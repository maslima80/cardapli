-- Add background_color column to profiles table for premium theme system
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_color TEXT;

-- Add comment
COMMENT ON COLUMN profiles.background_color IS 'Custom background color for user theme (HEX format)';
