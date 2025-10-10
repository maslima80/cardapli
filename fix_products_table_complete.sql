-- Complete fix for products table structure

-- First, check if the products table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'products'
  ) THEN
    -- Create the products table if it doesn't exist
    CREATE TABLE public.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      price NUMERIC,
      price_unit TEXT NOT NULL DEFAULT 'Unidade',
      price_unit_custom TEXT,
      price_note TEXT,
      min_qty INTEGER,
      price_on_request BOOLEAN DEFAULT FALSE,
      price_on_request_label TEXT,
      price_hidden BOOLEAN DEFAULT FALSE,
      sku TEXT,
      status TEXT NOT NULL DEFAULT 'Disponível',
      production_days INTEGER,
      accepts_customization BOOLEAN DEFAULT FALSE,
      customization_instructions TEXT,
      ingredients TEXT,
      allergens TEXT,
      conservation TEXT,
      category TEXT,
      categories TEXT[] DEFAULT '{}',
      quality_tags TEXT[] DEFAULT '{}',
      variants TEXT[] DEFAULT '{}',
      option_groups JSONB DEFAULT '[]',
      disabled_combinations JSONB DEFAULT '[]',
      photos JSONB DEFAULT '[]',
      external_media JSONB DEFAULT '[]',
      video_id TEXT,
      video_url TEXT,
      video_provider TEXT,
      video_poster_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view their own products"
      ON public.products
      FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own products"
      ON public.products
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own products"
      ON public.products
      FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own products"
      ON public.products
      FOR DELETE
      USING (auth.uid() = user_id);

    -- Create trigger to update updated_at timestamp
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

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.products ADD COLUMN category TEXT;
  END IF;
END $$;

-- Add quality_tags column if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'quality_tags'
  ) THEN
    ALTER TABLE public.products ADD COLUMN quality_tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Fix categories column type if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')
  AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'categories' 
    AND data_type <> 'ARRAY'
  ) THEN
    -- Create a temporary function to convert JSONB to TEXT array
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

    -- Create a temporary column
    ALTER TABLE public.products ADD COLUMN categories_temp TEXT[];
    
    -- Convert data
    UPDATE public.products 
    SET categories_temp = jsonb_to_text_array(categories::jsonb)
    WHERE categories IS NOT NULL;
    
    -- Drop the old column
    ALTER TABLE public.products DROP COLUMN categories;
    
    -- Rename the temporary column
    ALTER TABLE public.products RENAME COLUMN categories_temp TO categories;
  END IF;
END $$;

-- Drop the temporary function if it exists
DROP FUNCTION IF EXISTS jsonb_to_text_array;

-- Fix variants column type if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')
  AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'variants' 
    AND data_type <> 'ARRAY'
  ) THEN
    -- Create a temporary function to convert JSONB to TEXT array
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

    -- Create a temporary column
    ALTER TABLE public.products ADD COLUMN variants_temp TEXT[];
    
    -- Convert data
    UPDATE public.products 
    SET variants_temp = jsonb_to_text_array(variants::jsonb)
    WHERE variants IS NOT NULL;
    
    -- Drop the old column
    ALTER TABLE public.products DROP COLUMN variants;
    
    -- Rename the temporary column
    ALTER TABLE public.products RENAME COLUMN variants_temp TO variants;
  END IF;
END $$;

-- Drop the temporary function if it exists
DROP FUNCTION IF EXISTS jsonb_to_text_array;

-- Set NOT NULL constraints on required fields
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
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
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_user_id_fkey'
  ) THEN
    ALTER TABLE public.products 
    ADD CONSTRAINT products_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')
  AND NOT EXISTS (
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
