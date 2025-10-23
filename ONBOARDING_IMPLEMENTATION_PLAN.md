# 🚀 Cardapli Onboarding Implementation Plan

## 📋 Executive Summary

Transform Cardapli from a functional tool into a **guided, emotional journey** for non-tech-savvy Brazilian entrepreneurs. Build confidence through progressive disclosure, visual progress tracking, and warm encouragement.

---

## 🎯 Core Philosophy

**"One step at a time, with celebration at each milestone"**

- ✅ **Keep** existing `/escolher-slug` flow (it's already great!)
- ✅ **Enhance** it with better visuals and context
- ✅ **Add** progress tracking system
- ✅ **Build** guided journey on `/inicio` (Dashboard)
- ✅ **Create** contextual hints/coach bubbles
- ✅ **Prevent** users from jumping ahead without foundation

---

## 🗺️ User Journey Map

### Phase 1: First-Time User (New Signup)
```
1. Sign up → Email verification
2. Redirect to /escolher-slug (ENHANCED)
   - Better copy: "Vamos começar! Escolha seu nome de usuário"
   - Show preview: "Seu link será: cardapli.com/u/seu_nome"
   - Add illustration/icon
3. After slug → Redirect to /inicio with welcome modal
   - "Parabéns! 🎉 Agora vamos montar seu primeiro catálogo"
   - Show 5-step journey preview
   - CTA: "Começar minha jornada"
```

### Phase 2: Guided Setup (Dashboard with Progress)
```
/inicio shows:
┌─────────────────────────────────────────┐
│ Bem-vindo(a), Marcio 👋                 │
│ Crie seu primeiro catálogo em 5 passos │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📦 Seu Progresso                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 40% completo                            │
│                                         │
│ ✅ 1. Complete seu Perfil               │
│ ✅ 2. Escolha seu Tema                  │
│ 🟡 3. Adicione Produtos (6/10)          │
│ ⚪ 4. Informações do Negócio            │
│ ⚪ 5. Crie seu Catálogo                 │
│                                         │
│ [Continuar de onde parei →]             │
└─────────────────────────────────────────┘

💬 Coach Bubble (bottom-right):
"Ótimo! Você já tem 6 produtos. 
Adicione mais 4 para ter um catálogo completo!"
[Ok, entendi] [X]
```

### Phase 3: Completion & Celebration
```
When all 5 steps done:
- Confetti animation 🎉
- Modal: "Parabéns! Seu catálogo está pronto!"
- CTA: "Ver meu catálogo" → Opens catalog editor
- Secondary: "Compartilhar agora"
```

---

## 🏗️ Technical Implementation

### 1. Database Schema

#### New Table: `user_progress`
```sql
CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  step text NOT NULL, -- 'profile', 'theme', 'products', 'info', 'catalog'
  status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
  completed_at timestamptz,
  metadata jsonb, -- Extra data like product_count, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, step)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_status ON user_progress(user_id, status);

-- RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### New Table: `onboarding_hints` (optional - can use localStorage)
```sql
CREATE TABLE onboarding_hints_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  hint_key text NOT NULL, -- 'welcome', 'profile_done', 'theme_done', etc.
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, hint_key)
);
```

---

### 2. Component Architecture

```
src/
├── components/
│   ├── onboarding/
│   │   ├── OnboardingProgress.tsx       ← Main progress tracker
│   │   ├── OnboardingHints.tsx          ← Coach bubbles
│   │   ├── OnboardingWelcomeModal.tsx   ← First-time modal
│   │   ├── OnboardingStepCard.tsx       ← Individual step card
│   │   ├── ProgressBar.tsx              ← Animated progress bar
│   │   └── ConfettiCelebration.tsx      ← Completion animation
│   └── ...
├── hooks/
│   ├── useOnboardingProgress.ts         ← Fetch & update progress
│   ├── useOnboardingHints.ts            ← Manage hint visibility
│   └── ...
├── lib/
│   ├── onboarding.ts                    ← Helper functions
│   └── ...
└── pages/
    ├── Dashboard.tsx                    ← Enhanced with progress
    └── EscolherSlug.tsx                 ← Enhanced with better UX
