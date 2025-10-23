# 🔥 Product Slug Error Fix

## The Error
```
null value in column "slug" of relation "products" violates not-null constraint
```

## The Problem

The `products` table has a `slug` column that is **NOT NULL** (required), but:
1. ❌ No trigger to auto-generate slugs
2. ❌ Frontend code doesn't set slug when creating products
3. ❌ Result: 400 Bad Request when trying to save

---

## The Solution

**Add a database trigger** to auto-generate slugs from product titles.

### How It Works

When a product is created:
1. Takes the title: "Bolo de Chocolate"
2. Slugifies it: "bolo-de-chocolate"
3. Adds random suffix for uniqueness: "bolo-de-chocolate-a3f5d2"
4. Checks if slug exists for this user
5. If exists, adds counter: "bolo-de-chocolate-a3f5d2-1"
6. Saves with auto-generated slug ✅

---

## How to Apply

### Run Database Migration
**File:** `ADD_PRODUCT_SLUG_TRIGGER.sql`

Open Supabase SQL Editor and run it.

**This will:**
- Create `generate_product_slug()` function
- Create trigger on INSERT/UPDATE
- Auto-generate slugs for all new products

---

## Testing

1. **Refresh browser** (to clear any cached errors)
2. **Go to `/produtos`**
3. **Click "Novo Produto"**
4. **Enter:**
   - Title: "Bolo de Chocolate"
   - Toggle "Preço sob consulta" ON
5. **Click "Salvar Produto"**
6. ✅ Should save successfully!

---

## What Gets Generated

**Example slugs:**
- "Bolo de Chocolate" → `bolo-de-chocolate-a3f5d2`
- "Torta de Limão" → `torta-de-limao-b7e9c1`
- "Produto 123" → `produto-123-f4d8a6`

**Unique per user:**
- User A can have: `bolo-chocolate-a3f5d2`
- User B can have: `bolo-chocolate-b7e9c1`
- Same title, different slugs ✅

---

## Why This Happened

The migration `20251016000000_add_product_slug_and_public_link.sql`:
1. ✅ Added `slug` column
2. ✅ Backfilled slugs for existing products
3. ✅ Made slug NOT NULL
4. ❌ **Forgot to add trigger for new products!**

Now fixed with the trigger.

---

## Success Criteria

- [ ] Run `ADD_PRODUCT_SLUG_TRIGGER.sql`
- [ ] Refresh browser
- [ ] Can create product with just title (slug auto-generated)
- [ ] Can create product with "Sob consulta" enabled
- [ ] No more "slug violates not-null constraint" errors
- [ ] Products save successfully

---

## Combined Fixes Today

1. ✅ **Slug save** - Fixed in onboarding
2. ✅ **Theme removed** - Simplified to 4 steps
3. ✅ **Save and Continue** - Auto-navigation
4. ✅ **Price optional** - "Sob consulta" works
5. ✅ **Product slug** - Auto-generated ← **This fix**

**All working now!** 🎉
