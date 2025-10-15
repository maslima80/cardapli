# 🚀 Cardapli - Implementation Plan
**Target Launch:** After all features are implemented and tested
**Approach:** Incremental, safe, test-commit-push cycles

---

## 📊 Current Status Analysis

### ✅ What's Already Working
1. **Authentication & Onboarding**
   - Sign up, login, password recovery
   - Slug selection
   - Profile management (basic info, locations, socials)

2. **Products System** 
   - Full CRUD for products
   - Photos, descriptions, categories, tags
   - Product variants system (options + combinations)
   - Multi-select and filtering

3. **Catalog Builder (CatalogoEditor)**
   - Block system fully implemented
   - All block types working: Hero, Text, Image, Video, Divider, Product Grid, Categories, Tags, About, Benefits, Steps, FAQ, Important Info, Testimonials, Locations, Contact, Social
   - Drag & drop reordering
   - Block settings with proper persistence
   - Preview system

4. **Catalogs Management (/catalogos)**
   - List view
   - Basic CRUD operations

5. **Database Structure**
   - `profiles` table
   - `products` table with variants
   - `catalogs` table
   - `catalog_blocks` table

---

## 🎯 What Needs to Be Built

### 🔴 CRITICAL (Must have for launch)

1. **Public Catalog Page (`/c/[slug]`)**
   - Render catalog_blocks publicly
   - Responsive design
   - OG tags for sharing
   - Mobile-first layout

2. **Public Profile Page (`/@[slug]`)**
   - New table: `profile_blocks`
   - Render profile_blocks publicly
   - Link-in-bio style layout
   - Show catalogs section

3. **Profile Builder in /perfil**
   - Add "Montar Página Pública" section
   - Reuse same block system from catalog editor
   - New block type: "Catálogos" (shows selected catalogs)
   - Save to `profile_blocks` table

4. **Quick Catalog Flow (/compartilhar)**
   - Product selection interface
   - Quick catalog creation modal
   - Auto-generate title, cover, slug
   - Default: Publicado + Link Ativo + Não adicionado ao perfil
   - Immediate share modal

5. **Three-State Catalog Control System**
   - Status: "Rascunho" / "Publicado" (content readiness)
   - Link: "Ativo" / "Desativado" (URL accessibility)
   - Perfil: "Adicionado" / "Não adicionado" (shown on /@slug)
   - Smart guardrails and prompts

6. **Share Modal (Enhanced)**
   - WhatsApp deep link
   - Copy link with toast
   - Email share
   - QR Code generation
   - Preview with OG tags

### 🟡 IMPORTANT (Polish & UX)

7. **Templates System**
   - Base templates (3-5 visual styles)
   - Template picker UI
   - Apply template to catalog/profile
   - Color schemes and typography

8. **Dashboard Improvements**
   - Recent catalogs
   - Quick actions
   - Analytics preview (future)

9. **Catalog Actions**
   - "Adicionar ao perfil" button
   - Duplicate catalog
   - Archive/delete with confirmation

10. **Empty States & Onboarding**
    - Empty state messages (PT-BR)
    - First-time user guidance
    - Tooltips and hints

---

## 📋 Implementation Phases

### **PHASE 1: Public Pages Foundation** (Week 1)
**Goal:** Make catalogs and profiles publicly accessible

#### Step 1.1: Public Catalog Page
- [ ] Create `/c/[slug]` route
- [ ] Fetch catalog + blocks from database
- [ ] Render blocks using BlockRenderer
- [ ] Add responsive layout
- [ ] Test with existing catalogs
- [ ] **Commit:** "feat: add public catalog page rendering"

#### Step 1.2: OG Tags & SEO
- [ ] Add meta tags component
- [ ] Generate OG image from catalog cover
- [ ] Add title, description meta tags
- [ ] Test sharing on WhatsApp/Instagram
- [ ] **Commit:** "feat: add OG tags for catalog sharing"

#### Step 1.3: Database for Profile Blocks
- [ ] Create migration for `profile_blocks` table
- [ ] Structure: `id, user_id, type, data, order, visible`
- [ ] Add RLS policies
- [ ] Test migration
- [ ] **Commit:** "feat: add profile_blocks table"

#### Step 1.4: Public Profile Page
- [ ] Create `/@[slug]` route
- [ ] Fetch profile + profile_blocks
- [ ] Render header (logo, name, slogan)
- [ ] Render blocks
- [ ] Link-in-bio style layout
- [ ] **Commit:** "feat: add public profile page"

---

### **PHASE 2: Profile Builder** (Week 2)
**Goal:** Let users build their public profile page

#### Step 2.1: Profile Builder UI
- [ ] Add "Montar Página Pública" section to /perfil
- [ ] Add preview button (opens /@slug in new tab)
- [ ] Add "Copiar link" button
- [ ] Show current URL: `cardapli.com.br/@{slug}`
- [ ] **Commit:** "feat: add profile builder section UI"

