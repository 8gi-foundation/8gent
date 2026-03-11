/**
 * @fileoverview Pre-built AAC Card Library
 *
 * This module provides a pre-built library of AAC cards following the
 * ARASAAC (Aragonese Portal of Augmentative and Alternative Communication)
 * visual style and the Fitzgerald Key color coding system.
 *
 * The library includes:
 * - 18 categories following Fitzgerald Key standards
 * - Starter cards for each category
 * - GLP (Gestalt Language Processing) stage tagging
 * - Consistent visual styling
 *
 * Cards use ARASAAC pictograms from static.arasaac.org (free, open-source AAC symbols)
 *
 * @module lib/aac/cardLibrary
 */

import type { AACCard, AACCategoryId, GLPStage } from '@/types/aac';

/**
 * ARASAAC pictogram ID mapping
 * Source: https://arasaac.org/pictograms/search
 * Format: https://static.arasaac.org/pictograms/{id}/{id}_500.png
 */
const ARASAAC_IDS: Record<string, number> = {
  // People
  i: 6964,
  you: 6608,
  he: 6619,
  she: 6620,
  we: 6609,
  they: 6618,
  mom: 2445,
  dad: 2446,
  teacher: 4807,
  friend: 7002,

  // Actions
  want: 6540,
  go: 2387,
  stop: 5007,
  help: 2550,
  eat: 2397,
  drink: 2396,
  play: 2457,
  read: 2485,
  sleep: 2398,
  give: 2400,
  take: 6525,
  look: 2449,

  // Feelings
  happy: 2359,
  sad: 2501,
  angry: 2502,
  scared: 2505,
  tired: 2504,
  hungry: 2360,
  thirsty: 2361,
  sick: 2503,
  excited: 7112,
  confused: 7113,

  // Questions
  what: 6613,
  where: 6614,
  who: 6612,
  when: 6615,
  why: 6616,
  how: 6617,
  'how-many': 27414,

  // Greetings
  hello: 2423,
  goodbye: 2424,
  please: 2475,
  'thank-you': 2508,
  sorry: 2507,
  yes: 2552,
  no: 2553,
  'excuse-me': 7114,

  // Places
  home: 2425,
  school: 2514,
  bathroom: 2362,
  outside: 2472,
  inside: 2440,
  park: 2473,
  store: 2516,
  car: 2389,

  // Food
  apple: 2343,
  banana: 2363,
  pizza: 2474,
  cookie: 2399,
  bread: 2378,
  chicken: 2391,
  rice: 2492,
  pasta: 2470,
  snack: 6453,

  // Drinks
  water: 2542,
  milk: 2452,
  juice: 2444,

  // Animals
  dog: 2407,
  cat: 2390,
  bird: 2371,
  fish: 2408,

  // Colors
  red: 2487,
  blue: 2375,
  green: 2415,
  yellow: 2345,
  orange: 2467,
  purple: 7046,
  pink: 7045,
  black: 2372,
  white: 2374,
  brown: 2379,

  // Numbers
  one: 6628,
  two: 6629,
  three: 6630,
  four: 6631,
  five: 6632,
  more: 2458,
  'all-done': 6524,

  // Body
  head: 2419,
  hand: 2417,
  tummy: 2365,
  foot: 2410,
  ear: 2468,
  eye: 2469,
  mouth: 2377,
  nose: 2465,

  // Clothes
  shirt: 2380,
  pants: 2471,
  shoes: 2553,
  socks: 2382,
  coat: 2394,
  hat: 2513,

  // Toys
  ball: 2358,
  blocks: 2395,
  doll: 2459,
  'car-toy': 2389,
  book: 2376,
  puzzle: 2484,
  tablet: 28706,

  // Time
  now: 6543,
  later: 6544,
  wait: 2541,
  morning: 2454,
  night: 2466,
  today: 6545,
  tomorrow: 6546,

  // Weather
  sunny: 2520,
  rainy: 2446,
  cloudy: 2466,
  snowy: 2463,
  hot: 2381,
  cold: 2383,

  // Safety
  'stop-safety': 5007,
  'help-safety': 2550,
  'no-safety': 2553,
  hurt: 2434,
  'bathroom-emergency': 2362,
};

/**
 * Get ARASAAC image URL for a card ID
 */
function getArasaacUrl(cardId: string): string {
  const arasaacId = ARASAAC_IDS[cardId];
  if (arasaacId) {
    return `https://static.arasaac.org/pictograms/${arasaacId}/${arasaacId}_500.png`;
  }
  // Fallback to a generic placeholder
  return `https://static.arasaac.org/pictograms/2550/2550_500.png`; // "help" icon as fallback
}

/**
 * Creates a pre-built card with default values
 */
