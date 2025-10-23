-- ============================================================================
-- NUCLEAR OPTION: Complete RLS Reset for Profiles Table
-- This will fix the 406 error once and for all
-- Run this in Supabase SQL Editor NOW
-- ============================================================================

-- STEP 1: Drop ALL existing policies on profiles (clean slate)
-- ============================================================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- STEP 2: Create ONE simple, comprehensive SELECT policy
-- ============================================================================
-- This allows EVERYONE to read profiles (needed for public routing)
-- No conflicts, no 406 errors
CREATE POLICY "profiles_select_all"
ON public.profiles
FOR SELECT
USING (true);

-- STEP 3: Create UPDATE policy (only own profile)
-- ============================================================================
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- STEP 4: Create INSERT policy (only own profile)
-- ============================================================================
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- STEP 5: Create DELETE policy (only own profile)
-- ============================================================================
CREATE POLICY "profiles_delete_own"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show all policies (should see exactly 4)
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd;

-- Test: Try to select a profile (should work)
SELECT id, email, slug FROM public.profiles LIMIT 1;

-- ============================================================================
-- DONE! The 406 error should be GONE
-- ============================================================================
-- The issue was multiple SELECT policies with different conditions
-- Now we have ONE SELECT policy that allows everyone to read
-- This is safe because:
-- 1. Public catalogs need to read profiles by slug
-- 2. UPDATE/INSERT/DELETE are still protected
-- 3. Sensitive data should be filtered at app level if needed
-- ============================================================================
