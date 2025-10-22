-- Migration: Add business_info_sections and testimonials tables
-- Purpose: Store reusable business information for automatic catalog generation

-- 1) BUSINESS INFO SECTIONS (global + scoped overrides)
create table if not exists public.business_info_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('how_to_buy','delivery','pickup','shipping','payment','guarantee','custom')),
  scope text not null default 'global' check (scope in ('global','category','tag','product')),
  scope_id uuid null, -- null for global
  title text null,
  content_md text null,      -- optional markdown
  items jsonb null,          -- preferred: [{icon,title,description}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, type, scope, scope_id)
);

create index on public.business_info_sections (user_id, type, scope, scope_id);

-- 2) TESTIMONIALS (for Depoimentos block)
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  message text not null,
  image_url text null,
  rating int null check (rating between 1 and 5),
  scope text not null default 'global' check (scope in ('global','product','category','tag')),
  scope_id uuid null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index on public.testimonials (user_id, scope, scope_id, published);

-- RLS
alter table public.business_info_sections enable row level security;
alter table public.testimonials enable row level security;

-- Policies: owner-only CRUD for business_info_sections
create policy "bis_select_own" on public.business_info_sections
for select using (auth.uid() = user_id);

create policy "bis_modify_own" on public.business_info_sections
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies: owner-only CRUD for testimonials
create policy "tst_select_own" on public.testimonials
for select using (auth.uid() = user_id);

create policy "tst_modify_own" on public.testimonials
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
