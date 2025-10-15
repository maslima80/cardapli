# Testing Public Catalog Page - Phase 1 Step 1.1

## ✅ What We Fixed

1. **Added OG Meta Tags** - The public catalog page now includes proper Open Graph and Twitter Card meta tags for social sharing
2. **Verified Route** - Route is correctly set as `/@:slug/:catalog_slug` 
3. **Database Schema** - Confirmed `link_ativo` and `status` columns exist via migrations
4. **Access Guards** - Page only shows when `status='publicado'` AND `link_ativo=true`

## 🧪 How to Test

### Step 1: Verify Your Database

Run this SQL in Supabase SQL Editor to check your catalogs:

```sql
SELECT 
  c.id,
  c.title,
  c.slug as catalog_slug,
  c.status,
  c.link_ativo,
  c.no_perfil,
  p.slug as user_slug,
  p.business_name
FROM catalogs c
JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC;
```

**What to look for:**
- You need at least one catalog with `status = 'publicado'` and `link_ativo = true`
- Note the `user_slug` and `catalog_slug` for testing

### Step 2: Make a Catalog Public (if needed)

If you don't have a public catalog, run this SQL:

```sql
-- Update your catalog to be public
UPDATE catalogs 
SET 
  status = 'publicado',
  link_ativo = true
WHERE id = 'YOUR_CATALOG_ID_HERE';
```

### Step 3: Test the Public URL

With your dev server running at `http://localhost:8080`, visit:

```
http://localhost:8080/@{user_slug}/{catalog_slug}
```

**Example:**
```
http://localhost:8080/@docesdamaria/catalogo-pascoa
```

### Expected Results

#### ✅ Success Case (status='publicado', link_ativo=true)
- Catalog renders with all blocks visible
- Cover image displays (if set)
- All product grids, text blocks, etc. render correctly
- Footer shows business name and "Feito com Cardapli"
- No console errors

#### ⚠️ Unavailable Case (status='rascunho' OR link_ativo=false)
- Shows "Catálogo indisponível" message
- Displays "Visitar perfil" button (if user has a slug)
- Clean, branded error page

### Step 4: Verify Meta Tags

1. Open the public catalog page
2. Open browser DevTools (F12)
3. Go to Elements/Inspector tab
4. Look at the `<head>` section
5. You should see:

```html
<meta property="og:title" content="Your Catalog Title | Cardapli">
<meta property="og:description" content="Your catalog description">
<meta property="og:image" content="https://...cover-image-url">
<meta property="og:url" content="https://cardapli.com.br/@user/catalog">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://cardapli.com.br/@user/catalog">
```

### Step 5: Test Mobile Responsiveness

1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Test these viewports:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

**Expected:** Layout adapts smoothly, all content is readable

## 🐛 Troubleshooting

### Issue: "Catálogo indisponível" even though link_ativo is true

**Check:**
```sql
SELECT status, link_ativo FROM catalogs WHERE slug = 'your-catalog-slug';
```

**Solution:**
- Ensure `status = 'publicado'` (not 'rascunho', 'draft', etc.)
- Ensure `link_ativo = true` (not false or null)
- Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Blocks not showing

**Check:**
```sql
SELECT * FROM catalog_blocks 
WHERE catalog_id = 'YOUR_CATALOG_ID' 
ORDER BY sort;
```

**Solution:**
- Ensure blocks have `visible = true`
- Ensure blocks are properly saved with the catalog_id
- Check browser console for errors

### Issue: Profile slug not found

**Check:**
```sql
SELECT id, slug, business_name FROM profiles WHERE slug = 'your-user-slug';
```

**Solution:**
- Ensure the profile has a slug set
- If not, update it: `UPDATE profiles SET slug = 'yourslug' WHERE id = 'user-id';`

### Issue: Cover image not showing in meta tags

**Check the catalog's cover field:**
```sql
SELECT cover FROM catalogs WHERE slug = 'your-catalog-slug';
```

**Expected format:**
```json
{
  "url": "https://ik.imagekit.io/cardapli/...",
  "image_url": "https://ik.imagekit.io/cardapli/..."
}
```

## 📋 Acceptance Criteria Checklist

- [ ] Public catalog URL `/@{userSlug}/{catalogSlug}` renders correctly
- [ ] Only shows when `status='publicado'` AND `link_ativo=true`
- [ ] Shows "Catálogo indisponível" for drafts or inactive links
- [ ] OG meta tags are present in `<head>`
- [ ] Meta tags include title, description, and cover image
- [ ] Canonical URL is set correctly
- [ ] Mobile responsive (works on 375px width)
- [ ] No console errors
- [ ] Footer displays correctly
- [ ] All block types render properly

## 🎯 Next Steps

Once this is working:
1. **Phase 1 Step 1.2** - Build the simplified publish flow in the catalog editor
2. **Phase 1 Step 1.3** - Ensure all existing catalogs are migrated properly
3. **Phase 2** - Build the public profile page (`/@{userSlug}`)

## 📝 Commit Message

When everything works:
```
feat: implement functional public catalog page rendering

- Add useMetaTags hook for OG/Twitter meta tags
- Verify route /@:slug/:catalog_slug works correctly
- Add access guards for status and link_ativo
- Include canonical URL and social sharing tags
- Ensure mobile-first responsive design
- Add unavailable state with profile link
```

## 🔍 Quick Debug Commands

```sql
-- See all your catalogs and their status
SELECT 
  c.title,
  c.slug,
  c.status,
  c.link_ativo,
  p.slug as user_slug
FROM catalogs c
JOIN profiles p ON c.user_id = p.id;

-- Make a catalog public
UPDATE catalogs 
SET status = 'publicado', link_ativo = true
WHERE slug = 'your-catalog-slug';

-- Count blocks in a catalog
SELECT COUNT(*) FROM catalog_blocks 
WHERE catalog_id = 'YOUR_CATALOG_ID' AND visible = true;
```
