# 🐛 Bugs Fixed - Phase 2 Testing

## Issues Encountered & Resolved

### **Issue 1: 404 Error - `/depoimentos` route not found** ❌→✅

**Error:**
```
404 Error: User attempted to access non-existent route: /depoimentos
```

**Root Cause:**
- `InformacoesNegocio.tsx` had a card that navigated to `/depoimentos`
- This route doesn't exist in the application

**Fix:**
- Changed testimonials card to "coming soon" state
- Removed navigation click handler
- Added visual indicator: "🚧 Em breve: gerenciador de depoimentos"
- Card now has `opacity-60` to show disabled state

**File:** `src/pages/InformacoesNegocio.tsx`

---

### **Issue 2: 400 Error - Catalog generation failing** ❌→✅

**Error:**
```
Failed to load resource: the server responded with a status of 400
Error generating catalog
```

**Root Cause:**
- `catalog_blocks` table requires `anchor_slug` field
- All block insertions in `generateCatalogFromWizard()` were missing this field
- Supabase rejected the insert with 400 Bad Request

**Fix:**
- Created `generateAnchorSlug(type, sort)` helper function
- Added `anchor_slug` to ALL block insertions:
  - Cover blocks
  - About block
  - Product grids
  - Category/Tag covers and products
  - Info blocks (delivery, payment, etc.)
  - Testimonials block
  - Location block
  - Socials block
- Fixed `currentSort` increment pattern for consistency

**File:** `src/lib/wizard/generateCatalog.ts`

**Example:**
```typescript
// Before (BROKEN)
blocksToInsert.push({
  catalog_id: catalog.id,
  type: 'cover',
  sort: currentSort++,
  visible: true,
  data: coverData,
});

// After (FIXED)
blocksToInsert.push({
  catalog_id: catalog.id,
  type: 'cover',
  sort: currentSort,
  visible: true,
  anchor_slug: generateAnchorSlug('cover', currentSort),
  data: coverData,
});
currentSort++;
```

---

### **Issue 3: 400 Error - Invalid catalog status value** ❌→✅

**Error:**
```
new row for relation "catalogs" violates check constraint "catalogs_status_check"
```

**Root Cause:**
- Catalog generation was using `status: "published"`
- The `catalogs` table constraint only allows: `'rascunho'`, `'publicado'`, `'draft'`, `'public'`, `'unlisted'`
- `"published"` is not a valid value

**Fix:**
- Changed `status: "published"` to `status: "publicado"`
- This is the correct Portuguese value for published catalogs

**File:** `src/lib/wizard/generateCatalog.ts`

---

## Testing Status

### **Before Fixes:**
- ❌ Clicking testimonials card → 404 error
- ❌ Generating catalog → 400 error
- ❌ No catalogs created

### **After Fixes:**
- ✅ Testimonials card shows "coming soon" message
- ✅ Catalog generation should work (needs testing with migration)
- ✅ All blocks include required `anchor_slug` field

---

## Next Steps

1. **Run the migration:**
   ```bash
   supabase db push
   ```

2. **Regenerate TypeScript types:**
   ```bash
   npx supabase gen types typescript --project-id YOUR_ID > src/integrations/supabase/types.ts
   ```

3. **Test the complete flow:**
   - Navigate to `/compartilhar`
   - Select products/categories/tags
   - Go through wizard steps 3-5
   - Click "Gerar Catálogo"
   - Verify catalog is created successfully
   - Check that blocks render correctly

4. **Verify:**
   - No 404 errors
   - No 400 errors
   - Catalog appears in `/catalogos`
   - Public catalog renders properly
   - Auto-mode blocks fetch data correctly

---

## Commit

```
fix: Add anchor_slug to all blocks and remove broken testimonials route

Fixes:
1. 404 Error - Removed /depoimentos navigation
2. 400 Error - Added anchor_slug to all block insertions

Files changed:
- src/pages/InformacoesNegocio.tsx
- src/lib/wizard/generateCatalog.ts
```

---

**Status:** ✅ Both critical bugs fixed
**Ready for:** Migration + End-to-end testing
