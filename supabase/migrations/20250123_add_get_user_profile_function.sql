-- Create RPC function to get user's profile data (slug and business_name)
-- This bypasses the 406 error from direct PostgREST queries

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
