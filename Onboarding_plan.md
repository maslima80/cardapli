this is the right moment to shift Cardapli from “a set of screens that work” to a guided, emotional, confidence-building journey for non-tech-savvy entrepreneurs.

Let’s build a beautiful, step-by-step onboarding flow inside your dashboard — something so simple that even someone who’s never touched Canva feels like “I can do this.”

🌱 GOAL

Transform the dashboard into a guided creation journey where users are gently walked through the exact order to build their first catalog:

Perfil → Tema → Produtos → Informações do Negócio → Catálogo → Compartilhar

Each step must feel achievable, visually clear, and motivating.

🧭 1. Onboarding Path — “Seu progresso para lançar seu primeiro catálogo”

Add a progress module at the top of the dashboard — right under “Bem-vindo(a), Marcio 👋”.

Visual:

A horizontal or vertical progress card like this:

📦 Seu progresso

Monte seu catálogo passo a passo:

1️⃣ Complete seu Perfil
🟢 Nome, logo e contatos

2️⃣ Escolha seu Tema
🟢 Cores e fontes

3️⃣ Adicione Produtos
🟡 6 produtos cadastrados

4️⃣ Adicione Informações do Negócio
⚪️ Entrega, Pagamentos, Política

5️⃣ Crie seu Catálogo
⚪️ Monte e publique

[ Continuar de onde parei ➜ ]

Each step has a small status dot: 🟢 done, 🟡 partial, ⚪️ not started.

On click → takes them exactly where they need to go.

✨ 2. Smart Guidance: “Coach Bubbles” System

When the user lands for the first time, show friendly, contextual tips with animation or small “coach bubbles” (like WhatsApp onboarding or Duolingo).

Example:
First time on dashboard:

💬 “Oi, Marcio! Vamos criar o seu primeiro catálogo? Comece pelo Perfil, adicionando o nome e o logo da sua marca.”

When they complete the profile:

💬 “Perfeito! Agora escolha um tema de cores para deixar o catálogo com a sua cara.”

After adding theme:

💬 “Ótimo! Vamos aos produtos — adicione pelo menos 3 para o catálogo ficar incrível.”

→ This builds momentum and satisfaction (dopamine loop).

You can use localStorage or a Supabase user_progress table to control which bubble appears.

🪄 3. Step Logic (Order and Why)
Step	Page	Why it comes now
1️⃣ Perfil	/perfil	Foundation: brand identity and contact
2️⃣ Tema	/perfil/tema	Makes their brand visible early (immediate reward)
3️⃣ Produtos	/produtos	Adds real content, core of the catalog
4️⃣ Informações do Negócio	/perfil/informacoes-negocio	Adds clarity & professionalism (trust layer)
5️⃣ Catálogo	/compartilhar	Pulls all data into a beautiful generated catalog
🧩 4. Implementation Plan
Step A — Add “progress” component to /inicio

Component: <OnboardingProgress />

Pull data:

Profile completion (profiles table: logo, name, contact)

Theme (profiles.theme_primary_color)

Product count (products)

Business info completeness (business_info_sections)

Catalog count (catalogs)

Calculate %

const completion = {
  profile: hasLogo && hasName,
  theme: hasPrimaryColor,
  products: productCount > 0,
  info: infoCount > 0,
  catalog: catalogCount > 0,
};


Display a progress bar and step cards.

Step B — Add Coach Bubbles (Light Onboarding)

Component: <OnboardingHints />

Contextual messages triggered by:

first login

completion of key steps

inactivity (e.g. “Você já viu como é fácil criar um catálogo?”)

Use a simple array of hints and mark viewed ones in localStorage.

Step C — “Começar” Button Routing Logic

Change the dashboard buttons’ behavior:

Card	Current Action	New Behavior
Criar Catálogo	/compartilhar	If profile or theme incomplete → show modal guiding them there first
Gerenciar Produtos	/produtos	Keep
Perfil & Design	/perfil	Keep

That way they can’t “jump” ahead without a foundation.

Step D — Optional “Modo Aprendizado” (future)

Add a toggle at the top:
📘 “Ativar modo passo a passo” → shows overlay with simple explanations in each page (like onboarding modals).
Later, advanced users can disable it.

💜 5. Language and Tone (Brazilian Portuguese)

Your users need warmth + confidence, not technical words.

Examples:

“Vamos deixar seu catálogo com a sua cara?”

“Adicione seus produtos — quanto mais fotos bonitas, melhor!”

“Essas informações ajudam seus clientes a confiar em você.”

“Agora vem a parte divertida: montar o catálogo! ✨”

Keep tone human, friendly, Brazilian, WhatsApp-style short.

🧠 6. Why This Works for Your Persona
Problem	How This Fixes It
User gets lost or overwhelmed	Linear, friendly path (1 step at a time)
Doesn’t understand tech terms	Plain language + visual progress
Feels unmotivated	Immediate visual reward for each step
Builds random content	Logical flow ensures catalog quality
Doesn’t finish setup	Dopamine from “step complete” keeps engagement high
🚀 7. Sprint Summary (Next 7 Days)
Day	Task
1	Design the OnboardingProgress component (cards + bar)
2	Add logic to calculate completion status
3	Add smart routing (redirects if steps incomplete)
4	Create contextual “coach bubbles” (3–4 core messages)
5	Polish text and tone (PT-BR, warm voice)
6	Mobile testing + animations (slide/fade)
7	Internal test: full journey from signup → catalog ready
this is what our dev said: Guided Onboarding Experience for Cardapli

Goal:
Transform the /inicio dashboard into a beautiful, professional onboarding journey that helps non-tech-savvy Brazilian entrepreneurs gradually build their first catalog — with visual progress tracking, step persistence, and soft encouragement.

