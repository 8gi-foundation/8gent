# 8gent - Personal Generative Operating System

> **"Personal AI operating systems will replace SaaS."**
>
> Claude Code gave developers infinite building power. 8gent gives everyone else that same abundance.

---

## Ecosystem & Constitution

8gent is a multi-product ecosystem governed by a shared constitution. See `BRAND.md` for brand rules.

| Product | Domain | Role | Status |
|---------|--------|------|--------|
| **8gent OS** | 8gentos.com | Adult personal AI operating system | In development |
| **8gent Jr** | 8gentjr.com | Children's OS (AAC, education, communication) | Live |
| **8gent Code** | github.com/PodJamz/8gent-code | Developer coding agent | Open source |
| **8gent World** | 8gent.world | Ecosystem hub | Live |
| **8gent Games** | 8gent.games | Gaming experiences | Live |

### Constitutional Principles (Key Articles)

- **Article III - Privacy as a right, not a feature.** GDPR compliance is constitutional. Consent gate, data deletion, and privacy policies are enforced in code. See `/docs/DPIA.md`.
- **Article VI - 8gent Jr is the moral center.** Every child deserves a voice. Jr is free forever. Accessibility first. Built by a father for his non-verbal autistic son, with therapists from day one.
- **Brand rules live in `BRAND.md`** — do not duplicate them here. Reference that file for fonts, colors, banned hues, and design principles.

### 8gent Jr Architecture

- **Codebase:** `packages/jnr/`
- **Domain:** `8gentjr.com` (also accessible via `8gent.app/jr/[tenant]`)
- **Auth:** Clerk (production instance, `clerk.8gent.app`)
- **Backend:** Convex (`kindly-pony-819` production)
- **Routing:** Path-based (`/jr/nick`) — subdomain routing available but path preferred
- **Roles:** Owner (parent) + Child + Visitor per tenant
- **GDPR:** Consent gate mandatory before any child data processing

---

## The Vision

**8gent.app** is the consumer-facing manifestation of AIJAMESOS - a personal generative operating system that:

| Capability | What It Means |
|------------|---------------|
| **Learns your objectives** | Not prompt engineering - actual understanding of what you're trying to accomplish |
| **Creates what you need** | Apps, workflows, documents, interfaces generated on demand |
| **Self-improves** | The system compounds knowledge as you use it |
| **Feels like your phone** | Familiar UX patterns, not technical dashboards |

**This is NOT:**
- A chatbot wrapper
- A template gallery
- Another dark mode dashboard
- A features-first product

**This IS:**
- A thinking system that happens to be software
- An OS that demonstrates itself by being used
- Agentic infrastructure disguised as familiar UX

---

## Core Philosophy (from EXPERIENCE_PHILOSOPHY.md)

### Apps as Modes of Thinking

The home screen shows apps - not "sections", not "pages". **Ways of working:**

| App | Role |
|-----|------|
| **Chat** | The control plane - speak things into existence |
| **Tasks** | Where everything becomes concrete |
| **Memory** | Your second brain - what the system knows about you |
| **Canvas** | Creative workspace - generative design |
| **Settings** | System configuration and preferences |

Each app has a clear role. Nothing overlaps by accident.

### Agentic Without Being Theatrical

Users don't need to understand:
- Prompt engineering
- API calls
- Tool definitions
- Technical infrastructure

They just **speak**, **tap**, or **gesture** - and the system:
- Structures their intent
- Executes actions
- Files things correctly
- Remembers context
- Gets smarter over time

---

## Architecture

### Monorepo Structure

```
8gent/
├── mobile/          # Expo React Native (iOS/Android) - PRIMARY
├── web/             # Next.js 16 web app
├── convex/          # Shared backend (in web/)
└── CLAUDE.md        # This file
```

### The Stack (Inherited from AIJAMESOS)

| Layer | Mobile | Web | Why |
|-------|--------|-----|-----|
| Framework | Expo SDK 54 | Next.js 16 | Best-in-class for each platform |
| UI | React Native + Reanimated 4 | React 19 + Tailwind 4 | Native feel, not web-in-a-box |
| Animation | LegendList + Reanimated | Framer Motion 12 | 60fps everywhere |
| Backend | Convex | Convex | Real-time, transactional, type-safe |
| Auth | Clerk | Clerk | Unified identity |
| AI | Claude via AI SDK v6 | Claude via AI SDK v6 | The smartest model |

### Chat as Control Plane

The AI uses **tool calling** to perform actions, not just answer questions:

```typescript
// User says: "Remind me to call mom tomorrow at 5pm"
// AI executes:
{
  tool: "create_reminder",
  arguments: {
    title: "Call mom",
    datetime: "2026-01-29T17:00:00",
    notify: true
  }
}
// User sees: "Got it. I'll remind you tomorrow at 5pm."
```

This pattern scales to everything:
- Creating tasks, projects, workflows
- Storing memories and preferences
- Generating documents, designs, interfaces
- Navigating between apps
- Triggering complex multi-step workflows

### Recursive Memory Layer (RLM)

The system remembers everything relevant:

