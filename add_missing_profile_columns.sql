-- Part 1: Add missing columns to profiles table if they don't exist
DO $$
BEGIN
  -- Check if slug column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN slug TEXT UNIQUE;
  END IF;

  -- Check if business_name column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'business_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN business_name TEXT;
  END IF;

  -- Check if slogan column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'slogan'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN slogan TEXT;
  END IF;

  -- Check if about column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'about'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN about TEXT;
  END IF;

  -- Check if logo_url column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN logo_url TEXT;
  END IF;

  -- Check if phone column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;

  -- Check if whatsapp column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN whatsapp TEXT;
  END IF;

  -- Check if email_public column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email_public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email_public TEXT;
  END IF;

  -- Check if address column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN address TEXT;
  END IF;

  -- Check if locations column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'locations'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN locations JSONB;
  END IF;

  -- Check if socials column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'socials'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN socials JSONB;
  END IF;

  -- Check if accent_color column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'accent_color'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN accent_color TEXT;
  END IF;

  -- Check if theme_mode column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'theme_mode'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN theme_mode TEXT;
  END IF;

  -- Check if font_theme column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'font_theme'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN font_theme TEXT;
  END IF;

  -- Check if cta_shape column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'cta_shape'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cta_shape TEXT;
  END IF;
END $$;

-- Part 2: Create the is_slug_available function
DROP FUNCTION IF EXISTS public.is_slug_available;
CREATE FUNCTION public.is_slug_available(check_slug TEXT)
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
