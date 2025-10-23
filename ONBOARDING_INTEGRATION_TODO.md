# 🎯 Onboarding Integration TODO

## ✅ What's Already Done

1. **Database & Core Logic** ✅
   - `user_progress` table created
   - `onboarding_hints_viewed` table created
   - RPC functions for progress tracking
   - Triggers to initialize progress on signup

2. **UI Components** ✅
   - `OnboardingProgress` - Progress tracker
   - `OnboardingHints` - Coach bubbles
   - `OnboardingWelcomeWithSlug` - Welcome + slug selection modal
   - `ConfettiCelebration` - Completion celebration
   - `OnboardingStepCard` - Individual step cards
   - `ProgressBar` - Visual progress bar

3. **Hooks** ✅
   - `useOnboardingProgress` - Fetch and track progress
   - `useOnboardingHints` - Manage hint display

4. **Slug Selection** ✅
   - Integrated into welcome modal
   - No more separate page redirects
   - RPC function to avoid 406 errors

## 🔧 What Needs Integration

### 1. Profile Page (`/perfil`)
**File:** `src/pages/PerfilV2.tsx` or `src/components/profile/ProfileBuilder.tsx`

**Add this after profile save:**
```typescript
import { onProfileSaved, onThemeUpdated } from '@/lib/progressTracking';

// After successful profile save
await onProfileSaved(user.id, {
  business_name: profile.business_name,
  logo_url: profile.logo_url,
  whatsapp: profile.whatsapp
});

// After theme update
await onThemeUpdated(user.id, {
  accent_color: profile.accent_color
});
```

### 2. Products Page (`/produtos`)
**File:** `src/pages/Produtos.tsx` or product save handler

**Add this after product create/delete:**
```typescript
import { onProductChanged } from '@/lib/progressTracking';

// After product created or deleted
const { count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);

await onProductChanged(user.id, count || 0);
```

### 3. Business Info Page (`/informacoes-negocio`)
**File:** `src/pages/InformacoesNegocio.tsx`

**Add this after section save:**
```typescript
import { onBusinessInfoSaved } from '@/lib/progressTracking';

// After business info section saved
const { count } = await supabase
  .from('business_info_sections')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);

await onBusinessInfoSaved(user.id, count || 0);
```

### 4. Catalog Creation (`/catalogos`)
**File:** `src/pages/Catalogos.tsx` or catalog creation handler

**Add this after catalog created:**
```typescript
import { onCatalogCreated } from '@/lib/progressTracking';

// After catalog created
const { count } = await supabase
  .from('catalogs')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id);

await onCatalogCreated(user.id, count || 0);
```

## 📋 Testing Checklist

### Test 1: New User Flow
- [ ] Create new account
- [ ] See welcome modal with slug selection
- [ ] Enter slug and continue
- [ ] See dashboard with 0% progress
- [ ] Progress tracker shows 5 pending steps

### Test 2: Profile Completion
- [ ] Go to `/perfil`
- [ ] Add business name, logo, WhatsApp
- [ ] Save profile
- [ ] Return to dashboard
- [ ] Progress shows "Profile" as completed (20%)
- [ ] Hint bubble appears: "Perfeito! Agora escolha um tema..."

### Test 3: Theme Completion
- [ ] Go to `/perfil` (theme section)
- [ ] Choose accent color
- [ ] Save theme
- [ ] Return to dashboard
- [ ] Progress shows "Theme" as completed (40%)
- [ ] Hint bubble appears: "Ótimo! Vamos aos produtos..."

### Test 4: Products Completion
- [ ] Go to `/produtos`
- [ ] Add 3 products
- [ ] Return to dashboard
- [ ] Progress shows "Products" as completed (60%)
- [ ] Hint bubble appears about business info

### Test 5: Business Info Completion
- [ ] Go to `/informacoes-negocio`
- [ ] Add 2+ sections (delivery, payments, etc.)
- [ ] Save
- [ ] Return to dashboard
- [ ] Progress shows "Info" as completed (80%)

### Test 6: Catalog Completion
- [ ] Go to `/catalogos`
- [ ] Create first catalog
- [ ] Return to dashboard
- [ ] Progress shows "Catalog" as completed (100%)
- [ ] 🎉 Confetti celebration appears!
- [ ] Hint: "Parabéns! Seu catálogo está pronto!"

### Test 7: Returning User
- [ ] Log out
- [ ] Log back in
- [ ] Dashboard shows saved progress
- [ ] No welcome modal (already seen)
- [ ] Can continue from where they left off

## 🐛 Known Issues to Fix

1. **Progress not updating in real-time**
   - Need to add progress tracking calls to save handlers
   - Need to refresh progress after actions

2. **Hints not appearing**
   - Need to verify hint logic in `OnboardingHints.tsx`
   - Check localStorage for dismissed hints

3. **Confetti not showing**
   - Need to verify completion detection
   - Check localStorage for celebration flag

## 📝 Next Steps

1. **Find the save handlers** for each page
2. **Add progress tracking calls** after successful saves
3. **Test each step** individually
4. **Fix any bugs** that appear
5. **Polish the UX** (animations, timing, messages)

## 🎨 UX Improvements to Consider

- Add loading states when updating progress
- Show toast notifications when steps complete
- Animate progress bar transitions
- Add sound effects for completion (optional)
- Make hints dismissible but trackable
- Add "Skip onboarding" option for advanced users
