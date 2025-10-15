# How to Apply the Three-State Migration

## Option 1: Using Supabase Dashboard (Recommended for now)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste this SQL:

```sql
-- Add three-state control system to catalogs table
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
UPDATE catalogs 
SET link_ativo = true 
WHERE status IN ('public', 'unlisted', 'publicado') AND link_ativo = false;
```

5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Option 2: Using Supabase CLI

If you want to use the CLI and resolve the migration conflicts:

```bash
cd /Users/marciolima/Projects/cardapli
supabase db push
```

Then answer 'y' when prompted.

## After Migration is Applied

1. Regenerate TypeScript types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

2. Restart your dev server:
```bash
npm run dev
```

## Verify Migration

Run this query in SQL Editor to verify the columns were added:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'catalogs' 
AND column_name IN ('link_ativo', 'no_perfil');
```

You should see both columns listed.
