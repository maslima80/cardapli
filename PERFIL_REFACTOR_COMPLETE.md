# /perfil Refactor — Complete ✅

## What Changed

The `/perfil` page has been completely reorganized into **two clear sections** with better UX and all original features restored.

---

## Section 1: Informações do Negócio

**Business Info Card** — All the essential business data

### Fields Included:
- ✅ **Logo** with thumbnail preview (64x64)
- ✅ **Nome do negócio** (required)
- ✅ **Slogan** (100 chars max)
- ✅ **Sobre o negócio** (400 chars max)
- ✅ **WhatsApp** (required)
- ✅ **Telefone**
- ✅ **E-mail público**
- ✅ **Redes sociais** (Instagram, Facebook, YouTube, Website)

### Theme Settings:
- ✅ **Tema**: Claro/Escuro toggle
- ✅ **Cor principal**: Color picker + hex input
- ✅ **Fonte**: Dropdown (Moderna, Elegante, Clean)
- ✅ **Forma dos botões**: Rounded/Square/Capsule
- ✅ **Preview card**: Live preview of logo, name, slogan, button

### Username:
- ✅ **Nome de usuário**: Shows `cardapli.com.br/u/slug`
- ✅ **Editar button**: Opens `/escolher-slug`

### Actions:
- **Salvar** — Manual save button
- **Ver página** — Opens `/u/:slug` in new tab
- **Copiar link** — Copies profile URL to clipboard

---

## Section 2: Página Pública (Link na bio)

**Public Page Builder Card** — Build your profile page with blocks

### Features:
- ✅ **Intro text**: "Monte sua página pública e escolha o que aparece em /u/:slug"
- ✅ **ProfileBuilder component** embedded
- ✅ **Helpful micro-copy**:
  - 💡 "Você pode mudar a ordem dos blocos arrastando"
  - 📱 "Apenas catálogos publicados com link ativo aparecem no seu perfil"

### ProfileBuilder Capabilities:
- Add blocks (Profile Header, Catálogos, Contact, Social, etc.)
- Drag & drop to reorder
- Edit block settings
- Toggle visible/hidden
- Duplicate blocks
- Delete blocks

### Empty State:
- Shows if user hasn't set username yet
- Button to "Escolher nome de usuário"

---

## Technical Details

### Components Used:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `LogoUploader` (fixed prop names)
- `ProfileBuilder` (embedded, no duplicate header)
- All form inputs with debounced auto-save

### Auto-save:
- All fields auto-save 500ms after user stops typing
- Toast notification: "Salvo ✓"
- Manual "Salvar" button also available

### Responsive:
- Mobile-first design
- Works perfectly at ≤375px width
- No horizontal scroll
- Proper spacing and padding

### Type Safety:
- Added `font_theme` and `cta_shape` to Profile type
- Proper initialization with defaults
- All fields properly typed

---

## What Was Removed (Temporarily)

These were in the old version but not critical for Phase 2:
- ❌ Locations section (can be added as a block in Public Page)
- ❌ Address field (not used currently)

Old file backed up as `Perfil_old.tsx` if we need to reference it.

---

## Testing Checklist

### Business Info Section:
- [ ] Upload logo → See thumbnail appear
- [ ] Change business name → Auto-saves
- [ ] Add slogan → Character count updates
- [ ] Fill contact fields → All save correctly
- [ ] Add social media links → Save properly
- [ ] Change theme mode → Preview updates
- [ ] Pick color → Preview button color changes
- [ ] Change font → Preview font changes
- [ ] Change button shape → Preview button shape changes
- [ ] Click "Ver página" → Opens `/u/:slug`
- [ ] Click "Copiar link" → URL copied

### Public Page Section:
- [ ] See helpful tips at top
- [ ] Add Profile Header block → Appears in list
- [ ] Add Catálogos block → Can configure all/manual
- [ ] Drag blocks → Order changes and persists
- [ ] Edit block → Settings drawer opens
- [ ] Toggle visible → Block shows/hides on public page
- [ ] Delete block → Block removed
- [ ] No username → Shows empty state with button

---

## Commits

1. `refactor(perfil): split into Business Info and Public Page sections`
2. `fix(perfil): restore logo thumbnail and theme settings`

---

## Next: Phase 3

With `/perfil` now clean and organized, we're ready for:
**Phase 3: Quick Catalog Flow** 🚀

The reorganized `/perfil` makes it clear:
- Business data lives in Section 1
- Public page building lives in Section 2
- No confusion about what goes where
