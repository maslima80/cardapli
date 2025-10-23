-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR TO DIAGNOSE THE ISSUE ⚠️

-- 1. Check if profiles table exists and what columns it has
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check ALL RLS policies on profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public'
ORDER BY cmd, policyname;

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'profiles'
AND schemaname = 'public';

-- 4. Try to query profiles directly (as the database)
SELECT id, email, slug, created_at
FROM public.profiles
LIMIT 5;

-- 5. Check if there are any grants missing
SELECT 
    grantee, 
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'profiles';
