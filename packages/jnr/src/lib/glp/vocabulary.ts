/**
 * GLP Vocabulary Expansion
 *
 * Expands 8gent Jr vocabulary from ~200 core words to 500+ words organized by
 * Modified Fitzgerald Key categories with GLP stage assignments.
 *
 * Structure:
 * - 50 Supercore words (essential core vocabulary)
 * - 100 fringe vocabulary (child-specific interests, customizable per tenant)
 * - 100 gestalt phrases (whole chunks, Stage 1)
 * - 50 mitigable gestalts (templates with slots, Stage 2)
 * - 200+ extended vocabulary across all Fitzgerald categories
 */

import type { GLPStage } from './stages';

// =============================================================================
// Types
// =============================================================================

/** Modified Fitzgerald Key categories including gestalt types */
export type FitzgeraldCategory =
  | 'verb'
  | 'pronoun'
  | 'noun'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'determiner'
  | 'question'
  | 'negation'
  | 'interjection'
  | 'social'
  | 'gestalt'
  | 'mitigable';

/** A single vocabulary entry with display and clinical metadata */
export interface VocabEntry {
  /** Unique identifier */
  id: string;
  /** Display text */
  text: string;
  /** Fitzgerald Key category for color coding */
  category: FitzgeraldCategory;
  /** Minimum GLP stage where this word/phrase appears */
  glpStage: GLPStage;
  /** ARASAAC symbol ID (optional) */
  symbolId?: number;
  /** Spoken text if different from display text */
  spokenText?: string;
  /** For mitigable gestalts: the slot template */
  template?: string;
  /** For mitigable gestalts: suggested fill words */
  slotOptions?: string[];
  /** Tags for search/filtering */
  tags?: string[];
}

// =============================================================================
// 1. SUPERCORE 50 — Essential Core Words (Stage 3+)
// =============================================================================

export const SUPERCORE_50: VocabEntry[] = [
  // Pronouns (yellow)
  { id: 'sc-i',      text: 'I',     category: 'pronoun', glpStage: 3, symbolId: 6632 },
  { id: 'sc-you',    text: 'you',   category: 'pronoun', glpStage: 3, symbolId: 5598 },
  { id: 'sc-he',     text: 'he',    category: 'pronoun', glpStage: 4, symbolId: 9812 },
  { id: 'sc-she',    text: 'she',   category: 'pronoun', glpStage: 4, symbolId: 9813 },
  { id: 'sc-it',     text: 'it',    category: 'pronoun', glpStage: 3, symbolId: 9816 },
  { id: 'sc-we',     text: 'we',    category: 'pronoun', glpStage: 4, symbolId: 9818 },
  { id: 'sc-they',   text: 'they',  category: 'pronoun', glpStage: 5, symbolId: 9817 },
  { id: 'sc-my',     text: 'my',    category: 'pronoun', glpStage: 3, symbolId: 9810 },
  { id: 'sc-me',     text: 'me',    category: 'pronoun', glpStage: 3, symbolId: 9811 },

  // Verbs (green)
  { id: 'sc-want',   text: 'want',  category: 'verb', glpStage: 3, symbolId: 5441 },
  { id: 'sc-go',     text: 'go',    category: 'verb', glpStage: 3, symbolId: 7049 },
  { id: 'sc-stop',   text: 'stop',  category: 'verb', glpStage: 3, symbolId: 7196 },
  { id: 'sc-like',   text: 'like',  category: 'verb', glpStage: 3, symbolId: 5505 },
  { id: 'sc-help',   text: 'help',  category: 'verb', glpStage: 3, symbolId: 32648 },
  { id: 'sc-have',   text: 'have',  category: 'verb', glpStage: 3, symbolId: 5441 },
  { id: 'sc-is',     text: 'is',    category: 'verb', glpStage: 4, symbolId: 9816 },
  { id: 'sc-do',     text: 'do',    category: 'verb', glpStage: 3, symbolId: 7049 },
  { id: 'sc-make',   text: 'make',  category: 'verb', glpStage: 3, symbolId: 6997 },
  { id: 'sc-get',    text: 'get',   category: 'verb', glpStage: 3, symbolId: 5441 },
  { id: 'sc-put',    text: 'put',   category: 'verb', glpStage: 3, symbolId: 7049 },
  { id: 'sc-look',   text: 'look',  category: 'verb', glpStage: 3, symbolId: 6573 },
  { id: 'sc-see',    text: 'see',   category: 'verb', glpStage: 3, symbolId: 6573 },
  { id: 'sc-eat',    text: 'eat',   category: 'verb', glpStage: 3, symbolId: 6061 },
  { id: 'sc-play',   text: 'play',  category: 'verb', glpStage: 3, symbolId: 23392 },
  { id: 'sc-come',   text: 'come',  category: 'verb', glpStage: 3, symbolId: 7049 },
  { id: 'sc-give',   text: 'give',  category: 'verb', glpStage: 3, symbolId: 5441 },
  { id: 'sc-turn',   text: 'turn',  category: 'verb', glpStage: 3, symbolId: 7049 },
  { id: 'sc-open',   text: 'open',  category: 'verb', glpStage: 3, symbolId: 7049 },
  { id: 'sc-need',   text: 'need',  category: 'verb', glpStage: 3, symbolId: 32648 },
  { id: 'sc-feel',   text: 'feel',  category: 'verb', glpStage: 4, symbolId: 4581 },

  // Adjectives/Descriptors (pink)
  { id: 'sc-more',     text: 'more',     category: 'adjective', glpStage: 3, symbolId: 5508 },
  { id: 'sc-all-done', text: 'all done', category: 'adjective', glpStage: 3, symbolId: 32814 },
  { id: 'sc-big',      text: 'big',      category: 'adjective', glpStage: 3, symbolId: 2227 },
  { id: 'sc-little',   text: 'little',   category: 'adjective', glpStage: 3, symbolId: 2228 },
  { id: 'sc-good',     text: 'good',     category: 'adjective', glpStage: 3, symbolId: 5584 },
  { id: 'sc-bad',      text: 'bad',      category: 'adjective', glpStage: 3, symbolId: 5526 },

  // Social (teal)
  { id: 'sc-yes',    text: 'yes',    category: 'social', glpStage: 3, symbolId: 5584 },
  { id: 'sc-no',     text: 'no',     category: 'social', glpStage: 3, symbolId: 5526 },
  { id: 'sc-please', text: 'please', category: 'social', glpStage: 3, symbolId: 38783 },
  { id: 'sc-thanks', text: 'thanks', category: 'social', glpStage: 3, symbolId: 38783 },
  { id: 'sc-hi',     text: 'hi',     category: 'social', glpStage: 3, symbolId: 4570 },
  { id: 'sc-bye',    text: 'bye',    category: 'social', glpStage: 3, symbolId: 4571 },

  // Negation (red)
  { id: 'sc-not',    text: 'not',    category: 'negation', glpStage: 3, symbolId: 5526 },
  { id: 'sc-dont',   text: "don't",  category: 'negation', glpStage: 3, symbolId: 5526 },

  // Questions (purple)
  { id: 'sc-what',   text: 'what',   category: 'question', glpStage: 3, symbolId: 11295 },
  { id: 'sc-where',  text: 'where',  category: 'question', glpStage: 3, symbolId: 11295 },

  // Prepositions (blue)
  { id: 'sc-in',     text: 'in',     category: 'preposition', glpStage: 4, symbolId: 2227 },
  { id: 'sc-on',     text: 'on',     category: 'preposition', glpStage: 4, symbolId: 2227 },
  { id: 'sc-to',     text: 'to',     category: 'preposition', glpStage: 4, symbolId: 7049 },
  { id: 'sc-off',    text: 'off',    category: 'preposition', glpStage: 4, symbolId: 7049 },
];

