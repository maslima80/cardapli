# 🚀 Cardapli - Implementation Plan V2 (CORRECTED)
**Updated:** Oct 15, 2025
**Approach:** Incremental, safe, test-commit-push cycles
**Target:** Brazilian micro-entrepreneurs (MEIs) selling via WhatsApp

---

## 📊 Current Status

### ✅ What's Working
1. **Authentication & Onboarding** - Sign up, login, slug selection
2. **Products System** - Full CRUD with variants
3. **Catalog Builder** - All block types, drag & drop, settings
4. **Catalogs Management** - List view, basic CRUD

### 🔴 What's Broken/Incomplete
1. **Public pages don't exist** - Routes exist but pages don't render
2. **Publish flow is confusing** - Too technical, not mobile-first
3. **URL strategy unclear** - `/c/slug` vs `/@user/slug` confusion
4. **No success modal** - After publish, no WhatsApp share option

---

## 🎯 Core Principles (FIXED)

### 0️⃣ Routing & URLs

**Canonical Routes:**
- Profile: `/@{userSlug}`
- Catalog: `/@{userSlug}/{catalogSlug}`

**NOT using `/c/[slug]`** (causes collision issues)

**Database:**
- `UNIQUE(user_id, slug)` - per-user slug uniqueness
- Future: `redirects` table for username changes

**Example:**
- User: `@docesdamaria`
- Catalog: `catalogo-pascoa`
- URL: `cardapli.com.br/@docesdamaria/catalogo-pascoa`

---

### 1️⃣ Three-State Publish Model (SIMPLIFIED)

**Remove** "Visibilidade" dropdown from creation.

**Three independent states:**

| State | Values | Managed By | Default (New) | Default (Quick) |
|-------|--------|------------|---------------|-----------------|
| **Status** | `rascunho` \| `publicado` | Publish dialog | `rascunho` | `publicado` |
| **Link** | `ativo` \| `desativado` | Publish dialog | `desativado` | `ativo` |
| **Perfil** | `adicionado` \| `não adicionado` | Profile builder | `não adicionado` | `não adicionado` |

**Guardrails:**
- To add to perfil: requires `status=publicado` AND `link=ativo`
- If user tries to add with link off → prompt:
  > "Para mostrar no seu perfil, ative o link deste catálogo."
  > [Ativar e adicionar] [Cancelar]

---

## 📋 Implementation Phases

### **PHASE 1: Fix Public Pages** (Week 1) 🔴 URGENT

#### Step 1.1: Public Catalog Page
- [x] Route exists: `/@:slug/:catalog_slug`
- [ ] Fix PublicCatalogPage to properly check `status` and `link_ativo`
- [ ] Add OG meta tags for WhatsApp sharing
- [ ] Test: Create catalog → Publish → Visit URL → Should render
- [ ] **Commit:** "fix: public catalog page renders correctly"

#### Step 1.2: Fix Publish Flow
- [x] Removed "Mostrar no Perfil" toggle (premature)
- [ ] Ensure `link_ativo` is saved correctly on publish
- [ ] Add success modal after publish:
  ```
  🎉 Seu catálogo foi publicado!
  
  🔗 cardapli.com.br/@user/catalog
  
  [Enviar no WhatsApp] [Copiar link] [Ver catálogo]
  ```
- [ ] **Commit:** "feat: add success modal with WhatsApp share"

#### Step 1.3: Database Migrations
- [ ] Run migration to add `link_ativo` and `no_perfil` columns
- [ ] Update status constraint to accept `'rascunho'` and `'publicado'`
- [ ] Migrate existing data:
  - `draft` → `rascunho`
  - `public`/`unlisted` → `publicado` + `link_ativo=true`
- [ ] **Commit:** "migration: add three-state columns"

---

### **PHASE 2: Profile Builder** (Week 2)

#### Step 2.1: Profile Blocks Table
- [ ] Create `profile_blocks` table (same structure as `catalog_blocks`)
- [ ] Add RLS policies
- [ ] **Commit:** "migration: add profile_blocks table"

#### Step 2.2: Public Profile Page
- [ ] Create route: `/@:slug`
- [ ] Render `profile_blocks` publicly
- [ ] Link-in-bio style layout
- [ ] Mobile-first responsive
- [ ] **Commit:** "feat: public profile page"