```

---

### 3. Step-by-Step Implementation

#### ✅ **PHASE 1: Database & Core Logic** (Day 1-2)

**Tasks:**
1. Create migration file: `20250123_add_onboarding_system.sql`
2. Add `user_progress` table
3. Create helper functions in `src/lib/onboarding.ts`:
   ```typescript
   export async function getOnboardingProgress(userId: string)
   export async function updateStepStatus(userId: string, step: string, status: string)
   export async function calculateCompletionPercentage(userId: string)
   export async function getNextIncompleteStep(userId: string)
   ```
4. Create hook: `useOnboardingProgress.ts`

**Acceptance Criteria:**
- ✅ Migration runs successfully
- ✅ Can read/write progress to database
- ✅ Hook returns current progress state

---

#### ✅ **PHASE 2: Progress Tracker Component** (Day 2-3)

**Component: `OnboardingProgress.tsx`**

**Features:**
- Shows 5 steps with icons, titles, descriptions
- Status indicators: ✅ (done), 🟡 (in progress), ⚪ (pending)
- Animated progress bar
- "Continuar de onde parei" button → navigates to next incomplete step
- Mobile-responsive (vertical on mobile, horizontal on desktop)

**Design:**
```tsx
<Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background rounded-2xl p-6">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-xl font-semibold">Seu progresso</h3>
      <p className="text-sm text-muted-foreground">
        Monte seu catálogo passo a passo
      </p>
    </div>
    <div className="text-3xl font-bold text-primary">
      {progress}%
    </div>
  </div>
  
  <ProgressBar value={progress} className="mb-6" />
  
  <div className="space-y-3">
    {steps.map(step => (
      <OnboardingStepCard key={step.id} {...step} />
    ))}
  </div>
  
  <Button 
    onClick={continueToNextStep}
    className="w-full mt-6"
    size="lg"
  >
    Continuar de onde parei →
  </Button>
</Card>
```

**Step Configuration:**
```typescript
const ONBOARDING_STEPS = [
  {
    id: 'profile',
    icon: User,
    title: 'Complete seu Perfil',
    description: 'Nome, logo e contatos',
    route: '/perfil',
    checkCompletion: async (userId) => {
      const profile = await getProfile(userId);
      return !!(profile.business_name && profile.logo_url && profile.whatsapp);
    }
  },
  {
    id: 'theme',
    icon: Palette,
    title: 'Escolha seu Tema',
    description: 'Cores e fontes',
    route: '/perfil', // Theme section
    checkCompletion: async (userId) => {
      const profile = await getProfile(userId);
      return !!profile.theme_primary_color;
    }
  },
  {
    id: 'products',
    icon: Package,
    title: 'Adicione Produtos',
    description: 'Pelo menos 3 produtos',
    route: '/produtos',
    checkCompletion: async (userId) => {
      const count = await getProductCount(userId);
      return count >= 3;
    }
  },
  {
    id: 'info',
    icon: Info,
    title: 'Informações do Negócio',
    description: 'Entrega, Pagamentos, Política',
    route: '/informacoes-negocio',
    checkCompletion: async (userId) => {
      const count = await getBusinessInfoCount(userId);
      return count >= 2; // At least 2 sections filled
    }
  },
  {
    id: 'catalog',
    icon: Layout,
    title: 'Crie seu Catálogo',
    description: 'Monte e publique',
    route: '/catalogos',
    checkCompletion: async (userId) => {
      const count = await getCatalogCount(userId);
      return count > 0;
    }
  }
];
```

**Acceptance Criteria:**
- ✅ Shows correct progress percentage
- ✅ Updates in real-time when user completes steps
- ✅ "Continuar" button navigates to correct page
- ✅ Mobile responsive
- ✅ Smooth animations

---

#### ✅ **PHASE 3: Coach Hints System** (Day 3-4)

**Component: `OnboardingHints.tsx`**

**Features:**
- Floating bubble (bottom-right on desktop, bottom on mobile)
- Contextual messages based on progress
- Dismissible with "X" or "Ok, entendi"
- Fade in/out animations
- Stores viewed hints in localStorage

**Hint Configuration:**
```typescript
const HINTS = [
  {
    key: 'welcome',
    trigger: 'first_login',
    message: '👋 Oi, {{name}}! Vamos criar seu primeiro catálogo? Comece pelo Perfil.',
    cta: 'Ir para Perfil',
    route: '/perfil'
  },
  {
    key: 'profile_done',
    trigger: 'profile_completed',
    message: '✨ Perfeito! Agora escolha o Tema — cores e fontes da sua marca.',
    cta: 'Escolher Tema',
    route: '/perfil'
  },
  {
    key: 'theme_done',
    trigger: 'theme_completed',
    message: '🛍️ Ótimo! Vamos adicionar alguns produtos agora?',
    cta: 'Adicionar Produtos',
    route: '/produtos'
  },
  {
    key: 'products_done',
    trigger: 'products_completed',
    message: '💡 Último toque: adicione suas informações de entrega e pagamento.',
    cta: 'Adicionar Informações',
    route: '/informacoes-negocio'
  },
  {
    key: 'all_done',
    trigger: 'all_completed',
    message: '🎉 Parabéns! Agora é só criar seu catálogo e compartilhar!',
    cta: 'Criar Catálogo',
    route: '/catalogos'
  }
];
```

**Design:**
```tsx
<AnimatePresence>
  {showHint && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-50 max-w-sm"
    >
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl border-2 border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💬</div>
          <div className="flex-1">
            <p className="text-sm mb-3">{hint.message}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCTA}>
                {hint.cta}
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Ok, entendi
              </Button>
            </div>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
      </Card>
    </motion.div>
  )}
