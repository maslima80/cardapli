-- Add anchor_slug column to profile_blocks table
-- This allows blocks to have URL anchors for navigation (e.g., #about, #contact)

ALTER TABLE profile_blocks 
ADD COLUMN IF NOT EXISTS anchor_slug TEXT;

-- Create index for faster anchor lookups
CREATE INDEX IF NOT EXISTS idx_profile_blocks_anchor_slug 
ON profile_blocks(user_id, anchor_slug) 
WHERE anchor_slug IS NOT NULL;

-- Add comment
COMMENT ON COLUMN profile_blocks.anchor_slug IS 'URL-friendly slug for block anchors (e.g., "about", "contact")';
