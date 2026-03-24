# Nick Prototype → 8gent Jr Port Plan

**Goal:** Port ALL remaining features from Nick prototype (`~/Myresumeportfolio/src/`) into 8gent Jr (`~/8gent/packages/jnr/`).

**UX principles for autistic non-verbal children:**
- Large touch targets (64px minimum, 80px+ preferred)
- Predictable layouts — no surprise movements
- High contrast, warm palette (8gent Jr brand: #E8610A accent, #FFFDF9 bg)
- Minimal text — visual/icon-first interfaces
- Sensory-friendly: optional animations, no flashing, calming defaults
- Immediate feedback on every tap (haptic, visual, audio)
- No dead ends — always a way back
- Celebration without overwhelm (gentle, not explosive)
- Motor-lock protection against accidental taps
- Parent PIN for settings/exit

**Source:** `~/Myresumeportfolio/src/app/nick/` + `~/Myresumeportfolio/src/lib/nick/` + `~/Myresumeportfolio/src/components/nick/`
**Target:** `~/8gent/packages/jnr/src/`

---

## Wave 1: Speech Games (8 games) — DONE
These directly support AAC communication goals.

| Game | Source | Target | Status |
|------|--------|--------|--------|
| AnimalSounds | done | done | DONE |
| CopyMove | `speech/copy-move.tsx` | `games/CopyMove.tsx` | DONE |
| FeelingsExplorer | `speech/feelings-explorer.tsx` | `games/FeelingsExplorer.tsx` | DONE |
| JumpCount | `speech/jump-count.tsx` | `games/JumpCount.tsx` | DONE |
| NatureExplore | `speech/nature-explore.tsx` | `games/NatureExplore.tsx` | DONE |
| RhymeTime | `speech/rhyme-time.tsx` | `games/RhymeTime.tsx` | DONE |
| SentenceBuilder | `speech/sentence-builder.tsx` | `games/SentenceBuilderGame.tsx` | DONE |
| WordRepeat | `speech/word-repeat.tsx` | `games/WordRepeat.tsx` | DONE |

## Wave 2: Sensory Games (4 games) — DONE
Calming, regulation-focused activities.

| Game | Source | Target | Status |
|------|--------|--------|--------|
| BallRain | `sensory/ball-rain.tsx` | `games/BallRain.tsx` | DONE |
| BubbleWrap | `sensory/bubble-wrap.tsx` | `games/BubbleWrap.tsx` | DONE |
| MarbleRun | `sensory/marble-run.tsx` | `games/MarbleRun.tsx` | DONE |
| ShapeTower | `sensory/shape-tower.tsx` | `games/ShapeTower.tsx` | DONE |

## Wave 3: Sensory 3D Games (10 games)
Advanced sensory experiences.

| Game | Source | Target | Status |
|------|--------|--------|--------|
| BallRun | `sensory-3d/ball-run.tsx` | `games/BallRun.tsx` | DONE |
| BreathingSphere | `sensory-3d/breathing-sphere.tsx` | `games/BreathingSphere.tsx` | DONE |
| CalmingParticles | `sensory-3d/calming-particles.tsx` | `games/CalmingParticles.tsx` | DONE |
| ChainReaction | `sensory-3d/chain-reaction.tsx` | `games/ChainReaction.tsx` | DONE |
| CrystalGarden | `sensory-3d/crystal-garden.tsx` | `games/CrystalGarden.tsx` | DONE |
| DominoCascade | `sensory-3d/domino-cascade.tsx` | `games/DominoCascade.tsx` | DONE |
| LavaLamp | `sensory-3d/lava-lamp.tsx` | `games/LavaLamp.tsx` | DONE |
| MagneticParticles | `sensory-3d/magnetic-particles.tsx` | `games/MagneticParticles.tsx` | DONE |
| PendulumWave | `sensory-3d/pendulum-wave.tsx` | `games/PendulumWave.tsx` | DONE |
| Starfield | `sensory-3d/starfield.tsx` | `games/Starfield.tsx` | DONE |

## Wave 4: Standalone Apps
Full app experiences.

| App | Source | Target | Status |
|-----|--------|--------|--------|
| Draw | `nick/draw/page.tsx` | `(app)/draw/page.tsx` | DONE |
| Intuition | `nick/intuition/page.tsx` | `(app)/intuition/page.tsx` | DONE |
| Music | `nick/music/page.tsx` + `components/nick/instruments/` | `(app)/music/page.tsx` | DONE |
| Timer | `nick/timer/page.tsx` | `(app)/timer/page.tsx` | DONE |
| VSD | `nick/vsd/page.tsx` + `lib/nick/vsd/` | `(app)/vsd/page.tsx` | DONE |
| Speech Therapy | `nick/speech/page.tsx` + `components/nick/SpeechTherapy.tsx` | `(app)/speech/page.tsx` | DONE |

## Wave 5: Lib/Engine Modules
Core logic that powers the apps.

| Module | Source | Target | Status |
|--------|--------|--------|--------|
| sentence-engine.ts | `lib/nick/sentence-engine.ts` | `lib/sentence-engine.ts` | DONE |
| fitzgerald-key.ts | `lib/nick/fitzgerald-key.ts` | `lib/fitzgerald-key.ts` | DONE |
| GLP stages | `lib/nick/glp/` | `lib/glp/` | DONE |
| motor-lock.ts | `lib/nick/motor-lock.ts` | `lib/motor-lock.ts` | DONE |
| robust-vocabulary.ts | `lib/nick/robust-vocabulary.ts` | `lib/robust-vocabulary.ts` | DONE |
| offline.ts | `lib/nick/offline.ts` | `lib/offline.ts` | DONE |
| tts-config.ts | `lib/nick/tts-config.ts` | `lib/tts-config.ts` | DONE |
| music/emotional-playlists.ts | `lib/nick/music/` | `lib/music/` | DONE |
| vsd/ (scenes, types, display) | `lib/nick/vsd/` | `lib/vsd/` | DONE |
| instruments/ | `components/nick/instruments/` | `components/instruments/` | DONE |

## Wave 6: SchoolTube Infrastructure
UI chrome around the games.

| Component | Source | Target | Status |
|-----------|--------|--------|--------|
| reels-feed.tsx | `schooltube/components/reels-feed.tsx` | `components/schooltube/ReelsFeed.tsx` | DONE |
| reel-card.tsx | `schooltube/components/reel-card.tsx` | `components/schooltube/ReelCard.tsx` | DONE |
| video-player.tsx | `schooltube/components/video-player.tsx` | `components/schooltube/VideoPlayer.tsx` | DONE |
| weekly-schedule.tsx | `schooltube/components/weekly-schedule.tsx` | `components/schooltube/WeeklySchedule.tsx` | DONE |
| daily-activity-banner.tsx | `schooltube/components/daily-activity-banner.tsx` | `components/schooltube/DailyActivityBanner.tsx` | DONE |
| pin-dialog.tsx | `schooltube/components/pin-dialog.tsx` | `components/schooltube/PinDialog.tsx` | DONE |
| settings-panel.tsx | `schooltube/components/settings-panel.tsx` | `components/schooltube/SettingsPanel.tsx` | DONE |

## Wave 7: API Routes
Server-side AI endpoints.

| Route | Source | Target | Status |
|-------|--------|--------|--------|
| autocomplete | `api/nick/autocomplete/route.ts` | `api/nick/autocomplete/route.ts` | DONE |
| encourage | `api/nick/encourage/route.ts` | `api/nick/encourage/route.ts` | DONE |
| improve-sentence | `api/nick/improve-sentence/route.ts` | `api/nick/improve-sentence/route.ts` | DONE |
| generate-song | `api/nick/generate-song/route.ts` | `api/nick/generate-song/route.ts` | DONE |
| tts | `api/nick/tts/route.ts` | `api/tts/route.ts` | DONE |

---

## Port Rules

1. **Read source → extract pattern → rebuild clean.** Never copy wholesale.
2. **8gent Jr brand:** Fraunces headings, Inter body, #E8610A accent, warm palette.
3. **No emojis in UI** (per BRAND.md). Use SVG icons.
4. **'use client'** directive on all interactive components.
5. **Under 300 lines per file.** Split if larger.
6. **Touch targets:** minimum 64px, prefer 80px+.
7. **No external deps** unless already in package.json.
8. **TypeScript strict,** clean exports, JSDoc on public APIs.
9. **Sensory-safe defaults:** animations off by default, toggle to enable.
10. **Every game must have a clear "back" button** — no trapping.
