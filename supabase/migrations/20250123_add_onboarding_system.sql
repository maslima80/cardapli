-- Migration: Add Onboarding System
-- Purpose: Track user progress through guided onboarding journey
-- Date: 2025-01-23

-- ============================================================================
-- 1. USER PROGRESS TABLE
-- ============================================================================
-- Tracks completion status of each onboarding step

CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  step text NOT NULL CHECK (step IN ('profile', 'theme', 'products', 'info', 'catalog')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb, -- Extra data like product_count, info_count, etc.
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, step)
);

-- Indexes for performance
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_status ON public.user_progress(user_id, status);
CREATE INDEX idx_user_progress_step ON public.user_progress(step);

-- ============================================================================
-- 2. ONBOARDING HINTS VIEWED TABLE (Optional - for tracking hint dismissals)
-- ============================================================================
-- Tracks which hints the user has seen/dismissed

CREATE TABLE IF NOT EXISTS public.onboarding_hints_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hint_key text NOT NULL, -- 'welcome', 'profile_done', 'theme_done', etc.
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, hint_key)
);

CREATE INDEX idx_hints_viewed_user ON public.onboarding_hints_viewed(user_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_hints_viewed ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can modify their own progress
CREATE POLICY "Users can modify own progress"
  ON public.user_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own hints
CREATE POLICY "Users can view own hints"
  ON public.onboarding_hints_viewed
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can modify their own hints
CREATE POLICY "Users can modify own hints"
  ON public.onboarding_hints_viewed
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Function to initialize progress for a new user
CREATE OR REPLACE FUNCTION initialize_user_progress(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert all 5 steps as pending
  INSERT INTO public.user_progress (user_id, step, status)
  VALUES 
    (p_user_id, 'profile', 'pending'),
    (p_user_id, 'theme', 'pending'),
    (p_user_id, 'products', 'pending'),
    (p_user_id, 'info', 'pending'),
    (p_user_id, 'catalog', 'pending')
  ON CONFLICT (user_id, step) DO NOTHING;
END;
$$;

-- Function to update step status
CREATE OR REPLACE FUNCTION update_step_status(
  p_user_id uuid,
  p_step text,
  p_status text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, step, status, metadata, completed_at, updated_at)
  VALUES (
    p_user_id,
    p_step,
    p_status,
    p_metadata,
    CASE WHEN p_status = 'completed' THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id, step) 
  DO UPDATE SET
    status = EXCLUDED.status,
    metadata = EXCLUDED.metadata,
    completed_at = CASE WHEN EXCLUDED.status = 'completed' THEN now() ELSE user_progress.completed_at END,
    updated_at = now();
END;
$$;

-- Function to get completion percentage
CREATE OR REPLACE FUNCTION get_completion_percentage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_count integer;
  total_count integer := 5; -- 5 steps total
BEGIN
  SELECT COUNT(*)
  INTO completed_count
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND status = 'completed';
  
  RETURN (completed_count * 100 / total_count);
END;
$$;

-- Function to get next incomplete step
CREATE OR REPLACE FUNCTION get_next_incomplete_step(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_step text;
BEGIN
  -- Return first non-completed step in order
  SELECT step
  INTO next_step
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND status != 'completed'
  ORDER BY 
    CASE step
      WHEN 'profile' THEN 1
      WHEN 'theme' THEN 2
      WHEN 'products' THEN 3
      WHEN 'info' THEN 4
      WHEN 'catalog' THEN 5
    END
  LIMIT 1;
  
  RETURN next_step;
END;
$$;

-- ============================================================================
-- 5. TRIGGER TO AUTO-INITIALIZE PROGRESS FOR NEW USERS
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_initialize_user_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Initialize progress when a new profile is created
  PERFORM initialize_user_progress(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_initialize_progress
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_user_progress();

-- ============================================================================
-- 6. INITIALIZE PROGRESS FOR EXISTING USERS
-- ============================================================================
-- Run this for all existing users who don't have progress yet

DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT id FROM public.profiles
  LOOP
    PERFORM initialize_user_progress(profile_record.id);
  END LOOP;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Create TypeScript types
-- 2. Build helper functions in src/lib/onboarding.ts
-- 3. Create useOnboardingProgress hook
-- 4. Build UI components
