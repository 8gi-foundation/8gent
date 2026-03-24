# 8gent -- Personal Generative Operating System

> "Personal AI operating systems will replace SaaS."

8gent is an ecosystem of AI-native products built around one idea: everyone deserves a personal operating system that learns, adapts, and works for them.

---

## The Ecosystem

Six products sharing the Eight kernel, deployed at `eight-vessel.fly.dev` (Amsterdam).

| Product | Domain | Description | Status |
|---------|--------|-------------|--------|
| **8gent OS** | [8gentos.com](https://8gentos.com) | Parent product. Paid. Revenue engine. | In development |
| **8gent** | [8gent.app](https://8gent.app) | This repo. Consumer GUI client. | Live |
| **8gent Code** | [8gent.dev](https://8gent.dev) | Open source developer agent. Free on-ramp. | Open source |
| **8gent World** | [8gent.world](https://8gent.world) | Ecosystem story, docs, media portal. | Live |
| **8gent Games** | [8gent.games](https://8gent.games) | Agent simulation playground. | Live |
| **8gent Jr** | [8gentjr.com](https://8gentjr.com) | AI assistant for kids. Free forever. | Live |

Constitution: [8gent.world/constitution](https://8gent.world/constitution)

---

## 8gent Jr

Built by a father for his non-verbal autistic son. Free forever. Accessibility first. Developed with speech-language therapists from day one.

Jr runs within this codebase at `packages/jnr/`.

**AAC Engine:**
- 200+ core words, 46K ARASAAC symbols
- GLP stages 1-6 (Marge Blanc Natural Language Acquisition model)
- Gestalt protection, interest-driven AAC cards
- Fitzgerald Key color coding, morphology engine
- AI sentence engine: autocomplete, improvement, encouragement
- Custom card creation, motor lock, parent PIN lock

**40 Educational Games** across 6 categories:
- Speech (10), Sensory (10), Sensory 3D (5), Math (5), Language (5), Patterns (5)

**7 Standalone Apps:**
AAC Board, Draw, Music (DrumPads + Xylophone), Timer, VSD, Speech Therapy, Intuition

**SchoolTube:** Curated educational video feed with parental controls.

**Therapist Tools:** SLT reports with CSV export, session data capture, GLP stage tracking, music therapy.

**GDPR Compliant:** Consent gate, 90-day retention with automated cleanup, breach procedure, full DPIA. Ireland digital age of consent: 16.

---

## Tech Stack

| Layer | Jr (`packages/jnr/`) | OS (`web/`) | Mobile (`mobile/`) |
|-------|----------------------|-------------|-------------------|
| Framework | Next.js 14 | Next.js 16 | Expo SDK 54 |
| UI | React + Tailwind CSS | React 19 + Tailwind | React Native + Reanimated |
| Backend | Convex | Convex | Convex |
| Auth | Clerk | Clerk | Clerk |
| AI | Claude via AI SDK | Claude via AI SDK | Claude via AI SDK |
| TTS | ElevenLabs + SpeechSynthesis | -- | -- |
| Deploy | Vercel | Vercel | EAS |

---

## Monorepo Structure

```
8gent/
  packages/jnr/     8gent Jr (Next.js 14, children's AAC/education)
  mobile/            Expo React Native (iOS/Android)
  web/               Next.js web app (8gent OS)
  convex/            Shared Convex backend
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- pnpm

### Development

```bash
pnpm install

# Root app
pnpm dev

# 8gent Jr
cd packages/jnr && pnpm dev

# Web (OS)
cd web && pnpm dev

# Mobile
cd mobile && pnpm dev

# Convex backend
npx convex dev
```

### Environment Variables

```
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
```

---

## Links

- [Brand guidelines](./BRAND.md)
- [Constitution](https://8gent.world/constitution)
- [Media/Decks](https://8gent.world/media/decks)
- [Inspirations](https://8gent.world/inspirations)
- [DPIA](./docs/DPIA.md)

---

Proprietary. All rights reserved.