// =============================================================================
// 2. FRINGE VOCABULARY — Child-Specific Interests (Stage 3+)
// =============================================================================

export const FRINGE_VOCABULARY: VocabEntry[] = [
  // Media
  { id: 'fr-youtube',   text: 'YouTube',   category: 'noun', glpStage: 3, tags: ['interest', 'media'] },
  { id: 'fr-video',     text: 'video',     category: 'noun', glpStage: 3, tags: ['interest', 'media'] },
  { id: 'fr-phone',     text: 'phone',     category: 'noun', glpStage: 3, tags: ['interest', 'media'] },
  { id: 'fr-tablet',    text: 'tablet',    category: 'noun', glpStage: 3, tags: ['interest', 'media'] },
  { id: 'fr-tv',        text: 'TV',        category: 'noun', glpStage: 3, tags: ['interest', 'media'] },

  // Shows
  { id: 'fr-bluey',     text: 'Bluey',     category: 'noun', glpStage: 3, tags: ['interest', 'show'] },

  // Play
  { id: 'fr-lego',      text: 'Lego',      category: 'noun', glpStage: 3, symbolId: 7182, tags: ['interest', 'play'] },
  { id: 'fr-build',     text: 'build',     category: 'verb', glpStage: 3, tags: ['interest', 'play'] },
  { id: 'fr-tower',     text: 'tower',     category: 'noun', glpStage: 3, tags: ['interest', 'play'] },
  { id: 'fr-ball',      text: 'ball',      category: 'noun', glpStage: 3, symbolId: 3241, tags: ['interest', 'play'] },
  { id: 'fr-book',      text: 'book',      category: 'noun', glpStage: 3, symbolId: 25191, tags: ['interest', 'play'] },

  // Sports
  { id: 'fr-football',  text: 'football',  category: 'noun', glpStage: 3, symbolId: 3241, tags: ['interest', 'sport'] },
  { id: 'fr-kick',      text: 'kick',      category: 'verb', glpStage: 3, tags: ['interest', 'sport'] },
  { id: 'fr-throw',     text: 'throw',     category: 'verb', glpStage: 3, tags: ['interest', 'sport'] },
  { id: 'fr-catch',     text: 'catch',     category: 'verb', glpStage: 3, tags: ['interest', 'sport'] },

  // Playground
  { id: 'fr-swing',     text: 'swing',     category: 'noun', glpStage: 3, symbolId: 4608, tags: ['interest', 'playground'] },
  { id: 'fr-slide',     text: 'slide',     category: 'noun', glpStage: 3, symbolId: 4692, tags: ['interest', 'playground'] },
  { id: 'fr-jump',      text: 'jump',      category: 'verb', glpStage: 3, symbolId: 39052, tags: ['interest', 'playground'] },
  { id: 'fr-climb',     text: 'climb',     category: 'verb', glpStage: 3, tags: ['interest', 'playground'] },
  { id: 'fr-run',       text: 'run',       category: 'verb', glpStage: 3, tags: ['interest', 'playground'] },

  // Music
  { id: 'fr-music',     text: 'music',     category: 'noun', glpStage: 3, tags: ['interest', 'music'] },
  { id: 'fr-drum',      text: 'drum',      category: 'noun', glpStage: 3, symbolId: 7046, tags: ['interest', 'music'] },
  { id: 'fr-song',      text: 'song',      category: 'noun', glpStage: 3, tags: ['interest', 'music'] },
  { id: 'fr-sing',      text: 'sing',      category: 'verb', glpStage: 3, tags: ['interest', 'music'] },
  { id: 'fr-dance',     text: 'dance',     category: 'verb', glpStage: 3, tags: ['interest', 'music'] },
  { id: 'fr-listen',    text: 'listen',    category: 'verb', glpStage: 3, symbolId: 5915, tags: ['interest', 'music'] },

  // Transport
  { id: 'fr-train',     text: 'train',     category: 'noun', glpStage: 3, symbolId: 2685, tags: ['interest', 'transport'] },
  { id: 'fr-car',       text: 'car',       category: 'noun', glpStage: 3, symbolId: 2339, tags: ['interest', 'transport'] },
  { id: 'fr-bus',       text: 'bus',       category: 'noun', glpStage: 3, tags: ['interest', 'transport'] },

  // Animals
  { id: 'fr-dog',       text: 'dog',       category: 'noun', glpStage: 3, tags: ['interest', 'animal'] },
  { id: 'fr-cat',       text: 'cat',       category: 'noun', glpStage: 3, tags: ['interest', 'animal'] },
  { id: 'fr-bird',      text: 'bird',      category: 'noun', glpStage: 3, tags: ['interest', 'animal'] },
  { id: 'fr-fish',      text: 'fish',      category: 'noun', glpStage: 3, tags: ['interest', 'animal'] },
  { id: 'fr-dinosaur',  text: 'dinosaur',  category: 'noun', glpStage: 3, tags: ['interest', 'animal'] },

  // Food & Drink
  { id: 'fr-toast',     text: 'toast',     category: 'noun', glpStage: 3, tags: ['food'] },
  { id: 'fr-chips',     text: 'chips',     category: 'noun', glpStage: 3, tags: ['food'] },
  { id: 'fr-banana',    text: 'banana',    category: 'noun', glpStage: 3, tags: ['food'] },
  { id: 'fr-apple',     text: 'apple',     category: 'noun', glpStage: 3, tags: ['food'] },
  { id: 'fr-biscuit',   text: 'biscuit',   category: 'noun', glpStage: 3, tags: ['food'] },
  { id: 'fr-pizza',     text: 'pizza',     category: 'noun', glpStage: 3, tags: ['food'] },
  { id: 'fr-water',     text: 'water',     category: 'noun', glpStage: 3, symbolId: 32464, tags: ['drink'] },
  { id: 'fr-juice',     text: 'juice',     category: 'noun', glpStage: 3, symbolId: 11461, tags: ['drink'] },
  { id: 'fr-milk',      text: 'milk',      category: 'noun', glpStage: 3, symbolId: 2445, tags: ['drink'] },

  // People (generic — tenant customizes these)
  { id: 'fr-daddy',     text: 'Daddy',     category: 'noun', glpStage: 3, tags: ['people'] },
  { id: 'fr-mammy',     text: 'Mammy',     category: 'noun', glpStage: 3, tags: ['people'] },
  { id: 'fr-teacher',   text: 'teacher',   category: 'noun', glpStage: 3, tags: ['people', 'school'] },
  { id: 'fr-friend',    text: 'friend',    category: 'noun', glpStage: 3, tags: ['people'] },

  // Places
  { id: 'fr-home',      text: 'home',      category: 'noun', glpStage: 3, tags: ['place'] },
  { id: 'fr-school',    text: 'school',    category: 'noun', glpStage: 3, tags: ['place'] },
  { id: 'fr-park',      text: 'park',      category: 'noun', glpStage: 3, tags: ['place'] },
  { id: 'fr-garden',    text: 'garden',    category: 'noun', glpStage: 3, tags: ['place'] },
  { id: 'fr-bathroom',  text: 'bathroom',  category: 'noun', glpStage: 3, tags: ['place'] },
  { id: 'fr-bedroom',   text: 'bedroom',   category: 'noun', glpStage: 3, tags: ['place'] },

  // Body
  { id: 'fr-head',      text: 'head',      category: 'noun', glpStage: 3, tags: ['body'] },
  { id: 'fr-hand',      text: 'hand',      category: 'noun', glpStage: 3, tags: ['body'] },
  { id: 'fr-tummy',     text: 'tummy',     category: 'noun', glpStage: 3, tags: ['body'] },

  // Clothes
  { id: 'fr-shoes',     text: 'shoes',     category: 'noun', glpStage: 3, tags: ['clothes'] },
  { id: 'fr-coat',      text: 'coat',      category: 'noun', glpStage: 3, tags: ['clothes'] },

  // Colours
  { id: 'fr-red',       text: 'red',       category: 'adjective', glpStage: 3, tags: ['colour'] },
  { id: 'fr-blue',      text: 'blue',      category: 'adjective', glpStage: 3, tags: ['colour'] },
  { id: 'fr-green',     text: 'green',     category: 'adjective', glpStage: 3, tags: ['colour'] },
  { id: 'fr-yellow',    text: 'yellow',    category: 'adjective', glpStage: 3, tags: ['colour'] },
  { id: 'fr-rainbow',   text: 'rainbow',   category: 'noun', glpStage: 3, tags: ['colour'] },

  // Regulation items
  { id: 'fr-blanket',   text: 'blanket',   category: 'noun', glpStage: 3, tags: ['regulation'] },
  { id: 'fr-teddy',     text: 'teddy',     category: 'noun', glpStage: 3, tags: ['regulation'] },
];

