# 8gent Jr UX Audit

**Date:** 2026-03-21
**Auditor:** AI James
**Scope:** Full app UX audit of `/packages/jnr/` comparing against YouTube Kids, popular children's apps, and AAC best practices
**Pages Audited:** 13 pages (core, app, music, settings, schooltube, timer, intuition, voice, ai, vsd, draw, onboarding, marketing)

---

## Executive Summary

8gent Jr is a functional AAC app with solid foundations: safe-area support, touch-action manipulation, haptic feedback on card taps, and min-44px touch targets on critical buttons. However, it currently reads as **an iOS Settings clone with AAC cards bolted on** rather than a purpose-built children's communication tool. The gap between this app and YouTube Kids / Proloquo2Go / TD Snap is significant across visual design, feedback systems, and navigation clarity.

**Top 3 Priorities:**
1. The Dock is overcrowded (7 items) and uses text labels a non-reader cannot parse
2. No consistent tap feedback system (some pages have haptics, most do not; no audio feedback anywhere)
3. Visual identity is inconsistent -- each page is a standalone iOS-style screen with no unifying children's design language

---

## 1. Touch Targets

### 1.1 Dock Items

| Metric | Current | YouTube Kids Standard | Status |
|--------|---------|----------------------|--------|
| Dock item min-width | 64px | N/A (no bottom nav) | OK for width |
| Dock item min-height | 50px | 48px minimum | OK |
| Dock label font | 10px | N/A | **P1 - too small to read** |
| Dock item count | 7 items | 0 (uses top categories) | **P0 - too many for a child** |

**Issue P0-DOCK-001: Dock has 7 items -- cognitive overload for a child.**
YouTube Kids deliberately avoids bottom navigation entirely. Seven items with 10px text labels means a non-reading child cannot distinguish Talk/Core/AI/Draw/Music/Timer/SchoolTube by text. The emojis help but 7 is too many.
**Fix:** Reduce to 4 max items (Talk, Core, SchoolTube, More). Move Music, Draw, Timer, AI, Voice, VSD into a "More" grid page or use top-level category chips like YTK. Alternatively, make the dock a scrollable horizontal strip with larger icons (40px+).

### 1.2 Core Words Grid (`/core`)

| Metric | Current | AAC Standard | Status |
|--------|---------|-------------|--------|
| Button min-height | 72px (mobile), 80px (sm) | 64-80px | OK |
| Symbol size | 40px (mobile), 48px (sm) | 48-64px recommended | **P1 - symbols too small on mobile** |
| Label font | 11px (mobile), 12px (sm) | 14px minimum for kids | **P1 - too small** |
| Grid gap | 6px (gap-1.5) | 8-12px | **P2 - tight spacing, risk of mis-taps** |
| Grid columns | 5 (mobile), 10 (640px+) | 4-6 for motor planning | **P1 - 10 cols on tablet is dense** |

**Issue P1-CORE-001: 10-column grid on tablet is too dense for motor planning.**
AAC best practice (Proloquo2Go, TD Snap) limits to 4-8 columns depending on user ability. 10 columns makes each cell roughly 60px wide on a 640px screen -- below the 72px recommendation for reliable targeting by a child.
**Fix:** Cap at 8 columns on tablet. Add a grid-size setting (already exists in settings, but not wired to core page).

**Issue P1-CORE-002: Symbol images are 40px on mobile.**
ARASAAC symbols need at least 48px to be visually distinguishable, especially line-art pictograms.
**Fix:** Change `w-10 h-10` to `w-12 h-12` on mobile. Increase min-height to 80px.

### 1.3 AAC App Page (`/app`)

| Metric | Current | Standard | Status |
|--------|---------|----------|--------|
| Category/phrase card aspect | 1:1 (square) | 1:1 is good | OK |
| Card label font | 9px (mobile), 11px (sm) | 12-14px minimum | **P0 - illegible at arm's length** |
| Sentence strip height | 48px (mobile), 56px (sm) | 56-64px | **P2 - could be taller** |
| Speak button height | 44px (mobile), 50px (sm) | 48px minimum | OK |
| Card image area | 60% of square | 60-70% recommended | OK |

**Issue P0-APP-001: Card labels at 9px are illegible for a child.**
At arm's length from a tablet, 9px text is unreadable. YouTube Kids uses 13-14px minimum for card titles. AAC apps like Proloquo2Go use 14-16px.
**Fix:** Minimum 13px on mobile, 15px on tablet. If label is too long, use `line-clamp-1` with larger font rather than shrinking to 9px.

