-- Create profile_blocks table for profile builder
-- This table stores the blocks that appear on the public profile page (/u/:userSlug)

CREATE TABLE IF NOT EXISTS profile_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                        -- e.g. 'hero', 'about', 'contact', 'social', 'catalogs', etc.
  data JSONB NOT NULL DEFAULT '{}'::jsonb,   -- settings/payload for the block
  sort INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profile_blocks_user_id ON profile_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_blocks_sort ON profile_blocks(user_id, sort);

-- Enable Row Level Security
ALTER TABLE profile_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only the owner can manage their profile blocks

-- SELECT: Owner can view their own blocks
CREATE POLICY "owner can select profile_blocks"
  ON profile_blocks FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Owner can create blocks
CREATE POLICY "owner can insert profile_blocks"
  ON profile_blocks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Owner can update their blocks
CREATE POLICY "owner can update profile_blocks"
  ON profile_blocks FOR UPDATE 
  USING (auth.uid() = user_id);

-- DELETE: Owner can delete their blocks
CREATE POLICY "owner can delete profile_blocks"
  ON profile_blocks FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_blocks_updated_at
  BEFORE UPDATE ON profile_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_blocks_updated_at();
