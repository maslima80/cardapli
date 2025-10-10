-- Add missing columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS slogan TEXT,
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS email_public TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS locations JSONB,
  ADD COLUMN IF NOT EXISTS socials JSONB,
  ADD COLUMN IF NOT EXISTS accent_color TEXT,
  ADD COLUMN IF NOT EXISTS theme_mode TEXT,
  ADD COLUMN IF NOT EXISTS font_theme TEXT,
  ADD COLUMN IF NOT EXISTS cta_shape TEXT;

-- Create function to check if a slug is available
CREATE OR REPLACE FUNCTION public.is_slug_available(check_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE slug = check_slug
  );
END;
$$;
