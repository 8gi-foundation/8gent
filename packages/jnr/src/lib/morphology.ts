/**
 * 8gent Jr Morphology Engine
 *
 * Pure-function word morphology for AAC vocabulary.
 * Handles verb tenses, adjective comparisons, noun plurals,
 * possessives, and negations — including common irregular forms.
 *
 * No external dependencies. No side effects.
 *
 * @module morphology
 */

/** Morphological form category */
export type MorphType =
  | 'base' | 'present' | 'past' | 'progressive'
  | 'plural' | 'possessive' | 'comparative' | 'superlative' | 'negative';

/** A single morphological form of a word */
export interface MorphForm {
  /** Which morphological transformation was applied */
  type: MorphType;
  /** The resulting word text */
  text: string;
  /** Visual suffix label for UI (e.g. "-s", "-ing") */
  suffix?: string;
}

/** Word class determines which morphology rules apply */
export type WordClass = 'verb' | 'adjective' | 'noun' | 'modal';

/**
 * Generate regular verb forms: base, present (-s), progressive (-ing), past (-ed).
 * Does not handle irregulars — use {@link getForms} for that.
 */
export function getVerbForms(base: string): MorphForm[] {
  const endsE = base.endsWith('e');
  const endsConsonantY = /[bcdfghjklmnpqrstvwxyz]y$/.test(base);
  const shortVC = /[aeiou][bcdfghjklmnpqrstvwxyz]$/.test(base) && base.length <= 4;

  let present = base + 's';
  if (/(?:s|sh|ch|x|z|o)$/.test(base)) present = base + 'es';
  else if (endsConsonantY) present = base.slice(0, -1) + 'ies';

  let progressive = base + 'ing';
  if (endsE && !base.endsWith('ee')) progressive = base.slice(0, -1) + 'ing';
  else if (shortVC) progressive = base + base.at(-1) + 'ing';

  let past = base + 'ed';
  if (endsE) past = base + 'd';
  else if (endsConsonantY) past = base.slice(0, -1) + 'ied';
  else if (shortVC) past = base + base.at(-1) + 'ed';

  return [
    { type: 'base', text: base },
    { type: 'present', text: present, suffix: '-s' },
    { type: 'progressive', text: progressive, suffix: '-ing' },
    { type: 'past', text: past, suffix: '-ed' },
  ];
}

/**
 * Generate regular adjective forms: base, comparative (-er/more), superlative (-est/most).
 * Short adjectives (<=5 chars) use suffixes; longer ones use "more"/"most".
 */
export function getAdjectiveForms(base: string): MorphForm[] {
  const endsE = base.endsWith('e');
  const endsY = base.endsWith('y');
  const shortVC = /[aeiou][bcdfghjklmnpqrstvwxyz]$/.test(base);
  let comparative: string, superlative: string;

  if (base.length <= 5) {
    if (endsE) { comparative = base + 'r'; superlative = base + 'st'; }
    else if (endsY) { comparative = base.slice(0, -1) + 'ier'; superlative = base.slice(0, -1) + 'iest'; }
    else if (shortVC) { comparative = base + base.at(-1) + 'er'; superlative = base + base.at(-1) + 'est'; }
    else { comparative = base + 'er'; superlative = base + 'est'; }
  } else {
    comparative = `more ${base}`;
    superlative = `most ${base}`;
  }

  return [
    { type: 'base', text: base },
    { type: 'comparative', text: comparative, suffix: '-er' },
    { type: 'superlative', text: superlative, suffix: '-est' },
  ];
}

/**
 * Generate regular noun forms: base, plural (-s/-es/-ves/-ies), possessive ('s).
 * Handles -s/-sh/-ch/-x/-z endings, consonant+y, and -f/-fe patterns.
 */
export function getNounForms(base: string): MorphForm[] {
  const endsConsonantY = /[bcdfghjklmnpqrstvwxyz]y$/.test(base);
  let plural: string;
  if (/(?:s|ss|sh|ch|x|z)$/.test(base)) plural = base + 'es';
  else if (endsConsonantY) plural = base.slice(0, -1) + 'ies';
  else if (base.endsWith('fe')) plural = base.slice(0, -2) + 'ves';
  else if (base.endsWith('f')) plural = base.slice(0, -1) + 'ves';
  else plural = base + 's';

  return [
    { type: 'base', text: base },
    { type: 'plural', text: plural, suffix: '-s' },
    { type: 'possessive', text: base + "'s", suffix: "'s" },
  ];
}

