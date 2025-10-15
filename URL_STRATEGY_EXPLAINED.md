# Cardapli URL Strategy - Why User-Scoped URLs

## The Problem You Caught 🎯

**Question:** "If we use `/c/catalogo-natal`, won't multiple users create collisions?"

**Answer:** YES! Absolutely correct. This would cause major problems.

---

## The Solution: User-Scoped URLs

### Database Schema (Already Correct!)
```sql
CREATE TABLE catalogs (
  user_id UUID NOT NULL,
  slug TEXT NOT NULL,
  CONSTRAINT unique_user_catalog_slug UNIQUE (user_id, slug)
);
```

**Key insight:** Slug is unique **per user**, not globally.

This means:
- ✅ User A (@docesdamaria) can have `catalogo-natal`
- ✅ User B (@artesanatos) can also have `catalogo-natal`
- ✅ No collision because they're scoped to different `user_id`s

---

## Final URL Format

### ✅ Catalog URLs (User-Scoped)
**Format:** `/@[user-slug]/[catalog-slug]`

**Examples:**
- `cardapli.com.br/@docesdamaria/catalogo-natal`
- `cardapli.com.br/@artesanatos/catalogo-natal`
- `cardapli.com.br/@marcio/catalogo-2026`

**Why this works:**
1. No collisions (scoped to user)
2. Shows business context
3. SEO friendly (Google knows who owns it)
4. Aligns with social media mental model (@username/content)
5. If user changes @slug, we can redirect old URLs

---

## How It Works in Practice

### User Journey 1: Creating & Sharing
1. User creates "Catálogo de Natal"
2. System generates slug: `catalogo-natal`
3. Checks uniqueness for THIS user only
4. Clicks "Publicar" → Gets URL: `/@docesdamaria/catalogo-natal`
5. Shares on WhatsApp
6. Customers click and see the catalog

### User Journey 2: Collision Handling
1. User A creates "Catálogo de Natal" → `/@usera/catalogo-natal` ✅
2. User B creates "Catálogo de Natal" → `/@userb/catalogo-natal` ✅
3. No collision! Each user has their own namespace

### User Journey 3: Duplicate Catalogs (Same User)
1. User creates "Catálogo de Natal" → `catalogo-natal`
2. User tries to create another "Catálogo de Natal"
3. System detects duplicate slug for THIS user
4. Auto-appends number: `catalogo-natal-2`
5. Both catalogs coexist: 
   - `/@user/catalogo-natal`
   - `/@user/catalogo-natal-2`

---

## The Three-State System

Each catalog has three independent controls:

### 1. Status (Content Readiness)
- **Rascunho:** Not published, preview only for owner
- **Publicado:** Ready to share

### 2. Link de Compartilhamento (URL Accessibility)
- **Ativo:** Anyone with URL can view
- **Desativado:** URL returns "indisponível"

### 3. No Perfil (Profile Visibility)
- **Adicionado:** Shows in profile's "Catálogos" block
- **Não adicionado:** Not shown on /@slug page

---

## Publish Modal Flow

When user clicks "Publicar":

```
┌─────────────────────────────────┐
│  Status do Conteúdo             │
│  ○ Rascunho                     │
│  ● Publicado ✓                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Link de Compartilhamento       │
│  ☑ Ativo                        │
│  "Qualquer pessoa com o link    │
│   pode acessar"                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Mostrar no Perfil              │
│  ☑ Sim                          │
│  "Aparecerá na sua página       │
│   @docesdamaria"                │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  URL para Compartilhar          │
│  cardapli.com.br/@docesdamaria/ │
│  catalogo-natal            [📋] │
└─────────────────────────────────┘
```

---

## Benefits of This Approach

### For Users
1. ✅ **No confusion** - Clear, readable URLs
2. ✅ **Brand context** - URL shows who made it
3. ✅ **No collisions** - Can use natural names
4. ✅ **Flexibility** - Three independent controls

### For SEO
1. ✅ **User attribution** - Google knows ownership
2. ✅ **Keyword-rich** - `/@docesdamaria/bolos-casamento`
3. ✅ **Shareable** - Clean URLs for social media

### For Development
1. ✅ **Simple routing** - `/@:slug/:catalog_slug`
2. ✅ **Database aligned** - Matches UNIQUE constraint
3. ✅ **Scalable** - No global slug conflicts

---

## Future: Short Links (Optional)

If URL length becomes an issue for WhatsApp, we can add:

**Short link service:**
- `cardapli.com.br/s/x7k2m` → redirects to `/@docesdamaria/catalogo-natal`
- Generated on-demand
- Tracked for analytics
- Optional, not required

---

## Summary

**The Fix:**
- ❌ `/c/catalogo-natal` (global, causes collisions)
- ✅ `/@docesdamaria/catalogo-natal` (user-scoped, no collisions)

**Why It's Better:**
- Prevents slug collisions
- Shows business context
- SEO friendly
- Aligns with social media patterns
- Matches database constraints

**Your instinct was 100% correct!** 🎯 The global `/c/` route would have caused major problems at scale.