function createCard(
  id: string,
  label: string,
  categoryId: AACCategoryId,
  options: Partial<AACCard> = {}
): AACCard {
  return {
    id,
    label,
    speechText: options.speechText || label,
    imageUrl: getArasaacUrl(id),
    categoryId,
    isGenerated: false,
    symbolSource: 'arasaac',
    glpStage: options.glpStage || 3,
    arasaacId: ARASAAC_IDS[id],
    ...options,
  };
}

/**
 * Pre-built card library organized by category
 * Following Fitzgerald Key color coding system
 */
export const CARD_LIBRARY: Record<AACCategoryId, AACCard[]> = {
  // Yellow - People, pronouns
  people: [
    createCard('i', 'I', 'people', { speechText: 'I' }),
    createCard('you', 'you', 'people'),
    createCard('he', 'he', 'people'),
    createCard('she', 'she', 'people'),
    createCard('we', 'we', 'people'),
    createCard('they', 'they', 'people'),
    createCard('mom', 'mom', 'people', { speechText: 'mommy' }),
    createCard('dad', 'dad', 'people', { speechText: 'daddy' }),
    createCard('teacher', 'teacher', 'people'),
    createCard('friend', 'friend', 'people'),
  ],

  // Green - Verbs, actions
  actions: [
    createCard('want', 'want', 'actions', { glpStage: 2 }),
    createCard('go', 'go', 'actions'),
    createCard('stop', 'stop', 'actions', { glpStage: 1 }),
    createCard('help', 'help', 'actions', { glpStage: 1 }),
    createCard('eat', 'eat', 'actions'),
    createCard('drink', 'drink', 'actions'),
    createCard('play', 'play', 'actions'),
    createCard('read', 'read', 'actions'),
    createCard('sleep', 'sleep', 'actions'),
    createCard('give', 'give', 'actions'),
    createCard('take', 'take', 'actions'),
    createCard('look', 'look', 'actions'),
  ],

  // Blue - Emotions, states
  feelings: [
    createCard('happy', 'happy', 'feelings', { glpStage: 2 }),
    createCard('sad', 'sad', 'feelings', { glpStage: 2 }),
    createCard('angry', 'angry', 'feelings'),
    createCard('scared', 'scared', 'feelings'),
    createCard('tired', 'tired', 'feelings'),
    createCard('hungry', 'hungry', 'feelings', { glpStage: 1 }),
    createCard('thirsty', 'thirsty', 'feelings'),
    createCard('sick', 'sick', 'feelings'),
    createCard('excited', 'excited', 'feelings'),
    createCard('confused', 'confused', 'feelings'),
  ],

  // Purple - Question words
  questions: [
    createCard('what', 'what', 'questions'),
    createCard('where', 'where', 'questions'),
    createCard('who', 'who', 'questions'),
    createCard('when', 'when', 'questions'),
    createCard('why', 'why', 'questions'),
    createCard('how', 'how', 'questions'),
    createCard('how-many', 'how many', 'questions'),
  ],

  // Orange - Social phrases
  greetings: [
    createCard('hello', 'hello', 'greetings', { glpStage: 1 }),
    createCard('goodbye', 'goodbye', 'greetings', { glpStage: 1 }),
    createCard('please', 'please', 'greetings', { glpStage: 1 }),
    createCard('thank-you', 'thank you', 'greetings', { glpStage: 1 }),
    createCard('sorry', 'sorry', 'greetings'),
    createCard('yes', 'yes', 'greetings', { glpStage: 1 }),
    createCard('no', 'no', 'greetings', { glpStage: 1 }),
    createCard('excuse-me', 'excuse me', 'greetings'),
  ],

  // Brown - Locations
  places: [
    createCard('home', 'home', 'places'),
    createCard('school', 'school', 'places'),
    createCard('bathroom', 'bathroom', 'places', { glpStage: 1 }),
    createCard('outside', 'outside', 'places'),
    createCard('inside', 'inside', 'places'),
    createCard('park', 'park', 'places'),
    createCard('store', 'store', 'places'),
    createCard('car', 'car', 'places'),
  ],

  // Red - Food items
  food: [
    createCard('apple', 'apple', 'food'),
    createCard('banana', 'banana', 'food'),
    createCard('pizza', 'pizza', 'food'),
    createCard('cookie', 'cookie', 'food'),
    createCard('bread', 'bread', 'food'),
    createCard('chicken', 'chicken', 'food'),
    createCard('rice', 'rice', 'food'),
    createCard('pasta', 'pasta', 'food'),
    createCard('snack', 'snack', 'food'),
  ],

  // Red - Beverages
  drinks: [
    createCard('water', 'water', 'drinks', { glpStage: 1 }),
    createCard('milk', 'milk', 'drinks'),
    createCard('juice', 'juice', 'drinks'),
  ],

  // Green - Animals
  animals: [
    createCard('dog', 'dog', 'animals'),
    createCard('cat', 'cat', 'animals'),
    createCard('bird', 'bird', 'animals'),
    createCard('fish', 'fish', 'animals'),
  ],

  // Various - Color words
  colors: [
    createCard('red', 'red', 'colors'),
    createCard('blue', 'blue', 'colors'),
    createCard('green', 'green', 'colors'),
    createCard('yellow', 'yellow', 'colors'),
    createCard('orange', 'orange', 'colors'),
    createCard('purple', 'purple', 'colors'),
    createCard('pink', 'pink', 'colors'),
    createCard('black', 'black', 'colors'),
    createCard('white', 'white', 'colors'),
    createCard('brown', 'brown', 'colors'),
  ],

  // White - Numerals
  numbers: [
    createCard('one', '1', 'numbers', { speechText: 'one' }),
    createCard('two', '2', 'numbers', { speechText: 'two' }),
    createCard('three', '3', 'numbers', { speechText: 'three' }),
    createCard('four', '4', 'numbers', { speechText: 'four' }),
    createCard('five', '5', 'numbers', { speechText: 'five' }),
    createCard('more', 'more', 'numbers', { glpStage: 1 }),
    createCard('all-done', 'all done', 'numbers', { glpStage: 1 }),
  ],

  // Pink - Body parts
  body: [
    createCard('head', 'head', 'body'),
    createCard('hand', 'hand', 'body'),
    createCard('tummy', 'tummy', 'body'),
    createCard('foot', 'foot', 'body'),
    createCard('ear', 'ear', 'body'),
    createCard('eye', 'eye', 'body'),
    createCard('mouth', 'mouth', 'body'),
    createCard('nose', 'nose', 'body'),
  ],

  // Pink - Clothing items
  clothes: [
    createCard('shirt', 'shirt', 'clothes'),
    createCard('pants', 'pants', 'clothes'),
    createCard('shoes', 'shoes', 'clothes'),
    createCard('socks', 'socks', 'clothes'),
    createCard('coat', 'coat', 'clothes'),
    createCard('hat', 'hat', 'clothes'),
  ],

  // Yellow - Play items
  toys: [
    createCard('ball', 'ball', 'toys'),
    createCard('blocks', 'blocks', 'toys'),
    createCard('doll', 'doll', 'toys'),
    createCard('car-toy', 'car', 'toys'),
    createCard('book', 'book', 'toys'),
    createCard('puzzle', 'puzzle', 'toys'),
    createCard('tablet', 'tablet', 'toys'),
  ],

  // White - Time concepts
  time: [
    createCard('now', 'now', 'time'),
    createCard('later', 'later', 'time'),
    createCard('wait', 'wait', 'time', { glpStage: 1 }),
    createCard('morning', 'morning', 'time'),
    createCard('night', 'night', 'time'),
    createCard('today', 'today', 'time'),
    createCard('tomorrow', 'tomorrow', 'time'),
  ],

  // Blue - Weather conditions
  weather: [
    createCard('sunny', 'sunny', 'weather'),
    createCard('rainy', 'rainy', 'weather'),
    createCard('cloudy', 'cloudy', 'weather'),
    createCard('snowy', 'snowy', 'weather'),
    createCard('hot', 'hot', 'weather'),
    createCard('cold', 'cold', 'weather'),
  ],

  // Red - Safety words
  safety: [
    createCard('stop-safety', 'STOP', 'safety', { glpStage: 1, speechText: 'stop' }),
    createCard('help-safety', 'HELP', 'safety', { glpStage: 1, speechText: 'help me' }),
    createCard('no-safety', 'NO', 'safety', { glpStage: 1, speechText: 'no' }),
    createCard('hurt', 'hurt', 'safety', { speechText: 'I am hurt' }),
    createCard('bathroom-emergency', 'bathroom', 'safety', { glpStage: 1, speechText: 'I need the bathroom' }),
  ],

  // Gray - User-created cards (empty by default)
  custom: [],
};

/**
 * Get all cards flattened into a single array
 */
export function getAllCards(): AACCard[] {
  return Object.values(CARD_LIBRARY).flat();
}

/**
 * Get cards by category
 */
export function getCardsByCategory(categoryId: AACCategoryId): AACCard[] {
  return CARD_LIBRARY[categoryId] || [];
}

/**
 * Get cards filtered by GLP stage
 */
export function getCardsByGLPStage(stage: GLPStage): AACCard[] {
  return getAllCards().filter(
    (card) => card.glpStage && card.glpStage <= stage
  );
}

/**
 * Search cards by label or speech text
 */
export function searchCards(query: string): AACCard[] {
  const lowerQuery = query.toLowerCase();
  return getAllCards().filter(
    (card) =>
      card.label.toLowerCase().includes(lowerQuery) ||
      card.speechText.toLowerCase().includes(lowerQuery) ||
      card.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get a specific card by ID
 */
export function getCardById(id: string): AACCard | undefined {
  return getAllCards().find((card) => card.id === id);
}

export default CARD_LIBRARY;
