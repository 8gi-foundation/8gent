/**
 * 8gent Jr Robust Core Vocabulary
 *
 * Based on AAC research: ~200 core words cover 80% of daily communication.
 * Organized by WORD TYPE (not topic) to enable sentence construction.
 *
 * Key principles:
 * 1. Core words are HIGH-FREQUENCY, used across ALL contexts
 * 2. Focus on VERBS, PRONOUNS, PREPOSITIONS, ADJECTIVES (not nouns)
 * 3. Support multiple COMMUNICATION FUNCTIONS (not just requesting)
 *
 * Research sources:
 * - AssistiveWare "4 Things Every Robust AAC Has"
 * - CoughDrop "What is a Robust Vocabulary"
 * - Zangari & Van Tatenhove core vocabulary research
 */

import type { WordCategory } from './fitzgerald-key';

// =============================================================================
// Types
// =============================================================================

/**
 * Word types used in core vocabulary.
 * Maps to Fitzgerald Key categories (excluding 'noun' which is fringe).
 */
export type WordType =
  | 'pronoun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'determiner'
  | 'question'
  | 'interjection'
  | 'social'
  | 'negation';

/** Communication functions a word can serve */
export type CommunicationFunction =
  | 'request'
  | 'reject'
  | 'comment'
  | 'question'
  | 'greet'
  | 'respond'
  | 'express'
  | 'describe'
  | 'direct'
  | 'narrate'
  | 'joke'
  | 'opinion';

/** A single core vocabulary word with clinical metadata */
export interface CoreWord {
  /** Unique identifier */
  id: string;
  /** Display text */
  text: string;
  /** Spoken text if different from display */
  spokenText?: string;
  /** Grammatical word type */
  wordType: WordType;
  /** Communication functions this word supports */
  communicationFunctions: CommunicationFunction[];
  /** Usage frequency tier */
  frequency: 'essential' | 'high' | 'medium';
  /** Minimum GLP stage where this word appears */
  glpStage: 1 | 2 | 3 | 4 | 5 | 6;
  /** ARASAAC pictogram symbol ID */
  arasaacId?: number;
  /** Fixed grid position for motor planning */
  coreGridPosition?: { row: number; col: number };
  /** Morphological word forms */
  morphForms?: {
    base: string;
    present?: string;
    past?: string;
    plural?: string;
    comparative?: string;
    superlative?: string;
    negative?: string;
  };
  /** Word types that typically follow this word */
  typicallyFollowedBy?: WordType[];
  /** Word types that typically precede this word */
  typicallyPrecedeBy?: WordType[];
}

// =============================================================================
// CORE VOCABULARY — Essential Words
// =============================================================================

export const CORE_PRONOUNS: CoreWord[] = [
  { id: 'core-i',    text: 'I',    wordType: 'pronoun', communicationFunctions: ['request', 'express', 'comment', 'narrate'], frequency: 'essential', glpStage: 2, arasaacId: 6632, coreGridPosition: { row: 0, col: 0 }, typicallyFollowedBy: ['verb', 'adverb'] },
  { id: 'core-you',  text: 'you',  wordType: 'pronoun', communicationFunctions: ['question', 'direct', 'comment'], frequency: 'essential', glpStage: 2, arasaacId: 7116, coreGridPosition: { row: 0, col: 1 }, typicallyFollowedBy: ['verb', 'adverb'] },
  { id: 'core-he',   text: 'he',   wordType: 'pronoun', communicationFunctions: ['comment', 'narrate', 'describe'], frequency: 'high', glpStage: 3, arasaacId: 31146, typicallyFollowedBy: ['verb'] },
  { id: 'core-she',  text: 'she',  wordType: 'pronoun', communicationFunctions: ['comment', 'narrate', 'describe'], frequency: 'high', glpStage: 3, arasaacId: 2458, typicallyFollowedBy: ['verb'] },
  { id: 'core-it',   text: 'it',   wordType: 'pronoun', communicationFunctions: ['comment', 'describe', 'narrate'], frequency: 'essential', glpStage: 2, coreGridPosition: { row: 0, col: 2 }, typicallyFollowedBy: ['verb'] },
  { id: 'core-we',   text: 'we',   wordType: 'pronoun', communicationFunctions: ['request', 'narrate', 'comment'], frequency: 'high', glpStage: 3, arasaacId: 7116, typicallyFollowedBy: ['verb'] },
  { id: 'core-they', text: 'they', wordType: 'pronoun', communicationFunctions: ['comment', 'narrate'], frequency: 'medium', glpStage: 4, typicallyFollowedBy: ['verb'] },
  { id: 'core-me',   text: 'me',   wordType: 'pronoun', communicationFunctions: ['request', 'express'], frequency: 'essential', glpStage: 2, arasaacId: 6632, typicallyPrecedeBy: ['verb', 'preposition'] },
  { id: 'core-my',   text: 'my',   wordType: 'determiner', communicationFunctions: ['request', 'comment'], frequency: 'essential', glpStage: 2, arasaacId: 6632, coreGridPosition: { row: 0, col: 3 } },
  { id: 'core-your', text: 'your', wordType: 'determiner', communicationFunctions: ['question', 'comment'], frequency: 'high', glpStage: 3, arasaacId: 7116 },
];

