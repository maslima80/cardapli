-- Add navigation_label column to catalog_blocks and profile_blocks
-- This allows users to set a custom short label for navigation menus
-- separate from the public block title

-- Add to catalog_blocks
ALTER TABLE catalog_blocks 
ADD COLUMN IF NOT EXISTS navigation_label TEXT;

-- Add to profile_blocks  
ALTER TABLE profile_blocks
ADD COLUMN IF NOT EXISTS navigation_label TEXT;

-- Add helpful comment
COMMENT ON COLUMN catalog_blocks.navigation_label IS 'Custom short label for navigation menu (optional). If empty, uses block title.';
COMMENT ON COLUMN profile_blocks.navigation_label IS 'Custom short label for navigation menu (optional). If empty, uses block title.';
