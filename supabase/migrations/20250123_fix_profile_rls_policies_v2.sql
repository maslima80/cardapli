-- Fix conflicting RLS policies on profiles table - AGGRESSIVE VERSION
-- This drops ALL SELECT policies and creates a single one

-- Drop ALL existing SELECT policies on profiles (regardless of name)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
        AND cmd = 'SELECT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Create a single comprehensive SELECT policy
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Verify the policy was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public' 
        AND policyname = 'profiles_select_policy'
    ) THEN
        RAISE NOTICE 'SUCCESS: profiles_select_policy created';
    ELSE
        RAISE EXCEPTION 'FAILED: profiles_select_policy not created';
    END IF;
END $$;