export const CORE_VERBS: CoreWord[] = [
  { id: 'core-want',  text: 'want',  wordType: 'verb', communicationFunctions: ['request'], frequency: 'essential', glpStage: 2, arasaacId: 5441, coreGridPosition: { row: 1, col: 0 }, morphForms: { base: 'want', present: 'wants', past: 'wanted', negative: "don't want" }, typicallyPrecedeBy: ['pronoun'] },
  { id: 'core-need',  text: 'need',  wordType: 'verb', communicationFunctions: ['request'], frequency: 'essential', glpStage: 2, arasaacId: 32648, morphForms: { base: 'need', present: 'needs', past: 'needed', negative: "don't need" } },
  { id: 'core-like',  text: 'like',  wordType: 'verb', communicationFunctions: ['express', 'comment', 'opinion'], frequency: 'essential', glpStage: 2, arasaacId: 37721, coreGridPosition: { row: 1, col: 1 }, morphForms: { base: 'like', present: 'likes', past: 'liked', negative: "don't like" } },
  { id: 'core-go',    text: 'go',    wordType: 'verb', communicationFunctions: ['request', 'direct', 'narrate'], frequency: 'essential', glpStage: 2, arasaacId: 29951, coreGridPosition: { row: 1, col: 2 }, morphForms: { base: 'go', present: 'goes', past: 'went', negative: "don't go" } },
  { id: 'core-is',    text: 'is',    wordType: 'verb', communicationFunctions: ['describe', 'comment'], frequency: 'essential', glpStage: 2, coreGridPosition: { row: 1, col: 3 }, morphForms: { base: 'be', present: 'is', past: 'was', negative: "isn't" } },
  { id: 'core-have',  text: 'have',  wordType: 'verb', communicationFunctions: ['comment', 'request'], frequency: 'essential', glpStage: 2, morphForms: { base: 'have', present: 'has', past: 'had', negative: "don't have" } },
  { id: 'core-do',    text: 'do',    wordType: 'verb', communicationFunctions: ['question', 'direct'], frequency: 'essential', glpStage: 2, morphForms: { base: 'do', present: 'does', past: 'did', negative: "don't" } },
  { id: 'core-get',   text: 'get',   wordType: 'verb', communicationFunctions: ['request', 'narrate'], frequency: 'essential', glpStage: 2, morphForms: { base: 'get', present: 'gets', past: 'got' } },
  { id: 'core-see',   text: 'see',   wordType: 'verb', communicationFunctions: ['comment', 'request'], frequency: 'essential', glpStage: 2, arasaacId: 6573, morphForms: { base: 'see', present: 'sees', past: 'saw' } },
  { id: 'core-come',  text: 'come',  wordType: 'verb', communicationFunctions: ['request', 'direct'], frequency: 'essential', glpStage: 2, morphForms: { base: 'come', present: 'comes', past: 'came' } },
  { id: 'core-put',   text: 'put',   wordType: 'verb', communicationFunctions: ['direct', 'request'], frequency: 'high', glpStage: 3, morphForms: { base: 'put', present: 'puts', past: 'put' } },
  { id: 'core-make',  text: 'make',  wordType: 'verb', communicationFunctions: ['request', 'narrate'], frequency: 'high', glpStage: 3, morphForms: { base: 'make', present: 'makes', past: 'made' } },
  { id: 'core-play',  text: 'play',  wordType: 'verb', communicationFunctions: ['request', 'narrate'], frequency: 'high', glpStage: 2, arasaacId: 23392, morphForms: { base: 'play', present: 'plays', past: 'played' } },
  { id: 'core-eat',   text: 'eat',   wordType: 'verb', communicationFunctions: ['request'], frequency: 'high', glpStage: 2, arasaacId: 6456, morphForms: { base: 'eat', present: 'eats', past: 'ate' } },
  { id: 'core-drink', text: 'drink', wordType: 'verb', communicationFunctions: ['request'], frequency: 'high', glpStage: 2, arasaacId: 6061, morphForms: { base: 'drink', present: 'drinks', past: 'drank' } },
  { id: 'core-help',  text: 'help',  wordType: 'verb', communicationFunctions: ['request'], frequency: 'essential', glpStage: 2, arasaacId: 32648, morphForms: { base: 'help', present: 'helps', past: 'helped' } },
  { id: 'core-stop',  text: 'stop',  wordType: 'verb', communicationFunctions: ['reject', 'direct'], frequency: 'essential', glpStage: 2, arasaacId: 7196, morphForms: { base: 'stop', present: 'stops', past: 'stopped' } },
  { id: 'core-look',  text: 'look',  wordType: 'verb', communicationFunctions: ['direct', 'comment'], frequency: 'high', glpStage: 2, arasaacId: 6573, morphForms: { base: 'look', present: 'looks', past: 'looked' } },
  { id: 'core-think', text: 'think', wordType: 'verb', communicationFunctions: ['opinion', 'express'], frequency: 'high', glpStage: 3, morphForms: { base: 'think', present: 'thinks', past: 'thought' } },
  { id: 'core-know',  text: 'know',  wordType: 'verb', communicationFunctions: ['respond', 'express'], frequency: 'high', glpStage: 3, morphForms: { base: 'know', present: 'knows', past: 'knew', negative: "don't know" } },
  { id: 'core-feel',  text: 'feel',  wordType: 'verb', communicationFunctions: ['express'], frequency: 'high', glpStage: 3, morphForms: { base: 'feel', present: 'feels', past: 'felt' } },
  { id: 'core-can',   text: 'can',   wordType: 'verb', communicationFunctions: ['request', 'question'], frequency: 'essential', glpStage: 2, morphForms: { base: 'can', past: 'could', negative: "can't" } },
  { id: 'core-will',  text: 'will',  wordType: 'verb', communicationFunctions: ['narrate', 'request'], frequency: 'high', glpStage: 3, morphForms: { base: 'will', negative: "won't" } },
  { id: 'core-love',  text: 'love',  wordType: 'verb', communicationFunctions: ['express'], frequency: 'high', glpStage: 2, arasaacId: 37721, morphForms: { base: 'love', present: 'loves', past: 'loved' } },
];

