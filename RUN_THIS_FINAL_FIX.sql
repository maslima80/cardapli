-- ⚠️ FINAL FIX - RUN THIS IN SUPABASE SQL EDITOR NOW ⚠️
-- This creates an RPC function that returns both slug and business_name
-- Bypasses the 406 error completely

CREATE OR REPLACE FUNCTION get_user_profile_data(user_id uuid)
RETURNS TABLE(slug text, business_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.slug, p.business_name
  FROM public.profiles p
  WHERE p.id = user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_data(uuid) TO anon;

-- Test it (should return one row with slug and business_name, or empty if user doesn't exist)
SELECT * FROM get_user_profile_data('00000000-0000-0000-0000-000000000000'::uuid);
