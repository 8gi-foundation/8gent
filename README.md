# 8gent -- Personal Generative Operating System

> "Personal AI operating systems will replace SaaS."

8gent is an ecosystem of AI-native products built around one idea: everyone deserves a personal operating system that learns, adapts, and works for them.

---

## The Ecosystem

| Product | Domain | Description | Status |
|---------|--------|-------------|--------|
| **8gent Jr** | [8gentjr.com](https://8gentjr.com) | Children's AAC, education, and communication OS | Live |
| **8gent OS** | [8gentos.com](https://8gentos.com) | Adult personal AI operating system | In development |
| **8gent Code** | [GitHub](https://github.com/PodJamz/8gent-code) | Terminal-first developer coding agent | Open source |
| **8gent World** | [8gent.world](https://8gent.world) | Ecosystem hub | Live |
| **8gent Games** | [8gent.games](https://8gent.games) | Gaming experiences | Live |

All products share the Eight kernel. Constitution: [8gent.world/constitution](https://8gent.world/constitution)

---

## 8gent Jr

Built by a father for his non-verbal autistic son. Free forever. Accessibility first. Developed with speech-language therapists from day one.

**AAC Engine:**
- 200+ core words on the communication board
- GLP stages 1-6 (Marge Blanc Natural Language Acquisition model)
- Fitzgerald Key color coding for word categories
- Morphology engine (verb tenses, plurals, possessives)
- AI-powered sentence engine: autocomplete, improvement, and encouragement
- Custom card creation for personalized vocabulary
- Motor lock and parent PIN lock

**40 Educational Games** across 6 categories:
- Speech (10) -- articulation, phonics, word building
- Sensory (10) -- regulation and stimulation
- Sensory 3D (5) -- immersive 3D experiences
- Math (5) -- number recognition and counting
- Language (5) -- vocabulary and comprehension
- Patterns (5) -- sequencing and recognition

**7 Standalone Apps:**
AAC Board, Draw, Music (DrumPads + Xylophone via Web Audio API), Timer, VSD (Visual Scene Display), Speech Therapy, Intuition

**SchoolTube:**
YouTube Kids-style launcher with reels feed, video player, and weekly schedule.

**Therapist Tools:**
Progress reports with CSV export, session data capture, GLP stage tracking.

**GDPR Compliant:**
Consent gate, 90-day data retention with automated cleanup, breach notification procedure, full DPIA.

---

## Tech Stack

| Layer | Jr (`packages/jnr/`) | OS (`web/`) | Mobile (`mobile/`) |
|-------|----------------------|-------------|-------------------|
| Framework | Next.js 14 | Next.js | Expo SDK 54 |
| UI | React + Tailwind CSS | React + Tailwind | React Native + Reanimated |
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
- Convex account
- Clerk account

### Installation

```bash
git clone https://github.com/PodJamz/8gent.git
cd 8gent
pnpm install
```

### Development

```bash
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

Copy `.env.local.example` to `.env.local` and configure:

```
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
```

---

## Domain Routing

| URL | Destination |
|-----|-------------|
| 8gent.app | Sign-in gateway |
| 8gentjr.com | Jr landing page |
| nick.8gentjr.com | Child's AAC board (subdomain per child) |
| 8gentos.com | OS product |
| 8gent.world | Ecosystem hub |
| 8gent.games | Gaming experiences |

---

## Links

- [Brand guidelines](./BRAND.md)
- [Constitution](https://8gent.world/constitution)
- [DPIA](./docs/DPIA.md)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

Proprietary. All rights reserved.

---

*8gent: Your OS. Your rules. Your AI.*