🎨 Design Vision

A mobile-first, premium design — inspired by Canva, Apple onboarding, and Duolingo tone.

Layout must feel light, cinematic, with soft shadows, rounded corners (2xl), balanced spacing, and pastel purple accents (#8b5cf6 or use current theme color).

No clutter or hard borders — elegance, clarity, trust.

Every element must animate smoothly (fade / slide in).

🧩 Structure Overview

Main Page: /inicio
Components to implement:

<OnboardingProgress />

<DashboardCards /> (existing cards, keep but adjust layout)

<OnboardingHints /> (light bubble coach messages)

1️⃣ <OnboardingProgress /> — Progress Tracker Component

Position: Top of /inicio, below “Bem-vindo(a)” heading.

Purpose: Show users how far they are from publishing their first catalog and let them continue easily.

Design:

Card with soft gradient background (from-purple-50 to-white), rounded corners rounded-2xl, padding p-5.

Title: “Seu progresso para lançar seu primeiro catálogo”

Subtext: “Monte passo a passo e veja seu avanço abaixo.”

Inside:

Progress bar (bg-muted track, gradient purple fill).

5 steps shown as vertical or horizontal items with:

Icon

Step name

Status dot: 🟢 (done), 🟡 (in progress), ⚪️ (not started)

“Ir agora” button when incomplete.

Steps (with routes & PT-BR copy):

Step	Label	Description	Completion check	Route
1️⃣	Perfil	Adicione nome, logo e contatos da sua marca.	if logo + nome + contato	/perfil
2️⃣	Tema	Escolha cores e fonte para deixar seu catálogo com a sua cara.	if theme color selected	/perfil/tema
3️⃣	Produtos	Adicione seus produtos com fotos e preços.	if productCount > 0	/produtos
4️⃣	Informações do Negócio	Defina entrega, pagamentos e políticas.	if infoCount > 0	/perfil/informacoes-negocio
5️⃣	Catálogo	Monte e compartilhe seu primeiro catálogo.	if catalogCount > 0	/compartilhar

Logic:

const completion = {
  profile: !!profile.name && !!profile.logo_url,
  theme: !!profile.theme_primary_color,
  products: productCount > 0,
  info: infoCount > 0,
  catalog: catalogCount > 0,
};
const progress = Object.values(completion).filter(Boolean).length / 5 * 100;


Data source:

profiles, products, business_info_sections, catalogs

Use Supabase hooks with useEffect for live updates.

Behavior:

Saves completion state to user_progress table (user_id, step, status)

Auto-update when user completes a step.

Each step card clickable → navigates to respective route.

2️⃣ <OnboardingHints /> — Smart Coach Bubbles

Purpose: Friendly messages guiding users contextually.
Style: Floating chat-style bubbles with rounded background (bg-white/90, soft shadow, bottom fixed), fade-in/out animation.

Examples:

First login → “👋 Oi, {{first_name}}! Vamos criar seu primeiro catálogo? Comece pelo Perfil.”

After Perfil complete → “✨ Perfeito! Agora escolha o Tema — cores e fontes da sua marca.”

After Tema complete → “🛍️ Ótimo! Vamos adicionar alguns produtos agora?”

After Produtos → “💡 Último toque: adicione suas informações de entrega e pagamento.”

Use localStorage or Supabase user_progress to track which hints were shown.

Dismiss logic: user taps “X” or “Ok, entendi”.

3️⃣ Integration with Existing Dashboard Cards

Keep existing cards:

Criar Catálogo

Gerenciar Produtos

Perfil & Design

Enhance with subtle animation and hierarchy:

Wrap them inside a grid with gap-4.

Add motion fade-up (delay: 0.1s per card).

When clicking “Começar”, check progress state:

If profile or theme incomplete → show modal:

“Antes de criar seu catálogo, complete seu Perfil e Tema. Assim ele já nasce com a sua identidade.”
[Ir para Perfil] [Fechar]

4️⃣ Persistence

New Table: user_progress

CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  step text NOT NULL,
  status text DEFAULT 'pending', -- pending, done, skipped
  updated_at timestamptz DEFAULT now()
);


Behavior:

Each completed step updates record via Supabase RPC or insert/upsert.

Dashboard fetches it on load to show correct progress.

User can leave anytime; when they return, progress bar resumes.

5️⃣ Animations & Polish

Use Framer Motion for smooth fades & step transitions.

On hover: scale cards scale-105, subtle shadow.

Progress bar animates on load (width transition).

Section spacing consistent: space-y-6.

Keep everything centered and finger-friendly on mobile.

6️⃣ Copywriting Guidelines (PT-BR)

Tone: friendly, human, simple.
Examples:

“Tudo começa com o seu Perfil ✨”

“Seu catálogo está quase pronto — falta só mais um passo!”

“Você já deu os primeiros passos para o sucesso do seu negócio 🎉”

Avoid technical terms. No “tabelas”, “RLS”, etc.

✅ Deliverables Checklist

 OnboardingProgress.tsx component

 OnboardingHints.tsx component

 user_progress Supabase table migration

 Update /inicio layout

 Smart redirect modal for incomplete setup

 PT-BR microcopy & animations

🧪 Testing

Simulate a new user: should see progress = 0%, first bubble message.

After saving Perfil → step 1 turns green.

After completing all 5 → full bar + confetti animation:

“Parabéns 🎉 — seu catálogo está pronto para ser compartilhado!”

Summary for Windsurf:

“Transform the /inicio page into a cinematic guided onboarding journey for new users.
Build OnboardingProgress (progress tracker with saved state), OnboardingHints (coach bubbles), and integrate with existing dashboard cards.
Everything in PT-BR, mobile-first, elegant, soft, and premium.
Use Tailwind + Framer Motion + Supabase.”