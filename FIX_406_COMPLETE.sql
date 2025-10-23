-- ⚠️ COMPLETE FIX FOR 406 ERROR - RUN THIS IN SUPABASE SQL EDITOR ⚠️

-- Step 1: Disable RLS temporarily to test
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 3: Grant necessary permissions
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Step 4: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple policies
CREATE POLICY "allow_select_profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "allow_insert_own_profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own_profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 6: Verify
SELECT 
    'Policies created:' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

SELECT 
    'Columns in profiles:' as info,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;
