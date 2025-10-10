-- Add slug column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN slug text UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX idx_profiles_slug ON public.profiles(slug);

-- Add constraint to ensure slug format (lowercase, alphanumeric + underscore, 3-20 chars)
ALTER TABLE public.profiles 
ADD CONSTRAINT slug_format 
CHECK (slug ~* '^[a-z0-9_]{3,20}$');

-- Create function to check slug availability
CREATE OR REPLACE FUNCTION public.is_slug_available(check_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE slug = lower(check_slug)
  );
$$;

-- Create RLS policy for slug reads (public can read slugs for routing)
CREATE POLICY "Anyone can check if slug exists"
ON public.profiles
FOR SELECT
USING (true);