/**
 * Supercore 50 Core Words
 *
 * The 50 highest-frequency words in AAC communication, covering ~40-45%
 * of daily language. Based on Smartbox Supercore design principles.
 *
 * MOTOR PLANNING RULE: Word positions are PERMANENT. Never reorder.
 * Each word's grid position is derived from its array index:
 *   row = Math.floor(index / COLS), col = index % COLS
 *
 * ARASAAC pictogram IDs verified via API (2026-03-21).
 *
 * Fitzgerald Key color coding (AAC standard):
 *   green  = verbs (actions)
 *   yellow = pronouns (people words)
 *   orange = nouns (things)
 *   pink   = adjectives (describing words)
 *   blue   = prepositions (location words)
 *   red    = negatives / social
 *   purple = questions
 *   white  = misc (conjunctions, articles)
 */

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type FitzgeraldColor =
  | 'green'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'blue'
  | 'red'
  | 'purple'
  | 'white';

export interface CoreWord {
  /** Unique stable ID (also encodes grid position) */
  readonly id: string;
  /** Display text */
  readonly label: string;
  /** ARASAAC pictogram ID */
  readonly pictogramId: number;
  /** Fitzgerald Key color category */
  readonly color: FitzgeraldColor;
}

// -----------------------------------------------------------------------------
// Fitzgerald Key Color Map (Tailwind classes)
// -----------------------------------------------------------------------------

export const FITZGERALD_COLORS: Record<
  FitzgeraldColor,
  { bg: string; border: string; text: string }
> = {
  green:  { bg: 'bg-green-100',  border: 'border-green-500',  text: 'text-green-900' },
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-900' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-900' },
  pink:   { bg: 'bg-pink-100',   border: 'border-pink-500',   text: 'text-pink-900' },
  blue:   { bg: 'bg-blue-100',   border: 'border-blue-500',   text: 'text-blue-900' },
  red:    { bg: 'bg-red-100',    border: 'border-red-500',    text: 'text-red-900' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-900' },
  white:  { bg: 'bg-gray-50',    border: 'border-gray-300',   text: 'text-gray-900' },
};

// -----------------------------------------------------------------------------
// ARASAAC URL builder
// -----------------------------------------------------------------------------

export const arasaacUrl = (id: number): string =>
  `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;

// -----------------------------------------------------------------------------
// The 50 Core Words (FIXED ORDER - NEVER REORDER)
// Layout: 10 cols x 5 rows. Position = array index.
// -----------------------------------------------------------------------------

export const SUPERCORE_50: readonly CoreWord[] = Object.freeze([
  // Row 1: Pronouns + Core verbs
  { id: 'w01', label: 'I',       pictogramId: 6632,  color: 'yellow' },
  { id: 'w02', label: 'you',     pictogramId: 6625,  color: 'yellow' },
  { id: 'w03', label: 'want',    pictogramId: 5441,  color: 'green' },
  { id: 'w04', label: 'go',      pictogramId: 8142,  color: 'green' },
  { id: 'w05', label: 'stop',    pictogramId: 7196,  color: 'red' },
  { id: 'w06', label: 'more',    pictogramId: 5508,  color: 'white' },
  { id: 'w07', label: 'help',    pictogramId: 32648, color: 'red' },
  { id: 'w08', label: 'like',    pictogramId: 37826, color: 'green' },
  { id: 'w09', label: 'not',     pictogramId: 32308, color: 'red' },
  { id: 'w10', label: 'yes',     pictogramId: 5584,  color: 'green' },

  // Row 2: More pronouns + verbs
  { id: 'w11', label: 'he',      pictogramId: 6480,  color: 'yellow' },
  { id: 'w12', label: 'she',     pictogramId: 7028,  color: 'yellow' },
  { id: 'w13', label: 'it',      pictogramId: 31670, color: 'yellow' },
  { id: 'w14', label: 'have',    pictogramId: 32761, color: 'green' },
  { id: 'w15', label: 'do',      pictogramId: 32751, color: 'green' },
  { id: 'w16', label: 'get',     pictogramId: 24208, color: 'green' },
  { id: 'w17', label: 'make',    pictogramId: 32751, color: 'green' },
  { id: 'w18', label: 'put',     pictogramId: 32757, color: 'green' },
  { id: 'w19', label: 'come',    pictogramId: 32669, color: 'green' },
  { id: 'w20', label: 'no',      pictogramId: 5526,  color: 'red' },

  // Row 3: Verbs + prepositions
  { id: 'w21', label: 'eat',     pictogramId: 6456,  color: 'green' },
  { id: 'w22', label: 'drink',   pictogramId: 6061,  color: 'green' },
  { id: 'w23', label: 'play',    pictogramId: 23392, color: 'green' },
  { id: 'w24', label: 'look',    pictogramId: 6564,  color: 'green' },
  { id: 'w25', label: 'turn',    pictogramId: 6630,  color: 'green' },
  { id: 'w26', label: 'open',    pictogramId: 24825, color: 'green' },
  { id: 'w27', label: 'give',    pictogramId: 28431, color: 'green' },
  { id: 'w28', label: 'in',      pictogramId: 7034,  color: 'blue' },
  { id: 'w29', label: 'on',      pictogramId: 7814,  color: 'blue' },
  { id: 'w30', label: 'up',      pictogramId: 5388,  color: 'blue' },

  // Row 4: Prepositions + adjectives
  { id: 'w31', label: 'down',    pictogramId: 37428, color: 'blue' },
  { id: 'w32', label: 'out',     pictogramId: 8252,  color: 'blue' },
  { id: 'w33', label: 'off',     pictogramId: 7020,  color: 'blue' },
  { id: 'w34', label: 'big',     pictogramId: 4658,  color: 'pink' },
  { id: 'w35', label: 'little',  pictogramId: 25839, color: 'pink' },
  { id: 'w36', label: 'good',    pictogramId: 4581,  color: 'pink' },
  { id: 'w37', label: 'bad',     pictogramId: 5504,  color: 'pink' },
  { id: 'w38', label: 'happy',   pictogramId: 35533, color: 'pink' },
  { id: 'w39', label: 'sad',     pictogramId: 35545, color: 'pink' },
  { id: 'w40', label: 'done',    pictogramId: 10367, color: 'pink' },

  // Row 5: Questions + pronouns
  { id: 'w41', label: 'what',    pictogramId: 22620, color: 'purple' },
  { id: 'w42', label: 'where',   pictogramId: 7764,  color: 'purple' },
  { id: 'w43', label: 'my',      pictogramId: 12264, color: 'yellow' },
  { id: 'w44', label: 'me',      pictogramId: 6632,  color: 'yellow' },
  { id: 'w45', label: 'we',      pictogramId: 7185,  color: 'yellow' },
  { id: 'w46', label: 'they',    pictogramId: 7032,  color: 'yellow' },
  { id: 'w47', label: 'this',    pictogramId: 7095,  color: 'yellow' },
  { id: 'w48', label: 'that',    pictogramId: 6906,  color: 'yellow' },
  { id: 'w49', label: 'different', pictogramId: 9442, color: 'pink' },
  { id: 'w50', label: 'same',    pictogramId: 9443,  color: 'pink' },
]);
