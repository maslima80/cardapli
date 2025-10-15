# Phase 2 Progress - Profile Builder

## ✅ Completed (Steps 2.1 & 2.2)

### Step 2.1 - Database Migration
**File:** `supabase/migrations/20251015140000_create_profile_blocks.sql`

Created `profile_blocks` table with:
- `id` (UUID, primary key)
- `user_id` (UUID, references profiles)
- `type` (TEXT) - block type
- `data` (JSONB) - block settings
- `sort` (INTEGER) - display order
- `visible` (BOOLEAN) - show/hide toggle
- `created_at`, `updated_at` timestamps

**RLS Policies:**
- Owner can SELECT their blocks
- Owner can INSERT blocks
- Owner can UPDATE their blocks
- Owner can DELETE their blocks

**Indexes:**
- `idx_profile_blocks_user_id`
- `idx_profile_blocks_sort`

### Step 2.2 - Public Profile Page
**File:** `src/pages/PublicProfilePage.tsx`

**Route:** `/u/:userSlug`

**Features:**
- Fetches profile by slug
- Fetches profile_blocks (visible only, ordered by sort)
- Renders header with logo, business name, slogan
- Uses BlockRenderer for all blocks
- Meta tags for SEO/social sharing
- Empty state when no blocks
- 404 state when profile not found
- Footer with Cardapli branding

**Updated:** `src/App.tsx` - Route now uses PublicProfilePage

## 🔄 Next Steps

### Before Continuing - Run Migration

**IMPORTANT:** You need to run the migration and regenerate types:

```bash
# Push migration to Supabase
npx supabase db push

# Regenerate TypeScript types
npx supabase gen types typescript --project-id wjjoaikkvborvavghyjk > src/integrations/supabase/types.ts
```

This will fix the TypeScript errors in PublicProfilePage.tsx.

### Step 2.3 - Profile Builder UI (TODO)

**Location:** `/perfil` page

**What to add:**
1. New section "Montar Página Pública"
2. Buttons:
   - "Ver página" → opens `/u/:userSlug`
   - "Copiar link" → copies profile URL
3. Blocks list with drag & drop
4. Add Block drawer (reuse from catalog editor)
5. Block settings drawer (reuse from catalog editor)
6. CRUD operations on `profile_blocks`:
   - Create block
   - Update block data
   - Delete block
   - Reorder blocks (update sort)
   - Toggle visible

**Components to reuse:**
- `AddBlockDrawer` (from catalog editor)
- `BlockSettingsDrawer` (from catalog editor)
- `BlockCard` (from catalog editor)
- DnD Kit for drag & drop

### Step 2.4 - Catálogos Block (TODO)

**New block type:** `catalogs`

**Settings UI:**
- Mode selector:
  - "Mostrar todos (publicados + link ativo)"
  - "Selecionar manualmente"
- If manual mode:
  - Multi-select of user's catalogs
  - Drag & drop to reorder
  - Display style options (future)

**Data structure:**
```typescript
{
  mode: "all" | "manual",
  catalog_ids: string[],  // only for manual mode
  layout: "grid",         // future
  columns: 2              // future
}
```

**Render logic:**
- Mode "all": Query all catalogs where `status='publicado'` AND `link_ativo=true`
- Mode "manual": Fetch selected catalog_ids, filter to show only published+active
- Auto-hide: If catalog becomes draft or link_ativo=false, don't show it
- Each card links to `/u/:userSlug/:catalogSlug`

**Components needed:**
- `CatalogosBlockSettings.tsx` - Settings UI
- `CatalogosBlock.tsx` - Render component (or add to BlockRenderer)

## 📋 Testing Checklist (After Migration)

### Public Profile Page
- [ ] Visit `/u/your-slug` - page loads
- [ ] Shows header with logo, name, slogan
- [ ] Shows empty state when no blocks
- [ ] Shows 404 when slug doesn't exist
- [ ] Meta tags present in page source

### Profile Builder (After 2.3)
- [ ] `/perfil` shows "Montar Página Pública" section
- [ ] Can add blocks
- [ ] Can reorder blocks (drag & drop)
- [ ] Can edit block settings
- [ ] Can toggle visible
- [ ] Can delete blocks
- [ ] Changes persist to database
- [ ] "Ver página" opens `/u/:userSlug`
- [ ] "Copiar link" copies URL

### Catálogos Block (After 2.4)
- [ ] Can add Catálogos block
- [ ] "Mostrar todos" shows only published+active catalogs
- [ ] "Selecionar manualmente" allows picking catalogs
- [ ] Can reorder selected catalogs
- [ ] Draft catalogs don't appear
- [ ] link_ativo=false catalogs don't appear
- [ ] Cards link to correct catalog URLs
- [ ] Works on mobile

## 🎯 Current Status

**Completed:**
- ✅ Database migration created
- ✅ Public profile page implemented
- ✅ Route configured

**In Progress:**
- ⏳ Waiting for migration to run
- ⏳ Waiting for types regeneration

**Next:**
- 🔜 Profile builder UI in /perfil
- 🔜 Catálogos block implementation

## 📦 Commit Messages

**Done:**
```
feat(profile): add profile_blocks table and public profile page
```

**Upcoming:**
```
feat(perfil): add profile builder (blocks list, add/edit, reorder, visible)
feat(profile-blocks): add Catalogos block (all/manual, reorder, guards)
feat(profile): public profile page + builder + Catalogos block
```