#### Step 2.2: Reuse Block System
- [ ] Create ProfileBlocksEditor component (similar to CatalogoEditor)
- [ ] Reuse AddBlockDrawer
- [ ] Reuse BlockSettingsDrawer
- [ ] Reuse BlockRenderer for preview
- [ ] Save to `profile_blocks` table
- [ ] **Commit:** "feat: add profile blocks editor"

#### Step 2.3: Catalogs Block (Special)
- [ ] Create CatalogsBlock component
- [ ] Create CatalogsBlockSettings component
- [ ] Options: "Mostrar todos" or "Selecionar manualmente"
- [ ] Multi-select catalogs
- [ ] Drag & drop to reorder
- [ ] Render as cards on public profile
- [ ] **Commit:** "feat: add catalogs block for profile"

---

### **PHASE 3: Quick Catalog Flow** (Week 3)
**Goal:** Enable instant catalog creation from products

#### Step 3.1: /compartilhar Page
- [ ] Create Compartilhar page
- [ ] Product selection interface (reuse from /produtos)
- [ ] Multi-select with checkboxes
- [ ] Filter by category/tag
- [ ] "Criar Catálogo" button
- [ ] **Commit:** "feat: add compartilhar page with product selection"

#### Step 3.2: Quick Catalog Modal
- [ ] Create QuickCatalogModal component
- [ ] Auto-generate title (e.g., "Sugestões - 15 Out 2025")
- [ ] Auto-select cover (first product image)
- [ ] Layout picker (grid/list)
- [ ] Optional description field
- [ ] Optional template picker
- [ ] Generate slug automatically
- [ ] **Commit:** "feat: add quick catalog creation modal"

#### Step 3.3: Auto-Generate Catalog
- [ ] Create catalog with visibility="unlisted"
- [ ] Add hero block with cover
- [ ] Add product grid block with selected products
- [ ] Save to database
- [ ] Show success toast
- [ ] Open share modal immediately
- [ ] **Commit:** "feat: implement quick catalog generation"

#### Step 3.4: Share Modal Enhancement
- [ ] Create ShareModal component
- [ ] WhatsApp button with deep link
- [ ] Copy link button with toast feedback
- [ ] Email share button
- [ ] QR Code generation (use qrcode.react)
- [ ] Preview section
- [ ] **Commit:** "feat: add enhanced share modal"

---

### **PHASE 4: Three-State Catalog Control System** (Week 4)
**Goal:** Give users granular control with three independent toggles

#### Step 4.1: Database Schema
- [ ] Add `status` column: "rascunho" | "publicado"
- [ ] Add `link_ativo` column: boolean (default: false)
- [ ] Add `no_perfil` column: boolean (default: false)
- [ ] Migration with proper defaults
- [ ] **Commit:** "feat: add three-state catalog control schema"

#### Step 4.2: Catalog Card UI (Mobile-First)
- [ ] Add status chip: "Rascunho" (yellow) or "Publicado" (green)
- [ ] Add link chip: "Link ativo" (blue) or "Link desativado" (gray)
- [ ] Add perfil chip: "No perfil" (purple) or "Fora do perfil" (gray)
- [ ] Compact design for mobile
- [ ] **Commit:** "feat: add catalog status chips UI"

#### Step 4.3: Quick Actions Menu
- [ ] "Publicar" / "Voltar para rascunho" toggle
- [ ] "Ativar link" / "Desativar link" toggle
- [ ] "Adicionar ao perfil" / "Remover do perfil" toggle
- [ ] "Compartilhar" (opens share modal)
- [ ] "Editar" / "Duplicar" / "Excluir"
- [ ] **Commit:** "feat: add catalog quick actions"

#### Step 4.4: Guardrails & Smart Prompts
- [ ] Prompt when adding to perfil with link desativado:
  - "Para mostrar no perfil, ative o link deste catálogo."
  - [Ativar link e adicionar] [Cancelar]
- [ ] Auto-remove from perfil when link is deactivated
- [ ] Show toast: "Link desativado. Catálogo removido do perfil."
- [ ] **Commit:** "feat: add catalog control guardrails"

#### Step 4.5: URL Access Logic
- [ ] `/c/[slug]` with link_ativo=true → render normally
- [ ] `/c/[slug]` with link_ativo=false → show "Catálogo indisponível" page
- [ ] Rascunho catalogs → treat as link desativado (owner preview only in app)
- [ ] "Indisponível" page: branded, with CTA to visit /@slug
- [ ] **Commit:** "feat: implement catalog URL access logic"

#### Step 4.6: Profile Builder Integration
- [ ] Catálogos block only shows catalogs where no_perfil=true
- [ ] Filter: status="publicado" AND link_ativo=true
- [ ] Drag & drop to reorder
- [ ] Toggle to add/remove from perfil
- [ ] **Commit:** "feat: integrate catalog control with profile builder"

