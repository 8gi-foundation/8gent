# 8gent Jr Feature Port Plan (BMAD)

## Overview

Porting 6 features from NickOS (`~/Myresumeportfolio/src/`) to the canonical jnr app at `demo.8gentjr.com` (`~/8gent/packages/jnr/`).

**Key architectural differences to keep in mind:**
- NickOS uses `NickOSContext` + Clerk for auth. jnr uses `AppContext` (localStorage) + Convex tenants.
- NickOS Convex lives in `~/Myresumeportfolio/convex/`. jnr Convex lives in `~/8gent/packages/jnr/convex/`.
- NickOS uses `/api/tts/elevenlabs`. jnr uses `/api/jr/tts`.
- NickOS uses `@/lib/nick/...` path aliases. jnr uses `@/lib/...`.
- jnr primary color: `#E8610A` orange. Font: `var(--font-fraunces)` for headings.
- jnr design rule: inline styles over Tailwind color classes for colors.

---

## Feature 1: Emotional Regulation Playlists

### Problem
The jnr music page only has Drums and Xylophone instrument tabs. There is no mood-based playlist selector that lets a child or parent choose music based on emotional state, which is a core GLP-grounded feature.

### Constraint
Not building a streaming audio player. Not integrating Spotify or YouTube. The playlist UI selects a mood and filters tracks from a local/Convex track library. No new npm packages.

### Source files (NickOS)
- `~/Myresumeportfolio/src/lib/nick/music/emotional-playlists.ts` - full playlist type definitions and 7 mood objects (calm, happy, focus, energize, sleepy, brave, silly) with GLP notes, BPM ranges, color pairs, icons

### Target files (jnr)
The data layer already exists. The UI is missing.

- `~/8gent/packages/jnr/src/lib/music/emotional-playlists.ts` - already ported (confirmed identical structure)
- `~/8gent/packages/jnr/src/app/(app)/music/page.tsx` - **MODIFY**: add a third tab `Playlists` that renders the new component below
- `~/8gent/packages/jnr/src/components/music/EmotionalPlaylistPicker.tsx` - **CREATE**: mood grid (7 cards, gradient backgrounds), selected mood shows GLP note for parents, placeholder for track listing

### Estimated size
- 1 new component: ~120 lines
- 1 page modification: ~25 lines added
- Total: ~145 lines, 2 files touched

### Dependencies
- Framer-motion (already installed in jnr)
- `src/lib/music/emotional-playlists.ts` (already exists in jnr)
- No Convex changes needed for MVP (tracks array in playlist data is empty strings, used for future wiring)
- No new npm packages

### Risk
Low. This is a pure UI feature. The data file already exists in jnr. The music page already has a tab bar pattern to follow. The only complexity is deciding what to show when a mood is selected (placeholder "coming soon" track list is acceptable for v1).

### Acceptance criteria
- Tapping a mood card highlights it with its gradient
- GLP note text visible below the card (for parent/therapist context)
- Selected mood persists within the session (local state)
- All 7 moods visible in a scrollable grid
- Touch targets >= 80px

---

## Feature 2: Paginated Grid (AACPaginatedGrid)

### Problem
The jnr AAC board uses a single scrolling grid. Users with many cards (20+) must scroll to find symbols. NickOS has a paginated grid with swipe gestures, page indicators, and responsive column calculation that eliminates scroll entirely, which is better for motor-impaired children.

### Constraint
Not replacing `AACBoard.tsx` wholesale. Adding `AACPaginatedGrid` as an opt-in layout mode controlled by a setting. Not porting the framer-motion `useReducedMotion` hook setup (it already exists in jnr via framer-motion).

### Source files (NickOS)
- `~/Myresumeportfolio/src/components/nick/AACPaginatedGrid.tsx` - self-contained generic component, 274 lines. Generic `<T>` typed. Swipe via framer-motion `drag`. ResizeObserver for auto-rows. ChevronLeft/Right nav arrows. Dot page indicators.

