# Location Block - Final Fix Summary

## Issues Fixed

### 1. **Locations Not Showing** ✅
**Problem:** Locations in the profile don't have `id` fields - they only have `name`, `address`, `hours`, and `notes`.

**Solution:** Added automatic ID generation using the format `location-${index}` for locations that don't have IDs.

### 2. **Infinite Loop (Maximum update depth exceeded)** ✅
**Problem:** The `useEffect` in LocationBlock was running infinitely because `selectedLocationIds` was being recreated on every render.

**Solution:** 
- Used `useMemo` to memoize `selectedLocationIds` in LocationBlock.tsx
- Removed `onUpdate` from the dependencies array in LocationBlockSettings.tsx (with eslint-disable comment)

### 3. **Data Not Persisting After Refresh** ✅
**Problem:** The block data wasn't being saved properly to the database.

**Solution:** 
- Fixed the data structure being passed to `onUpdate` (removed spreading `...data` which could cause stale data)
- Ensured the update flow is clean and doesn't cause re-renders

## Files Modified

### 1. LocationBlock.tsx
```typescript
// Added useMemo to prevent infinite loops
const selectedLocationIds = useMemo(() => {
  return Array.isArray(data?.selected_locations) 
    ? data.selected_locations.filter(id => typeof id === 'string' && id.trim() !== '')
    : [];
}, [data?.selected_locations]);

// Added processLocations function to handle ID generation
const processLocations = (allLocations: any[]) => {
  const locationsWithIds = allLocations
    .filter((loc: any) => loc && loc.name)
    .map((loc: any, index: number) => ({
      ...loc,
      id: loc.id || `location-${index}`,
    }));
  
  if (!selectedLocationIds.length) {
    return [];
  }
  
  return locationsWithIds.filter(loc => selectedLocationIds.includes(loc.id));
};
```

### 2. LocationBlockSettings.tsx
```typescript
// Added automatic ID generation
const locationsWithIds = profileData.locations
  .filter((loc: any) => loc && loc.name)
  .map((loc: any, index: number) => ({
    ...loc,
    id: loc.id || `location-${index}`,
  }));

// Fixed data update to not spread old data
const updatedData = {
  title: title || "Nossas Localizações",
  description: description || "",
  layout: layout || "list",
  show_map: showMap !== false,
  selected_locations: selectedLocationIds,
};

// Removed onUpdate from dependencies to prevent infinite loops
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [title, description, layout, showMap, selectedLocationIds]);
```

## How It Works Now

1. **User adds locations in their profile** (Perfil page)
   - Locations are saved as JSONB in `profiles.locations`
   - Structure: `{ name, address, hours, notes }`

2. **LocationBlockSettings loads locations**
   - Fetches locations from profile
   - Adds IDs automatically: `location-0`, `location-1`, etc.
   - Displays them in a scrollable list with checkboxes

3. **User selects locations**
   - Clicking checkboxes updates `selectedLocationIds` state
   - Changes trigger `useEffect` which calls `onUpdate`
   - Data is saved to the block in the database

4. **LocationBlock renders selected locations**
   - Receives `data.selected_locations` with IDs
   - Fetches profile locations and adds IDs
   - Filters to show only selected locations
   - Renders in grid or list layout

## Testing Steps

1. ✅ Go to Perfil page
2. ✅ Add at least one location with a name
3. ✅ Save profile
4. ✅ Go to Catalog Editor
5. ✅ Add/Edit a Location block
6. ✅ Verify locations appear in settings
7. ✅ Select one or more locations
8. ✅ Save (click "Salvar" button)
9. ✅ Verify selected locations appear in preview
10. ✅ Refresh the page
11. ✅ Verify selections persist
12. ✅ Check console - no infinite loop errors

## Architecture Notes

**Current Implementation:**
- Locations stored as JSONB in `profiles.locations`
- IDs generated dynamically on-the-fly
- Works well for the 3-location limit

**Why This Works:**
- Simple and straightforward
- No additional database tables needed
- IDs are consistent (based on array index)
- Fast and efficient for small datasets

**Future Considerations:**
If you need to scale beyond 3 locations or add advanced features, consider migrating to a separate `locations` table with proper UUIDs. See `location_block_architecture_fix.md` for details.

## Common Issues & Solutions

### Issue: "Nenhuma localização encontrada"
**Cause:** No locations in profile or locations don't have names
**Solution:** Add locations in Perfil page with at least a name

### Issue: Locations disappear after refresh
**Cause:** Data not being saved properly
**Solution:** Make sure to click "Salvar" button in the block settings

### Issue: Can't select individual locations
**Cause:** ID generation not working
**Solution:** Verify locations have names (required for ID generation)

### Issue: Infinite loop in console
**Cause:** useEffect dependencies causing re-renders
**Solution:** Already fixed with useMemo and proper dependency arrays

## Performance Notes

- ID generation is O(n) where n is the number of locations
- With 3 locations max, performance impact is negligible
- useMemo prevents unnecessary recalculations
- No database queries on every render
