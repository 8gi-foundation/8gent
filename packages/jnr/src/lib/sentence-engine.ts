/**
 * GLP-Aware Sentence Engine — Client Helper
 *
 * Takes raw AAC card selections and produces grammatically improved sentences.
 * Respects GLP stages: Stage 1-2 gestalts are preserved as valid language,
 * higher stages get AI-powered grammar improvement.
 *
 * Calls the /api/jr/sentence/improve endpoint for Stage 3+ improvements.
 */

// =============================================================================
// Types
// =============================================================================

/** A word suggested as missing from the sentence */
export interface MissingWord {
  /** The suggested word */
  word: string;
  /** Grammatical category (verb, pronoun, etc.) */
  category: string;
  /** Fitzgerald Key color name for display */
  fitzgerald: string;
}

/** Result of sentence improvement */
export interface SentenceResult {
  /** Original raw card text joined with spaces */
  raw: string;
  /** Grammatically improved version */
  improved: string;
  /** Human-readable explanation of what was changed */
  explanation: string;
  /** Words that could be added to improve the sentence */
  missing: MissingWord[];
  /** Clinical note about the GLP stage context */
  glpNote: string;
  /** Confidence score 0-1 (1 = no improvement needed) */
  confidence: number;
}

// =============================================================================
// Sentence Improvement
// =============================================================================

/**
 * Improve a sentence built from AAC card selections.
 *
 * - Stage 1-2: Returns raw input unchanged (gestalts are valid language)
 * - Stage 3+: Calls API for grammar improvement
 * - Always returns a valid SentenceResult, even on error
 *
 * @param cards - Array of card text strings selected by the user
 * @param glpStage - Current GLP stage (1-6)
 * @param context - Optional context about the conversation
 * @param apiEndpoint - API endpoint (defaults to /api/jr/sentence/improve)
 */
export async function improveSentence(
  cards: string[],
  glpStage: number,
  context?: string,
  apiEndpoint: string = '/api/jr/sentence/improve',
): Promise<SentenceResult> {
  const raw = cards.join(' ');

  // Stage 1-2: gestalts are valid language — do not "correct" them
  if (glpStage <= 2) {
    return {
      raw,
      improved: raw,
      explanation: 'Gestalt preserved — this is valid communication at this GLP stage',
      missing: [],
      glpNote: glpStage === 1
        ? 'Stage 1: whole gestalts — these are valid language units, not errors'
        : 'Stage 2: partial gestalts and mix-and-match chunks — respect the recombination',
      confidence: 1.0,
    };
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards, glpStage, context }),
    });

    if (!response.ok) {
      throw new Error(`API ${response.status}`);
    }

    return await response.json() as SentenceResult;
  } catch (error) {
    console.warn('[8gent Jr] Sentence improve failed, returning raw:', error);
    return {
      raw,
      improved: raw,
      explanation: 'Could not reach improvement API — returning raw input',
      missing: [],
      glpNote: `Stage ${glpStage}: offline fallback`,
      confidence: 0.0,
    };
  }
}
