-- ============================================================================
-- COMPLETE ONBOARDING FIX
-- Run this in Supabase SQL Editor to fix all onboarding issues
-- Date: 2025-01-23
-- ============================================================================

-- ISSUE 1: Profile updates returning 0 rows
-- ISSUE 2: Foreign key constraint errors on onboarding_hints_viewed
-- ISSUE 3: RLS policies causing conflicts

-- ============================================================================
-- STEP 1: Ensure all authenticated users have profiles
-- ============================================================================

-- This function will create missing profiles for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    INSERT INTO public.profiles (id, email)
    VALUES (user_record.id, user_record.email)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created profile for user: %', user_record.id;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 2: Fix RLS Policies - Make them crystal clear
-- ============================================================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can check if slug exists" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create new, clear policies
CREATE POLICY "allow_select_own_or_public"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id  -- Users can see their own profile
  OR 
  true  -- Anyone can see profiles (needed for public routing)
);

CREATE POLICY "allow_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 3: Ensure onboarding tables have correct RLS
-- ============================================================================

-- Fix user_progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can modify own progress" ON public.user_progress;

CREATE POLICY "allow_all_own_progress"
ON public.user_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix onboarding_hints_viewed policies
DROP POLICY IF EXISTS "Users can view own hints" ON public.onboarding_hints_viewed;
DROP POLICY IF EXISTS "Users can modify own hints" ON public.onboarding_hints_viewed;

CREATE POLICY "allow_all_own_hints"
ON public.onboarding_hints_viewed
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Ensure all existing profiles have onboarding progress initialized
-- ============================================================================

DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT id FROM public.profiles
  LOOP
    -- Initialize progress for each user
    INSERT INTO public.user_progress (user_id, step, status)
    VALUES 
      (profile_record.id, 'profile', 'pending'),
      (profile_record.id, 'theme', 'pending'),
      (profile_record.id, 'products', 'pending'),
      (profile_record.id, 'info', 'pending'),
      (profile_record.id, 'catalog', 'pending')
    ON CONFLICT (user_id, step) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Initialized onboarding progress for all users';
END $$;

-- ============================================================================
-- STEP 5: Verify everything is working
-- ============================================================================

-- Count profiles
SELECT 'Total profiles:' as info, COUNT(*) as count FROM public.profiles;

-- Count user progress records (should be 5x number of profiles)
SELECT 'Total progress records:' as info, COUNT(*) as count FROM public.user_progress;

-- Show RLS policies
SELECT 
  'Profile policies:' as info,
  policyname, 
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- ============================================================================
-- DONE! Now test in your app:
-- 1. Create a new user
-- 2. Select a slug
-- 3. Verify it saves (check profiles table)
-- 4. Navigate through onboarding steps
-- ============================================================================