### Target files (jnr)
- `~/8gent/packages/jnr/src/components/aac/AACPaginatedGrid.tsx` - **CREATE**: near-identical port. Remove `cn` import (use inline styles or className string concat to match jnr pattern). Keep all logic. Replace `ChevronLeft/ChevronRight` from lucide-react (already used in jnr).
- `~/8gent/packages/jnr/src/app/(app)/app/page.tsx` - **MODIFY**: wrap the card grid section with `AACPaginatedGrid` when `settings.paginatedGrid` is true (new setting field)
- `~/8gent/packages/jnr/src/context/AppContext.tsx` - **MODIFY**: add `paginatedGrid: boolean` (default `false`) to `AppSettings`
- `~/8gent/packages/jnr/src/app/(app)/settings/page.tsx` - **MODIFY**: add toggle for paginated grid mode

### Estimated size
- 1 new component: ~270 lines (near-direct port)
- 3 file modifications: ~30 lines total
- Total: ~300 lines, 4 files touched

### Dependencies
- framer-motion (already installed)
- lucide-react (already installed - `ChevronLeft`, `ChevronRight` confirmed in NickOS source, check jnr lucide usage)
- No Convex changes
- No new npm packages

### Risk
Medium. The ResizeObserver height calculation for auto-rows depends on the container DOM structure. The jnr `AACBoard` layout differs from NickOS, so the container height passed to `AACPaginatedGrid` needs careful wiring. Test at 375px (iPhone SE) - if card height estimation breaks, use `customRowsPerPage={2}` as safe fallback.

### Acceptance criteria
- Grid paginates at >= 12 cards
- Swipe left/right navigates pages on mobile
- Dot indicators correct count and highlight active
- Back/forward arrows show on desktop only (hidden sm:flex pattern preserved)
- Toggle in settings switches between scroll and paginated mode
- Reduced motion preference respected

---

## Feature 3: Speech Therapy Section

### Problem
The jnr speech page already has phoneme cards and TTS playback but is missing the mouth visualization system from NickOS - specifically video playback of real mouth movements (generated via Google Flow / Veo) and the SVG animation fallback. The jnr version shows static text tips only.

### Constraint
Not building the video generation pipeline. Not porting the `SpeechTherapy` component wholesale as a new file (the jnr speech page IS the equivalent - extend it in place). Videos are served from `/videos/phonemes/{id}.mp4` which must exist in `/public/videos/phonemes/` - this is a content gap, not a code gap.

### Source files (NickOS)
- `~/Myresumeportfolio/src/components/nick/SpeechTherapy.tsx` (~10k tokens) - full component with: 20 phonemes (jnr has 14), `MouthVisualization` type with `videoUrl` + `imageUrl` + `description` + `tips`, `MouthDisplay` sub-component with video/SVG toggle, `useNickTTS` hook, practice counter
- `~/Myresumeportfolio/src/app/nick/speech/page.tsx` - thin wrapper with ElevenLabs TTS wiring + fallback

### Target files (jnr)
- `~/8gent/packages/jnr/src/app/(app)/speech/page.tsx` - **MODIFY**: extend to add 6 missing phonemes (g, n, v, z, j, y, ng, h vs current 14), add video availability check + `<video>` element fallback for mouth visualization, add animation mode toggle button (SVG vs video)
- `~/8gent/packages/jnr/src/lib/speech/tts.ts` - **CHECK**: ensure `speakWithKitten` handles the practice flow rate/pitch params

### Estimated size
- 1 file modification: ~100 lines added
- No new components (inline upgrade)
- Total: ~100 lines, 1 file touched

### Dependencies
- No new npm packages
- `/public/videos/phonemes/*.mp4` - **CONTENT DEPENDENCY**: videos need to be generated via Google Flow / Veo and placed in the public dir. The code will check `onerror` and gracefully degrade to static tips.
- No Convex changes

