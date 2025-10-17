-- Add WhatsApp bubble toggle to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS show_whatsapp_bubble BOOLEAN DEFAULT false;

-- Add WhatsApp bubble toggle to catalogs
ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS show_whatsapp_bubble BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN profiles.show_whatsapp_bubble IS 'Show WhatsApp floating bubble on profile page';
COMMENT ON COLUMN catalogs.show_whatsapp_bubble IS 'Show WhatsApp floating bubble on catalog page';