// =============================================================================
// 3. GESTALT PHRASES — Whole Chunks (Stage 1)
// =============================================================================

export const GESTALT_PHRASES: VocabEntry[] = [
  // Request gestalts
  { id: 'g-i-want-that',      text: 'I want that one',             category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-can-i-have',       text: 'Can I have some more please', category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-i-want-to-go',     text: 'I want to go',               category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-give-me',          text: 'Give me that',                category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-pick-me-up',       text: 'Pick me up',                  category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-i-want-to-play',   text: 'I want to play',             category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-i-want-to-watch',  text: 'I want to watch',            category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-help-me-please',   text: 'Help me please',             category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-open-it',          text: 'Open it',                    category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-do-it-again',      text: 'Do it again!',               category: 'gestalt', glpStage: 1, tags: ['request'] },

  // Rejection gestalts
  { id: 'g-i-dont-want-that', text: "I don't want that",          category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-no-thank-you',     text: 'No thank you',               category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-stop-it',          text: 'Stop it!',                   category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-leave-me-alone',   text: 'Leave me alone',             category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-not-now',          text: 'Not right now',              category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-dont-like-it',     text: "I don't like it",            category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-go-away',          text: 'Go away',                    category: 'gestalt', glpStage: 1, tags: ['rejection'] },

  // Social gestalts
  { id: 'g-hello',            text: 'Hello!',                     category: 'gestalt', glpStage: 1, tags: ['social'] },
  { id: 'g-goodbye',          text: 'Goodbye!',                   category: 'gestalt', glpStage: 1, tags: ['social'] },
  { id: 'g-see-you-later',    text: 'See you later!',             category: 'gestalt', glpStage: 1, tags: ['social'] },
  { id: 'g-how-are-you',      text: 'How are you?',               category: 'gestalt', glpStage: 1, tags: ['social'] },
  { id: 'g-im-fine',          text: "I'm fine!",                  category: 'gestalt', glpStage: 1, tags: ['social'] },
  { id: 'g-thank-you',        text: 'Thank you very much',        category: 'gestalt', glpStage: 1, tags: ['social'] },
  { id: 'g-good-morning',     text: 'Good morning!',              category: 'gestalt', glpStage: 1, tags: ['social', 'morning'] },
  { id: 'g-good-night',       text: 'Good night!',                category: 'gestalt', glpStage: 1, tags: ['social', 'evening'] },

  // Activity gestalts
  { id: 'g-lets-go',          text: "Let's go!",                  category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-lets-go-park',     text: "Let's go to the park",       category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-lets-play',        text: "Let's play!",                category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-come-on',          text: "Come on!",                   category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-ready-set-go',     text: "Ready, set, go!",            category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-my-turn',          text: "My turn!",                   category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-your-turn',        text: "Your turn!",                 category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-watch-this',       text: "Watch this!",                category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-look-at-that',     text: "Look at that!",              category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-i-did-it',         text: "I did it!",                  category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-play-with-me',     text: "Play with me!",              category: 'gestalt', glpStage: 1, tags: ['activity'] },
  { id: 'g-one-more-time',    text: "One more time!",             category: 'gestalt', glpStage: 1, tags: ['activity'] },

  // Emotional gestalts
  { id: 'g-im-happy',         text: "I'm happy!",                 category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-im-sad',           text: "I'm sad",                    category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-im-angry',         text: "I'm angry!",                 category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-im-scared',        text: "I'm scared",                 category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-im-tired',         text: "I'm tired",                  category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-i-love-you',       text: "I love you",                 category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-thats-funny',      text: "That's funny!",              category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-uh-oh',            text: "Uh oh!",                     category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-oh-no',            text: "Oh no!",                     category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-yay',              text: "Yay!",                       category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-wow',              text: "Wow!",                       category: 'gestalt', glpStage: 1, tags: ['feeling'] },

  // Routine gestalts
  { id: 'g-its-time-for',     text: "It's time for",              category: 'gestalt', glpStage: 1, tags: ['routine'] },
  { id: 'g-whats-next',       text: "What's next?",               category: 'gestalt', glpStage: 1, tags: ['routine'] },
  { id: 'g-are-we-there',     text: "Are we there yet?",          category: 'gestalt', glpStage: 1, tags: ['routine'] },
  { id: 'g-wait-for-me',      text: "Wait for me!",               category: 'gestalt', glpStage: 1, tags: ['routine'] },
  { id: 'g-all-done',         text: "All done!",                  category: 'gestalt', glpStage: 1, tags: ['routine'] },
  { id: 'g-finished',         text: "Finished!",                  category: 'gestalt', glpStage: 1, tags: ['routine'] },
  { id: 'g-bath-time',        text: "Bath time!",                 category: 'gestalt', glpStage: 1, tags: ['routine'] },

  // Music / Song gestalts
  { id: 'g-abc-song',         text: "A B C D E F G",              category: 'gestalt', glpStage: 1, tags: ['music', 'song'] },
  { id: 'g-wheels-on-bus',    text: "The wheels on the bus go round and round", category: 'gestalt', glpStage: 1, tags: ['music', 'song'] },
  { id: 'g-twinkle',          text: "Twinkle twinkle little star", category: 'gestalt', glpStage: 1, tags: ['music', 'song'] },
  { id: 'g-row-boat',         text: "Row row row your boat",      category: 'gestalt', glpStage: 1, tags: ['music', 'song'] },
  { id: 'g-head-shoulders',   text: "Head shoulders knees and toes", category: 'gestalt', glpStage: 1, tags: ['music', 'song'] },
  { id: 'g-if-youre-happy',   text: "If you're happy and you know it", category: 'gestalt', glpStage: 1, tags: ['music', 'song'] },
  { id: 'g-old-macdonald',    text: "Old MacDonald had a farm",   category: 'gestalt', glpStage: 1, tags: ['music', 'song'] },

  // Safety gestalts
  { id: 'g-i-need-help',      text: "I need help!",               category: 'gestalt', glpStage: 1, tags: ['safety'] },
  { id: 'g-i-dont-know',      text: "I don't know",               category: 'gestalt', glpStage: 1, tags: ['safety'] },
  { id: 'g-it-hurts',         text: "It hurts!",                  category: 'gestalt', glpStage: 1, tags: ['safety'] },
  { id: 'g-i-need-toilet',    text: "I need the toilet",          category: 'gestalt', glpStage: 1, tags: ['safety'] },
  { id: 'g-tummy-sore',       text: "My tummy is sore",           category: 'gestalt', glpStage: 1, tags: ['safety'] },
  { id: 'g-too-loud',         text: "It's too loud!",             category: 'gestalt', glpStage: 1, tags: ['safety', 'regulation'] },
  { id: 'g-need-break',       text: "I need a break",             category: 'gestalt', glpStage: 1, tags: ['safety', 'regulation'] },

  // Additional gestalts
  { id: 'g-want-cuddle',      text: "I want a cuddle",            category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-thats-mine',       text: "That's mine!",               category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-no-more',          text: "No more!",                   category: 'gestalt', glpStage: 1, tags: ['rejection'] },
  { id: 'g-where-going',      text: "Where are we going?",        category: 'gestalt', glpStage: 1, tags: ['routine'] },
  { id: 'g-want-go-home',     text: "I want to go home",          category: 'gestalt', glpStage: 1, tags: ['request'] },
  { id: 'g-cant-do-it',       text: "I can't do it!",             category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-im-ok',            text: "I'm OK",                     category: 'gestalt', glpStage: 1, tags: ['social'] },
  { id: 'g-i-love-that',      text: "I love that!",               category: 'gestalt', glpStage: 1, tags: ['feeling'] },
  { id: 'g-high-five',        text: "High five!",                 category: 'gestalt', glpStage: 1, tags: ['social'] },
];

// =============================================================================
// 4. MITIGABLE GESTALTS — Templates with Slots (Stage 2)
// =============================================================================

export const MITIGABLE_GESTALTS: VocabEntry[] = [
  { id: 'm-i-want',          text: 'I want ___',           category: 'mitigable', glpStage: 2, template: 'I want {thing}', slotOptions: ['more', 'that', 'to go', 'to play', 'to watch', 'to eat', 'to drink', 'juice', 'water'] },
  { id: 'm-i-want-to-go',    text: 'I want to go ___',     category: 'mitigable', glpStage: 2, template: 'I want to go {place}', slotOptions: ['home', 'outside', 'to the park', 'to school', 'upstairs', 'downstairs'] },
  { id: 'm-i-want-to-play',  text: 'I want to play ___',   category: 'mitigable', glpStage: 2, template: 'I want to play {activity}', slotOptions: ['Lego', 'football', 'drums', 'with the ball', 'on the swing', 'on the slide'] },
  { id: 'm-i-want-to-watch', text: 'I want to watch ___',  category: 'mitigable', glpStage: 2, template: 'I want to watch {show}', slotOptions: ['Bluey', 'YouTube', 'TV'] },
  { id: 'm-i-want-to-eat',   text: 'I want to eat ___',    category: 'mitigable', glpStage: 2, template: 'I want to eat {food}', slotOptions: ['toast', 'chips', 'banana', 'apple', 'biscuit', 'pizza'] },
  { id: 'm-i-want-to-drink', text: 'I want to drink ___',  category: 'mitigable', glpStage: 2, template: 'I want to drink {drink}', slotOptions: ['water', 'juice', 'milk'] },
  { id: 'm-lets-go',         text: "Let's go ___",          category: 'mitigable', glpStage: 2, template: "Let's go {place}", slotOptions: ['home', 'outside', 'to the park', 'to school', 'to the garden'] },
  { id: 'm-lets-play',       text: "Let's play ___",        category: 'mitigable', glpStage: 2, template: "Let's play {activity}", slotOptions: ['Lego', 'football', 'drums', 'with the ball', 'a game', 'hide and seek'] },
  { id: 'm-can-i-have',      text: 'Can I have ___',        category: 'mitigable', glpStage: 2, template: 'Can I have {thing}', slotOptions: ['more', 'that', 'some water', 'some juice', 'a biscuit', 'a hug', 'a turn'] },
  { id: 'm-i-like',          text: 'I like ___',            category: 'mitigable', glpStage: 2, template: 'I like {thing}', slotOptions: ['that', 'this', 'it', 'Bluey', 'music', 'Lego', 'football'] },
  { id: 'm-i-dont-like',     text: "I don't like ___",      category: 'mitigable', glpStage: 2, template: "I don't like {thing}", slotOptions: ['that', 'this', 'it', 'the noise', 'waiting'] },
  { id: 'm-i-feel',          text: 'I feel ___',            category: 'mitigable', glpStage: 2, template: 'I feel {feeling}', slotOptions: ['happy', 'sad', 'angry', 'scared', 'tired', 'hungry', 'good', 'excited'] },
  { id: 'm-im',              text: "I'm ___",               category: 'mitigable', glpStage: 2, template: "I'm {state}", slotOptions: ['happy', 'sad', 'tired', 'hungry', 'cold', 'hot', 'fine', 'ready', 'done'] },
  { id: 'm-time-for',        text: "It's time for ___",     category: 'mitigable', glpStage: 2, template: "It's time for {activity}", slotOptions: ['school', 'bed', 'food', 'bath', 'play', 'home', 'a break'] },
  { id: 'm-where-is',        text: 'Where is ___?',         category: 'mitigable', glpStage: 2, template: 'Where is {thing}?', slotOptions: ['Daddy', 'Mammy', 'my phone', 'my ball'] },
  { id: 'm-look-at',         text: 'Look at ___',           category: 'mitigable', glpStage: 2, template: 'Look at {thing}', slotOptions: ['this', 'that', 'me', 'the dog', 'the bird'] },
  { id: 'm-put-it',          text: 'Put it ___',            category: 'mitigable', glpStage: 2, template: 'Put it {place}', slotOptions: ['here', 'there', 'on', 'in', 'down', 'back', 'away'] },
  { id: 'm-give-me',         text: 'Give me ___',           category: 'mitigable', glpStage: 2, template: 'Give me {thing}', slotOptions: ['that', 'more', 'the ball', 'a hug'] },
  { id: 'm-i-see',           text: 'I see ___',             category: 'mitigable', glpStage: 2, template: 'I see {thing}', slotOptions: ['a dog', 'a cat', 'a bird', 'a train', 'Daddy', 'Mammy'] },
  { id: 'm-i-dont-want',     text: "I don't want ___",      category: 'mitigable', glpStage: 2, template: "I don't want {thing}", slotOptions: ['that', 'this', 'to go', 'to eat', 'to sleep'] },
  { id: 'm-what-is',         text: 'What is ___?',          category: 'mitigable', glpStage: 2, template: 'What is {thing}?', slotOptions: ['this', 'that', 'it', 'for dinner'] },
  { id: 'm-turn-on',         text: 'Turn on ___',           category: 'mitigable', glpStage: 2, template: 'Turn on {thing}', slotOptions: ['the light', 'the TV', 'the music', 'YouTube'] },
  { id: 'm-turn-off',        text: 'Turn off ___',          category: 'mitigable', glpStage: 2, template: 'Turn off {thing}', slotOptions: ['the light', 'the TV', 'the music', 'the noise'] },
  { id: 'm-too',             text: "It's too ___",          category: 'mitigable', glpStage: 2, template: "It's too {state}", slotOptions: ['loud', 'bright', 'hot', 'cold', 'fast', 'slow'] },
  { id: 'm-i-need',          text: 'I need ___',            category: 'mitigable', glpStage: 2, template: 'I need {thing}', slotOptions: ['help', 'a break', 'the toilet', 'a hug', 'water', 'my blanket', 'quiet'] },
  { id: 'm-help-me-with',    text: 'Help me with ___',      category: 'mitigable', glpStage: 2, template: 'Help me with {thing}', slotOptions: ['this', 'that', 'my shoes', 'my coat'] },
  { id: 'm-i-love',          text: 'I love ___',            category: 'mitigable', glpStage: 2, template: 'I love {thing}', slotOptions: ['you', 'Daddy', 'Mammy', 'music', 'it', 'this'] },
  { id: 'm-can-we',          text: 'Can we ___?',           category: 'mitigable', glpStage: 2, template: 'Can we {action}?', slotOptions: ['go', 'play', 'watch', 'eat', 'sing', 'dance', 'read'] },
  { id: 'm-go-to-the',       text: 'Go to the ___',         category: 'mitigable', glpStage: 2, template: 'Go to the {place}', slotOptions: ['bathroom', 'bedroom', 'kitchen', 'garden', 'park'] },
  { id: 'm-open-the',        text: 'Open the ___',          category: 'mitigable', glpStage: 2, template: 'Open the {thing}', slotOptions: ['door', 'box', 'bag', 'book', 'window'] },
];

// =============================================================================
// 5. EXTENDED VOCABULARY (Stage 3-6)
// =============================================================================

export const EXTENDED_VOCABULARY: VocabEntry[] = [
  // Verbs (green)
  { id: 'ev-sit',      text: 'sit',      category: 'verb', glpStage: 3 },
  { id: 'ev-stand',    text: 'stand',    category: 'verb', glpStage: 3 },
  { id: 'ev-walk',     text: 'walk',     category: 'verb', glpStage: 3 },
  { id: 'ev-push',     text: 'push',     category: 'verb', glpStage: 3 },
  { id: 'ev-pull',     text: 'pull',     category: 'verb', glpStage: 3 },
  { id: 'ev-wash',     text: 'wash',     category: 'verb', glpStage: 3 },
  { id: 'ev-sleep',    text: 'sleep',    category: 'verb', glpStage: 3 },
  { id: 'ev-drink',    text: 'drink',    category: 'verb', glpStage: 3 },
  { id: 'ev-wait',     text: 'wait',     category: 'verb', glpStage: 3 },
  { id: 'ev-read',     text: 'read',     category: 'verb', glpStage: 3 },
  { id: 'ev-draw',     text: 'draw',     category: 'verb', glpStage: 3 },
  { id: 'ev-show',     text: 'show',     category: 'verb', glpStage: 3 },
  { id: 'ev-take',     text: 'take',     category: 'verb', glpStage: 3 },
  { id: 'ev-move',     text: 'move',     category: 'verb', glpStage: 3 },
  { id: 'ev-close',    text: 'close',    category: 'verb', glpStage: 3 },
  { id: 'ev-hide',     text: 'hide',     category: 'verb', glpStage: 3 },
  { id: 'ev-find',     text: 'find',     category: 'verb', glpStage: 3 },
  { id: 'ev-hug',      text: 'hug',      category: 'verb', glpStage: 3 },
  { id: 'ev-cry',      text: 'cry',      category: 'verb', glpStage: 3 },
  { id: 'ev-laugh',    text: 'laugh',    category: 'verb', glpStage: 3 },
  { id: 'ev-smile',    text: 'smile',    category: 'verb', glpStage: 3 },
  { id: 'ev-fall',     text: 'fall',     category: 'verb', glpStage: 3 },
  { id: 'ev-count',    text: 'count',    category: 'verb', glpStage: 3 },
  { id: 'ev-touch',    text: 'touch',    category: 'verb', glpStage: 3 },
  { id: 'ev-hear',     text: 'hear',     category: 'verb', glpStage: 3, symbolId: 5915 },
  { id: 'ev-finish',   text: 'finish',   category: 'verb', glpStage: 3, symbolId: 32814 },
  { id: 'ev-write',    text: 'write',    category: 'verb', glpStage: 4 },
  { id: 'ev-try',      text: 'try',      category: 'verb', glpStage: 4 },
  { id: 'ev-know',     text: 'know',     category: 'verb', glpStage: 4 },
  { id: 'ev-say',      text: 'say',      category: 'verb', glpStage: 4 },
  { id: 'ev-tell',     text: 'tell',     category: 'verb', glpStage: 4 },
  { id: 'ev-bring',    text: 'bring',    category: 'verb', glpStage: 4 },
  { id: 'ev-share',    text: 'share',    category: 'verb', glpStage: 4 },
  { id: 'ev-break',    text: 'break',    category: 'verb', glpStage: 4 },
  { id: 'ev-fix',      text: 'fix',      category: 'verb', glpStage: 4 },
  { id: 'ev-use',      text: 'use',      category: 'verb', glpStage: 4 },
  { id: 'ev-change',   text: 'change',   category: 'verb', glpStage: 4 },
  { id: 'ev-start',    text: 'start',    category: 'verb', glpStage: 4 },
  { id: 'ev-choose',   text: 'choose',   category: 'verb', glpStage: 4 },
  { id: 'ev-think',    text: 'think',    category: 'verb', glpStage: 5 },
  { id: 'ev-remember', text: 'remember', category: 'verb', glpStage: 5 },

  // Adjectives (pink)
  { id: 'ev-happy',    text: 'happy',    category: 'adjective', glpStage: 3 },
  { id: 'ev-sad',      text: 'sad',      category: 'adjective', glpStage: 3 },
  { id: 'ev-angry',    text: 'angry',    category: 'adjective', glpStage: 3 },
  { id: 'ev-scared',   text: 'scared',   category: 'adjective', glpStage: 3 },
  { id: 'ev-tired',    text: 'tired',    category: 'adjective', glpStage: 3 },
  { id: 'ev-hungry',   text: 'hungry',   category: 'adjective', glpStage: 3 },
  { id: 'ev-hot',      text: 'hot',      category: 'adjective', glpStage: 3 },
  { id: 'ev-cold',     text: 'cold',     category: 'adjective', glpStage: 3, symbolId: 4652 },
  { id: 'ev-fast',     text: 'fast',     category: 'adjective', glpStage: 3 },
  { id: 'ev-slow',     text: 'slow',     category: 'adjective', glpStage: 3 },
  { id: 'ev-loud',     text: 'loud',     category: 'adjective', glpStage: 3 },
  { id: 'ev-quiet',    text: 'quiet',    category: 'adjective', glpStage: 3 },
  { id: 'ev-clean',    text: 'clean',    category: 'adjective', glpStage: 3 },
  { id: 'ev-dirty',    text: 'dirty',    category: 'adjective', glpStage: 3 },
  { id: 'ev-wet',      text: 'wet',      category: 'adjective', glpStage: 3 },
  { id: 'ev-dry',      text: 'dry',      category: 'adjective', glpStage: 3 },
  { id: 'ev-funny',    text: 'funny',    category: 'adjective', glpStage: 3 },
  { id: 'ev-silly',    text: 'silly',    category: 'adjective', glpStage: 3 },
  { id: 'ev-nice',     text: 'nice',     category: 'adjective', glpStage: 3 },
  { id: 'ev-yummy',    text: 'yummy',    category: 'adjective', glpStage: 3 },
  { id: 'ev-broken',   text: 'broken',   category: 'adjective', glpStage: 3 },
  { id: 'ev-ready',    text: 'ready',    category: 'adjective', glpStage: 3 },
  { id: 'ev-new',      text: 'new',      category: 'adjective', glpStage: 4 },
  { id: 'ev-same',     text: 'same',     category: 'adjective', glpStage: 4 },
  { id: 'ev-different', text: 'different', category: 'adjective', glpStage: 4 },

  // Adverbs (pink)
  { id: 'ev-now',      text: 'now',      category: 'adverb', glpStage: 3 },
  { id: 'ev-later',    text: 'later',    category: 'adverb', glpStage: 3 },
  { id: 'ev-here',     text: 'here',     category: 'adverb', glpStage: 3 },
  { id: 'ev-there',    text: 'there',    category: 'adverb', glpStage: 3 },
  { id: 'ev-up',       text: 'up',       category: 'adverb', glpStage: 3 },
  { id: 'ev-down',     text: 'down',     category: 'adverb', glpStage: 3 },
  { id: 'ev-again',    text: 'again',    category: 'adverb', glpStage: 3 },
  { id: 'ev-away',     text: 'away',     category: 'adverb', glpStage: 3 },
  { id: 'ev-together', text: 'together', category: 'adverb', glpStage: 4 },
  { id: 'ev-first',    text: 'first',    category: 'adverb', glpStage: 4 },
  { id: 'ev-then',     text: 'then',     category: 'adverb', glpStage: 4 },
  { id: 'ev-very',     text: 'very',     category: 'adverb', glpStage: 4 },
  { id: 'ev-maybe',    text: 'maybe',    category: 'adverb', glpStage: 4 },
  { id: 'ev-always',   text: 'always',   category: 'adverb', glpStage: 5 },
  { id: 'ev-never',    text: 'never',    category: 'adverb', glpStage: 5 },

  // Questions (purple)
  { id: 'ev-who',      text: 'who',      category: 'question', glpStage: 4 },
  { id: 'ev-when',     text: 'when',     category: 'question', glpStage: 4 },
  { id: 'ev-why',      text: 'why',      category: 'question', glpStage: 4 },
  { id: 'ev-how',      text: 'how',      category: 'question', glpStage: 4 },
  { id: 'ev-how-many', text: 'how many', category: 'question', glpStage: 5 },
  { id: 'ev-which',    text: 'which',    category: 'question', glpStage: 5 },

  // Prepositions (blue)
  { id: 'ev-with',     text: 'with',     category: 'preposition', glpStage: 4 },
  { id: 'ev-for',      text: 'for',      category: 'preposition', glpStage: 4 },
  { id: 'ev-from',     text: 'from',     category: 'preposition', glpStage: 4 },
  { id: 'ev-at',       text: 'at',       category: 'preposition', glpStage: 4 },
  { id: 'ev-under',    text: 'under',    category: 'preposition', glpStage: 4 },
  { id: 'ev-over',     text: 'over',     category: 'preposition', glpStage: 4 },
  { id: 'ev-behind',   text: 'behind',   category: 'preposition', glpStage: 4 },
  { id: 'ev-next-to',  text: 'next to',  category: 'preposition', glpStage: 4 },
  { id: 'ev-between',  text: 'between',  category: 'preposition', glpStage: 5 },

  // Conjunctions (white)
  { id: 'ev-and',      text: 'and',      category: 'conjunction', glpStage: 4 },
  { id: 'ev-but',      text: 'but',      category: 'conjunction', glpStage: 5 },
  { id: 'ev-or',       text: 'or',       category: 'conjunction', glpStage: 4 },
  { id: 'ev-because',  text: 'because',  category: 'conjunction', glpStage: 5 },
  { id: 'ev-so',       text: 'so',       category: 'conjunction', glpStage: 5 },
  { id: 'ev-if',       text: 'if',       category: 'conjunction', glpStage: 5 },
  { id: 'ev-before',   text: 'before',   category: 'conjunction', glpStage: 5 },
  { id: 'ev-after',    text: 'after',    category: 'conjunction', glpStage: 5 },

  // Determiners (white)
  { id: 'ev-the',      text: 'the',      category: 'determiner', glpStage: 4 },
  { id: 'ev-a',        text: 'a',        category: 'determiner', glpStage: 4 },
  { id: 'ev-this',     text: 'this',     category: 'determiner', glpStage: 3 },
  { id: 'ev-that',     text: 'that',     category: 'determiner', glpStage: 3 },
  { id: 'ev-some',     text: 'some',     category: 'determiner', glpStage: 4 },
  { id: 'ev-all',      text: 'all',      category: 'determiner', glpStage: 4 },
  { id: 'ev-another',  text: 'another',  category: 'determiner', glpStage: 4 },
  { id: 'ev-your',     text: 'your',     category: 'determiner', glpStage: 4 },

  // Negation (red)
  { id: 'ev-cant',     text: "can't",    category: 'negation', glpStage: 3 },
  { id: 'ev-wont',     text: "won't",    category: 'negation', glpStage: 4 },
  { id: 'ev-didnt',    text: "didn't",   category: 'negation', glpStage: 5 },
  { id: 'ev-isnt',     text: "isn't",    category: 'negation', glpStage: 5 },
  { id: 'ev-nothing',  text: 'nothing',  category: 'negation', glpStage: 5 },

  // Interjections (red)
  { id: 'ev-oops',     text: 'oops',     category: 'interjection', glpStage: 3 },
  { id: 'ev-wow-ext',  text: 'wow',      category: 'interjection', glpStage: 3 },
  { id: 'ev-yay-ext',  text: 'yay',      category: 'interjection', glpStage: 3 },
  { id: 'ev-uh-oh',    text: 'uh oh',    category: 'interjection', glpStage: 3 },
  { id: 'ev-oh-no',    text: 'oh no',    category: 'interjection', glpStage: 3 },
  { id: 'ev-shh',      text: 'shh',      category: 'interjection', glpStage: 3 },

  // Social (teal)
  { id: 'ev-sorry',       text: 'sorry',       category: 'social', glpStage: 3 },
  { id: 'ev-well-done',   text: 'well done',   category: 'social', glpStage: 3 },
  { id: 'ev-good-job',    text: 'good job',    category: 'social', glpStage: 3 },
  { id: 'ev-good-morning', text: 'good morning', category: 'social', glpStage: 3 },
  { id: 'ev-good-night',  text: 'good night',  category: 'social', glpStage: 3 },
  { id: 'ev-see-you',     text: 'see you later', category: 'social', glpStage: 3 },
  { id: 'ev-excuse-me',   text: 'excuse me',   category: 'social', glpStage: 4 },
  { id: 'ev-my-name',     text: 'my name is',  category: 'social', glpStage: 4 },

  // Nouns — additional (orange)
  { id: 'ev-door',     text: 'door',     category: 'noun', glpStage: 3 },
  { id: 'ev-window',   text: 'window',   category: 'noun', glpStage: 3 },
  { id: 'ev-table',    text: 'table',    category: 'noun', glpStage: 3 },
  { id: 'ev-chair',    text: 'chair',    category: 'noun', glpStage: 3 },
  { id: 'ev-bed',      text: 'bed',      category: 'noun', glpStage: 3 },
  { id: 'ev-bath',     text: 'bath',     category: 'noun', glpStage: 3, symbolId: 2272 },
  { id: 'ev-box',      text: 'box',      category: 'noun', glpStage: 3 },
  { id: 'ev-game',     text: 'game',     category: 'noun', glpStage: 3 },
  { id: 'ev-toy',      text: 'toy',      category: 'noun', glpStage: 3 },
  { id: 'ev-rain',     text: 'rain',     category: 'noun', glpStage: 3 },
  { id: 'ev-sun',      text: 'sun',      category: 'noun', glpStage: 3 },
  { id: 'ev-star',     text: 'star',     category: 'noun', glpStage: 3 },
  { id: 'ev-tree',     text: 'tree',     category: 'noun', glpStage: 3 },
  { id: 'ev-bubble',   text: 'bubble',   category: 'noun', glpStage: 3 },

  // Pronoun extras (yellow)
  { id: 'ev-him',        text: 'him',        category: 'pronoun', glpStage: 5 },
  { id: 'ev-her-pron',   text: 'her',        category: 'pronoun', glpStage: 5 },
  { id: 'ev-us',         text: 'us',         category: 'pronoun', glpStage: 5 },
  { id: 'ev-them',       text: 'them',       category: 'pronoun', glpStage: 5 },
  { id: 'ev-something',  text: 'something',  category: 'pronoun', glpStage: 4 },
  { id: 'ev-everyone',   text: 'everyone',   category: 'pronoun', glpStage: 5 },
];

// =============================================================================
// Aggregate & Helpers
// =============================================================================

/** All vocabulary entries combined */
export const ALL_VOCABULARY: VocabEntry[] = [
  ...SUPERCORE_50,
  ...FRINGE_VOCABULARY,
  ...GESTALT_PHRASES,
  ...MITIGABLE_GESTALTS,
  ...EXTENDED_VOCABULARY,
];

/** Get vocabulary filtered by maximum GLP stage */
export function getVocabularyForStage(stage: GLPStage): VocabEntry[] {
  return ALL_VOCABULARY.filter(v => v.glpStage <= stage);
}

/** Get vocabulary by Fitzgerald category */
export function getVocabularyByCategory(category: FitzgeraldCategory): VocabEntry[] {
  return ALL_VOCABULARY.filter(v => v.category === category);
}

/** Get only gestalt phrases */
export function getGestalts(): VocabEntry[] {
  return ALL_VOCABULARY.filter(v => v.category === 'gestalt');
}

/** Get only mitigable gestalts */
export function getMitigableGestalts(): VocabEntry[] {
  return ALL_VOCABULARY.filter(v => v.category === 'mitigable');
}

/** Get core words (non-gestalt, non-mitigable) */
export function getCoreWords(): VocabEntry[] {
  return ALL_VOCABULARY.filter(v => v.category !== 'gestalt' && v.category !== 'mitigable');
}

/** Get vocabulary by tags */
export function getVocabularyByTag(tag: string): VocabEntry[] {
  return ALL_VOCABULARY.filter(v => v.tags?.includes(tag));
}

/** Resolve ARASAAC symbol URL from ID */
export function getArasaacUrl(symbolId: number): string {
  return `https://static.arasaac.org/pictograms/${symbolId}/${symbolId}_500.png`;
}

/** Total vocabulary count */
export const VOCABULARY_COUNT = ALL_VOCABULARY.length;
