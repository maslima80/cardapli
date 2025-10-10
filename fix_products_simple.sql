-- Simple fix for products table - one statement at a time

-- Add category column if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;

-- Add quality_tags column if it doesn't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quality_tags TEXT[] DEFAULT '{}';

-- Set NOT NULL constraints on required fields
ALTER TABLE public.products ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN title SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.products ALTER COLUMN price_unit SET NOT NULL;

-- Set default values
ALTER TABLE public.products ALTER COLUMN price_unit SET DEFAULT 'Unidade';
ALTER TABLE public.products ALTER COLUMN status SET DEFAULT 'Disponível';
ALTER TABLE public.products ALTER COLUMN price_on_request SET DEFAULT false;
ALTER TABLE public.products ALTER COLUMN price_hidden SET DEFAULT false;
ALTER TABLE public.products ALTER COLUMN accepts_customization SET DEFAULT false;

-- Add foreign key constraint if it doesn't exist (will fail silently if it already exists)
ALTER TABLE public.products 
  DROP CONSTRAINT IF EXISTS products_user_id_fkey,
  ADD CONSTRAINT products_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create or replace function for updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_products_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and create it
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_products_updated_at();
