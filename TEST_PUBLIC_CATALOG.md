# Testing the Public Catalog Page

## Before Testing

1. ✅ Apply the database migration (see `APPLY_MIGRATION.md`)
2. ✅ Restart your dev server: `npm run dev`

## Test Scenario 1: View a Public Catalog

### Setup:
1. Go to `/catalogos` in your app
2. Create a new catalog or select an existing one
3. Add some blocks (Hero, Text, Product Grid, etc.)
4. Note the catalog's slug (e.g., "meu-catalogo-teste")

### Test:
1. Open a new browser tab
2. Go to: `http://localhost:5173/c/meu-catalogo-teste`
3. **Expected:** You should see "Catálogo indisponível" (because `link_ativo` defaults to `false`)

### Fix:
1. Go to Supabase Dashboard → Table Editor → `catalogs`
2. Find your test catalog
3. Set `link_ativo` to `true`
4. Set `status` to `publicado` (if it's not already)
5. Refresh `/c/meu-catalogo-teste`
6. **Expected:** Your catalog renders beautifully! 🎉

## Test Scenario 2: Unavailable Catalog

### Test:
1. In Supabase, set `link_ativo` to `false` for your test catalog
2. Visit `/c/meu-catalogo-teste`
3. **Expected:** 
   - "Catálogo indisponível" message
   - If the user has a profile slug, shows "Visitar perfil" button
   - Clean, branded error page

## Test Scenario 3: Draft Catalog

### Test:
1. In Supabase, set:
   - `status` = `rascunho`
   - `link_ativo` = `true`
2. Visit `/c/meu-catalogo-teste`
3. **Expected:** "Catálogo indisponível" (drafts are never public)

## Test Scenario 4: Mobile Responsiveness

### Test:
1. With a working catalog (`status=publicado`, `link_ativo=true`)
2. Open Chrome DevTools (F12)
3. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
4. Test different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
5. **Expected:** Layout adapts beautifully, all blocks are readable

## Test Scenario 5: Different Block Types

### Test:
Make sure your test catalog has:
- Hero block (with image)
- Text block
- Product Grid block
- Contact block
- Social block

Visit `/c/meu-catalogo-teste` and verify all blocks render correctly.

## Success Criteria ✅

- [ ] Public catalogs with `link_ativo=true` render perfectly
- [ ] Catalogs with `link_ativo=false` show unavailable page
- [ ] Draft catalogs (`status=rascunho`) show unavailable page
- [ ] All block types render correctly
- [ ] Mobile responsive (works on 375px width)
- [ ] Loading state shows briefly
- [ ] Footer shows business name
- [ ] No console errors
- [ ] No breaking changes to existing features

## Common Issues

### Issue: TypeScript errors in IDE
**Solution:** Regenerate types after migration:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

### Issue: "Catálogo indisponível" even though link_ativo is true
**Check:**
- Is `status` set to `publicado`? (not `rascunho`)
- Is `link_ativo` actually `true` in the database?
- Did you refresh the page after changing the database?

### Issue: Blocks not showing
**Check:**
- Do blocks have `visible = true` in `catalog_blocks` table?
- Are blocks properly saved with `catalog_id`?
- Check browser console for errors

## Next: Share on WhatsApp

Once this works, we'll add OG tags so when you share the link on WhatsApp, it shows a beautiful preview! 📱