### Risk
Low for the code. The videos themselves are the real dependency - without them the feature degrades gracefully to the existing tips UI. The `<video>` tag checks `onloadedmetadata` / `onerror` before showing the video toggle.

### Acceptance criteria
- All 20 phonemes (matching NickOS) are accessible
- Video mode toggle visible only if `videoAvailable === true` (HEAD check on mount)
- Animation/SVG mode always works as fallback
- Practice counter increments on each practice tap
- Milestone celebration shows every 5 practices

---

## Feature 4: Suno Song Generation

### Problem
The jnr music page's `Create` tab and the Suno integration exist as a stub API route (`/api/nick/generate-song/route.ts`) that only generates lyrics and returns style metadata - it does NOT actually call Suno or any audio generation service. The NickOS version has the full polling loop, Convex track persistence, and audio playback wiring.

### Constraint
Not replicating the Convex `nickMusicTracks` table. The jnr schema has no music track storage. For MVP, generated songs are added to a `generatedSongs` array in localStorage (via `AppContext`). Convex track storage is a follow-up task.

### Source files (NickOS)
- `~/Myresumeportfolio/src/app/nick/music/page.tsx` lines 241-409 - `handleMakeSong` callback, polling loop (`/api/nick/song-status`), `addTrack` Convex mutation call, message rotation
- `~/Myresumeportfolio/src/app/nick/music/page.tsx` lines 1-100 - `CreateStep` type, `MOOD_OPTIONS`, `DEFAULT_WORDS`, `bpmToDescriptor`, `GENERATING_MESSAGES`
- `/api/nick/generate-song` route - exists in both codebases (jnr version at `~/8gent/packages/jnr/src/app/api/nick/generate-song/route.ts`)

### Target files (jnr)
- `~/8gent/packages/jnr/src/app/(app)/music/page.tsx` - **MODIFY**: add `create` tab (4th tab), implement word picker step, mood selector step, BPM slider step, generate step with message rotation, success auto-play
- `~/8gent/packages/jnr/src/app/api/nick/generate-song/route.ts` - **MODIFY**: currently returns lyrics only. Add Suno API call if `SUNO_API_KEY` env is set; otherwise return lyrics-only response and let frontend show "lyrics ready" state
- `~/8gent/packages/jnr/src/app/api/nick/song-status/route.ts` - **CREATE**: polling endpoint for Suno task completion (check `SUNO_API_KEY`, proxy to Suno status API)
- `~/8gent/packages/jnr/src/context/AppContext.tsx` - **MODIFY**: add `generatedSongs: GeneratedSong[]` to settings for local track storage

### Estimated size
- 2 file modifications (music page + generate route): ~200 lines added
- 1 new route: ~60 lines
- 1 context modification: ~20 lines
- Total: ~280 lines, 4 files touched

### Dependencies
- `SUNO_API_KEY` env var (optional - feature degrades to lyrics-only without it)
- No new npm packages
- No Convex changes for MVP (localStorage fallback)

### Risk
High. Suno API is third-party and paid. Rate limits, latency (90-120s generation), and API changes are real concerns. The polling loop needs clear max-attempt limits (already 60 attempts x 5s = 5 minutes in NickOS). Degraded state (lyrics only, no audio) must be a valid output. Test the polling cancellation on unmount.

### Acceptance criteria
- Word picker shows default words + extracted from sentence history (localStorage)
- Mood selector shows 6 moods with ARASAAC pictograms
- BPM slider with descriptor label updates
- Generate tap calls `/api/nick/generate-song`, shows rotating messages
- If `SUNO_API_KEY` absent: shows lyrics in a card, no audio
- If `SUNO_API_KEY` present: polls status, adds audio to generatedSongs on complete, auto-plays
- Reset button clears state on error

---

## Feature 5: Social Stories

