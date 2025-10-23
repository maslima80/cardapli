# 🔗 Onboarding Progress Tracking - Integration Guide

This guide shows you how to integrate progress tracking into existing save functions.

---

## 📋 Quick Reference

Import the tracking helpers:

```typescript
import { 
  onProfileSaved, 
  onThemeUpdated, 
  onProductChanged, 
  onBusinessInfoSaved, 
  onCatalogCreated,
  refreshProgress 
} from '@/lib/progressTracking';
```

---

## 🎯 Integration Points

### 1. Profile Save (PerfilV2.tsx or Perfil.tsx)

**Location:** After profile update succeeds

```typescript
// Example in PerfilV2.tsx
const handleSaveProfile = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: businessName,
        logo_url: logoUrl,
        whatsapp: whatsapp,
      })
      .eq('id', userId);

    if (error) throw error;

    // ✅ ADD THIS: Track progress
    await onProfileSaved(userId, {
      business_name: businessName,
      logo_url: logoUrl,
      whatsapp: whatsapp,
    });

    toast.success('Perfil salvo!');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao salvar');
  }
};
```

**What it checks:**
- ✅ business_name exists
- ✅ logo_url exists
- ✅ whatsapp exists

**Result:** Marks profile step as completed when all 3 fields are filled.

---

### 2. Theme Update (Theme settings component)

**Location:** After theme color is saved

```typescript
// Example in theme settings
const handleSaveTheme = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        theme_primary_color: primaryColor,
        theme_font_heading: fontHeading,
        theme_font_body: fontBody,
      })
      .eq('id', userId);

    if (error) throw error;

    // ✅ ADD THIS: Track progress
    await onThemeUpdated(userId, {
      theme_primary_color: primaryColor,
    });

    toast.success('Tema salvo!');
  } catch (error) {
    console.error(error);
    toast.error('Erro ao salvar');
  }
};
```

**What it checks:**
- ✅ theme_primary_color exists

**Result:** Marks theme step as completed when primary color is set.

---

### 3. Product Add/Update/Delete (Produtos.tsx)

**Location:** After product is added, updated, or deleted

```typescript
// Example in Produtos.tsx
const handleAddProduct = async (productData: any) => {
  try {
    const { error } = await supabase
      .from('products')
      .insert({
        ...productData,
        user_id: userId,
      });

    if (error) throw error;

    // ✅ ADD THIS: Get new count and track progress
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    await onProductChanged(userId, count || 0);

    toast.success('Produto adicionado!');
    loadProducts(); // Refresh list
  } catch (error) {
    console.error(error);
    toast.error('Erro ao adicionar');
  }
};

// Also call after delete
const handleDeleteProduct = async (productId: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    // ✅ ADD THIS: Get new count and track progress
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    await onProductChanged(userId, count || 0);

    toast.success('Produto removido!');
    loadProducts();
  } catch (error) {
    console.error(error);
    toast.error('Erro ao remover');
  }
};
```

**What it checks:**
- ✅ At least 3 products exist

**Result:** 
- 1-2 products = "in_progress"
- 3+ products = "completed"

---

### 4. Business Info Save (InformacoesNegocio.tsx)

**Location:** After business info section is saved

```typescript
// Example in business info editors
const handleSave = async () => {
  try {
    await upsertBusinessInfo('delivery', 'global', undefined, {
      title: title,
      items: items,
    });

    // ✅ ADD THIS: Get count and track progress
    const { count } = await supabase
      .from('business_info_sections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('scope', 'global');

    await onBusinessInfoSaved(userId, count || 0);

    toast.success('Informações salvas!');
    onSaved?.();
  } catch (error) {
    console.error(error);
    toast.error('Erro ao salvar');
  }
};
```

**What it checks:**
- ✅ At least 2 business info sections exist

**Result:**
- 1 section = "in_progress"
- 2+ sections = "completed"

---

### 5. Catalog Creation (CatalogoEditor.tsx or QuickCatalogCreate.tsx)

**Location:** After catalog is created

```typescript
// Example in catalog creation
const handleCreateCatalog = async (catalogData: any) => {
  try {
    const { data: catalog, error } = await supabase
      .from('catalogs')
      .insert({
        ...catalogData,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // ✅ ADD THIS: Get count and track progress
    const { count } = await supabase
      .from('catalogs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    await onCatalogCreated(userId, count || 0);

    toast.success('Catálogo criado!');
    navigate(`/catalogos/${catalog.id}/editor`);
  } catch (error) {
    console.error(error);
    toast.error('Erro ao criar');
  }
};
```

**What it checks:**
- ✅ At least 1 catalog exists

**Result:** Marks catalog step as completed.

---

## 🔄 Alternative: Manual Refresh

If you don't want to add tracking to every save function, you can use `refreshProgress()` to manually trigger a re-check:

```typescript
import { refreshProgress } from '@/lib/progressTracking';

// Call this after any major action
await refreshProgress(userId);
```

This will run all checks and update progress accordingly. However, it's less efficient than targeted tracking.

---

## 🧪 Testing Progress Tracking

### Test Profile Step:
1. Go to `/perfil`
2. Fill in: Business Name, Logo, WhatsApp
3. Save
4. Check dashboard → Profile step should be ✅

### Test Theme Step:
1. Go to `/perfil` (theme section)
2. Choose a primary color
3. Save
4. Check dashboard → Theme step should be ✅

### Test Products Step:
1. Go to `/produtos`
2. Add 3 products
3. Check dashboard → Products step should be ✅

### Test Business Info Step:
1. Go to `/informacoes-negocio`
2. Fill in 2 sections (e.g., Delivery + Payments)
3. Save each
4. Check dashboard → Info step should be ✅

### Test Catalog Step:
1. Go to `/catalogos`
2. Create a catalog
3. Check dashboard → Catalog step should be ✅
4. Confetti should appear! 🎉

---

## 📊 Progress States

Each step can have 3 states:

- **pending** (⚪) - Not started
- **in_progress** (🟡) - Partially complete
- **completed** (✅) - Fully complete

The progress bar shows: `(completed_steps / 5) * 100%`

---

## 🎯 Priority Integration Order

If you want to integrate gradually, do it in this order:

1. **Profile** - Most important, first step
2. **Theme** - Quick win, easy to implement
3. **Products** - Core functionality
4. **Catalog** - Final step, triggers celebration
5. **Business Info** - Optional but recommended

---

## 🐛 Debugging

To check current progress in console:

```typescript
import { getOnboardingProgress } from '@/lib/onboarding';

const progress = await getOnboardingProgress(userId);
console.log('Current progress:', progress);
```

To manually update a step:

```typescript
import { updateStepStatus } from '@/lib/onboarding';

await updateStepStatus(userId, 'profile', 'completed');
```

---

## ✅ Checklist

- [ ] Integrated profile tracking
- [ ] Integrated theme tracking
- [ ] Integrated products tracking
- [ ] Integrated business info tracking
- [ ] Integrated catalog tracking
- [ ] Tested all steps
- [ ] Verified confetti appears on completion

---

## 🚀 That's It!

Once integrated, the onboarding system will:
- ✅ Auto-detect completion
- ✅ Update progress in real-time
- ✅ Show contextual hints
- ✅ Celebrate completion with confetti

Users will have a smooth, guided journey from signup to first catalog! 🎉
