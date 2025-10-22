# Quick Catalog Wizard - Block Issues FIXED ✅

## Problems Identified and Fixed

### 1. ❌ Wrong Block Types
**Problem:** Using non-existent block types
- Used: `sobre`, `redes_sociais`, `localizacoes`
- **Actual types from AddBlockDrawer.tsx:**
  - `about_business` (Sobre Nós)
  - `socials` (Redes Sociais)
  - `location` (Localizações)

**Fix:** Updated all block type references in `QuickCatalogCreate.tsx` to use correct types.

### 2. ❌ Wrong Location Data Source
**Problem:** Trying to fetch from non-existent `profile_locations` table
```typescript
// WRONG:
const { data } = await supabase
  .from("profile_locations")  // ❌ This table doesn't exist
  .select("id")
```

**Actual Structure:** Locations are stored in `profiles.locations` as JSONB array
```sql
-- From migration:
ADD COLUMN locations jsonb DEFAULT '[]';
```

**Fix:** Now correctly fetches from `profiles.locations`:
```typescript
const { data: profileData } = await supabase
  .from("profiles")
  .select("locations")
  .eq("id", user.id)
  .single();

if (profileData?.locations && Array.isArray(profileData.locations)) {
  locationIds = profileData.locations
    .filter((loc: any) => loc && loc.name)
    .map((loc: any, index: number) => loc.id || `location-${index}`);
}
```

### 3. ✅ Correct Block Data Structure

**About Business Block:**
```typescript
{
  catalog_id: catalog.id,
  type: 'about_business',  // ✅ Correct type
  sort: 1,
  visible: true,
  data: {},
}
```

**Socials Block:**
```typescript
{
  catalog_id: catalog.id,
  type: 'socials',  // ✅ Correct type
  sort: 999,
  visible: true,
  data: {},
}
```

**Location Block:**
```typescript
{
  catalog_id: catalog.id,
  type: 'location',  // ✅ Correct type
  sort: 998,
  visible: true,
  data: {
    title: "Nossas Localizações",
    description: "Conheça nossas unidades e onde nos encontrar",
    layout: "list",
    show_map: true,
    selected_locations: locationIds,  // ✅ Array of location IDs from profile.locations
  },
}
```

## Block Ordering (Correct)

1. **Main Cover** (sort: 0) - Already inserted
2. **About Business** (sort: 1) - If selected
3. **Category/Tag Sections** (sort: 2+) - All product blocks
4. **Location** (sort: end-1) - If selected
5. **Socials** (sort: end) - If selected

## Testing Checklist

- [ ] Create catalog by categories
- [ ] Select: ✅ Sobre, ✅ Redes Sociais, ✅ Localização
- [ ] Generate catalog
- [ ] Verify blocks appear with correct types:
  - `about_business` (not `sobre`)
  - `socials` (not `redes_sociais`)
  - `location` (not `localizacoes`)
- [ ] Verify location block shows user's locations
- [ ] Verify correct ordering: About → Products → Location → Social

## Files Modified

- `/src/pages/QuickCatalogCreate.tsx` - Fixed all block types and location fetching logic
