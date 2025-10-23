-- ============================================================================
-- FIX: Ensure Profile is Created for All Auth Users
-- Run this in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Check if trigger exists
-- ============================================================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- STEP 2: Recreate the trigger (in case it's broken)
-- ============================================================================

-- Drop and recreate the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Created profile for user: %', NEW.id;
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Create profiles for ALL existing auth users that don't have one
-- ============================================================================
INSERT INTO public.profiles (id, email)
SELECT 
  au.id,
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Verify all users have profiles
-- ============================================================================
SELECT 
  'Auth users without profiles:' as info,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Should return 0

-- STEP 5: Show recent users and their profiles
-- ============================================================================
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  p.id as profile_id,
  p.slug,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- ============================================================================
-- DONE! Now all auth users should have profiles
-- ============================================================================
