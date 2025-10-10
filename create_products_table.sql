-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
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