### 1.4 Settings Page (`/settings`)

| Metric | Current | Standard | Status |
|--------|---------|----------|--------|
| Row height | py-3 (~44px) | 44px minimum | OK |
| Slider thumb | 24px (w-6 h-6) | 44px for kids | **P1 - too small** |
| Section label font | 13px uppercase | N/A (adult page) | OK for parent UI |

**Issue P1-SETTINGS-001: Slider thumbs are 24px -- too small for a child.**
If a child ever reaches settings, the range sliders are impossible to use. However, settings is a parent-facing page, so this is lower priority.
**Fix:** Behind a parent gate, this is acceptable. Add a parental gate (PIN) before settings access.

### 1.5 Drawing Page (`/draw`)

| Metric | Current | Standard | Status |
|--------|---------|----------|--------|
| Color buttons | 32px (w-8 h-8) | 44px minimum | **P1 - too small** |
| Size buttons | 32px (w-8 h-8) | 44px minimum | **P1 - too small** |
| Tool bar layout | Single row | Adequate | OK |

**Issue P1-DRAW-001: Color and brush size buttons are 32px -- below 44px minimum.**
A child's finger pad averages 10-14mm. 32px is approximately 8mm on a standard-DPI tablet.
**Fix:** Increase to `w-11 h-11` (44px). Reduce the number of color options visible at once, or use a 2-row palette.

---

## 2. Navigation

### 2.1 Can a child navigate without reading?

| Page | Navigation Method | Readable Without Text? | Status |
|------|------------------|----------------------|--------|
| Dock | Emoji + 10px text label | Partially (emojis help) | **P1** |
| `/app` categories | ARASAAC images + 9px label | Partially (images help) | **P1** |
| `/core` words | ARASAAC images + 11px label | Yes (images are primary) | OK |
| `/schooltube` categories | Emoji + 15px text | Partially | OK |
| `/music` tabs | Emoji + text tabs | Partially | OK |
| `/settings` | Text-only iOS rows | No | **P2** (parent page) |
| `/vsd` scene selector | Text-only pills | **No** | **P1** |
| `/voice` | Text-only iOS rows | **No** | **P2** (parent page) |

**Issue P1-NAV-001: VSD scene selector uses text-only pill buttons ("Kitchen", "Playground").**
A non-reading child cannot select a scene. These should use scene preview thumbnails or large emoji/icons.
**Fix:** Add emoji or thumbnail preview to each scene selector button. Use a visual card grid instead of text pills.

**Issue P1-NAV-002: No visual distinction between "Talk" and "Core" in the dock.**
Both are AAC-related (speech bubbles). A child may not understand the difference.
**Fix:** Use more distinct icons. Consider merging Talk and Core into a single AAC experience with a tab/toggle at the top.

### 2.2 Dead Ends

| Page | Has Back Button? | Can Get Home? | Status |
|------|-----------------|---------------|--------|
| `/app` (home) | N/A | N/A | OK |
| `/core` | Via dock only | Yes (dock) | OK |
| `/settings` | Yes (Back link) | Yes (dock) | OK |
| `/music` | Via dock only | Yes (dock) | OK |
| `/schooltube` | Via dock only | Yes (dock) | OK |
| `/timer` | Via dock only | Yes (dock) | OK |
| `/intuition` | Via dock only | Yes (dock) | OK |
| `/voice` | Via dock only | Yes (dock) | **P2 - no back button in header** |
| `/ai` | Via dock only | Yes (dock) | OK |
| `/vsd` | Via dock only | Yes (dock) | OK |
| `/draw` | Via dock only | Yes (dock) | OK |
| `/onboarding` | "Skip" button only | Yes (Skip -> /app) | OK |
| Video player overlay | Close button | Yes | OK |
| Intuition game | No exit during play | Dock only | **P2 - should have exit button** |

**Issue P2-NAV-003: Voice page header has no back button -- only dock.**
Every other non-home page has either a back button (settings) or at least the dock. Voice page header is centered "Voice" with no navigation affordance.
**Fix:** Add a back/home button to the voice page header, consistent with settings.

**Issue P2-NAV-004: Intuition game has no exit button during gameplay.**
Once a child starts the game, the only way out is the dock. Should have a visible close/exit button.
**Fix:** Add an X button in the header during gameplay.

### 2.3 Dock Consistency

The dock appears on every `/app/*` page, which is good. However:

