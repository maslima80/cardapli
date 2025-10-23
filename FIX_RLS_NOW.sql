-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR NOW ⚠️
-- This will fix the 406 error immediately

-- Step 1: Check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;

-- Step 2: Drop ALL SELECT policies on profiles
DROP POLICY IF EXISTS "Anyone can check if slug exists" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

-- Step 3: Create ONE simple SELECT policy
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Step 4: Verify the fix
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;

-- You should see only ONE SELECT policy now: "profiles_select_policy"