#### Step 2.3: Profile Builder UI
- [ ] Add "Montar Página Pública" section to `/perfil`
- [ ] Reuse block system from catalog editor
- [ ] Add drag & drop
- [ ] **Commit:** "feat: profile builder UI"

#### Step 2.4: Catálogos Block
- [ ] New block type: "Catálogos"
- [ ] Options:
  - "Mostrar todos" (auto-show all published+active)
  - "Selecionar manualmente" (multi-select + drag & drop)
- [ ] Filter: only show `status=publicado` AND `link_ativo=true`
- [ ] Toggle sets `no_perfil=true/false`
- [ ] **Commit:** "feat: Catálogos block for profile"

---

### **PHASE 3: Quick Catalog Flow** (Week 3)

#### Step 3.1: Product Selection Page
- [ ] Create `/compartilhar` route
- [ ] Multi-select products
- [ ] Filter by category/tags
- [ ] **Commit:** "feat: product selection for quick catalog"

#### Step 3.2: Quick Catalog Modal
- [ ] Auto-generate title from selection
- [ ] Auto-cover from first product image
- [ ] Optional description
- [ ] Optional layout picker
- [ ] **NO visibility dropdown**
- [ ] **Commit:** "feat: quick catalog modal"

#### Step 3.3: Auto-Publish & Share
- [ ] After create:
  - Set `status=publicado`
  - Set `link_ativo=true`
  - Set `no_perfil=false`
- [ ] Show share modal immediately
- [ ] WhatsApp deep link with pre-filled message
- [ ] **Commit:** "feat: quick catalog auto-publish"

---

### **PHASE 4: Catalog Cards Enhancement** (Week 4)

#### Step 4.1: Three-State Chips
- [ ] Status chip: 🟣 Rascunho | 🟢 Publicado
- [ ] Link chip: 🔵 Link ativo | ⚪ Link desativado
- [ ] Perfil chip: 🌐 No perfil | 🚫 Fora do perfil
- [ ] **Commit:** "feat: three-state status chips"

#### Step 4.2: Quick Actions Menu
- [ ] Publicar / Voltar p/ rascunho
- [ ] Ativar/Desativar link
- [ ] Adicionar/Remover do perfil (with guardrails)
- [ ] Compartilhar (opens share modal)
- [ ] Editar
- [ ] Duplicar
- [ ] Excluir
- [ ] **Commit:** "feat: catalog quick actions"

#### Step 4.3: Copy Link Fix
- [ ] Use `/@{user}/{catalogSlug}` format
- [ ] Add toast on copy
- [ ] **Commit:** "fix: copy link uses correct URL format"

---

### **PHASE 5: Polish & UX** (Week 5)

#### Step 5.1: Micro-Copy Updates
- [ ] New Catalog dialog: "Você pode mudar o endereço e a imagem depois."
- [ ] Publish dialog: "Você pode adicionar ao seu perfil a qualquer momento em /perfil."
- [ ] Unavailable page: "Este catálogo está indisponível no momento. Veja outras opções em /@{userSlug}."
- [ ] **Commit:** "polish: PT-BR micro-copy improvements"

#### Step 5.2: Empty States
- [ ] No catalogs yet
- [ ] No products yet
- [ ] Empty profile builder
- [ ] All with friendly PT-BR copy
- [ ] **Commit:** "polish: add empty states"

#### Step 5.3: Templates System
- [ ] 3-5 base templates (colors, fonts, layouts)
- [ ] Template picker in catalog settings
- [ ] Apply to catalog
- [ ] **Commit:** "feat: basic templates system"

---

### **PHASE 6: Testing & Launch Prep** (Week 6)

#### Step 6.1: QA Checklist
- [ ] Create catalog (no visibility asked) → builder opens
- [ ] Add 1 block → Publish dialog with one toggle
- [ ] Publish with link ON → success modal → URL works
- [ ] Add to perfil in `/perfil` → appears on `/@user`
- [ ] Turn link OFF → catalog disappears from perfil with toast
- [ ] Quick catalog from `/compartilhar` → directly published + link ON
- [ ] Slug uniqueness per user works
- [ ] Mobile responsive on real devices

