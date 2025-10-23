-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR NOW ⚠️
-- This creates the RPC function to get user slug

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

GRANT EXECUTE ON FUNCTION get_user_slug(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_slug(uuid) TO anon;

-- Verify it works
SELECT get_user_slug('00000000-0000-0000-0000-000000000000'::uuid);
-- Should return NULL (no user with that ID)