| Memory Type | What It Stores | Example |
|-------------|----------------|---------|
| **Episodic** | "What happened" | "User created 3 tasks about home renovation on Jan 28" |
| **Semantic** | "What I know" | "User prefers morning reminders, works in tech, has dog named Max" |
| **Working** | "Current context" | "Currently planning a trip to Japan in April" |

Memory enables personalization without explicit configuration.

---

## AI Tools (Current)

### Core Actions

| Tool | Description |
|------|-------------|
| `create_task` | Create task with title, description, priority, due date |
| `update_task` | Modify status, priority, or details |
| `list_tasks` | Query tasks by status, priority, or search |
| `delete_task` | Remove a task |

### Memory Operations

| Tool | Description |
|------|-------------|
| `remember` | Store an episodic memory with importance |
| `recall` | Search memories by semantic query |
| `learn` | Store a semantic fact about the user |
| `forget` | Remove a memory |

### System Operations

| Tool | Description |
|------|-------------|
| `navigate_to` | Switch to an app or screen |
| `set_preference` | Update user settings |
| `generate_ui` | Create dynamic interface components |

### Future Tools (Roadmap)

- `create_workflow` - Define multi-step automated processes
- `generate_document` - Create formatted documents
- `design_interface` - Generate UI from description
- `schedule_action` - Time-based automation
- `connect_service` - Integrate external APIs

---

## Convex Schema

```typescript
// Core tables for 8gent
tasks: defineTable({
  userId: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("backlog"),
    v.literal("todo"),
    v.literal("in_progress"),
    v.literal("review"),
    v.literal("done")
  ),
  priority: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("urgent")
  ),
  dueDate: v.optional(v.number()),
  tags: v.array(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_status", ["userId", "status"]),

episodicMemories: defineTable({
  userId: v.string(),
  content: v.string(),
  importance: v.number(), // 0-1
  context: v.optional(v.string()),
  tags: v.array(v.string()),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_importance", ["userId", "importance"]),

semanticMemories: defineTable({
  userId: v.string(),
  category: v.string(), // "preference", "fact", "relationship"
  key: v.string(),
  value: v.string(),
  confidence: v.number(), // 0-1
  source: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_category", ["userId", "category"]),

chatThreads: defineTable({
  userId: v.string(),
  title: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"]),

chatMessages: defineTable({
  userId: v.string(),
  threadId: v.id("chatThreads"),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  toolCalls: v.optional(v.array(v.object({
    id: v.string(),
    name: v.string(),
    arguments: v.string(),
    result: v.optional(v.string()),
  }))),
  createdAt: v.number(),
}).index("by_thread", ["threadId"]),
```

---

## Development

### Commands

```bash
# Mobile (primary)
cd mobile && pnpm dev        # Start Expo dev server
cd mobile && pnpm ios        # Run on iOS simulator
cd mobile && pnpm android    # Run on Android emulator

# Web
cd web && pnpm dev           # Start Next.js dev server
cd web && pnpm build         # Production build

# Convex (from web/)
npx convex dev               # Start Convex dev server
npx convex deploy            # Deploy to production
```

### Environment Variables

```env
# Shared
CONVEX_DEPLOYMENT=
ANTHROPIC_API_KEY=

# Web
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Mobile (Expo)
EXPO_PUBLIC_CONVEX_URL=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

---

## Coding Conventions

### Universal
- TypeScript strict mode
- Zod for runtime validation
- Composition over inheritance
- Small, focused files (< 300 lines)
- Comments explain "why", not "what"

### Mobile
- Use Reanimated worklets for 60fps animations
- LegendList for virtualized lists
- `react-native-keyboard-controller` for keyboard handling
- iOS HIG patterns (44pt touch targets, 8pt grid)
- Test on both platforms

### Web
- Server Components by default
- Streaming responses for AI
- Tailwind CSS variables for theming
- No hardcoded colors

---

## References

| Document | Location | Purpose |
|----------|----------|---------|
| MANIFESTO | `../Myresumeportfolio/MANIFESTO.md` | The vision |
| EXPERIENCE_PHILOSOPHY | `../Myresumeportfolio/EXPERIENCE_PHILOSOPHY.md` | UX principles |
| AIJAMESOS CLAUDE.md | `../Myresumeportfolio/CLAUDE.md` | Full architecture |
| BMAD Framework | `../Myresumeportfolio/.bmad-core/` | Methodology |

---

## The Bet

> Everyone will have a personal AI operating system within 5 years. The question is: who builds the one people actually want to live in?

We're not building another tool.

We're building the place where tools live.

---

## 8gent Code Integration (v0.7.0)

The terminal-first coding agent (`8gent-code`) powers the developer experience:

- **Smart Onboarding** — 3-question setup with auto-detection
- **Cloud Sync** — Preferences sync across devices via Convex
- **Session Resume** — `/continue`, `/history`, `/resume`, `/compact`
- **Adaptive Prompts** — Agent knows your name, role, and communication style
- **Personal LoRA** — Training pipeline learns from your coding patterns
- **ESC Interrupt** — Abort generation mid-stream

Source: `~/8gent-code/` | Docs: `docs/PERSONALIZATION.md`

---

*8gent: Your OS. Your rules. Your AI.*