export const CORE_ADJECTIVES: CoreWord[] = [
  { id: 'core-big',       text: 'big',       wordType: 'adjective', communicationFunctions: ['describe', 'comment'], frequency: 'essential', glpStage: 2, morphForms: { base: 'big', comparative: 'bigger', superlative: 'biggest' } },
  { id: 'core-little',    text: 'little',    wordType: 'adjective', communicationFunctions: ['describe', 'comment'], frequency: 'essential', glpStage: 2, morphForms: { base: 'little', comparative: 'littler', superlative: 'littlest' } },
  { id: 'core-good',      text: 'good',      wordType: 'adjective', communicationFunctions: ['describe', 'opinion', 'respond'], frequency: 'essential', glpStage: 2, arasaacId: 4581, morphForms: { base: 'good', comparative: 'better', superlative: 'best' } },
  { id: 'core-bad',       text: 'bad',       wordType: 'adjective', communicationFunctions: ['describe', 'express'], frequency: 'high', glpStage: 2, arasaacId: 35545, morphForms: { base: 'bad', comparative: 'worse', superlative: 'worst' } },
  { id: 'core-happy',     text: 'happy',     wordType: 'adjective', communicationFunctions: ['express', 'describe'], frequency: 'essential', glpStage: 2, arasaacId: 35533, morphForms: { base: 'happy', comparative: 'happier', superlative: 'happiest' } },
  { id: 'core-sad',       text: 'sad',       wordType: 'adjective', communicationFunctions: ['express', 'describe'], frequency: 'essential', glpStage: 2, arasaacId: 35545, morphForms: { base: 'sad', comparative: 'sadder', superlative: 'saddest' } },
  { id: 'core-hot',       text: 'hot',       wordType: 'adjective', communicationFunctions: ['describe', 'express'], frequency: 'high', glpStage: 2, arasaacId: 2300, morphForms: { base: 'hot', comparative: 'hotter', superlative: 'hottest' } },
  { id: 'core-cold',      text: 'cold',      wordType: 'adjective', communicationFunctions: ['describe', 'express'], frequency: 'high', glpStage: 2, arasaacId: 4652, morphForms: { base: 'cold', comparative: 'colder', superlative: 'coldest' } },
  { id: 'core-new',       text: 'new',       wordType: 'adjective', communicationFunctions: ['describe'], frequency: 'high', glpStage: 3, morphForms: { base: 'new', comparative: 'newer', superlative: 'newest' } },
  { id: 'core-old',       text: 'old',       wordType: 'adjective', communicationFunctions: ['describe'], frequency: 'high', glpStage: 3, morphForms: { base: 'old', comparative: 'older', superlative: 'oldest' } },
  { id: 'core-more',      text: 'more',      wordType: 'adjective', communicationFunctions: ['request'], frequency: 'essential', glpStage: 2, arasaacId: 5508, coreGridPosition: { row: 2, col: 0 } },
  { id: 'core-all',       text: 'all',       wordType: 'adjective', communicationFunctions: ['describe', 'request'], frequency: 'high', glpStage: 2 },
  { id: 'core-same',      text: 'same',      wordType: 'adjective', communicationFunctions: ['describe', 'comment'], frequency: 'medium', glpStage: 3 },
  { id: 'core-different',  text: 'different',  wordType: 'adjective', communicationFunctions: ['describe', 'comment'], frequency: 'medium', glpStage: 3 },
  { id: 'core-tired',     text: 'tired',     wordType: 'adjective', communicationFunctions: ['express'], frequency: 'high', glpStage: 2, arasaacId: 35537 },
  { id: 'core-hungry',    text: 'hungry',    wordType: 'adjective', communicationFunctions: ['express', 'request'], frequency: 'high', glpStage: 2 },
  { id: 'core-funny',     text: 'funny',     wordType: 'adjective', communicationFunctions: ['describe', 'joke'], frequency: 'high', glpStage: 2, arasaacId: 13354 },
  { id: 'core-silly',     text: 'silly',     wordType: 'adjective', communicationFunctions: ['describe', 'joke'], frequency: 'high', glpStage: 2 },
  { id: 'core-scary',     text: 'scary',     wordType: 'adjective', communicationFunctions: ['describe', 'express'], frequency: 'medium', glpStage: 3, arasaacId: 6916 },
  { id: 'core-cool',      text: 'cool',      wordType: 'adjective', communicationFunctions: ['describe', 'express', 'opinion'], frequency: 'high', glpStage: 2 },
];

