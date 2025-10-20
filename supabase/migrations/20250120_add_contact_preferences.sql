-- Add contact preference fields to profiles table
-- These control which contact buttons appear on product pages

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS enable_whatsapp BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_phone BOOLEAN DEFAULT false;

-- Add helpful comments
COMMENT ON COLUMN public.profiles.enable_whatsapp IS 'Show WhatsApp button on product pages';
COMMENT ON COLUMN public.profiles.enable_phone IS 'Show phone call button on product pages';
