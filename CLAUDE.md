# CLAUDE.md

## What This Is

8gent is the consumer GUI client for the 8gent OS, live at **8gent.app**. It also hosts **8gent Jr** (8gentjr.com) at `packages/jnr/`. Both run from this monorepo.

---

## Ecosystem

Six products sharing the Eight kernel, deployed at `eight-vessel.fly.dev` (Amsterdam).

| Domain | Product | Role |
|--------|---------|------|
| **8gentos.com** | 8gent OS | Parent product. Paid. Revenue engine. |
| **8gent.app** | 8gent | This repo. Consumer GUI client. |
| **8gent.dev** | 8gent Code | Open source developer agent. Free on-ramp. |
| **8gent.world** | 8gent World | Ecosystem story, docs, media portal. |
| **8gent.games** | 8gent Games | Agent simulation playground. |
| **8gentjr.com** | 8gent Jr | AI assistant for kids. Free forever. |

Constitution: [8gent.world/constitution](https://8gent.world/constitution)
Media/Decks: [8gent.world/media/decks](https://8gent.world/media/decks)
Inspirations: [8gent.world/inspirations](https://8gent.world/inspirations)

---

## Monorepo Structure

```
8gent/
├── src/app/                  # Next.js App Router (OS GUI routes)
├── packages/jnr/             # 8gent Jr (children's AAC/education, Next.js 14)
├── packages/control-plane/
├── packages/lynkr/
├── packages/toolshed/
├── packages/livekit-agent/
├── packages/whatsapp-bridge/
├── mobile/                   # Expo React Native (iOS/Android)
├── web/                      # Next.js web app (OS frontend)
└── convex/                   # Backend (in web/)
```

---

## Commands

```bash
# Root app
pnpm dev              # Dev server on localhost:3000
pnpm build            # Production build
pnpm lint             # Linting
pnpm test             # Vitest
pnpm test:run         # Single run
pnpm test:coverage    # Coverage report

# Jr
cd packages/jnr && pnpm dev
cd packages/jnr && pnpm build

# Mobile
cd mobile && pnpm dev
cd mobile && pnpm ios
cd mobile && pnpm android

# Web (OS)
cd web && pnpm dev
cd web && pnpm build

# Convex (from web/)
npx convex dev
npx convex deploy
```

No test suite in Jr yet. Root app uses Vitest.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19 |
| Jr Framework | Next.js 14 |
| Mobile | Expo SDK 54, React Native, Reanimated |
| Styling | Tailwind CSS 3, Framer Motion 12 |
| Backend | Convex (real-time, transactional, type-safe) |
| Auth | Clerk (unified across ecosystem, production at `clerk.8gent.app`) |
| AI | Claude via AI SDK v6 (`@ai-sdk/anthropic`) |
| 3D | Three.js, React Three Fiber |
| Video | Remotion |
| Voice | LiveKit |
| Testing | Vitest, Testing Library |
| Validation | Zod v4 |
| State | Zustand |

---

## Key Routes (src/app/)

The OS GUI has 60+ app routes. Notable ones:

| Route | Purpose |
|-------|---------|
| `/` | Home screen |
| `/chat` | AI control plane |
| `/agent` | Agent workspace |
| `/terminal` | Terminal emulator |
| `/memory` | Context/memory viewer |
| `/canvas` | Creative workspace |
| `/music` | Music studio |
| `/games` | Game hub |
| `/settings` | System config |
| `/onboarding` | First-run setup |
| `/sign-in`, `/sign-up` | Clerk auth |
| `/inspirations` | Credits and inspirations |

### Domain Routing

| URL | Destination |
|-----|-------------|
| `8gent.app` | Sign-in gateway |
| `8gentjr.com` | Jr landing page |
| `nick.8gentjr.com` | Child's AAC board (subdomain per child) |

---

## Brand Rules

Full reference in `BRAND.md`. Do not duplicate that file here. Key points:

### Typography
- **Fraunces** (serif, weight 800) -- brand wordmark
- **Inter** (sans) -- UI text
- **JetBrains Mono** -- code blocks

### Color
- Primary accent: `#E8610A`
- Dark mode is the default
- No purple. Purple is banned from the palette.

### Jr Brand (different from OS)
- **Light/warm** palette (not dark mode)
- 80px+ touch targets
- No emojis (SVG icons only)
- Sensory-safe, clinically accurate

### Writing Rules
- No em dashes. Use commas, periods, or semicolons.
- No inflation. State what was done, what works, what does not.
- No fake stats. Every number must be verifiable.
- Roadmap framing: NOW / NEXT / LATER.

---

## 8gent Jr (packages/jnr/)

Jr is a free, accessibility-first AI assistant for non-verbal and neurodivergent children. Built by a father for his non-verbal autistic son, with speech-language therapists from day one.

**Domain:** 8gentjr.com (subdomain per child, e.g. `nick.8gentjr.com`)
**Auth:** Clerk (production instance, `clerk.8gent.app`)
**Backend:** Convex
**Roles:** Owner (parent) + Child + Visitor per tenant

### AAC Engine
- 200+ core words on the communication board
- 46K ARASAAC symbols for visual communication
- GLP stages 1-6 (Marge Blanc Natural Language Acquisition model)
- Gestalt protection
- Interest-driven AAC cards tailored to each child
- Fitzgerald Key color coding for word categories
- Morphology engine for verb tenses, plurals, possessives
- AI sentence engine: autocomplete, improvement, encouragement (Claude via AI SDK)
- Custom card creation for parents/therapists
- Motor lock to prevent accidental navigation
- Parent PIN lock for settings access

### Educational Content
- 40 games across speech (10), sensory (10), sensory 3D (5), math (5), language (5), patterns (5)
- 7 standalone apps: AAC Board, Draw, Music, Timer, VSD, Speech Therapy, Intuition
- SchoolTube: curated educational video feed with parental controls

### Therapist Tools
- SLT reports with CSV export
- Session data capture per interaction
- GLP stage tracking across sessions
- Music therapy integration

### Jr API Routes

| Route | Purpose |
|-------|---------|
| `/api/autocomplete` | AI word/phrase prediction |
| `/api/encourage` | Contextual encouragement |
| `/api/sentence-improve` | Grammar and structure suggestions |
| `/api/tts` | Text-to-speech (ElevenLabs + browser fallback) |

### GDPR Compliance (Non-Negotiable)

GDPR compliance is constitutional (Article III). This is not optional, not a feature flag, not negotiable.

- Ireland digital age of consent: 16
- Consent gate mandatory before any child data processing
- 90-day data retention with automated cron cleanup
- Breach notification procedure documented
- Full DPIA at `/docs/DPIA.md`
- Privacy is architecture, not a feature toggle

### Accessibility Is Architecture

Accessibility in Jr is not a feature. It is the architecture. Do not treat it as an add-on.

- 80px+ touch targets (not the standard 44px)
- Sensory-safe color and motion design
- Clinically accurate communication tools
- Designed with SLTs from the start, not retrofitted

---

## Environment Variables

```env
# Shared
CONVEX_DEPLOYMENT=
ANTHROPIC_API_KEY=

# Web / Jr
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Jr TTS
ELEVENLABS_API_KEY=

# Mobile (Expo)
EXPO_PUBLIC_CONVEX_URL=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

---

## Coding Conventions

- TypeScript strict mode
- Zod for runtime validation
- Server Components by default (web)
- Composition over inheritance
- Small, focused files (under 300 lines)
- Comments explain "why", not "what"
- Tailwind CSS variables for theming, no hardcoded colors
- Mobile: Reanimated worklets for 60fps, iOS HIG patterns
- Streaming responses for AI

## Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