export const CORE_ADVERBS: CoreWord[] = [
  { id: 'core-here',   text: 'here',   wordType: 'adverb', communicationFunctions: ['direct', 'comment'], frequency: 'essential', glpStage: 2, coreGridPosition: { row: 2, col: 1 } },
  { id: 'core-there',  text: 'there',  wordType: 'adverb', communicationFunctions: ['direct', 'comment'], frequency: 'essential', glpStage: 2, coreGridPosition: { row: 2, col: 2 } },
  { id: 'core-now',    text: 'now',    wordType: 'adverb', communicationFunctions: ['request', 'narrate'], frequency: 'essential', glpStage: 2 },
  { id: 'core-later',  text: 'later',  wordType: 'adverb', communicationFunctions: ['narrate', 'respond'], frequency: 'high', glpStage: 3 },
  { id: 'core-again',  text: 'again',  wordType: 'adverb', communicationFunctions: ['request'], frequency: 'essential', glpStage: 2 },
  { id: 'core-too',    text: 'too',    wordType: 'adverb', communicationFunctions: ['describe'], frequency: 'high', glpStage: 3 },
  { id: 'core-very',   text: 'very',   wordType: 'adverb', communicationFunctions: ['describe'], frequency: 'high', glpStage: 3 },
  { id: 'core-not',    text: 'not',    wordType: 'negation', communicationFunctions: ['reject', 'respond'], frequency: 'essential', glpStage: 2, coreGridPosition: { row: 2, col: 3 } },
  { id: 'core-maybe',  text: 'maybe',  wordType: 'adverb', communicationFunctions: ['respond', 'opinion'], frequency: 'high', glpStage: 3 },
  { id: 'core-please', text: 'please', wordType: 'adverb', communicationFunctions: ['request'], frequency: 'essential', glpStage: 2 },
];

