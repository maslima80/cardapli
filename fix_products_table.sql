-- Fix products table structure to match the original Lovable project

-- Add missing columns
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS quality_tags TEXT[] DEFAULT '{}';

-- Fix data types
-- First, create a temporary function to convert JSONB arrays to TEXT arrays
CREATE OR REPLACE FUNCTION jsonb_to_text_array(jsonb_array JSONB)
RETURNS TEXT[] AS $$
BEGIN
  RETURN (
    SELECT array_agg(value::TEXT)
    FROM jsonb_array_elements_text(jsonb_array)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN '{}';
END;
$$ LANGUAGE plpgsql;

-- Convert categories from JSONB to TEXT[] if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'categories' 
    AND data_type = 'jsonb'
  ) THEN
    -- Create a temporary column
    ALTER TABLE public.products ADD COLUMN categories_temp TEXT[];
    
    -- Convert data
    UPDATE public.products 
    SET categories_temp = jsonb_to_text_array(categories)
    WHERE categories IS NOT NULL;
    
    -- Drop the old column
    ALTER TABLE public.products DROP COLUMN categories;
    
    -- Rename the temporary column
    ALTER TABLE public.products RENAME COLUMN categories_temp TO categories;
  END IF;
END $$;

-- Convert variants from JSONB to TEXT[] if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'variants' 
    AND data_type = 'jsonb'
  ) THEN
    -- Create a temporary column
    ALTER TABLE public.products ADD COLUMN variants_temp TEXT[];
    
    -- Convert data
    UPDATE public.products 
    SET variants_temp = jsonb_to_text_array(variants)
    WHERE variants IS NOT NULL;
    
    -- Drop the old column
    ALTER TABLE public.products DROP COLUMN variants;
    
    -- Rename the temporary column
    ALTER TABLE public.products RENAME COLUMN variants_temp TO variants;
  END IF;
END $$;

-- Set NOT NULL constraints on required fields
ALTER TABLE public.products 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN price_unit SET NOT NULL;

-- Set default values
ALTER TABLE public.products 
  ALTER COLUMN price_unit SET DEFAULT 'Unidade',
  ALTER COLUMN status SET DEFAULT 'Disponível',
  ALTER COLUMN price_on_request SET DEFAULT false,
  ALTER COLUMN price_hidden SET DEFAULT false,
  ALTER COLUMN accepts_customization SET DEFAULT false;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_user_id_fkey'
  ) THEN
    ALTER TABLE public.products 
    ADD CONSTRAINT products_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS jsonb_to_text_array;

-- Add updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_products_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION public.handle_products_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER set_products_updated_at
      BEFORE UPDATE ON public.products
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_products_updated_at();
  END IF;
END $$;
