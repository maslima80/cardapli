-- Create RPC function to get user's slug
-- This bypasses the 406 error from direct PostgREST queries

CREATE OR REPLACE FUNCTION get_user_slug(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_slug text;
BEGIN
  SELECT slug INTO user_slug
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN user_slug;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_slug(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_slug(uuid) TO anon;
