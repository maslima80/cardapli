# Phase 2: Wizard Steps 4-5 Implementation Guide

## ✅ What's Been Created

### **1. Type Definitions** (`src/lib/wizard/types.ts`)
- `WizardMode` type
- `WizardAutoSections` interface
- `WizardState` interface with all wizard data
- Default state values

### **2. Business Info Helper** (`src/lib/businessInfo.ts`)
- Added `hasBusinessInfo()` function to check if content exists
- Used in Step 4 to show warnings for unconfigured sections

### **3. Step 4 Component** (`src/components/wizard/AutoSectionsStep.tsx`)
- Complete UI for selecting auto-sections
- Checkboxes for all business info types
- Warning indicators (⚠️) for unconfigured sections
- Async content status checking
- Portuguese labels and descriptions

### **4. Step 5 Component** (`src/components/wizard/ReviewStep.tsx`)
- Summary screen showing all selections
- Cards for: Type, Items, Cover, Layout, Sections
- "Gerar Catálogo" button with loading state
- "Voltar e ajustar" option

### **5. Catalog Generation** (`src/lib/wizard/generateCatalog.ts`)
- `generateCatalogFromWizard()` function
- Creates catalog with all blocks in correct order:
  1. Cover (sort: 0)
  2. About (if selected)
  3. Product sections (products/categories/tags)
  4. Info blocks (how_to_buy, delivery, shipping, payment, guarantee)
  5. Testimonials (if selected)
  6. Location (if selected)
  7. Socials (if selected)
- Each info block uses `mode: 'auto'` with proper configuration

---

## 🔨 What Needs to be Done

### **1. Update QuickCatalogCreate.tsx**

The main wizard page needs to be refactored to support multi-step flow:

```typescript
// Add state for wizard steps
const [currentStep, setCurrentStep] = useState(3); // 3, 4, or 5
const [wizardState, setWizardState] = useState<WizardState>({...});

// Step 3: Cover & Layout (existing code, mostly unchanged)
// Step 4: Auto Sections (new - use AutoSectionsStep component)
// Step 5: Review (new - use ReviewStep component)

// Progress indicator at top
<div className="text-center mb-6">
  <p className="text-sm text-muted-foreground">
    Passo {currentStep} de 5
  </p>
</div>

// Conditional rendering based on currentStep
{currentStep === 3 && <CoverLayoutStep ... />}
{currentStep === 4 && <AutoSectionsStep ... />}
{currentStep === 5 && <ReviewStep ... />}
```

**Key changes needed:**
- Convert existing state to use `WizardState` type
- Add step navigation (currentStep state)
- Split existing UI into Step 3 component
- Add Step 4 (AutoSectionsStep)
- Add Step 5 (ReviewStep)
- Replace `handleCreateCatalog()` with call to `generateCatalogFromWizard()`

### **2. Update Block Renderers**

#### **InformacoesBlockPremium.tsx**
Add support for `mode: 'auto'`:

```typescript
interface InformacoesBlockProps {
  data: {
    mode?: 'auto' | 'custom';
    section?: 'how_to_buy' | 'delivery' | 'pickup' | 'shipping' | 'payment' | 'guarantee';
    auto?: {
      scope: 'global' | 'category' | 'tag' | 'product';
      scope_id?: string | null;
      fallback_to_global?: boolean;
    };
    title?: string;
    subtitle?: string;
    items?: Array<{icon?: string; title: string; description?: string}>;
    layout?: 'grid' | 'list';
  };
}

// In component:
useEffect(() => {
  if (data.mode === 'auto' && data.section) {
    // Fetch from business_info_sections
    fetchBusinessInfo(data.section, data.auto?.scope, data.auto?.scope_id);
  }
}, [data]);

// If no content found, show placeholder:
if (data.mode === 'auto' && !items.length) {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">
        Configure esta seção em Perfil → Informações do Negócio
      </p>
    </div>
  );
}
```

#### **TestimonialsBlockPremium.tsx**
Add support for `mode: 'auto'`:

```typescript
interface TestimonialsBlockProps {
  data: {
    mode?: 'auto' | 'custom';
    source?: {
      scope: 'global' | 'product' | 'category' | 'tag';
      scope_id?: string | null;
      include_global_backfill?: boolean;
      limit?: number;
    };
    testimonials?: Array<{...}>; // for custom mode
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'list';
  };
}

// Fetch testimonials if mode === 'auto'
useEffect(() => {
  if (data.mode === 'auto') {
    fetchTestimonials(data.source);
  }
}, [data]);
```

### **3. Success Screen Enhancement**

Update `QuickCatalogSuccess.tsx` to show:
- ✅ "Seu catálogo está pronto!"
- 🔗 Catalog URL
- 2 CTAs:
  - "Ver e compartilhar" → Opens public catalog
  - "Editar e adicionar mais seções" → Opens catalog editor
- Tip box:
  ```
  💡 Você pode alterar textos, mover blocos e adicionar novas seções
  (entrega, pagamentos, depoimentos) quando quiser.
  ```

---

## 📋 Implementation Checklist

### **Phase 2A: Wizard UI** (Priority 1)
- [ ] Refactor QuickCatalogCreate to multi-step
- [ ] Add progress indicator (3/5, 4/5, 5/5)
- [ ] Integrate AutoSectionsStep component
- [ ] Integrate ReviewStep component
- [ ] Replace generation logic with `generateCatalogFromWizard()`
- [ ] Test wizard flow end-to-end

### **Phase 2B: Block Renderers** (Priority 2)
- [ ] Update InformacoesBlockPremium for `mode: 'auto'`
- [ ] Add business_info_sections fetching
- [ ] Add placeholder for unconfigured sections
- [ ] Update TestimonialsBlockPremium for `mode: 'auto'`
- [ ] Add testimonials fetching
- [ ] Test auto-population on public catalog

### **Phase 2C: Polish** (Priority 3)
- [ ] Update success screen with new CTAs
- [ ] Add helpful tips throughout
- [ ] Test all edge cases (no content, errors, etc.)
- [ ] Mobile responsiveness check

---

## 🎯 Expected User Flow

1. **Step 1:** Choose type (Poucos produtos / Categorias / Tags) ✅ Done
2. **Step 2:** Select items ✅ Done
3. **Step 3:** Configure cover & layout ✅ Exists (needs minor updates)
4. **Step 4:** Select auto-sections (NEW) ✅ Component ready
5. **Step 5:** Review & generate (NEW) ✅ Component ready
6. **Success:** View/edit catalog ⚠️ Needs update

---

## 🔧 Quick Start

To continue implementation:

1. **Update QuickCatalogCreate.tsx:**
   ```bash
   # The file is backed up at QuickCatalogCreate.backup.tsx
   # Refactor to use the new components
   ```

2. **Test with migration:**
   ```bash
   supabase db push
   npx supabase gen types typescript --project-id YOUR_ID > src/integrations/supabase/types.ts
   ```

3. **Test wizard flow:**
   - Navigate to `/compartilhar`
   - Select type and items
   - Go through steps 3-5
   - Generate catalog
   - Verify blocks are created correctly

---

## 📝 Notes

- TypeScript errors in `businessInfo.ts` are expected until migration runs
- All components use Portuguese labels as specified
- Block generation follows exact sort order specified
- Auto-mode blocks will show placeholders if content doesn't exist
- Users can configure content later via /informacoes-negocio

---

**Status:** Phase 2 - 60% Complete
**Next:** Refactor QuickCatalogCreate.tsx to integrate new components
