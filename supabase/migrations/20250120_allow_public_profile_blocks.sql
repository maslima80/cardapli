-- Allow public access to visible profile blocks
-- This enables the public profile page (/u/:userSlug) to display blocks

-- Drop the restrictive policy
DROP POLICY IF EXISTS "owner can select profile_blocks" ON profile_blocks;

-- Create new policies:
-- 1. Public can view visible blocks
CREATE POLICY "public can view visible profile_blocks"
  ON profile_blocks FOR SELECT
  USING (visible = true);

-- 2. Owner can view all their blocks (including hidden ones)
CREATE POLICY "owner can view all their profile_blocks"
  ON profile_blocks FOR SELECT
  USING (auth.uid() = user_id);
