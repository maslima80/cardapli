-- ============================================================================
-- Update Onboarding to 4 Steps (Remove Theme)
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Theme is now optional customization, not part of core onboarding
-- New 4-step flow:
-- 1. Profile
-- 2. Products  
-- 3. Business Info
-- 4. Catalog

-- STEP 1: Delete all theme progress records
-- ============================================================================
DELETE FROM public.user_progress WHERE step = 'theme';

-- STEP 2: Update the step constraint to remove 'theme'
-- ============================================================================
ALTER TABLE public.user_progress 
DROP CONSTRAINT IF EXISTS user_progress_step_check;

ALTER TABLE public.user_progress
ADD CONSTRAINT user_progress_step_check 
CHECK (step IN ('profile', 'products', 'info', 'catalog'));

-- STEP 3: Update initialization function to only create 4 steps
-- ============================================================================
CREATE OR REPLACE FUNCTION initialize_user_progress(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert all 4 steps as pending
  INSERT INTO public.user_progress (user_id, step, status)
  VALUES 
    (p_user_id, 'profile', 'pending'),
    (p_user_id, 'products', 'pending'),
    (p_user_id, 'info', 'pending'),
    (p_user_id, 'catalog', 'pending')
  ON CONFLICT (user_id, step) DO NOTHING;
END;
$$;

-- STEP 4: Update completion percentage function
-- ============================================================================
CREATE OR REPLACE FUNCTION get_completion_percentage(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_count integer;
  total_count integer := 4; -- 4 steps now
BEGIN
  SELECT COUNT(*)
  INTO completed_count
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND status = 'completed';
  
  RETURN (completed_count * 100 / total_count);
END;
$$;

-- STEP 5: Update next step function
-- ============================================================================
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
      WHEN 'products' THEN 2
      WHEN 'info' THEN 3
      WHEN 'catalog' THEN 4
    END
  LIMIT 1;
  
  RETURN next_step;
END;
$$;

-- STEP 6: Initialize 4 steps for all existing users
-- ============================================================================
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT id FROM public.profiles
  LOOP
    -- Delete old theme progress
    DELETE FROM public.user_progress 
    WHERE user_id = profile_record.id AND step = 'theme';
    
    -- Initialize 4 steps
    PERFORM initialize_user_progress(profile_record.id);
  END LOOP;
  
  RAISE NOTICE 'Updated all users to 4-step onboarding';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count steps per user (should be 4 for each)
SELECT 
  user_id,
  COUNT(*) as step_count,
  array_agg(step ORDER BY step) as steps
FROM public.user_progress
GROUP BY user_id
LIMIT 10;

-- Show progress for all users
SELECT 
  p.email,
  up.step,
  up.status
FROM public.profiles p
JOIN public.user_progress up ON p.id = up.user_id
ORDER BY p.email, 
  CASE up.step
    WHEN 'profile' THEN 1
    WHEN 'products' THEN 2
    WHEN 'info' THEN 3
    WHEN 'catalog' THEN 4
  END;

-- ============================================================================
-- DONE! Onboarding is now 4 steps
-- ============================================================================
-- Users can still customize theme from /perfil, but it's not required
-- ============================================================================
