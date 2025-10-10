-- Add pricing control fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_on_request boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS price_on_request_label text DEFAULT 'Sob consulta',
ADD COLUMN IF NOT EXISTS price_hidden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sku text;