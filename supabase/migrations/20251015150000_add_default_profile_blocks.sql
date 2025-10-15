-- Function to create default profile blocks for new users
CREATE OR REPLACE FUNCTION create_default_profile_blocks()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default profile blocks for the new user
  INSERT INTO profile_blocks (user_id, type, data, sort, visible)
  VALUES
    -- 1. Profile Header (logo, business name, slogan)
    (NEW.id, 'profile_header', 
     '{"show_logo": true, "show_name": true, "show_slogan": true, "alignment": "center"}'::jsonb, 
     0, true),
    
    -- 2. Contact Block
    (NEW.id, 'contact', 
     '{"title": "Entre em contato", "show_whatsapp": true, "show_phone": true, "show_email": true}'::jsonb, 
     1, true),
    
    -- 3. Social Media Block
    (NEW.id, 'socials', 
     '{"title": "Redes sociais", "layout": "buttons"}'::jsonb, 
     2, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after a new profile is inserted
DROP TRIGGER IF EXISTS on_profile_created_add_blocks ON profiles;
CREATE TRIGGER on_profile_created_add_blocks
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_profile_blocks();

-- For existing users without profile blocks, add the default blocks
INSERT INTO profile_blocks (user_id, type, data, sort, visible)
SELECT 
  p.id,
  block_type,
  block_data,
  block_sort,
  true
FROM profiles p
CROSS JOIN (
  VALUES 
    ('profile_header'::text, '{"show_logo": true, "show_name": true, "show_slogan": true, "alignment": "center"}'::jsonb, 0),
    ('contact'::text, '{"title": "Entre em contato", "show_whatsapp": true, "show_phone": true, "show_email": true}'::jsonb, 1),
    ('socials'::text, '{"title": "Redes sociais", "layout": "buttons"}'::jsonb, 2)
) AS defaults(block_type, block_data, block_sort)
WHERE NOT EXISTS (
  SELECT 1 FROM profile_blocks pb WHERE pb.user_id = p.id
);
