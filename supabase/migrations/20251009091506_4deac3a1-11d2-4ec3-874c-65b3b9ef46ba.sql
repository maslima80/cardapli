-- Add option_groups and disabled_combinations columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS option_groups jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS disabled_combinations jsonb DEFAULT '[]'::jsonb;