/** Irregular forms — common AAC words only */
const IRREG_VERBS: Record<string, { past: string; present?: string }> = {
  be: { past: 'was', present: 'is' }, go: { past: 'went', present: 'goes' },
  do: { past: 'did', present: 'does' }, have: { past: 'had', present: 'has' },
  say: { past: 'said' }, get: { past: 'got' }, make: { past: 'made' },
  see: { past: 'saw' }, come: { past: 'came' }, take: { past: 'took' },
  eat: { past: 'ate' }, drink: { past: 'drank' }, sleep: { past: 'slept' },
  run: { past: 'ran' }, sit: { past: 'sat' }, put: { past: 'put' },
  read: { past: 'read' }, cut: { past: 'cut' }, hit: { past: 'hit' },
  buy: { past: 'bought' }, give: { past: 'gave' }, fall: { past: 'fell' },
  tell: { past: 'told' }, feel: { past: 'felt' }, find: { past: 'found' },
  know: { past: 'knew' }, think: { past: 'thought' }, write: { past: 'wrote' },
  break: { past: 'broke' }, draw: { past: 'drew' }, sing: { past: 'sang' },
  swim: { past: 'swam' }, fly: { past: 'flew' }, wake: { past: 'woke' },
};
const IRREG_ADJ: Record<string, { comparative: string; superlative: string }> = {
  good: { comparative: 'better', superlative: 'best' },
  bad: { comparative: 'worse', superlative: 'worst' },
  far: { comparative: 'farther', superlative: 'farthest' },
  little: { comparative: 'less', superlative: 'least' },
  much: { comparative: 'more', superlative: 'most' },
};
const IRREG_NOUNS: Record<string, string> = {
  child: 'children', person: 'people', man: 'men', woman: 'women',
  foot: 'feet', tooth: 'teeth', mouse: 'mice', fish: 'fish',
  sheep: 'sheep', deer: 'deer', goose: 'geese',
};
const NEGATIONS: Record<string, string> = {
  can: "can't", will: "won't", do: "don't", does: "doesn't",
  did: "didn't", is: "isn't", are: "aren't", was: "wasn't",
  have: "haven't", has: "hasn't", would: "wouldn't",
  could: "couldn't", should: "shouldn't",
};

/**
 * Get all morphological forms for a word, including irregular forms.
 *
 * This is the primary entry point. It checks irregular lookup tables first,
 * then falls back to regular rule-based morphology.
 *
 * @param base - The base/dictionary form of the word
 * @param wordClass - The grammatical class (verb, noun, adjective, modal)
 * @returns Array of all applicable morphological forms
 *
 * @example
 * ```ts
 * getForms('go', 'verb')
 * // [{ type: 'base', text: 'go' }, { type: 'present', text: 'goes', suffix: '-s' },
 * //  { type: 'progressive', text: 'going', suffix: '-ing' }, { type: 'past', text: 'went', suffix: '-ed' }]
 *
 * getForms('child', 'noun')
 * // [{ type: 'base', text: 'child' }, { type: 'plural', text: 'children', suffix: '-s' },
 * //  { type: 'possessive', text: "child's", suffix: "'s" }]
 * ```
 */
export function getForms(base: string, wordClass: WordClass): MorphForm[] {
  const key = base.toLowerCase();

  if (wordClass === 'verb') {
    const irr = IRREG_VERBS[key];
    if (irr) {
      const regular = getVerbForms(base);
      return [
        { type: 'base', text: base },
        irr.present
          ? { type: 'present', text: irr.present, suffix: '-s' }
          : regular.find(f => f.type === 'present')!,
        regular.find(f => f.type === 'progressive')!,
        { type: 'past', text: irr.past, suffix: '-ed' },
      ];
    }
    return getVerbForms(base);
  }

  if (wordClass === 'adjective') {
    const irr = IRREG_ADJ[key];
    if (irr) return [
      { type: 'base', text: base },
      { type: 'comparative', text: irr.comparative, suffix: '-er' },
      { type: 'superlative', text: irr.superlative, suffix: '-est' },
    ];
    return getAdjectiveForms(base);
  }

  if (wordClass === 'noun') {
    const irr = IRREG_NOUNS[key];
    if (irr) return [
      { type: 'base', text: base },
      { type: 'plural', text: irr, suffix: '-s' },
      { type: 'possessive', text: base + "'s", suffix: "'s" },
    ];
    return getNounForms(base);
  }

  // modal — base + negation
  const neg = NEGATIONS[key];
  return neg
    ? [{ type: 'base', text: base }, { type: 'negative', text: neg, suffix: "n't" }]
    : [{ type: 'base', text: base }];
}

/**
 * Get the contracted negation of a modal/auxiliary verb.
 *
 * @param word - The word to negate (e.g. "can", "will", "do")
 * @returns The negated form (e.g. "can't", "won't", "don't") or null if no negation exists
 */
export function getNegation(word: string): string | null {
  return NEGATIONS[word.toLowerCase()] ?? null;
}