**Issue P2-NAV-005: Dock does not include Settings, Voice, VSD, Intuition, or Onboarding.**
These pages are reachable only via direct links from within pages. A child who lands on `/vsd` has no dock item to return to it. This is acceptable if these are sub-pages, but `/vsd` and `/intuition` feel like top-level features.
**Fix:** Either add VSD and Intuition to the dock (increasing its size problem) or make them accessible from within a "More" or "Play" section.

---

## 3. Visual Design

### 3.1 Color Consistency

| Page | Background | Header Color | Card Style | Status |
|------|-----------|-------------|------------|--------|
| `/app` | `#f2f2f7` | `primaryColor` + F2 alpha | White cards | OK |
| `/core` | `#f2f2f7` | White (sentence strip) | Fitzgerald-colored borders | **Different header** |
| `/settings` | `#f2f2f7` | `primaryColor` + F2 alpha | iOS grouped rows | OK |
| `/schooltube` | `#f2f2f7` | `primaryColor` + F2 alpha | White cards | OK |
| `/timer` | `#f2f2f7` | `primaryColor` + F2 alpha | None | OK |
| `/intuition` | `indigo-900 to purple-900` gradient | `primaryColor` + F2 alpha | Colored game cards | **Completely different palette** |
| `/music` | `#f2f2f7` | `primaryColor` + F2 alpha | Tab-based | OK |
| `/ai` | `#f2f2f7` | `primaryColor` + F2 alpha | Chat bubbles | OK |
| `/vsd` | `#f2f2f7` | `primaryColor` + F2 alpha | Gradient scene | OK |
| `/draw` | `#f2f2f7` | `primaryColor` + F2 alpha | White canvas | OK |

**Issue P1-VIS-001: Core Words page has no colored header -- breaks visual consistency.**
Every other page uses a `primaryColor`-tinted header with white text. Core Words uses a plain white sentence strip as its top element. This makes the page feel like it belongs to a different app.
**Fix:** Add the same colored header as other pages. Move the sentence strip below it.

**Issue P2-VIS-002: Intuition page uses a dark purple/indigo gradient background.**
This is the only page with a dark theme. While it creates a nice game atmosphere, it visually disconnects from the rest of the app. A child moving from `/app` (light) to `/intuition` (dark) may feel disoriented.
**Fix:** Either bring it in line with the light theme, or add a transition animation so the shift feels intentional.

### 3.2 Comparison with YouTube Kids Visual Language