</AnimatePresence>
```

**Acceptance Criteria:**
- ✅ Shows correct hint based on progress
- ✅ Dismissible and doesn't reappear
- ✅ CTA navigates to correct page
- ✅ Mobile responsive
- ✅ Smooth animations

---

#### ✅ **PHASE 4: Enhanced Dashboard** (Day 4-5)

**Update: `Dashboard.tsx`**

**Changes:**
1. Add `<OnboardingProgress />` component at top
2. Add `<OnboardingHints />` component
3. Add smart routing logic to existing cards
4. Add welcome modal for first-time users

**Smart Routing Logic:**
```typescript
const handleCreateCatalog = async () => {
  const progress = await getOnboardingProgress(userId);
  
  // Check if foundation steps are complete
  if (!progress.profile.completed || !progress.theme.completed) {
    setShowSetupModal(true);
    return;
  }
  
  // If products < 3, show warning
  if (progress.products.count < 3) {
    setShowProductWarning(true);
    return;
  }
  
  // All good, proceed
  navigate('/catalogos');
};
```

**Setup Modal:**
```tsx
<Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Antes de criar seu catálogo...</DialogTitle>
      <DialogDescription>
        Complete seu Perfil e Tema primeiro. Assim ele já nasce com a sua identidade! ✨
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowSetupModal(false)}>
        Fechar
      </Button>
      <Button onClick={() => navigate('/perfil')}>
        Ir para Perfil
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Acceptance Criteria:**
- ✅ Progress tracker shows at top
- ✅ Hints appear contextually
- ✅ Can't create catalog without profile/theme
- ✅ Warning if products < 3
- ✅ All existing functionality preserved

---

#### ✅ **PHASE 5: Enhanced Slug Selection** (Day 5)

**Update: `EscolherSlug.tsx`**

**Enhancements:**
1. Better copy and illustrations
2. Show "Seu link será:" preview earlier
3. Add context about why slug matters
4. Smoother animations

**Changes:**
```tsx
// Add illustration/icon at top
<div className="text-center mb-6">
  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
    <Sparkles className="w-10 h-10 text-white" />
  </div>
</div>

// Better copy
<h1 className="text-3xl font-bold tracking-tight">
  Vamos começar! 🚀
</h1>
<p className="text-muted-foreground text-lg">
  Escolha seu nome de usuário para criar seu link personalizado
</p>

// Add context card
<Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 p-4 mb-6">
  <p className="text-sm text-blue-900 dark:text-blue-100">
    💡 <strong>Por que isso importa?</strong><br/>
    Seu nome de usuário será usado no link que você compartilha com seus clientes.
    Escolha algo fácil de lembrar!
  </p>
</Card>
```

**Acceptance Criteria:**
- ✅ Better visual hierarchy
- ✅ Clearer copy
- ✅ Context about slug importance
- ✅ Smooth animations

---

#### ✅ **PHASE 6: Progress Auto-Update System** (Day 6)

**Create: `src/lib/progressTracking.ts`**

**Features:**
- Auto-detect when steps are completed
- Update progress in real-time
- Trigger hints when appropriate

**Implementation:**
```typescript
// Hook into existing save functions
// Example: When profile is saved
export async function onProfileSaved(userId: string) {
  const profile = await getProfile(userId);
  const isComplete = !!(profile.business_name && profile.logo_url && profile.whatsapp);
  
  if (isComplete) {
    await updateStepStatus(userId, 'profile', 'completed');
    // Trigger hint
    await triggerHint(userId, 'profile_done');
  }
}

// Similar for other steps
export async function onThemeUpdated(userId: string) { ... }
export async function onProductAdded(userId: string) { ... }
export async function onBusinessInfoSaved(userId: string) { ... }
export async function onCatalogCreated(userId: string) { ... }
```

**Integration Points:**
- `PerfilV2.tsx` → Call `onProfileSaved()` after save
- Theme settings → Call `onThemeUpdated()` after save
- `Produtos.tsx` → Call `onProductAdded()` after add
- `InformacoesNegocio.tsx` → Call `onBusinessInfoSaved()` after save
- Catalog creation → Call `onCatalogCreated()` after create

**Acceptance Criteria:**
- ✅ Progress updates automatically
- ✅ No manual refresh needed
- ✅ Hints appear at right time
- ✅ Real-time updates across tabs (optional)

---

