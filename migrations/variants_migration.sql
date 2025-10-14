-- Product Variants Migration
-- This script creates a normalized variant system for products

-- OPTIONS (e.g., "Tamanho", "Cor")
create table product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null,
  name text not null,
  sort int not null default 0,
  created_at timestamptz default now()
);

-- OPTION VALUES (e.g., "S", "M", "L", "Vermelho")
create table product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references product_options(id) on delete cascade,
  user_id uuid not null,
  value text not null,
  sort int not null default 0,
  created_at timestamptz default now()
);

-- VARIANTS (one concrete combination)
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null,
  sku text,
  price numeric(12,2),                  -- optional override
  is_available boolean not null default true,
  image_url text,                       -- optional photo for this variant
  combination_key text,                 -- e.g. "color_black|size_s" (see trigger below)
  created_at timestamptz default now()
);

-- LINK: which value is chosen for each option in this variant
create table product_variant_options (
  variant_id uuid not null references product_variants(id) on delete cascade,
  option_id uuid not null references product_options(id) on delete cascade,
  value_id uuid not null references product_option_values(id) on delete cascade,
  primary key (variant_id, option_id)
);

-- Create indexes for better performance
create index on product_options(product_id, sort);
create index on product_option_values(option_id, sort);
create index on product_variants(product_id, is_available);
create index on product_variant_options(value_id);

-- Function builds a stable key like "color_black|size_s" sorted by option name
create or replace function build_variant_combination_key(p_variant_id uuid)
returns text language sql as $$
  select string_agg( concat(lower(po.name), '_', lower(pov.value)), '|' order by po.name )
  from product_variant_options pvo
  join product_options po on po.id = pvo.option_id
  join product_option_values pov on pov.id = pvo.value_id
  where pvo.variant_id = p_variant_id;
$$;

-- Trigger function to set combination_key
create or replace function set_combination_key()
returns trigger language plpgsql as $$
begin
  new.combination_key := build_variant_combination_key(new.id);
  return new;
end $$;

-- Create trigger to automatically set combination_key
create trigger trg_set_comb_key
after insert or update on product_variants
for each row execute procedure set_combination_key();

-- Create unique index to enforce one variant per combination
create unique index product_variants_unique_combo
  on product_variants(product_id, combination_key)
  where combination_key is not null;

-- Enable Row Level Security
alter table product_options enable row level security;
alter table product_option_values enable row level security;
alter table product_variants enable row level security;
alter table product_variant_options enable row level security;

-- RLS Policies for product_options
create policy options_select_own on product_options
  for select using (user_id = auth.uid());
create policy options_crud_own on product_options
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RLS Policies for product_option_values
create policy opt_values_select_own on product_option_values
  for select using (user_id = auth.uid());
create policy opt_values_crud_own on product_option_values
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RLS Policies for product_variants
create policy variants_select_own on product_variants
  for select using (user_id = auth.uid());
create policy variants_crud_own on product_variants
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RLS Policies for product_variant_options
create policy variant_opts_select on product_variant_options
  for select using (exists (
    select 1 from product_variants v
    where v.id = product_variant_options.variant_id
      and v.user_id = auth.uid()
  ));
create policy variant_opts_crud on product_variant_options
  for all using (exists (
    select 1 from product_variants v
    where v.id = product_variant_options.variant_id
      and v.user_id = auth.uid()
  )) with check (exists (
    select 1 from product_variants v
    where v.id = product_variant_options.variant_id
      and v.user_id = auth.uid()
  ));

-- Migration for existing products with option_groups
-- This will migrate any existing option_groups data to the new normalized structure
-- Note: This is a best-effort migration and may need manual review
DO $$
DECLARE
  product_record RECORD;
  option_group RECORD;
  option_id UUID;
  value_id UUID;
  variant_id UUID;
  variant_options JSONB[];
  variant_option JSONB;
BEGIN
  FOR product_record IN 
    SELECT id, user_id, option_groups 
    FROM products 
    WHERE option_groups IS NOT NULL AND jsonb_array_length(option_groups) > 0
  LOOP
    -- For each option group in the product
    FOR i IN 0..jsonb_array_length(product_record.option_groups) - 1 LOOP
      option_group := jsonb_array_element(product_record.option_groups, i);
      
      -- Create option
      INSERT INTO product_options (product_id, user_id, name, sort)
      VALUES (product_record.id, product_record.user_id, option_group->>'name', i)
      RETURNING id INTO option_id;
      
      -- Create option values
      IF option_group->'values' IS NOT NULL THEN
        FOR j IN 0..jsonb_array_length(option_group->'values') - 1 LOOP
          INSERT INTO product_option_values (option_id, user_id, value, sort)
          VALUES (option_id, product_record.user_id, 
                 jsonb_array_element(option_group->'values', j)::text, j);
        END LOOP;
      END IF;
    END LOOP;
    
    -- Note: We're not attempting to migrate disabled_combinations here
    -- as it would require complex logic to map to the new structure
  END LOOP;
END $$;