#### Step 6.2: Performance
- [ ] Optimize image loading
- [ ] Add loading skeletons
- [ ] Test on slow 3G

#### Step 6.3: Documentation
- [ ] User guide (PT-BR)
- [ ] FAQ
- [ ] Video tutorial (optional)

---

## 🗄️ Database Schema (Final)

### `catalogs` table
```sql
CREATE TABLE catalogs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover JSONB,
  
  -- Three-state system
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
  link_ativo BOOLEAN DEFAULT false,
  no_perfil BOOLEAN DEFAULT false,
  
  settings JSONB,
  theme_overrides JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, slug)
);
```

### `profile_blocks` table
```sql
CREATE TABLE profile_blocks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  sort INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `redirects` table (future)
```sql
CREATE TABLE redirects (
  old_slug TEXT PRIMARY KEY,
  new_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 Success Metrics

### Before (Current State)
- ❌ Public pages don't work
- ❌ Publish flow confusing
- ❌ Can't share on WhatsApp
- ❌ No profile builder

### After (Target State)
- ✅ Public pages work perfectly
- ✅ Publish in 2 clicks
- ✅ WhatsApp share with preview
- ✅ Profile builder with catalog block
- ✅ Quick catalog in 30 seconds

---

## 🚫 What We're NOT Doing

1. **NOT using `/c/[slug]`** - causes collision issues
2. **NOT asking for visibility upfront** - too confusing
3. **NOT showing "Mostrar no Perfil" in publish** - managed in profile builder
4. **NOT using English terms** - 100% PT-BR
5. **NOT building e-commerce** - just presentation + sharing

---

## 📱 Mobile-First Checklist

- [ ] All dialogs work on 375px width
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll
- [ ] WhatsApp share works on mobile
- [ ] Copy link works on mobile
- [ ] Images optimized for mobile

---

## 🇧🇷 PT-BR Copy Standards

| English | ❌ Don't Use | ✅ Use Instead |
|---------|-------------|----------------|
| Draft | Rascunho | Em edição |
| Published | Publicado | Publicado |
| Unlisted | Não listado | (removed) |
| Visibility | Visibilidade | (removed) |
| Share | Compartilhar | Compartilhar |
| Create | Criar | Criar |
| Publish | Publicar | Publicar |

---

## 🎉 Launch Readiness

### Must Have
- [x] Catalog creation works
- [ ] Public pages render
- [ ] Publish flow simple
- [ ] WhatsApp share works
- [ ] Profile builder works
- [ ] Mobile responsive

### Nice to Have
- [ ] Templates
- [ ] Analytics
- [ ] Duplicate catalog
- [ ] Archive feature

---

## 📞 Support for Confeiteira Persona

**Key Questions They'll Ask:**
1. "Como compartilho meu catálogo?" → WhatsApp button in success modal
2. "Como adiciono ao meu perfil?" → Profile builder tutorial
3. "Como desativo um catálogo?" → Quick actions menu
4. "Por que meu link não funciona?" → Check if link is "ativo"

**Documentation Priority:**
1. Video: "Criar e compartilhar seu primeiro catálogo"
2. Guide: "Montar sua página pública"
3. FAQ: "Perguntas frequentes"

---

## 🔄 Migration Path

### From Old System
```sql
-- Migrate old status values
UPDATE catalogs 
SET status = CASE 
  WHEN status = 'draft' THEN 'rascunho'
  WHEN status IN ('public', 'unlisted') THEN 'publicado'
  ELSE 'rascunho'
END;

-- Set link_ativo for published catalogs
UPDATE catalogs 
SET link_ativo = true 
WHERE status = 'publicado';

-- All start with no_perfil = false
UPDATE catalogs 
SET no_perfil = false;
```

---

## ✅ Definition of Done

Each feature is done when:
1. Code works on desktop
2. Code works on mobile (375px)
3. PT-BR copy is friendly
4. Committed with clear message
5. Pushed to main
6. Tested end-to-end

---

**Next Step:** Fix Phase 1, Step 1.1 - Make public catalog page work! 🚀