| Aspect | YouTube Kids | 8gent Jr | Gap |
|--------|-------------|----------|-----|
| Overall aesthetic | Bright red canvas, white content card, playful shapes | iOS Settings gray (#f2f2f7) | **Large gap -- looks clinical** |
| Card border-radius | 12px | `rounded-lg` (8px) to `rounded-2xl` (16px) | Inconsistent |
| Card shadows | `0 2px 4px rgba(0,0,0,0.24)` | `shadow-sm` to `shadow-md` | OK but inconsistent |
| Tap animation | Scale 0.95, spring transition | `active:scale-95` (CSS) or `active:scale-90` | OK |
| Loading state | Shimmer skeleton animation | Spinner only | **P2 - no skeleton loading** |
| Color saturation | High (primary red, bright category colors) | Medium (follows user's `primaryColor`) | **P1 - too muted** |
| Illustrations | Playful characters, hand-drawn | Emojis only | **P1 - no personality** |
| Font | Roboto + Mikado (playful) | Inter (corporate) | **P1 - too serious for kids** |

**Issue P1-VIS-003: The app uses Inter font -- too corporate/serious for a children's app.**
YouTube Kids uses Mikado for child-facing headings (rounded, playful). Proloquo2Go uses rounded sans-serifs. Inter is a UI font designed for developer tools and dashboards.
**Fix:** Add a rounded/playful font for headings (e.g., Nunito, Fredoka, Baloo 2). Keep Inter for body text and parent-facing UI.

**Issue P1-VIS-004: No playful illustrations or mascot -- emojis do all the heavy lifting.**
YouTube Kids has hand-drawn characters. Proloquo2Go has animal characters. Even the onboarding uses plain emojis (wave, globe, palette, microphone). This makes the app feel generic.
**Fix:** Create a simple mascot or illustration set for key moments: onboarding, empty states, timer completion, game results.

**Issue P2-VIS-005: No skeleton loading states -- only spinners.**
YouTube Kids uses shimmer skeleton placeholders during content loading. 8gent Jr shows spinners (border-4 animate-spin). Skeleton loading reduces perceived wait time and is less anxiety-inducing for children.
**Fix:** Add skeleton placeholders for the AAC grid, SchoolTube cards, and voice list.

### 3.3 Does It Look Like a Kids App?

**Verdict: No.** It looks like an iOS Settings app with emoji icons. The gray `#f2f2f7` background, grouped white cards, `text-[17px]` iOS-style typography, and chevron disclosure indicators (`>`) are all adult iOS patterns.

**Issue P0-VIS-006: The app's visual identity does not communicate "this is for children."**
A parent downloading this would not immediately recognize it as a kids' AAC app. It looks like a settings panel.
**Fix:** This requires a holistic redesign of the chrome (background, headers, card styles) rather than individual fixes. The YTK study already maps out a complete visual transformation. Minimum viable change: add a colored background (not gray), increase border-radius globally, add rounded font for headers.

---

## 4. Content

### 4.1 Labels

| Page | Label Style | Short/Simple? | Status |
|------|------------|---------------|--------|
| `/app` | "Tap cards to build a sentence..." | Slightly long | **P2** |
| `/core` | "Tap words to build a sentence" | Good | OK |
| `/schooltube` | "No content in this category yet" | Good | OK |
| `/timer` | "Quick Set" | Good | OK |
| `/intuition` | "Can you sense which card hides the picture? Trust your feelings!" | Too long for a child | **P2** |
| `/ai` | "I'm your AI helper. I can help you..." | Adult language | **P1** |
| `/voice` | "Clone Your Voice" | Unclear to a child | **P2** (parent page) |
| `/onboarding` | "Who will use 8gent?" | Good | OK |
| Dock labels | "Talk", "Core", "AI", "Draw", "Music", "Timer", "SchoolTube" | "Core" and "AI" are jargon | **P1** |

**Issue P1-CONTENT-001: Dock labels "Core" and "AI" are jargon.**
A child does not know what "Core Words" or "AI" means. Parents may also find "Core" confusing.
**Fix:** Rename: "Core" -> "Words" or use only icons. "AI" -> "Help" or "Ask". "SchoolTube" -> "Watch" or "Videos".

**Issue P1-CONTENT-002: AI Chat page greeting uses adult language.**
"I can help you set up communication cards, answer questions about AAC, or suggest new vocabulary" -- a child will not understand this. This is a parent-facing tool presented in the child's dock.
**Fix:** Either: (a) Gate the AI page behind parental access, or (b) Rewrite the greeting for a child: "Hi! I can help you find new words. What do you want to talk about?"

### 4.2 ARASAAC Symbol Consistency

| Page | Uses ARASAAC? | Symbol Size | Consistent? | Status |
|------|--------------|-------------|-------------|--------|
| `/app` | Yes | 60% of card area | Yes | OK |
| `/core` | Yes | 40-48px | Smaller than `/app` | **P2** |
| `/music` Create tab | Yes (mood options) | Via `_500.png` URL | Different sizing | **P2** |
| `/vsd` | No (text hotspots) | N/A | N/A | OK (different purpose) |
| `/schooltube` | No (emojis) | N/A | N/A | OK |

**Issue P2-CONTENT-003: ARASAAC symbol sizes differ between Core Words (40-48px) and App categories (60% of card).**
On the App page, symbols fill 60% of a square card (roughly 60-80px). On Core Words, symbols are 40px mobile / 48px tablet. This inconsistency may confuse a child who learns to associate symbol size with meaning.
**Fix:** Standardize minimum ARASAAC symbol display size to 48px across all pages.

---

## 5. Feedback

### 5.1 Tap Feedback

| Page | Visual Feedback | Haptic Feedback | Audio Feedback | Status |
|------|----------------|-----------------|----------------|--------|
| `/app` card tap | `active:scale-[0.95]` | No | TTS speaks word | OK |
| `/core` word tap | `active:scale-95` | `navigator.vibrate(10)` | No immediate audio | **P1** |
| `/schooltube` card tap | `active:scale-95` | `navigator.vibrate(30)` | No | **P1** |
| `/timer` preset tap | Color change only | No | No | **P1** |
| `/intuition` card tap | Ring highlight + scale | Vibrate patterns | No | OK |
| `/draw` color tap | `scale-125` ring | No | No | **P2** |
| `/music` drum tap | None visible | No | Tone plays | OK |
| `/music` xylophone | None visible | No | Tone plays | OK |
| Dock tap | `active:scale-90` | No | No | **P2** |

**Issue P1-FEEDBACK-001: Core Words page taps have no audio feedback.**
When a child taps a core word, it vibrates (10ms) and adds to the sentence strip, but the word is NOT spoken. The child must then tap the Speak button to hear the full sentence. In AAC best practice, each word should be spoken immediately on tap (auditory scanning / word-level feedback). This is the most critical feedback issue in the app.
**Fix:** Call `speakWithKitten(word.label)` or browser TTS immediately on core word tap, same as the `/app` page does for phrase cards.

**Issue P1-FEEDBACK-002: SchoolTube card taps provide no audio confirmation.**
A child taps a video card, feels a brief vibration, and then... either a game loads or a "Video coming soon!" screen appears. No audio cue.
**Fix:** Add a tap sound (short chirp or pop) on all SchoolTube card taps. For the "coming soon" placeholder, add a friendly voiceover or sound.

**Issue P1-FEEDBACK-003: Timer preset selection has no feedback at all.**
Tapping a timer preset (1 min, 5 min, etc.) only changes the visual style. No haptic, no audio, no animation. A child may not realize their tap registered.
**Fix:** Add `navigator.vibrate(10)` and a brief scale animation on preset tap.

### 5.2 Loading States

| Page | Loading Indicator | Child-Friendly? | Status |
|------|------------------|-----------------|--------|
| `/app` | Colored spinner | No -- just a spinning circle | **P2** |
| `/settings` | Colored spinner | Same | **P2** |
| `/voice` | Colored spinner | Same | **P2** |
| `/onboarding` (creating) | Colored spinner + "Setting up..." text | Slightly better | OK |
| `/ai` | "Thinking..." text + spinner in send button | OK for adults | **P2** |
| `/music` (generating) | Progress bar + percentage | Good! | OK |

**Issue P2-FEEDBACK-004: Loading spinners are not child-friendly.**
A plain CSS spinner means nothing to a child. YouTube Kids uses shimmer skeletons. Good children's apps use animated characters or progress illustrations.
**Fix:** Replace spinners with a simple animated illustration or at minimum a pulsing emoji (e.g., pulsing speech bubble for TTS loading).

### 5.3 Error States

| Page | Error Handling | Child-Friendly? | Status |
|------|---------------|-----------------|--------|
| `/ai` | "I'm having trouble right now. Please try again in a moment." | Adult phrasing | **P2** |
| `/voice` (recording) | "Could not access microphone" | Technical error | **P1** |
| `/voice` (create) | "Failed to create voice. Please try again." | Vague but OK | OK |
| `/onboarding` | `err.message` raw | **Exposes raw error** | **P1** |
| `/schooltube` empty | Mailbox emoji + "No content in this category yet" | OK | OK |

**Issue P1-ERROR-001: Onboarding can display raw error messages.**
Line 117 of onboarding: `err instanceof Error ? err.message : 'Something went wrong'`. If the Convex mutation throws a technical error (e.g., "ConvexError: subdomain already exists"), the raw message is shown to the user.
**Fix:** Map all errors to child/parent-friendly messages. Never display `err.message` directly.

**Issue P1-ERROR-002: "Could not access microphone" is a technical error shown to a child.**
**Fix:** Replace with: "Oops! I can't hear you. Ask a grown-up to turn on the microphone."

---

## 6. Accessibility

### 6.1 Orientation Support

| Page | Portrait | Landscape | Status |
|------|----------|-----------|--------|
| All pages | `h-screen flex flex-col` | Content squishes vertically | **P1** |
| `/draw` | Canvas fills available space | Canvas adapts | OK |
| `/core` | Grid reflows | Grid reflows (5->10 cols) | OK |
| `/intuition` | Cards stack 2x2 | Cards stay 2x2, lots of whitespace | **P2** |

**Issue P1-ACCESS-001: Most pages use `h-screen` which can cause content to be cut off in landscape.**
On a tablet in landscape, `h-screen` leaves very little vertical space after header + dock. The AAC grid on `/app` has `overflow-y-auto pb-24` which handles this, but pages like Timer may have content pushed below the fold.
**Fix:** Test all pages in landscape mode on an iPad. Replace `h-screen` with `min-h-screen` where scroll is appropriate (settings, voice). For fixed layouts (AAC boards), ensure the grid adapts column count for landscape.

### 6.2 Animations

| Animation | Duration | Reduced Motion Support? | Status |
|-----------|----------|------------------------|--------|
| `active:scale-95` | CSS transition | Yes (via globals.css `prefers-reduced-motion`) | OK |
| `animate-spin` (loading) | Continuous | Yes (reduced to 0.01ms) | OK |
| `animate-pulse` (recording) | Continuous | Yes | OK |
| Onboarding `fadeIn` | 400ms | **No -- custom keyframe not covered** | **P2** |
| Intuition card reveal | 300ms transition | Yes (via CSS) | OK |
| VSD spoken phrase | `animate-pulse` | Yes | OK |

**Issue P2-ACCESS-002: Onboarding fadeIn animation is a custom `@keyframes` not covered by the global `prefers-reduced-motion` rule.**
The global rule targets `animation-duration` on all elements, which should catch this. However, it uses `style jsx` which may compile differently. Verify it works.
**Fix:** Test with `prefers-reduced-motion: reduce` enabled. If animation persists, add explicit reduced-motion handling.

### 6.3 One-Handed Use

| Page | One-Handed Usable? | Notes | Status |
|------|-------------------|-------|--------|
| `/app` | Yes | Grid is reachable, speak button is large | OK |
| `/core` | Yes | Grid is reachable | OK |
| `/draw` | Partially | Tool palette at bottom is reachable, canvas needs both hands for complex drawing | OK |
| `/timer` | Yes | All controls centered | OK |
| `/settings` | Yes | Scroll + tap | OK |
| `/schooltube` | Yes | Grid + categories | OK |

One-handed use is generally well-supported. The dock at the bottom is within thumb reach on standard-sized tablets.

### 6.4 ARIA Labels

| Component | Has aria-label? | Status |
|-----------|----------------|--------|
| Core word buttons | Yes (`aria-label={word.label}`) | OK |
| Sentence strip buttons (backspace, clear, speak) | Yes | OK |
| Dock links | No `aria-label` | **P2** |
| AAC category cards | No `aria-label` | **P2** |
| SchoolTube cards | No `aria-label` | **P2** |
| Timer controls | No `aria-label` | **P2** |

**Issue P2-ACCESS-003: Most interactive elements outside Core Words lack aria-labels.**
While switch access and screen readers are not the primary input method for this AAC app, accessibility is important for parent/therapist interaction.
**Fix:** Add `aria-label` to all buttons and interactive elements across all pages.

---

## 7. Comparison with YouTube Kids

### 7.1 Card Sizes

| Aspect | YouTube Kids | 8gent Jr | Verdict |
|--------|-------------|----------|---------|
| Card type | 16:9 video thumbnail | 1:1 square AAC cards | **Different purpose, both valid** |
| Card width (mobile 2-col) | ~175px | Flexible (grid fills width) | OK |
| Card min-height | ~140px (thumb + title) | ~80-120px (depending on grid cols) | **P2 - 8gent cards smaller** |
| Card content | Photo thumbnail + text title | ARASAAC symbol + text label | OK |
| SchoolTube card aspect | N/A | `aspect-video` (16:9) -- correct! | OK |

### 7.2 Navigation Pattern

| Aspect | YouTube Kids | 8gent Jr | Verdict |
|--------|-------------|----------|---------|
| Primary nav | Horizontal category chips at top | Bottom dock (7 items) | **P0 - opposite pattern** |
| Category system | Chip pills, horizontal scroll | Category cards in AAC grid | Different but valid for AAC |
| Bottom nav | None | 7-item dock | **See P0-DOCK-001** |
| Back button | Device back or on-screen arrow | Inconsistent (some pages have it, some don't) | **P1** |
| Home access | Logo tap or "Recommended" tab | Dock "Talk" item | OK |

### 7.3 Color Palette

| Aspect | YouTube Kids | 8gent Jr | Verdict |
|--------|-------------|----------|---------|
| Primary color | Red #FF0000 | User-selectable (default green #4CAF50) | OK -- personalization is good |
| Background | White content on red canvas | Gray #f2f2f7 everywhere | **P1 - gray is clinical** |
| Text color | Near-black rgba(0,0,0,0.87) | Mix of `text-black`, `text-gray-800`, `text-gray-500` | OK |
| Accent colors | Category-specific (purple, teal, green, orange, blue) | Fitzgerald Key colors for AAC | OK -- AAC-specific |
| Contrast | High (white on red, black on white) | Good (white on primaryColor, black on white) | OK |

### 7.4 Animation Style

| Aspect | YouTube Kids | 8gent Jr | Verdict |
|--------|-------------|----------|---------|
| Card tap | Scale 0.95, spring transition, ~200ms | `active:scale-95` CSS or `active:scale-90` | **P2 - no spring, feels flat** |
| Page transition | Horizontal slide, 350ms | None (instant Next.js route) | **P1 - jarring transitions** |
| Content entry | Staggered fade-in | None | **P2 - content pops in all at once** |
| Loading | Shimmer skeleton | Spinner | **P2 - see FEEDBACK-004** |

**Issue P1-ANIM-001: No page transitions between routes.**
When a child taps a dock item, the page instantly swaps with no transition. YouTube Kids uses horizontal slides. This is disorienting for a child who may not understand they've "moved" to a new page.
**Fix:** Add route transition animations. Next.js App Router supports this via `layout.tsx` with Framer Motion's `AnimatePresence`. A simple fade or slide-up would suffice.

---

## 8. Page-Specific Issues

### 8.1 Music Page (`/music`)

**Issue P2-MUSIC-001: Music page is extremely long (400+ lines) with 4 tabs (Player, Drums, Xylophone, Create).**
This is the most complex page in the app. The Create flow has a multi-step wizard with swipe navigation. While impressive, the cognitive load for a child is high.
**Fix:** Consider splitting into separate pages or simplifying. The drum pad and xylophone are great -- the "Create" AI song generator is a parent/therapist feature.

### 8.2 VSD Page (`/vsd`)

**Issue P1-VSD-001: Hotspot buttons display text phrases directly on the scene.**
The VSD (Visual Scene Display) shows text like "Let's eat breakfast!" overlaid on colored gradient areas. For a non-reading GLP Stage 1 learner, text-based hotspots defeat the purpose. VSD hotspots should be positioned on recognizable visual elements (a fridge, a table, a sink) within a real photograph or detailed illustration.
**Fix:** Replace gradient backgrounds with actual scene images. Make hotspots invisible or use small icon markers that reveal the phrase on tap.

### 8.3 SchoolTube Video Player

**Issue P1-SCHOOL-001: Video player for type "video" is a placeholder showing "Video coming soon!"**
This is not a UX design issue per se, but it is a broken user expectation. A child taps a "VIDEO" card and gets a dead end.
**Fix:** Either remove video-type cards until the player is implemented, or link to the actual YouTube embed.

### 8.4 Onboarding (`/onboarding`)

**Issue P1-ONBOARD-001: Onboarding asks child to type a subdomain.**
Step 2 asks the child (or parent) to choose a subdomain like `emma.8gent.app`. This is a developer concept. A child should never see this. Even for parents, it is confusing.
**Fix:** Auto-generate the subdomain from the child's name. Show it as informational ("Emma's board will be at emma.8gent.app") rather than asking them to choose.

**Issue P2-ONBOARD-002: Color selection uses squares with no labels.**
The color picker on step 3 shows 6 colored squares. The selected one gets a checkmark. This is actually good for a child (visual, no reading needed). However, the colors have no names visible -- a parent helping may want to know what color their child picked.
**Fix:** Add color name below each square (`text-xs text-gray-500`).

---

## 9. Summary Table

### P0 Issues (Critical -- Fix First)

| ID | Page | Issue | Fix |
|----|------|-------|-----|
| P0-DOCK-001 | Dock | 7 items -- cognitive overload | Reduce to 4, add "More" page |
| P0-APP-001 | `/app` | Card labels at 9px are illegible | Minimum 13px |
| P0-VIS-006 | Global | App looks like iOS Settings, not a children's app | Add colored background, rounded font, illustrations |

### P1 Issues (Important -- Fix Soon)

| ID | Page | Issue | Fix |
|----|------|-------|-----|
| P1-CORE-001 | `/core` | 10-column grid too dense for motor planning | Cap at 8 columns |
| P1-CORE-002 | `/core` | Symbols 40px on mobile, need 48px | Increase to `w-12 h-12` |
| P1-VIS-001 | `/core` | No colored header -- breaks consistency | Add matching header |
| P1-VIS-003 | Global | Inter font too corporate for kids | Add Nunito/Fredoka for headings |
| P1-VIS-004 | Global | No illustrations or mascot, emojis only | Create simple illustration set |
| P1-NAV-001 | `/vsd` | Scene selector is text-only | Add emoji/thumbnails |
| P1-NAV-002 | Dock | "Talk" and "Core" are confusable | Rename or merge |
| P1-CONTENT-001 | Dock | "Core" and "AI" are jargon | Rename to "Words" and "Help" |
| P1-CONTENT-002 | `/ai` | AI greeting uses adult language | Simplify or gate behind parent access |
| P1-FEEDBACK-001 | `/core` | No audio feedback on word tap | Speak word immediately on tap |
| P1-FEEDBACK-002 | `/schooltube` | No audio on card tap | Add tap sound |
| P1-FEEDBACK-003 | `/timer` | No feedback on preset tap | Add haptic + animation |
| P1-VSD-001 | `/vsd` | Text hotspots defeat VSD purpose for non-readers | Use photo scenes + icon markers |
| P1-SCHOOL-001 | `/schooltube` | Video player is a placeholder | Remove video cards or implement player |
| P1-ONBOARD-001 | `/onboarding` | Asks child to type a subdomain | Auto-generate |
| P1-ERROR-001 | `/onboarding` | Raw error messages shown | Map to friendly messages |
| P1-ERROR-002 | `/voice` | "Could not access microphone" is technical | Rewrite for child/parent |
| P1-ACCESS-001 | Global | `h-screen` cuts off content in landscape | Test + fix per page |
| P1-ANIM-001 | Global | No page transitions | Add Framer Motion route transitions |
| P1-DRAW-001 | `/draw` | Color/size buttons 32px (below 44px min) | Increase to 44px |
| P1-SETTINGS-001 | `/settings` | Slider thumbs 24px | Add parental gate |

### P2 Issues (Nice to Have)

| ID | Page | Issue | Fix |
|----|------|-------|-----|
| P2-VIS-002 | `/intuition` | Dark theme breaks visual consistency | Align or add transition |
| P2-VIS-005 | Global | No skeleton loading states | Add shimmer placeholders |
| P2-NAV-003 | `/voice` | No back button in header | Add consistent back navigation |
| P2-NAV-004 | `/intuition` | No exit during gameplay | Add X button |
| P2-NAV-005 | Dock | VSD and Intuition not in dock | Add "More" section |
| P2-CONTENT-003 | Global | ARASAAC symbol sizes inconsistent | Standardize at 48px min |
| P2-FEEDBACK-004 | Global | Loading spinners not child-friendly | Use animated illustrations |
| P2-ACCESS-002 | `/onboarding` | Custom fadeIn may not respect reduced-motion | Verify |
| P2-ACCESS-003 | Global | Missing aria-labels on most interactive elements | Add systematically |
| P2-ONBOARD-002 | `/onboarding` | Color squares have no name labels | Add text below |
| P2-MUSIC-001 | `/music` | Page is too complex for a child | Split or simplify |

---

## 10. Positive Findings

Credit where due -- these things are done well:

1. **Safe area support** -- `safe-top`, `safe-bottom`, `safe-area-inset` classes in globals.css handle notched devices correctly
2. **Touch-action manipulation** -- Set globally in globals.css, prevents accidental zooming during AAC use
3. **Fitzgerald Key colors** -- Defined as CSS variables, properly applied to Core Words categories
4. **Haptic feedback on core interactions** -- Core word tap (10ms) and SchoolTube card tap (30ms) use navigator.vibrate
5. **`prefers-reduced-motion` support** -- Global rule reduces all animations for motion-sensitive users
6. **Focus-visible styles** -- Keyboard navigation is supported with visible focus rings
7. **AAC-specific CSS classes** -- `.aac-card` and `.aac-board` prevent text selection during communication
8. **44px minimum touch targets** -- Consistently applied to sentence strip action buttons (backspace, clear, speak)
9. **Personalization** -- User-selectable primary color, voice, grid size, child name
10. **Motor planning lock on Core Words** -- Words NEVER move, positions are permanent for muscle memory (this is critical AAC practice)
11. **Multi-step TTS fallback** -- KittenTTS -> ElevenLabs -> Browser TTS, graceful degradation
12. **`userScalable: false`** in viewport -- Prevents accidental pinch-zoom during AAC use

---

## 11. Recommended Implementation Order

1. **P0-APP-001**: Increase card label font to 13px (5 minutes, huge readability win)
2. **P0-DOCK-001**: Reduce dock to 4 items (30 minutes, requires "More" page)
3. **P1-FEEDBACK-001**: Add word-level TTS to Core Words (15 minutes, copy pattern from `/app`)
4. **P1-CONTENT-001**: Rename dock labels (5 minutes)
5. **P1-CORE-002**: Increase symbol size to 48px (5 minutes)
6. **P1-VIS-001**: Add colored header to Core Words (15 minutes)
7. **P1-DRAW-001**: Increase draw tool button sizes (10 minutes)
8. **P1-ERROR-001 + P1-ERROR-002**: Map errors to friendly messages (15 minutes)
9. **P0-VIS-006**: Visual identity refresh (2-4 hours, requires design decisions)
10. **P1-ANIM-001**: Add page transitions (1-2 hours, Framer Motion setup)
