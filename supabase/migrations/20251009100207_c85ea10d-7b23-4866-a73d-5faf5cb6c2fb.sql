-- Add external_media column to products table
ALTER TABLE public.products 
ADD COLUMN external_media jsonb DEFAULT '[]'::jsonb;