export const CORE_PREPOSITIONS: CoreWord[] = [
  { id: 'core-in',   text: 'in',   wordType: 'preposition', communicationFunctions: ['describe', 'narrate'], frequency: 'essential', glpStage: 3 },
  { id: 'core-on',   text: 'on',   wordType: 'preposition', communicationFunctions: ['describe', 'narrate'], frequency: 'essential', glpStage: 3 },
  { id: 'core-to',   text: 'to',   wordType: 'preposition', communicationFunctions: ['narrate', 'request'], frequency: 'essential', glpStage: 2 },
  { id: 'core-with', text: 'with', wordType: 'preposition', communicationFunctions: ['describe', 'request'], frequency: 'essential', glpStage: 3 },
  { id: 'core-for',  text: 'for',  wordType: 'preposition', communicationFunctions: ['request', 'narrate'], frequency: 'high', glpStage: 3 },
  { id: 'core-up',   text: 'up',   wordType: 'preposition', communicationFunctions: ['direct', 'describe'], frequency: 'high', glpStage: 2 },
  { id: 'core-down', text: 'down', wordType: 'preposition', communicationFunctions: ['direct', 'describe'], frequency: 'high', glpStage: 2 },
  { id: 'core-out',  text: 'out',  wordType: 'preposition', communicationFunctions: ['direct', 'request'], frequency: 'high', glpStage: 2 },
  { id: 'core-off',  text: 'off',  wordType: 'preposition', communicationFunctions: ['direct', 'request'], frequency: 'high', glpStage: 2 },
];

export const CORE_QUESTIONS: CoreWord[] = [
  { id: 'core-what',  text: 'what',  wordType: 'question', communicationFunctions: ['question'], frequency: 'essential', glpStage: 2, coreGridPosition: { row: 3, col: 0 } },
  { id: 'core-where', text: 'where', wordType: 'question', communicationFunctions: ['question'], frequency: 'essential', glpStage: 2, coreGridPosition: { row: 3, col: 1 } },
  { id: 'core-who',   text: 'who',   wordType: 'question', communicationFunctions: ['question'], frequency: 'high', glpStage: 3, coreGridPosition: { row: 3, col: 2 } },
  { id: 'core-when',  text: 'when',  wordType: 'question', communicationFunctions: ['question'], frequency: 'high', glpStage: 3, coreGridPosition: { row: 3, col: 3 } },
  { id: 'core-why',   text: 'why',   wordType: 'question', communicationFunctions: ['question'], frequency: 'high', glpStage: 3 },
  { id: 'core-how',   text: 'how',   wordType: 'question', communicationFunctions: ['question'], frequency: 'high', glpStage: 3 },
];