#### ✅ **PHASE 7: Completion Celebration** (Day 7)

**Component: `ConfettiCelebration.tsx`**

**Features:**
- Confetti animation when all steps done
- Celebration modal
- CTA to view/share catalog

**Implementation:**
```tsx
import confetti from 'canvas-confetti';

export function ConfettiCelebration({ onComplete }: Props) {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <Dialog open={true} onOpenChange={onComplete}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <DialogTitle className="text-2xl">
            Parabéns!
          </DialogTitle>
          <DialogDescription className="text-base">
            Seu catálogo está pronto para ser compartilhado com o mundo!
          </DialogDescription>
          <div className="flex flex-col gap-2 pt-4">
            <Button size="lg" onClick={() => navigate('/catalogos')}>
              Ver meu catálogo
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/compartilhar')}>
              Compartilhar agora
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Acceptance Criteria:**
- ✅ Confetti appears
- ✅ Modal shows celebration message
- ✅ CTAs work correctly
- ✅ Only shows once per completion

---

## 📱 Mobile Considerations

**All components must be:**
- ✅ Touch-friendly (min 44px tap targets)
- ✅ Readable on small screens
- ✅ Smooth animations (respect `prefers-reduced-motion`)
- ✅ Bottom navigation doesn't overlap hints
- ✅ Progress cards stack vertically on mobile

---

## 🎨 Design System

**Colors:**
- Primary: `#8b5cf6` (purple)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (amber)
- Info: `#3b82f6` (blue)

**Spacing:**
- Card padding: `p-6` (desktop), `p-4` (mobile)
- Section gaps: `space-y-6`
- Card gaps: `gap-4`

**Animations:**
- Fade in: `animate-fade-in` (0.3s)
- Slide up: `animate-slide-up` (0.4s)
- Scale on hover: `scale-105` (0.2s)

**Typography:**
- Headings: `font-semibold` or `font-bold`
- Body: `text-base` or `text-sm`
- Muted: `text-muted-foreground`

---

## 🧪 Testing Checklist

### New User Flow
- [ ] Sign up → Redirects to `/escolher-slug`
- [ ] Choose slug → Redirects to `/inicio` with welcome modal
- [ ] Welcome modal → Shows 5-step journey
- [ ] Progress tracker → Shows 0% initially
- [ ] Click "Continuar" → Goes to Perfil

### Progress Tracking
- [ ] Complete profile → Step 1 turns green
- [ ] Choose theme → Step 2 turns green
- [ ] Add 3 products → Step 3 turns green
- [ ] Add business info → Step 4 turns green
- [ ] Create catalog → Step 5 turns green
- [ ] All done → Confetti + celebration modal

### Coach Hints
- [ ] First login → Shows welcome hint
- [ ] Profile done → Shows theme hint
- [ ] Theme done → Shows products hint
- [ ] Products done → Shows info hint
- [ ] All done → Shows catalog hint
- [ ] Dismiss hint → Doesn't reappear

### Smart Routing
- [ ] Try to create catalog without profile → Shows setup modal
- [ ] Try to create catalog with < 3 products → Shows warning
- [ ] Complete setup → Can create catalog

### Mobile
- [ ] Progress tracker responsive
- [ ] Hints don't overlap bottom nav
- [ ] All buttons tap-friendly
- [ ] Smooth animations

---

## 📊 Success Metrics

**Track these in analytics:**
- % of users who complete onboarding
- Average time to complete each step
- Drop-off points (where users abandon)
- Hint dismissal rates
- Catalog creation rate after onboarding

---

## 🚀 Deployment Plan

### Week 1: Core System
- Days 1-2: Database + hooks
- Days 3-4: Progress tracker + hints
- Days 5-6: Dashboard integration + auto-updates
- Day 7: Testing + polish

### Week 2: Refinement
- User testing with 5-10 beta users
- Gather feedback
- Iterate on copy and UX
- Performance optimization

### Week 3: Launch
- Deploy to production
- Monitor metrics
- Quick fixes if needed
- Celebrate! 🎉

---

## 💡 Future Enhancements

**Phase 2 (Optional):**
- [ ] Video tutorials for each step
- [ ] "Skip for now" option (with warning)
- [ ] Progress badges/achievements
- [ ] Email reminders for incomplete onboarding
- [ ] A/B test different copy variations
- [ ] Onboarding analytics dashboard

---

## 🎯 Summary

This onboarding system will:
1. ✅ **Guide** users step-by-step
2. ✅ **Motivate** with progress tracking
3. ✅ **Educate** with contextual hints
4. ✅ **Prevent** confusion with smart routing
5. ✅ **Celebrate** completion with confetti
6. ✅ **Retain** users by building confidence

**Result:** Higher completion rates, happier users, more catalogs created! 🚀
