-- Add three-state control system to catalogs table
-- This migration adds the new columns for the improved catalog visibility system

-- Add new columns only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='catalogs' AND column_name='link_ativo') THEN
    ALTER TABLE catalogs ADD COLUMN link_ativo boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='catalogs' AND column_name='no_perfil') THEN
    ALTER TABLE catalogs ADD COLUMN no_perfil boolean DEFAULT false;
  END IF;
END $$;

-- Set sensible defaults for existing catalogs
-- Catalogs that were 'public' or 'unlisted' should have link_ativo = true
UPDATE catalogs 
SET link_ativo = true 
WHERE status IN ('public', 'unlisted', 'publicado') AND link_ativo = false;
