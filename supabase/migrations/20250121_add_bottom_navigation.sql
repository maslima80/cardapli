-- Add show_bottom_nav to catalog settings
-- This enables a premium fixed bottom navigation menu

-- The settings column is JSONB, so we don't need to alter the schema
-- Just document the new field

COMMENT ON COLUMN catalogs.settings IS 'Catalog settings (JSONB): show_section_nav (boolean), show_whatsapp_bubble (boolean), show_bottom_nav (boolean)';