---

### **PHASE 5: Templates & Polish** (Week 5)
**Goal:** Visual customization and UX improvements

#### Step 5.1: Base Templates
- [ ] Create 3-5 template definitions (colors, fonts, layouts)
- [ ] Store in database or config file
- [ ] Create TemplatePicker component
- [ ] Apply template to catalog/profile
- [ ] **Commit:** "feat: add base templates system"

#### Step 5.2: Empty States
- [ ] Add empty state for /catalogos
- [ ] Add empty state for /produtos
- [ ] Add empty state for profile builder
- [ ] Add empty state for /compartilhar
- [ ] PT-BR messages from spec
- [ ] **Commit:** "feat: add empty states with PT-BR messages"

#### Step 5.3: Catalog Actions
- [ ] Duplicate catalog function
- [ ] Archive/delete with confirmation modal
- [ ] Bulk actions (future)
- [ ] **Commit:** "feat: add catalog duplicate and delete"

#### Step 5.4: Dashboard Enhancements
- [ ] Show recent catalogs (last 5)
- [ ] Quick action cards
- [ ] Link to /compartilhar
- [ ] Stats preview (catalogs count, products count)
- [ ] **Commit:** "feat: enhance dashboard with quick actions"

---

### **PHASE 6: Final Testing & Launch Prep** (Week 6)
**Goal:** Ensure everything works perfectly

#### Step 6.1: End-to-End Testing
- [ ] Test full user journey (signup → products → catalog → share)
- [ ] Test public pages on mobile
- [ ] Test sharing on WhatsApp
- [ ] Test all block types
- [ ] Test visibility states
- [ ] Fix any bugs found

#### Step 6.2: Performance & SEO
- [ ] Optimize images
- [ ] Add loading states
- [ ] Test page speed
- [ ] Verify OG tags work
- [ ] Add analytics (optional)

#### Step 6.3: Documentation
- [ ] Update README
- [ ] Create user guide (optional)
- [ ] Document API/database schema
- [ ] Prepare launch checklist

---

## 🎨 Design Principles

### Mobile-First
- All layouts must work perfectly on mobile
- Touch-friendly buttons (min 44px)
- Thumb-friendly navigation

### Brazilian UX
- All text in PT-BR
- WhatsApp as primary share method
- Simple, clear language
- Emoji-friendly 😊

### Speed
- Quick Catalog should take <30 seconds
- Profile builder should be intuitive
- No unnecessary steps

---

## 💡 Additional Ideas & Enhancements

### Short-term Wins
1. **Product Import from Instagram**
   - Scrape Instagram posts
   - Auto-create products from photos
   - Save time for users

2. **Catalog Analytics**
   - View count per catalog
   - Click tracking on products
   - Most shared catalogs

3. **WhatsApp Integration**
   - Direct "Pedir no WhatsApp" button on products
   - Pre-filled message template
   - Order tracking via WhatsApp

4. **Seasonal Templates**
   - Páscoa, Natal, Dia das Mães
   - Auto-suggest based on date
   - Quick apply

### Long-term Vision
1. **Payment Integration** (optional)
   - Pix QR code on products
   - Simple checkout (no cart)
   - Order notifications

2. **Customer Management**
   - Save customer contacts
   - Order history
   - Repeat customer detection

3. **Inventory Alerts**
   - Low stock warnings
   - Auto-hide sold out products
   - Restock reminders

4. **Collaboration**
   - Multiple users per business
   - Role-based permissions
   - Team catalogs

---

## 🎯 Success Metrics

### Launch Goals
- [ ] 100% of spec features implemented
- [ ] Zero critical bugs
- [ ] Mobile responsive (100%)
- [ ] Fast loading (<3s)
- [ ] WhatsApp sharing works perfectly

### User Success
- [ ] User can create first catalog in <5 minutes
- [ ] User can share catalog in <30 seconds
- [ ] Public profile looks professional
- [ ] Products display beautifully

---

## 🚦 Risk Mitigation

### Technical Risks
- **Block system complexity:** Already solved ✅
- **Performance with many products:** Use pagination
- **Image loading:** Lazy load + optimization
- **Mobile compatibility:** Test on real devices

### UX Risks
- **Too many options:** Keep it simple, hide advanced features
- **Confusing flow:** Add onboarding tooltips
- **Empty states:** Guide users with clear CTAs

---

## 📝 Notes

- Each phase should be completed, tested, and committed before moving to next
- Always test on mobile after each feature
- Keep commits atomic and descriptive
- Update this plan as we discover new requirements
- Celebrate small wins! 🎉

---

**Next Step:** Start with Phase 1, Step 1.1 - Public Catalog Page
**Estimated Total Time:** 6 weeks (can be adjusted based on progress)
**Priority:** Focus on making existing features work publicly before adding new ones
