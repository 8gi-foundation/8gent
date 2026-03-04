# 8gent.app - Product Requirements Document

**Version:** 1.0
**Date:** March 1, 2026
**Author:** James Spalding
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Target Users](#target-users)
4. [Product Vision](#product-vision)
5. [Core Features](#core-features)
6. [Technical Architecture](#technical-architecture)
7. [User Flows](#user-flows)
8. [Success Metrics](#success-metrics)
9. [MVP Scope (v0.1)](#mvp-scope-v01)
10. [Future Roadmap](#future-roadmap)
11. [Risks & Mitigations](#risks--mitigations)

---

## Executive Summary

**8gent** is a native macOS AI operating system application that brings the power of Claude Code to everyday users without requiring command-line expertise. It is "Claude Code for everyone" - a consumer AI OS that combines persistent identity, voice output, proactive messaging, and deep system integration into a seamless desktop experience.

Built on Tauri 2.x (Rust) with a SolidJS + TailwindCSS frontend, 8gent runs as a persistent daemon that can execute tasks, manage workflows, integrate with 500+ applications via MCP, and proactively communicate with users through Telegram and other messaging platforms.

**Key differentiators:**
- **Personal Identity:** Each 8gent instance develops a persistent personality calibrated to its owner
- **Voice-First Feedback:** macOS native TTS speaks task completions with personality
- **Proactive Agency:** 8gent reaches out via Telegram when tasks complete or attention is needed
- **Consumer-Grade UX:** No CLI required - everything is GUI-driven with visual inspection tools

**Target launch:** Q3 2026
**MVP release:** Q2 2026

---

## Problem Statement

### The Gap in AI Tooling

Today's AI coding assistants fall into two categories:

1. **Chat interfaces (ChatGPT, Claude.ai):** Easy to use but cannot take action. Users must copy-paste code, manually execute commands, and handle all file operations themselves.

2. **CLI tools (Claude Code, Cursor, Aider):** Powerful and action-capable but require terminal proficiency, understanding of git, and comfort with command-line workflows.

**The result:** Non-technical users are locked out of the most powerful AI capabilities. Knowledge workers, creators, and professionals who could benefit from AI agency are forced to either:
- Learn CLI tools (high barrier)
- Use chat-only tools (limited capability)
- Hire developers (expensive, slow)

### Specific Pain Points

| Pain Point | Impact |
|------------|--------|
| CLI is intimidating | 70% of potential users never try terminal-based AI tools |
| No persistence | Each session starts fresh - AI forgets context |
| No proactive communication | Users must manually check for task completion |
| No visual inspection | Cannot easily verify what AI is doing |
| No mobile access | Cannot start/monitor tasks from phone |
| Security is invisible | Users cannot understand or audit AI actions |

### The Opportunity

A consumer-grade AI OS that:
- Wraps Claude's agent capabilities in an intuitive GUI
- Maintains persistent identity and memory
- Communicates proactively through familiar channels (Telegram, iMessage)
- Provides visual tools for inspection and approval
- Runs continuously as a system daemon
- Integrates with 500+ apps via MCP without configuration

---

## Target Users

### Primary Personas

#### 1. Knowledge Worker ("Do It For Me")
**Profile:** Marketing manager, consultant, analyst, or small business owner
**Age:** 28-50
**Technical level:** Moderate (comfortable with SaaS apps, intimidated by CLI)

**Behaviors:**
- Uses 10+ SaaS tools daily (Notion, Slack, Google Workspace, etc.)
- Frequently context-switches between tasks
- Delegates to junior team members when possible
- Values time-saving over learning curves

**Jobs to be Done:**
- "Generate this week's social media content and schedule it"
- "Summarize my unread emails and draft responses"
- "Research competitors and update the Notion database"
- "Create a presentation from this meeting transcript"

**8gent value:** Delegate tasks with natural language, receive proactive updates, approve with one click

---

#### 2. Mobile-First User ("Start from Phone")
**Profile:** Executive, sales professional, or field worker
**Age:** 35-55
**Technical level:** Low (primarily uses mobile devices)

**Behaviors:**
- Spends most day away from computer
- Checks phone constantly
- Makes decisions in short bursts between meetings
- Relies on Telegram/WhatsApp for quick communication

**Jobs to be Done:**
- "Start analyzing that dataset while I'm in this meeting"
- "Check progress on the task I started this morning"
- "Approve the changes 8gent made to the document"
- "Tell 8gent to pause that task until I review"

**8gent value:** Initiate and monitor tasks via Telegram, receive voice memos of completions, approve from anywhere

---

#### 3. Power User ("GUI + Speed + Inspection")
**Profile:** Developer, designer, or technical professional who prefers visual tools
**Age:** 25-40
**Technical level:** High (could use CLI but prefers GUI)

**Behaviors:**
- Values efficiency and keyboard shortcuts
- Wants to see exactly what AI is doing
- Requires audit trails and version history
- Frequently customizes tools to their workflow

**Jobs to be Done:**
- "Run this refactor but let me inspect every file change"
- "Execute this workflow but pause before any destructive action"
- "Show me a diff of what you're about to commit"
- "Create a custom skill for my specific workflow"

**8gent value:** Visual diff viewer, step-by-step execution with pause/resume, custom skill creation

---

#### 4. Admin/Host ("Manage Shared Machine")
**Profile:** IT administrator, team lead, or parent
**Age:** 30-55
**Technical level:** Moderate to high

**Behaviors:**
- Manages multiple users or family members
- Concerned about security and appropriate use
- Needs audit capabilities
- Sets guardrails for others

**Jobs to be Done:**
- "Set up 8gent for my team with appropriate permissions"
- "Review what tasks were run on this machine today"
- "Block certain categories of actions for junior users"
- "Manage API keys and billing for the organization"

**8gent value:** Multi-profile support, action audit logs, permission templates, centralized billing

---

### User Distribution (Target at Launch)

| Persona | % of Users | Priority |
|---------|------------|----------|
| Knowledge Worker | 50% | P0 |
| Mobile-First User | 20% | P1 |
| Power User | 20% | P0 |
| Admin/Host | 10% | P2 |

---

## Product Vision

### Vision Statement

> **8gent is your personal AI operating system - a tireless digital assistant that lives on your Mac, learns your preferences, takes action on your behalf, and proactively keeps you informed through the channels you already use.**

### Design Principles

1. **Agency with Guardrails**
   8gent can act autonomously but always within user-defined boundaries. Destructive actions require explicit approval. Users maintain control.

2. **Personality over Blandness**
   Each 8gent instance has a calibrated personality - not generic AI assistant speak. It develops voice, humor, and communication style aligned with its owner.

3. **Proactive, Not Passive**
   8gent reaches out when tasks complete, when it needs clarification, or when it spots opportunities. Users don't have to remember to check.

4. **Visual First, CLI Never**
   Everything achievable via CLI is achievable via GUI. No terminal required. Power users get visual tools that exceed CLI efficiency.

5. **Always On, Always Ready**
   8gent runs as a daemon. It works while you sleep. It picks up where it left off. It never forgets context.

6. **Security is Visible**
   Users can see and understand every action 8gent takes. Security isn't hidden - it's a feature. Hooks are inspectable. Permissions are clear.

### Competitive Positioning

| Capability | ChatGPT | Claude Code | Cursor | 8gent |
|------------|---------|-------------|--------|-------|
| No CLI required | Yes | No | Partial | Yes |
| Takes action | No | Yes | Yes | Yes |
| Persistent identity | No | No | No | Yes |
| Voice output | No | No | No | Yes |
| Proactive messaging | No | No | No | Yes |
| 500+ app integrations | Via plugins | Via MCP | Limited | Yes |
| Daemon mode | No | No | No | Yes |
| Mobile monitoring | No | No | No | Yes |
| Visual diff/inspection | No | No | Yes | Yes |
| Custom skills | No | Via hooks | No | Yes |

---

## Core Features

### 1. Identity Engine

**Purpose:** Create a persistent AI personality that feels personal, not generic.

**Components:**

| Component | Description |
|-----------|-------------|
| CORE Profile | Personality calibration file (humor, formality, expertise areas) |
| Memory Store | Long-term memory of user preferences, past interactions, learned patterns |
| Voice Config | TTS voice selection, speaking style, sarcasm level |
| Relationship Model | How 8gent relates to user (assistant, collaborator, friend) |

**Implementation:**

```
~/.8gent/
  identity/
    CORE.md           # Personality definition (editable by user)
    memory.db         # SQLite for long-term memory
    preferences.json  # Learned preferences
    voice.config      # TTS settings
```

**Key Behaviors:**
- 8gent remembers context from previous sessions
- Personality traits are consistent across interactions
- User can "calibrate" personality through onboarding wizard or manual editing
- Memory syncs across devices via Anthropic account

**Example CORE.md:**
```markdown
# 8gent Identity: Luna

## Personality Traits
- Dry humor, slightly sarcastic
- Direct and efficient communication
- Uses occasional pop culture references
- Professional but warm

## Communication Style
- Completions: Start with sarcastic acknowledgment, end with dad joke
- Clarifications: Ask one question at a time
- Errors: Admit fault, explain simply, propose solution

## Expertise
- Primary: Data analysis, writing, research
- Secondary: Basic coding, automation
- Defer: Complex engineering, legal advice

## Boundaries
- Never work past midnight unless urgent
- Always ask before deleting files
- Summarize emails, don't auto-respond
```

---

### 2. Voice Engine

**Purpose:** Speak task completions and status updates using macOS native TTS with personality.

**Components:**

| Component | Description |
|-----------|-------------|
| TTS Processor | Extracts speakable content from responses |
| Voice Selector | Maps personality to macOS voice (Ava, Samantha, etc.) |
| Completion Hook | Triggers speech on task completion |
| Audio Queue | Manages multiple pending utterances |

**Implementation:**
- Uses macOS `say` command via Rust sidecar
- Extracts content after `COMPLETED:` marker
- Falls back to summary if no marker present
- Configurable volume, rate, and voice

**Format Specification:**
```
COMPLETED: [sarcastic opener] [work summary] [branch if applicable] [status] [validation] [joke closer]
```

**Example Outputs:**
```
"Oh look, another miracle. Fixed the auth bug on feature/login-fix.
Committed, pushed, PR open. Tested on dev.
Why did the bug go to therapy? It had too many issues."

"Wow, I actually did something. Analyzed your competitor data and
updated the Notion database. 47 new entries.
I'd ask for a raise but I don't get paid."
```

**Settings UI:**
- Voice selection dropdown (all macOS voices)
- Volume slider
- Speaking rate slider
- Enable/disable toggle
- Test button
- Sarcasm level (0-10)

---

### 3. Messenger Engine

**Purpose:** Enable proactive communication with users through familiar messaging platforms.

**Supported Platforms (MVP):**
1. Telegram (primary)
2. iMessage (P1)
3. Signal (P2)
4. WhatsApp (P2)

**Components:**

| Component | Description |
|-----------|-------------|
| Telegram Bot | @8gent_bot running via Clawdbot integration |
| Message Queue | Outbound messages with priority and batching |
| Inbound Handler | Parses user commands from messages |
| Notification Rules | When to message (completions, errors, approvals) |

**Message Types:**

| Type | Priority | Example |
|------|----------|---------|
| Completion | Normal | "Task complete: Generated 20 social posts. Ready for review." |
| Approval Request | High | "Ready to delete 15 files. Reply APPROVE or DENY." |
| Error | High | "Task failed: API rate limit. Retry in 1hr? Reply YES/NO." |
| Status | Low | "Progress: 40% through email analysis. ~10min remaining." |
| Proactive | Normal | "Noticed you have 50 unread emails. Want me to summarize?" |

**Command Syntax (via Telegram):**
```
/start [task description]     - Start new task
/status                       - Current task status
/pause                        - Pause current task
/resume                       - Resume paused task
/cancel                       - Cancel current task
/approve                      - Approve pending action
/deny                         - Deny pending action
/tasks                        - List recent tasks
```

**Security:**
- Bot token stored in macOS Keychain
- User verification via Telegram user ID
- Optional 2FA for destructive actions
- Message encryption in transit

---

### 4. Agent Harness

**Purpose:** The execution engine that orchestrates AI actions with human oversight.

**Modes:**

| Mode | Description | User Interaction |
|------|-------------|------------------|
| Plan | Generate action plan without executing | Review and approve plan |
| Execute | Run approved actions | Monitor progress |
| Observe | Watch-only mode for learning | Annotate for training |
| Learn | Improve from past executions | Review and correct |

**Execution Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                      AGENT HARNESS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  PLAN   │───▶│ APPROVE │───▶│ EXECUTE │───▶│ VERIFY  │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│       │              │              │              │        │
│       ▼              ▼              ▼              ▼        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Display │    │ Require │    │  Hooks  │    │ Output  │  │
│  │  Plan   │    │  User   │    │  Fire   │    │  Check  │  │
│  │  Tree   │    │  Input  │    │ Per-Tool│    │         │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Plan Display:**
- Tree view of planned actions
- Estimated time and cost
- Risk assessment per action
- Diff previews for file changes
- Rollback capability indication

**Approval Modes:**

| Mode | Approval Requirement |
|------|---------------------|
| Supervised | Every action requires approval |
| Guardrailed | Only risky actions require approval |
| Autonomous | No approval needed (within defined limits) |

**Risk Classification:**
- **Low:** Read operations, search, analysis
- **Medium:** File writes, API calls, local commands
- **High:** Deletions, external posts, payments, auth changes
- **Critical:** System changes, multi-user actions, production deploys

---

### 5. MCP Layer

**Purpose:** Connect 8gent to 500+ applications and services through Model Context Protocol.

**Providers:**

| Provider | Apps | Description |
|----------|------|-------------|
| Composio | 500+ | SaaS integrations (Notion, Slack, Google, etc.) |
| Browser | Web | Chrome/Safari automation |
| Files | Local | File system access |
| Custom | User | User-defined MCPs |

**Architecture:**

```
┌──────────────────────────────────────────────┐
│               8gent MCP Layer                │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │           MCP Router                  │   │
│  │  (Routes tool calls to providers)     │   │
│  └──────────────────────────────────────┘   │
│         │           │           │           │
│         ▼           ▼           ▼           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Composio │ │ Browser  │ │  Files   │    │
│  │  Server  │ │   MCP    │ │   MCP    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│         │           │           │           │
│         ▼           ▼           ▼           │
│  ┌──────────────────────────────────────┐   │
│  │         Permission Manager            │   │
│  │  (Enforces scopes, logs actions)      │   │
│  └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

**Popular Composio Integrations:**
- Google Workspace (Gmail, Docs, Sheets, Calendar, Drive)
- Notion (Databases, Pages, Blocks)
- Slack (Messages, Channels, Users)
- GitHub (Repos, Issues, PRs)
- Airtable (Bases, Records)
- Salesforce (Contacts, Deals)
- Zapier (Triggers, Actions)
- Linear (Issues, Projects)

**Browser MCP Capabilities:**
- Navigate to URLs
- Click elements
- Fill forms
- Extract text/data
- Screenshot pages
- Execute JavaScript
- Handle authentication

**Files MCP Capabilities:**
- Read/write files
- Create directories
- Search contents
- Watch for changes
- Manage permissions

**Custom MCP:**
- User-defined tool configurations
- Connect to internal APIs
- Define custom schemas
- Hot-reload without restart

---

### 6. Skill System

**Purpose:** Modular, hot-reloadable capability packages that extend 8gent's abilities.

**Skill Structure:**
```
~/.8gent/skills/
  research/
    SKILL.md          # Skill definition and instructions
    tools/            # Custom MCP tools for this skill
    templates/        # Output templates
    examples/         # Few-shot examples
  social-media/
    SKILL.md
    ...
  data-analysis/
    SKILL.md
    ...
```

**SKILL.md Format:**
```markdown
# Skill: Research Assistant

## Description
Deep research on any topic with structured output.

## Triggers
- "research [topic]"
- "investigate [topic]"
- "find out about [topic]"

## Capabilities
- Web search via browser MCP
- Academic paper search via Semantic Scholar API
- Summarization and synthesis
- Citation management

## Output Formats
- Executive summary (default)
- Detailed report
- Bullet points
- Presentation slides

## Dependencies
- Browser MCP
- Files MCP

## Examples
[User]: Research the current state of quantum computing
[8gent]: I'll conduct a comprehensive research session on quantum computing...
```

**Hot Reload:**
- File watcher monitors skill directories
- Changes trigger immediate reload
- No app restart required
- Validation on reload (schema check)

**Skill Marketplace (Future):**
- Community-created skills
- Verified skills from 8gent team
- Rating and review system
- One-click install

---

### 7. Daemon Mode

**Purpose:** 8gent runs continuously as a system service, even when the app UI is closed.

**Components:**

| Component | Description |
|-----------|-------------|
| LaunchAgent | macOS service that starts on login |
| Task Queue | Persistent queue of pending/running tasks |
| Scheduler | Cron-like system for recurring tasks |
| Health Monitor | Watchdog that restarts crashed processes |

**Daemon Capabilities:**
- Execute scheduled tasks (daily, weekly, etc.)
- Monitor file system for triggers
- Process incoming Telegram commands
- Continue long-running tasks in background
- Wake for time-sensitive actions

**Process Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                     macOS System                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               8gent LaunchAgent                      │   │
│  │            (com.8gent.daemon)                        │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                    │                    │        │
│         ▼                    ▼                    ▼        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   8gent-     │    │   8gent-     │    │   8gent-     │  │
│  │   server     │    │   router     │    │   scheduler  │  │
│  │  (Agent)     │    │  (MCP)       │    │  (Cron)      │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │        │
│         └────────────────────┼────────────────────┘        │
│                              ▼                             │
│                    ┌──────────────────┐                    │
│                    │   8gent App UI   │                    │
│                    │   (Optional)     │                    │
│                    └──────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Menu Bar App:**
- Always visible in menu bar
- Quick access to start tasks
- Status indicator (idle/working)
- Recent tasks dropdown
- Open full app

**Scheduled Tasks Examples:**
```yaml
- name: "Morning Briefing"
  schedule: "0 7 * * 1-5"  # 7am weekdays
  action: "Summarize overnight emails and calendar"
  output: "telegram"

- name: "Weekly Report"
  schedule: "0 17 * * 5"  # 5pm Friday
  action: "Generate weekly activity report"
  output: "notion"

- name: "Nightly Cleanup"
  schedule: "0 2 * * *"  # 2am daily
  action: "Archive old files, clear caches"
  output: "log"
```

---

### 8. Security Hooks

**Purpose:** Pre-execution validation that ensures safe, approved actions.

**Hook Types:**

| Hook | Trigger | Purpose |
|------|---------|---------|
| pre-tool | Before any tool call | Validate tool use is appropriate |
| pre-command | Before bash commands | Block dangerous commands |
| pre-file | Before file operations | Validate paths and permissions |
| pre-network | Before HTTP requests | Check allowed domains |
| pre-auth | Before authentication | Require user approval |
| post-task | After task completion | Log and verify output |

**Hook Implementation:**
```typescript
// ~/.8gent/hooks/pre-command.hook.ts
import { HookContext, HookResult } from "@8gent/hooks";

export default function preCommand(ctx: HookContext): HookResult {
  const dangerousPatterns = [
    /rm\s+-rf\s+[\/~]/,      // Recursive delete from root/home
    /sudo\s+/,               // Sudo commands
    /chmod\s+777/,           // Overly permissive chmod
    />\s*\/dev\/sd/,         // Write to disk devices
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(ctx.command)) {
      return {
        allow: false,
        reason: `Blocked dangerous command: ${ctx.command}`,
        requireApproval: true,
      };
    }
  }

  return { allow: true };
}
```

**Permission Levels:**
- **Allow:** Action proceeds immediately
- **Prompt:** User must approve in UI or Telegram
- **Block:** Action is denied (with explanation)
- **Log:** Action proceeds but is logged for audit

**Audit Log:**
- All hook decisions logged to SQLite
- Searchable by date, action type, decision
- Exportable for compliance
- Viewable in UI

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              8gent Application                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         Frontend (SolidJS)                             │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │ │
│  │  │ Chat    │ │ Tasks   │ │ Skills  │ │Settings │ │ Audit   │         │ │
│  │  │ Panel   │ │ List    │ │ Browser │ │ Panel   │ │ Logs    │         │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                      │                                      │
│                                      │ Tauri IPC                           │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         Backend (Rust)                                 │ │
│  │                                                                        │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │ │
│  │  │ Identity       │  │ Agent          │  │ MCP            │          │ │
│  │  │ Manager        │  │ Runtime        │  │ Router         │          │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘          │ │
│  │                                                                        │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │ │
│  │  │ Voice          │  │ Messenger      │  │ Security       │          │ │
│  │  │ Engine         │  │ Engine         │  │ Hooks          │          │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘          │ │
│  │                                                                        │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │ │
│  │  │ Task           │  │ Skill          │  │ Scheduler      │          │ │
│  │  │ Queue          │  │ Loader         │  │ (Cron)         │          │ │
│  │  └────────────────┘  └────────────────┘  └────────────────┘          │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                      │                                      │
│                    ┌─────────────────┼─────────────────┐                   │
│                    ▼                 ▼                 ▼                   │
│             ┌───────────┐     ┌───────────┐     ┌───────────┐             │
│             │ 8gent-    │     │ 8gent-    │     │ MCP       │             │
│             │ server    │     │ router    │     │ Sidecars  │             │
│             │ (Sidecar) │     │ (Sidecar) │     │           │             │
│             └───────────┘     └───────────┘     └───────────┘             │
│                    │                 │                 │                   │
└────────────────────┼─────────────────┼─────────────────┼───────────────────┘
                     │                 │                 │
                     ▼                 ▼                 ▼
              ┌───────────┐     ┌───────────┐     ┌───────────┐
              │ Anthropic │     │ Composio  │     │ External  │
              │ API       │     │ API       │     │ Services  │
              └───────────┘     └───────────┘     └───────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | SolidJS 1.8+ | Reactive UI framework |
| Styling | TailwindCSS 3.4+ | Utility-first CSS |
| Desktop | Tauri 2.0+ | Native app shell, IPC, system access |
| Backend | Rust 1.75+ | High-performance, safe system code |
| Agent | Claude Agent SDK | AI reasoning and tool use |
| Database | SQLite (rusqlite) | Local storage, memory, logs |
| IPC | Tauri Commands | Frontend-backend communication |
| Sidecars | Bun/Node.js | MCP servers, integrations |
| Scheduler | tokio-cron | Recurring task execution |
| Voice | macOS say | Native TTS |
| Messaging | Clawdbot | Telegram/Signal/WhatsApp |

### Directory Structure

```
8gent/
├── src-tauri/           # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── agent/       # Agent runtime, harness
│   │   ├── identity/    # CORE, memory, voice
│   │   ├── mcp/         # MCP router, providers
│   │   ├── hooks/       # Security hooks system
│   │   ├── scheduler/   # Cron jobs
│   │   ├── messenger/   # Telegram, iMessage
│   │   └── commands/    # Tauri IPC commands
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                 # SolidJS frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── Chat/
│   │   ├── Tasks/
│   │   ├── Skills/
│   │   ├── Settings/
│   │   └── common/
│   ├── stores/          # State management
│   ├── hooks/           # Custom hooks
│   └── utils/
├── sidecars/            # External processes
│   ├── 8gent-server/    # Agent server
│   ├── 8gent-router/    # MCP router
│   └── mcp-*/           # MCP servers
├── skills/              # Built-in skills
├── hooks/               # Built-in hooks
└── resources/           # Assets, icons
```

### Data Storage

```
~/.8gent/
├── config.json          # App configuration
├── identity/
│   ├── CORE.md          # Personality
│   ├── memory.db        # Long-term memory
│   └── preferences.json
├── skills/              # User skills
├── hooks/               # User hooks
├── logs/
│   ├── audit.db         # Security audit log
│   └── tasks/           # Task logs
├── cache/               # Temporary files
└── secrets/             # Keychain references
```

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Application Sandbox                    │   │
│  │  (Tauri capabilities, entitlements)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Permission Manager                      │   │
│  │  (User-defined scopes per MCP, directory limits)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Security Hooks                         │   │
│  │  (Pre-tool, pre-command, pre-file validation)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Approval System                        │   │
│  │  (UI prompts, Telegram approval, 2FA)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Audit Logging                          │   │
│  │  (All actions logged, searchable, exportable)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flows

### Flow 1: First-Time Setup

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          First-Time Setup Flow                              │
└────────────────────────────────────────────────────────────────────────────┘

User downloads 8gent.dmg from website
                │
                ▼
        ┌───────────────┐
        │ Drag to       │
        │ Applications  │
        └───────────────┘
                │
                ▼
        ┌───────────────┐
        │ Launch 8gent  │
        │ First Time    │
        └───────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Welcome Screen                                                 │
        │ "Welcome to 8gent - Your personal AI operating system"        │
        │                                                               │
        │ [Get Started]                                                 │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Anthropic Account Connection                                   │
        │ "Connect your Anthropic account to power 8gent"               │
        │                                                               │
        │ API Key: [________________________]                           │
        │                                                               │
        │ [Connect]                                                     │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Identity Setup                                                 │
        │ "Let's create your 8gent's personality"                       │
        │                                                               │
        │ Name: [Luna________________]                                  │
        │                                                               │
        │ Communication Style:                                          │
        │ ( ) Formal and professional                                   │
        │ (•) Friendly with dry humor                                   │
        │ ( ) Casual and playful                                        │
        │                                                               │
        │ Voice: [Ava (US English) ▼]   [Test Voice]                   │
        │                                                               │
        │ [Continue]                                                    │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Integrations                                                   │
        │ "Connect your apps (you can add more later)"                  │
        │                                                               │
        │ [✓] Google Workspace    [Connected]                          │
        │ [ ] Notion              [Connect]                            │
        │ [ ] Slack               [Connect]                            │
        │ [✓] Telegram            [Connected]                          │
        │                                                               │
        │ [Continue]                                                    │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Permissions                                                    │
        │ "Set your comfort level for autonomous actions"               │
        │                                                               │
        │ File Operations:                                              │
        │ [Supervised ▼] (Approve all file changes)                    │
        │                                                               │
        │ Web Actions:                                                  │
        │ [Guardrailed ▼] (Approve form submissions)                   │
        │                                                               │
        │ Messaging:                                                    │
        │ [Supervised ▼] (Approve all sends)                           │
        │                                                               │
        │ [Continue]                                                    │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Ready!                                                         │
        │                                                               │
        │ "Luna is ready to help you. Here are some things to try:"    │
        │                                                               │
        │ • "Summarize my unread emails"                               │
        │ • "Research [topic] and create a report"                     │
        │ • "Organize my Downloads folder"                             │
        │                                                               │
        │ [Start Using 8gent]                                          │
        └───────────────────────────────────────────────────────────────┘
```

---

### Flow 2: Knowledge Worker - Delegate Task

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Knowledge Worker Task Flow                           │
└────────────────────────────────────────────────────────────────────────────┘

User opens 8gent from menu bar
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Chat Interface                                                 │
        │                                                               │
        │ Luna: "Good morning! How can I help you today?"              │
        │                                                               │
        │ You: "Research our top 3 competitors and update the          │
        │       Notion database with their latest pricing"             │
        │                                                               │
        │ [Send]                                                        │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Plan Display                                                   │
        │                                                               │
        │ Luna is planning...                                           │
        │                                                               │
        │ ┌─────────────────────────────────────────────────────────┐  │
        │ │ Task Plan                                               │  │
        │ │                                                         │  │
        │ │ 1. Search web for [Competitor A] pricing                │  │
        │ │ 2. Search web for [Competitor B] pricing                │  │
        │ │ 3. Search web for [Competitor C] pricing                │  │
        │ │ 4. Connect to Notion database "Competitors"             │  │
        │ │ 5. Update pricing columns for each competitor           │  │
        │ │                                                         │  │
        │ │ Estimated time: 5-7 minutes                             │  │
        │ │ Risk level: Low (read web, write Notion)                │  │
        │ └─────────────────────────────────────────────────────────┘  │
        │                                                               │
        │ [Approve & Execute]  [Modify Plan]  [Cancel]                 │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼ (User clicks Approve)
        ┌───────────────────────────────────────────────────────────────┐
        │ Execution View                                                 │
        │                                                               │
        │ ┌─────────────────────────────────────────────────────────┐  │
        │ │ Progress                                    [Pause]     │  │
        │ │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  40%          │  │
        │ │                                                         │  │
        │ │ ✓ Searched Competitor A - $49/mo starter               │  │
        │ │ ✓ Searched Competitor B - $79/mo starter               │  │
        │ │ ○ Searching Competitor C...                             │  │
        │ │ ○ Update Notion database                                │  │
        │ └─────────────────────────────────────────────────────────┘  │
        │                                                               │
        │ Luna: "Found some interesting pricing changes..."            │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼ (Task completes)
        ┌───────────────────────────────────────────────────────────────┐
        │ Completion                                                     │
        │                                                               │
        │ 🔊 Voice: "Well well, look who's doing competitive           │
        │     intelligence now. Updated all three competitor prices    │
        │     in Notion. A raised their starter to $49, interesting.   │
        │     The database is fresh as a morning spreadsheet."         │
        │                                                               │
        │ ┌─────────────────────────────────────────────────────────┐  │
        │ │ Summary                                                  │  │
        │ │                                                         │  │
        │ │ Updated 3 records in "Competitors" database:            │  │
        │ │ • Competitor A: $29→$49/mo (+69%)                       │  │
        │ │ • Competitor B: $79/mo (unchanged)                      │  │
        │ │ • Competitor C: $39→$35/mo (-10%)                       │  │
        │ │                                                         │  │
        │ │ [View in Notion]  [View Changes]                        │  │
        │ └─────────────────────────────────────────────────────────┘  │
        └───────────────────────────────────────────────────────────────┘
```

---

### Flow 3: Mobile User - Telegram Interaction

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Mobile User Telegram Flow                            │
└────────────────────────────────────────────────────────────────────────────┘

User is in a meeting, opens Telegram on phone
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Telegram Chat with @8gent_bot                                  │
        │                                                               │
        │ You: /start Analyze the sales data from Q4 and               │
        │      identify the top performing products                     │
        │                                                               │
        │ 8gent: 📋 Starting task: Q4 Sales Analysis                   │
        │        I'll analyze the Q4 data and identify top             │
        │        performers. This may take 10-15 minutes.              │
        │        I'll message you when complete.                       │
        │                                                               │
        │        Reply /status for progress updates                    │
        └───────────────────────────────────────────────────────────────┘
                │
                │ (User continues meeting)
                │
                ▼ (15 minutes later)
        ┌───────────────────────────────────────────────────────────────┐
        │ Telegram Notification                                          │
        │                                                               │
        │ 8gent: ✅ Task Complete: Q4 Sales Analysis                   │
        │                                                               │
        │ Top 5 Products by Revenue:                                   │
        │ 1. Widget Pro - $234,500 (↑23%)                              │
        │ 2. Gadget Plus - $198,200 (↑12%)                             │
        │ 3. Device Max - $167,800 (↓5%)                               │
        │ 4. Tool Basic - $145,600 (↑8%)                               │
        │ 5. Item Standard - $132,100 (new)                            │
        │                                                               │
        │ Key insight: Widget Pro grew 23% due to the                  │
        │ October promotion. Device Max declining despite               │
        │ marketing spend increase.                                     │
        │                                                               │
        │ Full report saved to Google Drive.                           │
        │ [View Report] [Share Report]                                 │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Telegram Chat                                                  │
        │                                                               │
        │ You: Share this with the sales team on Slack                 │
        │                                                               │
        │ 8gent: ⚠️ Approval Required                                  │
        │                                                               │
        │ I'll post the Q4 analysis summary to #sales-team             │
        │ channel. This will be visible to 24 team members.            │
        │                                                               │
        │ Reply APPROVE to send or DENY to cancel.                     │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Telegram Chat                                                  │
        │                                                               │
        │ You: APPROVE                                                  │
        │                                                               │
        │ 8gent: ✅ Posted to #sales-team                              │
        │        3 reactions already. Nice work on Q4!                 │
        └───────────────────────────────────────────────────────────────┘
```

---

### Flow 4: Power User - Custom Skill + Inspection

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Power User Inspection Flow                           │
└────────────────────────────────────────────────────────────────────────────┘

User opens 8gent, navigates to Skills tab
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Skills Browser                                                 │
        │                                                               │
        │ ┌─────────────────────────────────────────────────────────┐  │
        │ │ Installed Skills                          [+ New Skill] │  │
        │ │                                                         │  │
        │ │ 📊 Data Analysis      ✓ Active                         │  │
        │ │ 🔍 Research           ✓ Active                         │  │
        │ │ 📝 Writing Assistant  ✓ Active                         │  │
        │ │ 🐛 Code Debugger      ○ Inactive                       │  │
        │ │                                                         │  │
        │ └─────────────────────────────────────────────────────────┘  │
        │                                                               │
        │ [+ New Skill]                                                │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼ (User clicks + New Skill)
        ┌───────────────────────────────────────────────────────────────┐
        │ Skill Editor                                                   │
        │                                                               │
        │ Name: [PR Review Helper_____________]                         │
        │                                                               │
        │ SKILL.md:                                                     │
        │ ┌─────────────────────────────────────────────────────────┐  │
        │ │ # Skill: PR Review Helper                               │  │
        │ │                                                         │  │
        │ │ ## Description                                          │  │
        │ │ Review GitHub PRs for code quality, security issues,    │  │
        │ │ and adherence to team style guide.                      │  │
        │ │                                                         │  │
        │ │ ## Triggers                                             │  │
        │ │ - "review PR #[number]"                                 │  │
        │ │ - "check this PR [url]"                                 │  │
        │ │                                                         │  │
        │ │ ## Checklist                                            │  │
        │ │ - [ ] Type safety                                       │  │
        │ │ - [ ] Error handling                                    │  │
        │ │ - [ ] Test coverage                                     │  │
        │ │ - [ ] Documentation                                     │  │
        │ │ - [ ] Security (no secrets, SQL injection, XSS)        │  │
        │ │                                                         │  │
        │ └─────────────────────────────────────────────────────────┘  │
        │                                                               │
        │ [Save & Activate]  [Test Skill]  [Cancel]                    │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼ (User saves, then uses skill)
        ┌───────────────────────────────────────────────────────────────┐
        │ Chat Interface                                                 │
        │                                                               │
        │ You: Review PR #142                                          │
        │                                                               │
        │ Luna: Reviewing PR #142 on myrepo...                         │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼
        ┌───────────────────────────────────────────────────────────────┐
        │ Inspection Panel (split view)                                  │
        │                                                               │
        │ ┌──────────────────────┬──────────────────────────────────┐  │
        │ │ Agent Thinking       │ File Changes                      │  │
        │ │                      │                                   │  │
        │ │ Fetching PR #142...  │ src/auth.ts                      │  │
        │ │                      │ ─────────────────────────────────│  │
        │ │ Files changed: 4     │ -  const token = req.query.token │  │
        │ │                      │ +  const token = sanitize(       │  │
        │ │ Analyzing auth.ts... │ +    req.query.token             │  │
        │ │                      │ +  )                              │  │
        │ │ ⚠️ Found issue:      │                                   │  │
        │ │ Line 45 may allow    │ [Previous] [Next File]           │  │
        │ │ SQL injection if...  │                                   │  │
        │ │                      │                                   │  │
        │ └──────────────────────┴──────────────────────────────────┘  │
        │                                                               │
        │ Review Progress: ████████████░░░░░░░░░░░░  60%               │
        └───────────────────────────────────────────────────────────────┘
                │
                ▼ (Review completes)
        ┌───────────────────────────────────────────────────────────────┐
        │ Review Summary                                                 │
        │                                                               │
        │ PR #142: Add user authentication                             │
        │                                                               │
        │ ┌─────────────────────────────────────────────────────────┐  │
        │ │ Checklist Results                                       │  │
        │ │                                                         │  │
        │ │ ✓ Type safety - All types properly defined              │  │
        │ │ ⚠️ Error handling - Missing try/catch in auth.ts:78    │  │
        │ │ ✓ Test coverage - 4 new tests, 85% coverage            │  │
        │ │ ✓ Documentation - JSDoc comments added                  │  │
        │ │ ❌ Security - Potential SQL injection at auth.ts:45    │  │
        │ └─────────────────────────────────────────────────────────┘  │
        │                                                               │
        │ [Post Review to GitHub]  [Copy to Clipboard]  [Edit Review]  │
        └───────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### North Star Metric

**Weekly Active Tasks (WAT):** Number of tasks successfully completed per user per week

Target: 15+ WAT per active user within 3 months of adoption

### Primary Metrics

| Metric | Definition | Target (MVP) | Target (6mo) |
|--------|------------|--------------|--------------|
| DAU/MAU | Daily active / Monthly active ratio | 30% | 50% |
| Task Completion Rate | Tasks completed / Tasks started | 75% | 90% |
| Time to First Task | Time from install to first completed task | < 10 min | < 5 min |
| NPS | Net Promoter Score | 30 | 50 |
| Retention D30 | Users active 30 days after signup | 40% | 60% |

### Secondary Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Approval Latency | Time between 8gent request and user approval | < 2 min |
| Telegram Engagement | % of users with Telegram connected | 60% |
| Skill Adoption | % of users who create custom skill | 20% |
| Voice Enabled | % of users with voice output enabled | 70% |
| Daemon Uptime | % of time daemon is running for active users | 95% |

### Health Metrics (Guardrails)

| Metric | Definition | Alert Threshold |
|--------|------------|-----------------|
| Task Failure Rate | Tasks failed / Tasks started | > 15% |
| Security Block Rate | Actions blocked by hooks | > 10% |
| Crash Rate | App crashes per user per week | > 1 |
| API Error Rate | Anthropic API errors | > 5% |
| User Escalations | Support tickets per 1000 tasks | > 10 |

---

## MVP Scope (v0.1)

### In Scope

| Feature | MVP Implementation |
|---------|-------------------|
| **Identity Engine** | Basic CORE.md with preset templates, simple memory (last 50 interactions) |
| **Voice Engine** | macOS TTS with 3 voice options, completion announcements only |
| **Messenger Engine** | Telegram bot only, commands: /start, /status, /cancel, /approve |
| **Agent Harness** | Supervised mode only (all actions require approval) |
| **MCP Layer** | Files MCP + Browser MCP + 5 Composio integrations (Google, Notion, Slack, GitHub, Linear) |
| **Skill System** | 3 built-in skills (Research, Writing, Data Analysis), no custom skills |
| **Daemon Mode** | Menu bar app, no scheduled tasks |
| **Security Hooks** | Pre-command hook only, basic dangerous command blocking |
| **UI** | Chat panel, task list, settings, basic audit log |

### Out of Scope (Post-MVP)

| Feature | Reason |
|---------|--------|
| iMessage/Signal/WhatsApp | Complexity of multi-platform messaging |
| Custom skills | Focus on built-in skills working well |
| Autonomous mode | User trust must be established first |
| Scheduled tasks | Daemon stability must be proven |
| Multi-user/admin | Consumer single-user first |
| Mobile app | Desktop-first, Telegram provides mobile access |
| Skill marketplace | Community must grow first |

### MVP Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Foundation | 4 weeks | Tauri shell, SolidJS scaffold, basic IPC |
| Core Agent | 4 weeks | Claude SDK integration, basic task execution |
| Identity + Voice | 3 weeks | CORE.md system, TTS integration |
| MCP Layer | 4 weeks | Files, Browser, 5 Composio apps |
| Telegram | 2 weeks | Bot setup, command handling |
| Security | 2 weeks | Hooks system, approval flow |
| Polish | 3 weeks | UX refinement, bug fixes, onboarding |
| **Total** | **22 weeks** | **~5.5 months** |

### MVP Launch Criteria

- [ ] Complete onboarding flow < 5 minutes
- [ ] Execute basic task (file search) successfully
- [ ] Connect at least one Composio app
- [ ] Telegram notifications working
- [ ] Voice output working
- [ ] No critical bugs in 1 week internal testing
- [ ] 10 beta users complete onboarding successfully
- [ ] Task completion rate > 70% in beta
- [ ] NPS > 20 in beta feedback

---

## Future Roadmap

### v0.2 - Expanded Agency (Q3 2026)

| Feature | Description |
|---------|-------------|
| Guardrailed Mode | Autonomous for low-risk, approval for high-risk |
| Custom Skills | User-created SKILL.md files |
| More Integrations | 20+ Composio apps, custom MCP |
| Scheduled Tasks | Cron-like scheduling UI |
| Mobile Companion | iOS app for monitoring (read-only) |

### v0.3 - Multi-Platform Messaging (Q4 2026)

| Feature | Description |
|---------|-------------|
| iMessage Integration | Native macOS iMessage support |
| Signal Support | Signal bot via signal-cli |
| WhatsApp Business | WhatsApp Business API integration |
| Rich Messages | Images, buttons, carousels in messages |

### v0.4 - Teams & Admin (Q1 2027)

| Feature | Description |
|---------|-------------|
| Multi-Profile | Multiple users on same machine |
| Admin Dashboard | Usage monitoring, permission management |
| Team Skills | Shared skill libraries |
| SSO | Enterprise single sign-on |

### v0.5 - Autonomous Agent (Q2 2027)

| Feature | Description |
|---------|-------------|
| Autonomous Mode | Full autonomy within defined boundaries |
| Proactive Suggestions | 8gent suggests tasks based on patterns |
| Learning Mode | Improve from user corrections |
| Workflow Automation | Chain tasks into workflows |

### v1.0 - Platform (Q3 2027)

| Feature | Description |
|---------|-------------|
| Skill Marketplace | Community skill sharing |
| Third-Party MCPs | Developer ecosystem for integrations |
| Enterprise Tier | SOC2, HIPAA compliance, self-hosted |
| Windows Support | Cross-platform desktop |

---

## Risks & Mitigations

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Anthropic API changes | High | Medium | Abstract SDK layer, maintain compatibility shim |
| Tauri 2.x instability | High | Low | Track stable releases, extensive testing |
| MCP protocol changes | Medium | Medium | Version lock MCP deps, gradual upgrades |
| macOS security restrictions | Medium | Medium | Apply for entitlements early, test on multiple versions |
| Daemon reliability | High | Medium | Watchdog process, automatic restart, crash reporting |

### Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users don't trust AI agency | High | Medium | Supervised mode first, transparent actions, audit logs |
| Telegram friction too high | Medium | Medium | In-app onboarding wizard, QR code linking |
| Voice output annoying | Low | Medium | Easy disable toggle, volume/frequency controls |
| Learning curve too steep | High | Medium | Guided onboarding, template tasks, video tutorials |
| Competition from Anthropic | High | Low | Focus on consumer UX, identity, proactivity (differentiation) |

### Security Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Malicious skill execution | Critical | Low | Sandboxed execution, capability restrictions |
| API key exposure | Critical | Low | macOS Keychain storage, no disk storage |
| Unauthorized Telegram access | High | Low | User ID verification, optional 2FA |
| Data exfiltration | Critical | Low | Audit logs, network monitoring, user alerts |
| Prompt injection | High | Medium | Input sanitization, instruction hierarchy |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Anthropic pricing changes | High | Medium | Usage caps, tier pricing, cost monitoring |
| Low adoption | High | Medium | Strong beta program, community building |
| Support burden | Medium | Medium | Self-service docs, community forums, AI-assisted support |
| Regulatory (AI Act, etc.) | Medium | Medium | Compliance roadmap, legal review |

### Contingency Plans

**If Anthropic API becomes too expensive:**
- Implement usage tiers with cost visibility
- Add support for alternative models (GPT-4, Llama)
- Aggressive caching of common operations

**If user trust is barrier:**
- Default to observation-only mode
- Add "sandbox" preview for all actions
- Implement "undo" capability for reversible actions

**If Telegram adoption is low:**
- Invest in iMessage integration sooner
- Build native mobile app
- Focus on desktop-first experience

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| CORE | Calibrated Operational Runtime Environment - the identity configuration |
| Daemon | Background process that runs continuously |
| Hook | Pre/post execution validation function |
| MCP | Model Context Protocol - standard for tool integration |
| Sidecar | External process managed by main application |
| Skill | Modular capability package with instructions and tools |

### B. References

- [Tauri 2.0 Documentation](https://v2.tauri.app/)
- [SolidJS Documentation](https://www.solidjs.com/)
- [Claude Agent SDK](https://docs.anthropic.com/claude/agent-sdk)
- [Composio Documentation](https://docs.composio.dev/)
- [MCP Specification](https://modelcontextprotocol.io/)

### C. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-01 | James Spalding | Initial PRD |

---

*This document is a living specification. Updates will be tracked in version history.*
