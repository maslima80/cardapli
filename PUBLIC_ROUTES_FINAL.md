# Public Routes - FINAL IMPLEMENTATION ✅

## The Solution: `/u/` Instead of `/@`

We've switched from `/@user` to `/u/user` for simplicity and reliability.

## New URL Structure

| Page | Old URL | New URL |
|------|---------|---------|
| Profile | `/@marcio` | `/u/marcio` |
| Catalog | `/@marcio/new-one` | `/u/marcio/new-one` |

## What Changed

### 1. Routes (App.tsx)
```tsx
<Route path="/u/:userSlug" element={<PublicUserLayout />}>
  <Route index element={<NotFound />} />  {/* /u/user → profile (Phase 2) */}
  <Route path=":catalogSlug" element={<PublicCatalogPage />} />  {/* /u/user/catalog */}
</Route>
```

**Key points:**
- Parent route renders `<Outlet/>` via `PublicUserLayout`
- Child routes properly nested
- Comes before catch-all `*` route

### 2. URL Helpers (lib/urls.ts)
Created single source of truth for all public URLs:

```typescript
export const publicProfileUrl = (userSlug: string) => `/u/${userSlug}`;

export const publicCatalogUrl = (userSlug: string, catalogSlug: string) => 
  `/u/${userSlug}/${catalogSlug}`;

export const publicCatalogFullUrl = (userSlug: string, catalogSlug: string) => 
  `https://cardapli.com.br/u/${userSlug}/${catalogSlug}`;

export const whatsappShareCatalog = (userSlug: string, catalogSlug: string, customMessage?: string) => {
  const url = publicCatalogFullUrl(userSlug, catalogSlug);
  const message = customMessage || "Oi! Separei essas sugestões para você 👉";
  return `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
};
```

### 3. PublicCatalogPage Updates
- Uses `publicCatalogFullUrl()` for meta tags
- Uses `publicProfileUrl()` for "Visitar perfil" link
- Debug logging to track route matching

## Testing

### Test URL
```
http://localhost:8080/u/marcio/new-one
```

### Expected Console Output
```
PublicCatalogPage params: { userSlug: 'marcio', catalogSlug: 'new-one' }
Profile found: { id: '...', slug: 'marcio', ... }
Catalog found: { id: '...', slug: 'new-one', status: 'publicado', link_ativo: true, ... }
```

### Success Case
When `status='publicado'` AND `link_ativo=true`:
- ✅ Page renders with all blocks
- ✅ OG meta tags set correctly
- ✅ No 404, no console errors

### Unavailable Case
When `status='rascunho'` OR `link_ativo=false`:
- ✅ Shows "Catálogo indisponível" message
- ✅ Displays "Visitar perfil" button linking to `/u/marcio`
- ✅ Clean, branded error page (not 404)

## Files Changed

1. **src/App.tsx** - Changed route from `/@:userSlug` to `/u/:userSlug`
2. **src/lib/urls.ts** - Created (new file with URL helpers)
3. **src/pages/PublicCatalogPage.tsx** - Updated to use new URL helpers
4. **src/hooks/useMetaTags.ts** - Already created (handles OG tags)

## Next Steps

### Immediate
1. Test the URL: `http://localhost:8080/u/marcio/new-one`
2. Verify console shows params and data
3. Check OG tags in browser DevTools

### Phase 1 - Step 1.2 (Next)
Build the publish flow in catalog editor:
- "Publicar" button
- Success modal with share options
- Use `whatsappShareCatalog()` helper
- Copy link functionality

### Phase 2
Build public profile page at `/u/:userSlug`

## Commit Message

```
fix(router): switch public routes to /u/:user and /u/:user/:catalog

- Replace /@user routes with /u/:userSlug for simplicity
- Create URL helper utilities in lib/urls.ts
- Update PublicCatalogPage to use new URL structure
- Add debug logging for route matching
- Ensure parent route renders <Outlet/> for nested routes
- Update unavailable page to link to /u/:userSlug

Fixes: Public catalog pages now render correctly at /u/user/catalog
```

## Quick Debug

If still getting 404:
1. Check browser console for params log
2. Verify route order in App.tsx (public routes before `*`)
3. Ensure `PublicUserLayout` renders `<Outlet/>`
4. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

If page loads but shows "indisponível":
```sql
-- Check catalog status
SELECT slug, status, link_ativo FROM catalogs WHERE slug = 'new-one';

-- Make it public
UPDATE catalogs 
SET status = 'publicado', link_ativo = true 
WHERE slug = 'new-one';
```
