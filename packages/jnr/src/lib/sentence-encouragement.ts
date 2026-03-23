/**
 * 8gent Jr Sentence Encouragement System
 *
 * Pure logic for encouraging longer utterances based on GLP stage.
 * Takes sentence length and GLP stage, returns encouragement type
 * and contextual feedback messages.
 *
 * Principles:
 * - Never rush or pressure the child
 * - Celebrate every communication attempt
 * - Match complexity expectations to GLP stage
 * - Stage 1-2: single words and gestalts are valid language
 * - Stage 3-4: gently encourage 2-3 word combinations
 * - Stage 5-6: encourage full sentences
 *
 * No external dependencies. No React. No side effects.
 *
 * @module sentence-encouragement
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** GLP stage (1-6) per Marge Blanc's Natural Language Acquisition framework */
export type GLPStage = 1 | 2 | 3 | 4 | 5 | 6;

/** What kind of encouragement to show (or none) */
export type EncouragementAction = 'none' | 'prompt' | 'celebrate';

/** Celebration intensity scales with communication achievement */
export type CelebrationLevel = 'small' | 'medium' | 'big';

/** Result returned by {@link getEncouragement} */
export interface EncouragementResult {
  /** What action to take */
  action: EncouragementAction;
  /** Human-readable message to display (empty string for "none") */
  message: string;
  /** TTS-friendly version of the message */
  spokenMessage: string;
  /** Celebration intensity (only set when action is "celebrate") */
  celebrationLevel?: CelebrationLevel;
  /** Suggested next words to offer (only set when action is "prompt") */
  suggestedStarters?: string[];
}

// ---------------------------------------------------------------------------
// Celebration pools
// ---------------------------------------------------------------------------

const CELEBRATIONS_SMALL: readonly string[] = [
  'Nice!',
  'Good job!',
  'Yes!',
  'You said it!',
  "That's it!",
];

const CELEBRATIONS_MEDIUM: readonly string[] = [
  'Great talking!',
  'I understood you!',
  'You told me what you want!',
  'Great words!',
  "You're communicating!",
];

const CELEBRATIONS_BIG: readonly string[] = [
  'Wow, what a great sentence!',
  'Amazing! You used so many words!',
  'That was brilliant talking!',
  'I love hearing you communicate!',
  "You're getting so good at this!",
];

// ---------------------------------------------------------------------------
// Stage-appropriate starter words
// ---------------------------------------------------------------------------

const STARTERS_EARLY: readonly string[] = [
  'I', 'want', 'more', 'help', 'yes', 'no', 'go', 'stop',
];

const STARTERS_MID: readonly string[] = [
  ...STARTERS_EARLY,
  'what', 'where', 'can', 'my', 'the',
];

const STARTERS_ADVANCED: readonly string[] = [
  ...STARTERS_MID,
  'because', 'when', 'how', 'why', 'but', 'and',
];

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Determine what encouragement to provide based on sentence length and GLP stage.
 *
 * @param sentenceLength - Number of words in the current sentence strip (0 = empty)
 * @param glpStage - The child's current GLP stage (1-6)
 * @returns An encouragement result with action, message, and optional extras
 *
 * @example
 * ```ts
 * // Empty strip, early gestalt stage — no pressure
 * getEncouragement(0, 1)
 * // { action: 'none', message: '', spokenMessage: '' }
 *
 * // Single word at stage 4 — encourage expansion
 * getEncouragement(1, 4)
 * // { action: 'prompt', message: 'Nice! Can you add more?', ... }
 *
 * // 3-word sentence at stage 3 — celebrate
 * getEncouragement(3, 3)
 * // { action: 'celebrate', message: 'Great talking!', celebrationLevel: 'big' }
 * ```
 */
export function getEncouragement(
  sentenceLength: number,
  glpStage: GLPStage,
): EncouragementResult {
  // --- Stage 1-2: Gestalts and single words are valid language ---
  if (glpStage <= 2) {
    return sentenceLength >= 1
      ? buildCelebration(sentenceLength, glpStage)
      : none();
  }

  // --- Stage 3-4: Encourage 2-3 word combinations ---
  if (glpStage <= 4) {
    if (sentenceLength === 0) return none();
    if (sentenceLength === 1) return buildPrompt(glpStage);
    if (sentenceLength >= 2) return buildCelebration(sentenceLength, glpStage);
    return none();
  }

  // --- Stage 5-6: Encourage full sentences ---
  if (sentenceLength === 0) return none();
  if (sentenceLength <= 2) return buildPrompt(glpStage);
  if (sentenceLength >= 3) return buildCelebration(sentenceLength, glpStage);
  return none();
}

/**
 * Get stage-appropriate starter word suggestions.
 *
 * @param glpStage - The child's current GLP stage (1-6)
 * @returns Array of starter words, capped at 8
 */
export function getStarterWords(glpStage: GLPStage): string[] {
  if (glpStage <= 2) return [...STARTERS_EARLY];
  if (glpStage <= 4) return [...STARTERS_MID].slice(0, 8);
  return [...STARTERS_ADVANCED].slice(0, 8);
}

/**
 * Determine the expected sentence length target for a GLP stage.
 * Useful for progress indicators.
 *
 * @param glpStage - The child's current GLP stage (1-6)
 * @returns Target number of words that represents "good" for this stage
 */
export function getTargetLength(glpStage: GLPStage): number {
  const targets: Record<GLPStage, number> = {
    1: 1, 2: 1, 3: 2, 4: 3, 5: 5, 6: 7,
  };
  return targets[glpStage];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function none(): EncouragementResult {
  return { action: 'none', message: '', spokenMessage: '' };
}

function buildPrompt(glpStage: GLPStage): EncouragementResult {
  const messages =
    glpStage <= 4
      ? ['Nice! Can you add more?', 'Good start! Keep going!', 'What else?']
      : ['Great start! Try a full sentence.', 'Keep going — you can do it!', 'Add more words!'];

  const message = pick(messages);
  return {
    action: 'prompt',
    message,
    spokenMessage: message,
    suggestedStarters: getStarterWords(glpStage),
  };
}

function buildCelebration(
  sentenceLength: number,
  glpStage: GLPStage,
): EncouragementResult {
  const target = getTargetLength(glpStage);
  let level: CelebrationLevel;
  let pool: readonly string[];

  if (sentenceLength >= target + 2) {
    level = 'big';
    pool = CELEBRATIONS_BIG;
  } else if (sentenceLength >= target) {
    level = 'medium';
    pool = CELEBRATIONS_MEDIUM;
  } else {
    level = 'small';
    pool = CELEBRATIONS_SMALL;
  }

  const message = pick(pool);
  return {
    action: 'celebrate',
    message,
    spokenMessage: message,
    celebrationLevel: level,
  };
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
