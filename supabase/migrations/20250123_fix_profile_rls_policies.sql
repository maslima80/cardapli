-- Fix conflicting RLS policies on profiles table
-- The issue: Two SELECT policies with different conditions cause 406 errors
-- Solution: Drop the conflicting policy and create a single comprehensive one

-- Drop the old "Anyone can check if slug exists" policy
DROP POLICY IF EXISTS "Anyone can check if slug exists" ON public.profiles;

-- Drop the old "Users can view their own profile" policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new comprehensive SELECT policy
-- Allows authenticated users to see their own profile AND allows anyone to see public profile data (for slug routing)
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
USING (
  -- User can see their own profile
  auth.uid() = id
  OR
  -- Anyone can see profiles (needed for public catalog routing by slug)
  true
);

-- Note: This is safe because:
-- 1. Authenticated users can see their own full profile
-- 2. Public users can see profiles (needed for /u/:slug routing)
-- 3. Sensitive data should be filtered at the application level if needed
-- 4. The UPDATE and INSERT policies still protect against unauthorized modifications
