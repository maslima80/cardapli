-- ============================================
-- BUSINESS INFO SECTIONS - MANUAL MIGRATION
-- ============================================
-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- 1) Create business_info_sections table
CREATE TABLE IF NOT EXISTS public.business_info_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('how_to_buy','delivery','pickup','shipping','payment','guarantee','custom')),
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global','category','tag','product')),
  scope_id UUID NULL,
  title TEXT NULL,
  content_md TEXT NULL,
  items JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, type, scope, scope_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_business_info_sections_lookup 
ON public.business_info_sections (user_id, type, scope, scope_id);

-- 2) Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT NULL,
  rating INT NULL CHECK (rating BETWEEN 1 AND 5),
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global','product','category','tag')),
  scope_id UUID NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name, scope, scope_id)
);

-- Index for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_lookup 
ON public.testimonials (user_id, scope, scope_id, published);

-- 3) Enable RLS
ALTER TABLE public.business_info_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 4) RLS Policies for business_info_sections

-- Users can view their own sections
DROP POLICY IF EXISTS "Users can view own business info" ON public.business_info_sections;
CREATE POLICY "Users can view own business info"
ON public.business_info_sections
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sections
DROP POLICY IF EXISTS "Users can insert own business info" ON public.business_info_sections;
CREATE POLICY "Users can insert own business info"
ON public.business_info_sections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sections
DROP POLICY IF EXISTS "Users can update own business info" ON public.business_info_sections;
CREATE POLICY "Users can update own business info"
ON public.business_info_sections
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sections
DROP POLICY IF EXISTS "Users can delete own business info" ON public.business_info_sections;
CREATE POLICY "Users can delete own business info"
ON public.business_info_sections
FOR DELETE
USING (auth.uid() = user_id);

-- 5) RLS Policies for testimonials

-- Users can view their own testimonials
DROP POLICY IF EXISTS "Users can view own testimonials" ON public.testimonials;
CREATE POLICY "Users can view own testimonials"
ON public.testimonials
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own testimonials
DROP POLICY IF EXISTS "Users can insert own testimonials" ON public.testimonials;
CREATE POLICY "Users can insert own testimonials"
ON public.testimonials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own testimonials
DROP POLICY IF EXISTS "Users can update own testimonials" ON public.testimonials;
CREATE POLICY "Users can update own testimonials"
ON public.testimonials
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own testimonials
DROP POLICY IF EXISTS "Users can delete own testimonials" ON public.testimonials;
CREATE POLICY "Users can delete own testimonials"
ON public.testimonials
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- DONE! ✅
-- ============================================
-- After running this, check that tables exist:
-- SELECT * FROM business_info_sections LIMIT 1;
-- SELECT * FROM testimonials LIMIT 1;
-- ============================================