### Problem
Social stories are listed in the NickOS toolshed registry (`/nick/stories` route, category `communicate`) but no implementation exists anywhere in the NickOS codebase. This is a specified-but-not-built feature in NickOS. The jnr app also has no implementation.

### Constraint
This feature needs to be built from scratch, not ported. The NickOS toolshed defines the concept: "Picture-based social narratives for new situations." The pattern to follow is the VSD system (photo scenes + interaction) adapted for sequential narrative pages.

Not building an AI story generator for v1. Stories are curated static content. Not requiring Convex for v1 (static data file).

### Source files (NickOS)
- `~/Myresumeportfolio/src/lib/nick/toolshed/index.ts` lines 93-101 - toolshed entry definition (name, icon, route, description only - no implementation)
- No implementation exists in NickOS

### Target files (jnr)
- `~/8gent/packages/jnr/src/lib/social-stories/stories.ts` - **CREATE**: type definitions (`SocialStory`, `StoryPage`) + 3-5 seed stories (Going to School, Taking Turns, Visiting the Doctor, Trying New Food, Saying Goodbye)
- `~/8gent/packages/jnr/src/components/social-stories/StoryViewer.tsx` - **CREATE**: full-screen story viewer with swipe/tap navigation, large text + image placeholder, TTS read-aloud on each page
- `~/8gent/packages/jnr/src/app/(app)/stories/page.tsx` - **CREATE**: stories list page (cards grid) + route into `StoryViewer`

### Estimated size
- 1 data file: ~80 lines
- 1 new component: ~150 lines
- 1 new page: ~80 lines
- Total: ~310 lines, 3 new files, 1 new route

### Dependencies
- framer-motion for page transitions (already installed)
- `AppContext` for `childName` personalization
- No Convex changes for v1 (static seed data)
- No new npm packages

### Risk
Low code risk (greenfield build, small scope). Content risk: story quality matters clinically. The 5 seed stories should be reviewed by a speech therapist before shipping. For v1, mark them as "preview" in the UI.

### Acceptance criteria
- Stories list shows story title, icon, page count
- Tapping opens full-screen viewer
- Each page has image area (gradient placeholder until photos added) + large text
- Read-aloud button speaks current page text via `/api/jr/tts`
- Swipe or tap-arrow navigates pages
- Progress dots show position in story
- "The End" state with back-to-list button

---

## Feature 6: Visual Schedule ("My Day")

### Problem
The jnr app has no visual schedule feature. NickOS has it registered in the toolshed (`/nick/schedule`, "Visual schedule with picture cards") but not implemented as a page. The schooltube's `WeeklySchedule` component (which exists in jnr) is a game-selector widget, not a true visual schedule for daily routines.

### Constraint
Not building a real-time calendar sync. Not integrating Google Calendar. The schedule is a linear list of 6-8 daily activities with ARASAAC pictograms, a "now" indicator, and tap-to-speak per activity. Parent/carer edits schedule in settings (stretch - not in v1 scope). V1 is static default schedule with time-of-day smart defaults.

### Source files (NickOS)
- `~/Myresumeportfolio/src/lib/nick/toolshed/index.ts` lines 208-230 - toolshed schedule entry (route `/nick/schedule`, description "Visual schedule with picture cards") - no implementation
- `~/Myresumeportfolio/src/app/nick/schooltube/components/weekly-schedule.tsx` - this is a different UX (weekly game filter widget for schooltube), not a daily visual schedule. Architecture reference only.
- No true visual schedule implementation exists in NickOS.

