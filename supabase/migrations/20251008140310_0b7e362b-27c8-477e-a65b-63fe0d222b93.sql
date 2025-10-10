-- Add profile customization columns
ALTER TABLE public.profiles
ADD COLUMN logo_url text,
ADD COLUMN business_name text,
ADD COLUMN slogan text,
ADD COLUMN about text,
ADD COLUMN whatsapp text,
ADD COLUMN phone text,
ADD COLUMN email_public text,
ADD COLUMN address text,
ADD COLUMN socials jsonb DEFAULT '{}',
ADD COLUMN theme_mode text DEFAULT 'light',
ADD COLUMN accent_color text DEFAULT '#8B5CF6',
ADD COLUMN font_theme text DEFAULT 'clean',
ADD COLUMN cta_shape text DEFAULT 'rounded',
ADD COLUMN locations jsonb DEFAULT '[]';

-- Create storage bucket for logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for logos
CREATE POLICY "Users can upload their own logo"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own logo"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logo"
ON storage.objects
FOR DELETE
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Logo images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');