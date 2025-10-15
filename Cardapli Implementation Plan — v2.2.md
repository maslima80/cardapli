Cardapli Implementation Plan — v2.2

Last Updated: Oct 15, 2025
Status: Active Development
Owner: Marcio Souza
Stack: Vite + Supabase + Shadcn/UI
Goal: Launch a mobile-first catalog builder for Brazilian MEIs (artisans, confeiteiras, handmade sellers)

🧭 Architecture Overview
🔹 Routes
Purpose	Path	Example
Dashboard	/	—
Catalogs list	/catalogos	—
Catalog editor	/catalogos/:catalogId	—
Public profile	/@{userSlug}	/@docesdamaria
Public catalog	/@{userSlug}/{catalogSlug}	/@docesdamaria/catalogo-pascoa
Quick share builder	/compartilhar	—

No /c/[slug] routes — all catalogs are user-namespaced.

🔹 Database Schema (confirmed)
profiles
Column	Type	Notes
id	uuid	PK
email	text	
business_name	text	public name
slogan	text	tagline
about	text	short description
whatsapp	int8	
phone	int8	
email_public	text	visible email
address	text	main address
socials	jsonb	{ instagram, facebook, tiktok, youtube }
theme_mode	text	light/dark
accent_color	text	hex
font_theme	text	
cta_shape	text	
locations	jsonb	multiple store locations
slug	text	unique per profile
catalogs
Column	Type	Notes
id	uuid	PK
user_id	uuid	FK → profiles.id
title	text	catalog title
slug	text	per-user unique
description	text	optional
cover	jsonb	main image + metadata
settings	jsonb	layout, preferences
theme_overrides	jsonb	per-catalog design overrides
status	text	rascunho or publicado
link_ativo	bool	if public link is active
no_perfil	bool	deprecated → will be replaced by profile_blocks control
created_at	timestamptz	default now()
updated_at	timestamptz	default now()
🔹 Core Logic Summary
Concept	Description
Status	content readiness: rascunho or publicado
Link ativo	whether public link works
Perfil	defined via profile_blocks (not inside catalogs)
Public pages	render only when status=publicado and link_ativo=true
Slug uniqueness	enforced per user: UNIQUE(user_id, slug)
Reserved slugs	avoid: ["sobre", "contato", "catalogos", "perfil", "loja", "admin", "api"]
🧩 Phases Overview
Phase	Goal	Status
1	Fix public pages & publish flow	⏳ In progress
2	Build profile builder (link in bio)	🔜 Next
3	Implement quick catalog flow	⏳ Pending
4	Catalog cards + actions	🔜 Planned
5	UX polish + templates	⏳ Later
6	Testing & launch prep	🚀 Final phase
🔴 PHASE 1 — PUBLIC PAGES & PUBLISH FLOW

Goal: Make catalogs publicly viewable and publishing effortless.

Step 1.1 — Public Catalog Page

 Route: /@{userSlug}/{catalogSlug}

 Fetch profile + catalog + blocks

 Render blocks (mobile-first)

 Guard: only show if status='publicado' & link_ativo=true

 Else → show “Catálogo indisponível” page with link to /@{userSlug}

 Add OG meta tags:

<meta property="og:title" content="{catalog.title}" />
<meta property="og:description" content="{catalog.description or profile.slogan}" />
<meta property="og:image" content="{cover.url}" />
<link rel="canonical" href="https://cardapli.com.br/@{user}/{catalog}" />


 Commit: feat: public catalog page rendering

Step 1.2 — Simplified Publish Flow

 Removed “Visibilidade” dropdown

 “Publicar” button active only if catalog has Capa + ≥1 block

 Publish dialog:

“🎉 Pronto para compartilhar seu catálogo?”

☑️ Ativar link público (default ON)
[Publicar agora] [Cancelar]

 After publish:

set status='publicado'

set link_ativo=true

 Show success modal:

🎉 Catálogo publicado!
Agora você pode enviar para seus clientes.

🔗 cardapli.com.br/@user/catalog

[Enviar no WhatsApp] [Copiar link] [Ver catálogo]


 WhatsApp link:

https://wa.me/?text=${encodeURIComponent("Oi! Separei essas sugestões para você 👉 " + url)}


 Commit: feat: new publish flow + success modal

Step 1.3 — Database Migration
ALTER TABLE catalogs 
  ADD COLUMN IF NOT EXISTS link_ativo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_perfil BOOLEAN DEFAULT false;

UPDATE catalogs
  SET status = CASE 
    WHEN status = 'draft' THEN 'rascunho'
    WHEN status IN ('public', 'unlisted') THEN 'publicado'
    ELSE 'rascunho'
  END;

UPDATE catalogs SET link_ativo = true WHERE status='publicado';
UPDATE catalogs SET no_perfil = false;


 Commit: migration: finalize catalogs schema (status/link_ativo/no_perfil)

🟣 PHASE 2 — PROFILE BUILDER (LINK-IN-BIO)

Goal: Let users build a public profile with blocks, including catalogs.

Step 2.1 — Table: profile_blocks
CREATE TABLE profile_blocks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  sort INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


 Add RLS: only owner can modify

 Commit: migration: create profile_blocks table

Step 2.2 — Public Profile Page

 Route: /@{userSlug}

 Fetch profile + profile_blocks

 Render:

Header (logo, business_name, slogan)

Blocks (About, Contact, Socials, Catálogos, etc.)

 Only show catalogs if they meet conditions:
status='publicado' and link_ativo=true

 Commit: feat: public profile page

Step 2.3 — Profile Builder UI

 Page: /perfil

 Add section: “Montar Página Pública”

 Reuse block drawer from catalog editor

 Add preview + copy link buttons

 Commit: feat: profile builder UI

Step 2.4 — Catálogos Block

 New block: “Catálogos”

 Modes:

Mostrar todos publicados

Selecionar manualmente (multi-select + reorder)

 Data source: catalogs table

 Display rule: only published + active link

 Commit: feat: Catálogos block

🟡 PHASE 3 — QUICK CATALOG FLOW

Goal: Create & share catalogs instantly from product selection.

Step 3.1 — /compartilhar

 Multi-select products

 Filter by category/tags

 Commit: feat: quick catalog selection page

Step 3.2 — Quick Catalog Modal

 Auto-generate title (ex: “Sugestões - 15 Out 2025”)

 Auto-select first image as cover

 Auto-create slug

 No visibility field

 Commit: feat: quick catalog modal

Step 3.3 — Auto Publish + Share

 Creates catalog with:

status='publicado'

link_ativo=true

no_perfil=false

 Immediately open share modal

 Commit: feat: quick catalog auto publish

🟢 PHASE 4 — DASHBOARD ENHANCEMENTS
Step 4.1 — Status Chips
State	Icon	Color
Rascunho	🟣	Neutral
Publicado	🟢	Success
Link ativo	🔵	Info
Link desativado	⚪	Gray
No perfil	🌐	Purple
Fora do perfil	🚫	Gray

 Compact layout for mobile

 Commit: feat: catalog cards status chips

Step 4.2 — Quick Actions Menu

Publicar / Voltar a rascunho

Ativar / Desativar link

Adicionar / Remover do perfil (with guardrail)

Compartilhar

Editar / Duplicar / Excluir

 Commit: feat: catalog quick actions

🟠 PHASE 5 — POLISH & UX

 Add friendly PT-BR copy:

“Você pode mudar o endereço e a imagem depois.”

“Você pode adicionar ao seu perfil a qualquer momento.”

 Empty states for all main pages

 Template system (3–5 color/font layouts)

 Commit: polish: UX and copy improvements

🧪 PHASE 6 — TESTING & LAUNCH PREP

Checklist:

 Create → Add block → Publish → Link works

 Add to perfil → appears on /@user

 Disable link → removed automatically

 Quick catalog → share instantly

 All text PT-BR, no English leakage

 Works on 375px mobile

 WhatsApp share opens correctly

Performance:

 Lazy load images

 Use skeleton loaders

 Test under 3G

Commit: test: full QA ready for launch

🧾 Definition of Done

Works on desktop and mobile

PT-BR copy finalized

All commits clear (feat:, fix:, test:)

OG preview tested on WhatsApp

Live URLs functional (/@user/catalog)