### Target files (jnr)
- `~/8gent/packages/jnr/src/lib/schedule/default-schedule.ts` - **CREATE**: `ScheduleActivity` type + default daily schedule (8 activities: wake up, breakfast, get dressed, school/therapy, lunch, free play, tidy up, bedtime). Each activity: id, label, icon emoji, ARASAAC ID, timeOfDay bucket, speechPhrase.
- `~/8gent/packages/jnr/src/components/schedule/ScheduleCard.tsx` - **CREATE**: single activity card component (large icon, label, time, active/done/upcoming state, tap to speak)
- `~/8gent/packages/jnr/src/app/(app)/schedule/page.tsx` - **CREATE**: full-screen My Day page. Vertical list of `ScheduleCard` components. Auto-highlights current activity based on time of day. "Next up" banner. TTS on tap.

### Estimated size
- 1 data file: ~60 lines
- 1 new component: ~80 lines
- 1 new page: ~120 lines
- Total: ~260 lines, 3 new files, 1 new route

### Dependencies
- `AppContext` for `childName`, `primaryColor`
- `/api/jr/tts` for speak-on-tap (already exists)
- No Convex changes for v1 (static schedule, no cloud sync)
- No framer-motion required (optional)
- No new npm packages

### Risk
Low. This is the smallest feature in the set. The only gotcha is the time-of-day auto-highlight logic - use `new Date().getHours()` bucketed into morning/midday/afternoon/evening. If the time bucket logic is wrong it silently defaults to showing all activities without highlight.

### Acceptance criteria
- 8 default activities displayed in order
- Current activity highlighted based on time of day
- Completed activities show checkmark/dimmed state (toggled by tap)
- Tap on any activity speaks the phrase via TTS
- Back button returns to main app
- Child name in header ("Nick's Day")

---

## Execution Order

### Parallel batch 1 (no dependencies between these)
These can be built simultaneously:
- **Feature 2: AACPaginatedGrid** - pure UI component, self-contained
- **Feature 3: Speech Therapy** - extends existing page, no new routes
- **Feature 6: Visual Schedule** - new route, no shared state

### Parallel batch 2 (after batch 1 ships and is validated)
- **Feature 1: Emotional Playlists** - extends music page (wait for batch 1 to avoid music page conflicts with Feature 4)
- **Feature 5: Social Stories** - new route, greenfield

### Last (most complex, most risk)
- **Feature 4: Suno Song Generation** - depends on AppContext changes from batch 2 (generatedSongs), requires environment variable decisions, polling loop needs careful testing

### Do not parallelize
- Features 1 and 4 both modify `music/page.tsx` - do them sequentially (1 then 4, or 4 then 1, not both at once)
- Features 4 and AppContext changes - wire together in one pass

---

## Total Estimated Impact

| Metric | Count |
|--------|-------|
| New files | 9 |
| Modified files | 8 |
| New routes | 3 (`/stories`, `/schedule`, `/music` extended) |
| Lines added | ~1295 |
| New Convex tables | 0 (v1 uses localStorage for tracks) |
| New npm packages | 0 |
| New env vars | 1 optional (`SUNO_API_KEY`) |
| New API routes | 1 (`/api/nick/song-status`) |

### Files touched by feature

| Feature | New Files | Modified Files |
|---------|-----------|----------------|
| 1. Emotional Playlists | `EmotionalPlaylistPicker.tsx` | `music/page.tsx` |
| 2. Paginated Grid | `AACPaginatedGrid.tsx` | `app/page.tsx`, `AppContext.tsx`, `settings/page.tsx` |
| 3. Speech Therapy | - | `speech/page.tsx` |
| 4. Suno Song Gen | `song-status/route.ts` | `music/page.tsx`, `generate-song/route.ts`, `AppContext.tsx` |
| 5. Social Stories | `stories.ts`, `StoryViewer.tsx`, `stories/page.tsx` | - |
| 6. Visual Schedule | `default-schedule.ts`, `ScheduleCard.tsx`, `schedule/page.tsx` | - |

### Shared file conflict map
- `music/page.tsx` - touched by Features 1 and 4. **Must be done sequentially.**
- `AppContext.tsx` - touched by Features 2 and 4. **Batch into one pass.**
- All other files are unique to their feature.
