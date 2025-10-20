-- Fix catalog RLS policy to support 'publicado' status
-- This allows public access to catalogs with status 'publicado'

DROP POLICY IF EXISTS "Anyone can view public/unlisted catalogs" ON public.catalogs;

CREATE POLICY "Anyone can view public catalogs"
  ON public.catalogs FOR SELECT
  USING (status IN ('public', 'unlisted', 'publicado'));