export const CORE_CONJUNCTIONS: CoreWord[] = [
  { id: 'core-and',     text: 'and',     wordType: 'conjunction', communicationFunctions: ['narrate', 'describe'], frequency: 'essential', glpStage: 3 },
  { id: 'core-but',     text: 'but',     wordType: 'conjunction', communicationFunctions: ['narrate', 'opinion'], frequency: 'high', glpStage: 4 },
  { id: 'core-or',      text: 'or',      wordType: 'conjunction', communicationFunctions: ['question', 'narrate'], frequency: 'high', glpStage: 4 },
  { id: 'core-because', text: 'because', wordType: 'conjunction', communicationFunctions: ['narrate', 'express'], frequency: 'medium', glpStage: 4 },
  { id: 'core-then',    text: 'then',    wordType: 'conjunction', communicationFunctions: ['narrate'], frequency: 'high', glpStage: 3 },
];

export const CORE_SOCIAL: CoreWord[] = [
  { id: 'core-yes',      text: 'yes',       wordType: 'interjection', communicationFunctions: ['respond'], frequency: 'essential', glpStage: 1, arasaacId: 5584, coreGridPosition: { row: 4, col: 0 } },
  { id: 'core-no',       text: 'no',        wordType: 'interjection', communicationFunctions: ['respond', 'reject'], frequency: 'essential', glpStage: 1, arasaacId: 5526, coreGridPosition: { row: 4, col: 1 } },
  { id: 'core-hello',    text: 'hello',     wordType: 'social', communicationFunctions: ['greet'], frequency: 'essential', glpStage: 1, arasaacId: 6522, coreGridPosition: { row: 4, col: 2 } },
  { id: 'core-goodbye',  text: 'goodbye',   wordType: 'social', communicationFunctions: ['greet'], frequency: 'essential', glpStage: 1, coreGridPosition: { row: 4, col: 3 } },
  { id: 'core-thank-you', text: 'thank you', wordType: 'social', communicationFunctions: ['respond'], frequency: 'essential', glpStage: 2, arasaacId: 38783 },
  { id: 'core-sorry',    text: 'sorry',     wordType: 'social', communicationFunctions: ['express'], frequency: 'high', glpStage: 2 },
  { id: 'core-okay',     text: 'okay',      wordType: 'interjection', communicationFunctions: ['respond'], frequency: 'essential', glpStage: 1, arasaacId: 5584 },
  { id: 'core-wow',      text: 'wow',       wordType: 'interjection', communicationFunctions: ['express', 'comment'], frequency: 'high', glpStage: 1 },
  { id: 'core-uh-oh',    text: 'uh-oh',     wordType: 'interjection', communicationFunctions: ['comment', 'express'], frequency: 'high', glpStage: 1 },
  { id: 'core-yay',      text: 'yay',       wordType: 'interjection', communicationFunctions: ['express'], frequency: 'high', glpStage: 1 },
];

// =============================================================================
// Combined & Utility
// =============================================================================

/** All core vocabulary words combined */
export const ALL_CORE_WORDS: CoreWord[] = [
  ...CORE_PRONOUNS,
  ...CORE_VERBS,
  ...CORE_ADJECTIVES,
  ...CORE_ADVERBS,
  ...CORE_PREPOSITIONS,
  ...CORE_QUESTIONS,
  ...CORE_CONJUNCTIONS,
  ...CORE_SOCIAL,
];

/** Get core words filtered by word type */
export function getCoreWordsByType(wordType: WordType): CoreWord[] {
  return ALL_CORE_WORDS.filter(w => w.wordType === wordType);
}

/** Get core words that support a specific communication function */
export function getCoreWordsForFunction(fn: CommunicationFunction): CoreWord[] {
  return ALL_CORE_WORDS.filter(w => w.communicationFunctions.includes(fn));
}

/** Get core words for a GLP stage (includes all lower stages) */
export function getCoreWordsForGLPStage(stage: number): CoreWord[] {
  return ALL_CORE_WORDS.filter(w => w.glpStage <= stage);
}
