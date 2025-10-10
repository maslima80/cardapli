-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  price_unit TEXT NOT NULL DEFAULT 'Unidade',
  price_unit_custom TEXT,
  price_note TEXT,
  min_qty INTEGER,
  status TEXT NOT NULL DEFAULT 'Disponível',
  production_days INTEGER,
  accepts_customization BOOLEAN DEFAULT false,
  customization_instructions TEXT,
  ingredients TEXT,
  allergens TEXT,
  conservation TEXT,
  category TEXT,
  quality_tags TEXT[],
  variants TEXT[],
  photos JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  video_provider TEXT,
  video_id TEXT,
  video_poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Users can view their own products"
ON public.products
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products"
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();