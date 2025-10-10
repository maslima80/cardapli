-- Add categories array column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS categories text[];