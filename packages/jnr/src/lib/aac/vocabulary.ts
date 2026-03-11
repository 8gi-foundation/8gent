/**
 * 8gent AAC Vocabulary System
 *
 * Vanilla AAC vocabulary using ARASAAC pictographic symbols.
 * Based on Fitzgerald Key color categories and GLP (Gestalt Language Processing) principles.
 */

// =============================================================================
// ARASAAC Helper
// =============================================================================

const ARASAAC = (id: number) => `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;

// =============================================================================
// Types
// =============================================================================

export interface AACCategory {
  id: string;
  name: string;
  color: string; // Fitzgerald Key color
  imageUrl: string;
}

export interface AACPhrase {
  id: string;
  text: string;
  spokenText?: string; // Optional different text to speak
  imageUrl: string;
  categoryId: string;
}

// =============================================================================
// Fitzgerald Key Colors (AAC Standard Color Coding)
// =============================================================================

export const FITZGERALD_COLORS = {
  people: '#FFD700',      // Yellow - People/Pronouns
  verbs: '#4CAF50',       // Green - Actions/Verbs
  descriptors: '#2196F3', // Blue - Descriptors/Adjectives
  nouns: '#FF9800',       // Orange - Things/Nouns
  places: '#9C27B0',      // Purple - Places
  feelings: '#E91E63',    // Pink - Feelings/Social
  questions: '#00BCD4',   // Cyan - Questions
  misc: '#9E9E9E',        // Gray - Miscellaneous
} as const;

// =============================================================================
// Categories
// =============================================================================

export const AAC_CATEGORIES: AACCategory[] = [
  // Core Communication
  { id: 'general', name: 'General', color: FITZGERALD_COLORS.misc, imageUrl: ARASAAC(6964) },
  { id: 'feelings', name: 'Feelings', color: FITZGERALD_COLORS.feelings, imageUrl: ARASAAC(37190) },
  { id: 'actions', name: 'Actions', color: FITZGERALD_COLORS.verbs, imageUrl: ARASAAC(6503) },
  { id: 'questions', name: 'Questions', color: FITZGERALD_COLORS.questions, imageUrl: ARASAAC(7217) },

  // Daily Life
  { id: 'food', name: 'Food', color: FITZGERALD_COLORS.nouns, imageUrl: ARASAAC(4610) },
  { id: 'drinks', name: 'Drinks', color: FITZGERALD_COLORS.nouns, imageUrl: ARASAAC(6061) },
  { id: 'clothes', name: 'Clothes', color: FITZGERALD_COLORS.nouns, imageUrl: ARASAAC(7233) },
  { id: 'body', name: 'Body', color: FITZGERALD_COLORS.nouns, imageUrl: ARASAAC(6473) },

  // Fun & Learning
  { id: 'play', name: 'Play', color: FITZGERALD_COLORS.verbs, imageUrl: ARASAAC(23392) },
  { id: 'colours', name: 'Colours', color: FITZGERALD_COLORS.descriptors, imageUrl: ARASAAC(5968) },
  { id: 'numbers', name: 'Numbers', color: FITZGERALD_COLORS.descriptors, imageUrl: ARASAAC(2879) },
  { id: 'shapes', name: 'Shapes', color: FITZGERALD_COLORS.descriptors, imageUrl: ARASAAC(4651) },

  // People & Places
  { id: 'people', name: 'People', color: FITZGERALD_COLORS.people, imageUrl: ARASAAC(7116) },
  { id: 'places', name: 'Places', color: FITZGERALD_COLORS.places, imageUrl: ARASAAC(32757) },
  { id: 'school', name: 'School', color: FITZGERALD_COLORS.places, imageUrl: ARASAAC(32446) },
  { id: 'home', name: 'Home', color: FITZGERALD_COLORS.places, imageUrl: ARASAAC(6964) },
];

// =============================================================================
// General Phrases (Core vocabulary - high frequency)
// =============================================================================

export const GENERAL_PHRASES: AACPhrase[] = [
  { id: 'gen-i', text: 'I', imageUrl: ARASAAC(6867), categoryId: 'general' },
  { id: 'gen-you', text: 'you', imageUrl: ARASAAC(6866), categoryId: 'general' },
  { id: 'gen-yes', text: 'yes', imageUrl: ARASAAC(5584), categoryId: 'general' },
  { id: 'gen-no', text: 'no', imageUrl: ARASAAC(5526), categoryId: 'general' },
  { id: 'gen-help', text: 'help', imageUrl: ARASAAC(7171), categoryId: 'general' },
  { id: 'gen-stop', text: 'stop', imageUrl: ARASAAC(7196), categoryId: 'general' },
  { id: 'gen-more', text: 'more', imageUrl: ARASAAC(32753), categoryId: 'general' },
  { id: 'gen-done', text: 'done', imageUrl: ARASAAC(28429), categoryId: 'general' },
  { id: 'gen-want', text: 'I want', imageUrl: ARASAAC(5441), categoryId: 'general' },
  { id: 'gen-dont-want', text: "I don't want", imageUrl: ARASAAC(5442), categoryId: 'general' },
  { id: 'gen-please', text: 'please', imageUrl: ARASAAC(8195), categoryId: 'general' },
  { id: 'gen-thanks', text: 'thank you', imageUrl: ARASAAC(8129), categoryId: 'general' },
  { id: 'gen-ok', text: 'ok', imageUrl: ARASAAC(5584), categoryId: 'general' },
  { id: 'gen-wait', text: 'wait', imageUrl: ARASAAC(36914), categoryId: 'general' },
  { id: 'gen-look', text: 'look', imageUrl: ARASAAC(6564), categoryId: 'general' },
  { id: 'gen-listen', text: 'listen', imageUrl: ARASAAC(6572), categoryId: 'general' },
];

// =============================================================================
// Feelings Phrases
// =============================================================================

export const FEELINGS_PHRASES: AACPhrase[] = [
  { id: 'feel-happy', text: 'happy', imageUrl: ARASAAC(35533), categoryId: 'feelings' },
  { id: 'feel-sad', text: 'sad', imageUrl: ARASAAC(35545), categoryId: 'feelings' },
  { id: 'feel-angry', text: 'angry', imageUrl: ARASAAC(35539), categoryId: 'feelings' },
  { id: 'feel-scared', text: 'scared', imageUrl: ARASAAC(35535), categoryId: 'feelings' },
  { id: 'feel-tired', text: 'tired', imageUrl: ARASAAC(35537), categoryId: 'feelings' },
  { id: 'feel-sick', text: 'sick', imageUrl: ARASAAC(7040), categoryId: 'feelings' },
  { id: 'feel-good', text: 'good', imageUrl: ARASAAC(35541), categoryId: 'feelings' },
  { id: 'feel-bad', text: 'bad', imageUrl: ARASAAC(35543), categoryId: 'feelings' },
  { id: 'feel-love', text: 'love', imageUrl: ARASAAC(8020), categoryId: 'feelings' },
  { id: 'feel-excited', text: 'excited', imageUrl: ARASAAC(39090), categoryId: 'feelings' },
  { id: 'feel-nervous', text: 'nervous', imageUrl: ARASAAC(35549), categoryId: 'feelings' },
  { id: 'feel-hot', text: 'hot', imageUrl: ARASAAC(32179), categoryId: 'feelings' },
  { id: 'feel-cold', text: 'cold', imageUrl: ARASAAC(32178), categoryId: 'feelings' },
  { id: 'feel-hungry', text: 'hungry', imageUrl: ARASAAC(35525), categoryId: 'feelings' },
  { id: 'feel-thirsty', text: 'thirsty', imageUrl: ARASAAC(35523), categoryId: 'feelings' },
];

// =============================================================================
// Actions Phrases
// =============================================================================

export const ACTIONS_PHRASES: AACPhrase[] = [
  { id: 'act-go', text: 'go', imageUrl: ARASAAC(8142), categoryId: 'actions' },
  { id: 'act-come', text: 'come', imageUrl: ARASAAC(32669), categoryId: 'actions' },
  { id: 'act-eat', text: 'eat', imageUrl: ARASAAC(6456), categoryId: 'actions' },
  { id: 'act-drink', text: 'drink', imageUrl: ARASAAC(6061), categoryId: 'actions' },
  { id: 'act-play', text: 'play', imageUrl: ARASAAC(23392), categoryId: 'actions' },
  { id: 'act-sleep', text: 'sleep', imageUrl: ARASAAC(6479), categoryId: 'actions' },
  { id: 'act-sit', text: 'sit', imageUrl: ARASAAC(6611), categoryId: 'actions' },
  { id: 'act-stand', text: 'stand', imageUrl: ARASAAC(8152), categoryId: 'actions' },
  { id: 'act-walk', text: 'walk', imageUrl: ARASAAC(6044), categoryId: 'actions' },
  { id: 'act-run', text: 'run', imageUrl: ARASAAC(6465), categoryId: 'actions' },
  { id: 'act-jump', text: 'jump', imageUrl: ARASAAC(6607), categoryId: 'actions' },
  { id: 'act-read', text: 'read', imageUrl: ARASAAC(6463), categoryId: 'actions' },
  { id: 'act-write', text: 'write', imageUrl: ARASAAC(2380), categoryId: 'actions' },
  { id: 'act-watch', text: 'watch', imageUrl: ARASAAC(6564), categoryId: 'actions' },
  { id: 'act-give', text: 'give', imageUrl: ARASAAC(28431), categoryId: 'actions' },
  { id: 'act-take', text: 'take', imageUrl: ARASAAC(10148), categoryId: 'actions' },
];

// =============================================================================
// Questions Phrases
// =============================================================================

export const QUESTIONS_PHRASES: AACPhrase[] = [
  { id: 'q-what', text: 'what?', imageUrl: ARASAAC(22620), categoryId: 'questions' },
  { id: 'q-where', text: 'where?', imageUrl: ARASAAC(7764), categoryId: 'questions' },
  { id: 'q-when', text: 'when?', imageUrl: ARASAAC(32874), categoryId: 'questions' },
  { id: 'q-who', text: 'who?', imageUrl: ARASAAC(9853), categoryId: 'questions' },
  { id: 'q-why', text: 'why?', imageUrl: ARASAAC(36719), categoryId: 'questions' },
  { id: 'q-how', text: 'how?', imageUrl: ARASAAC(22619), categoryId: 'questions' },
  { id: 'q-can-i', text: 'can I?', imageUrl: ARASAAC(7667), categoryId: 'questions' },
  { id: 'q-do-you', text: 'do you?', imageUrl: ARASAAC(22620), categoryId: 'questions' },
  { id: 'q-is-it', text: 'is it?', imageUrl: ARASAAC(22620), categoryId: 'questions' },
  { id: 'q-dont-know', text: "I don't know", imageUrl: ARASAAC(28248), categoryId: 'questions' },
];

// =============================================================================
// Food Phrases
// =============================================================================

export const FOOD_PHRASES: AACPhrase[] = [
  { id: 'food-eat', text: 'I want to eat', imageUrl: ARASAAC(6456), categoryId: 'food' },
  { id: 'food-apple', text: 'apple', imageUrl: ARASAAC(2462), categoryId: 'food' },
  { id: 'food-banana', text: 'banana', imageUrl: ARASAAC(2530), categoryId: 'food' },
  { id: 'food-bread', text: 'bread', imageUrl: ARASAAC(2494), categoryId: 'food' },
  { id: 'food-cheese', text: 'cheese', imageUrl: ARASAAC(2541), categoryId: 'food' },
  { id: 'food-chicken', text: 'chicken', imageUrl: ARASAAC(2825), categoryId: 'food' },
  { id: 'food-pizza', text: 'pizza', imageUrl: ARASAAC(2527), categoryId: 'food' },
  { id: 'food-pasta', text: 'pasta', imageUrl: ARASAAC(8652), categoryId: 'food' },
  { id: 'food-rice', text: 'rice', imageUrl: ARASAAC(6911), categoryId: 'food' },
  { id: 'food-soup', text: 'soup', imageUrl: ARASAAC(2573), categoryId: 'food' },
  { id: 'food-sandwich', text: 'sandwich', imageUrl: ARASAAC(2281), categoryId: 'food' },
  { id: 'food-cookie', text: 'cookie', imageUrl: ARASAAC(8312), categoryId: 'food' },
  { id: 'food-icecream', text: 'ice cream', imageUrl: ARASAAC(3348), categoryId: 'food' },
  { id: 'food-breakfast', text: 'breakfast', imageUrl: ARASAAC(4626), categoryId: 'food' },
  { id: 'food-lunch', text: 'lunch', imageUrl: ARASAAC(4611), categoryId: 'food' },
  { id: 'food-dinner', text: 'dinner', imageUrl: ARASAAC(4611), categoryId: 'food' },
];

// =============================================================================
// Drinks Phrases
// =============================================================================

export const DRINKS_PHRASES: AACPhrase[] = [
  { id: 'drink-want', text: 'I want to drink', imageUrl: ARASAAC(6061), categoryId: 'drinks' },
  { id: 'drink-water', text: 'water', imageUrl: ARASAAC(32464), categoryId: 'drinks' },
  { id: 'drink-juice', text: 'juice', imageUrl: ARASAAC(11461), categoryId: 'drinks' },
  { id: 'drink-milk', text: 'milk', imageUrl: ARASAAC(2445), categoryId: 'drinks' },
  { id: 'drink-hot-choc', text: 'hot chocolate', imageUrl: ARASAAC(6448), categoryId: 'drinks' },
  { id: 'drink-tea', text: 'tea', imageUrl: ARASAAC(29802), categoryId: 'drinks' },
  { id: 'drink-cold', text: 'cold drink', imageUrl: ARASAAC(4652), categoryId: 'drinks' },
  { id: 'drink-hot', text: 'hot drink', imageUrl: ARASAAC(2300), categoryId: 'drinks' },
];

// =============================================================================
// Clothes Phrases
// =============================================================================

export const CLOTHES_PHRASES: AACPhrase[] = [
  { id: 'clothes-dress', text: 'get dressed', imageUrl: ARASAAC(7233), categoryId: 'clothes' },
  { id: 'clothes-shirt', text: 'shirt', imageUrl: ARASAAC(13640), categoryId: 'clothes' },
  { id: 'clothes-pants', text: 'pants', imageUrl: ARASAAC(2565), categoryId: 'clothes' },
  { id: 'clothes-shoes', text: 'shoes', imageUrl: ARASAAC(2775), categoryId: 'clothes' },
  { id: 'clothes-socks', text: 'socks', imageUrl: ARASAAC(2298), categoryId: 'clothes' },
  { id: 'clothes-jacket', text: 'jacket', imageUrl: ARASAAC(4872), categoryId: 'clothes' },
  { id: 'clothes-hat', text: 'hat', imageUrl: ARASAAC(2572), categoryId: 'clothes' },
  { id: 'clothes-pjs', text: 'pajamas', imageUrl: ARASAAC(2522), categoryId: 'clothes' },
];

// =============================================================================
// Body Phrases
// =============================================================================

export const BODY_PHRASES: AACPhrase[] = [
  { id: 'body-head', text: 'head', imageUrl: ARASAAC(2720), categoryId: 'body' },
  { id: 'body-eyes', text: 'eyes', imageUrl: ARASAAC(6573), categoryId: 'body' },
  { id: 'body-ears', text: 'ears', imageUrl: ARASAAC(5915), categoryId: 'body' },
  { id: 'body-nose', text: 'nose', imageUrl: ARASAAC(2727), categoryId: 'body' },
  { id: 'body-mouth', text: 'mouth', imageUrl: ARASAAC(2663), categoryId: 'body' },
  { id: 'body-hands', text: 'hands', imageUrl: ARASAAC(6575), categoryId: 'body' },
  { id: 'body-feet', text: 'feet', imageUrl: ARASAAC(2775), categoryId: 'body' },
  { id: 'body-tummy', text: 'tummy', imageUrl: ARASAAC(2786), categoryId: 'body' },
  { id: 'body-hurt', text: 'it hurts', imageUrl: ARASAAC(5484), categoryId: 'body' },
  { id: 'body-toilet', text: 'toilet', imageUrl: ARASAAC(6473), categoryId: 'body' },
  { id: 'body-bath', text: 'bath', imageUrl: ARASAAC(2272), categoryId: 'body' },
  { id: 'body-brush', text: 'brush teeth', imageUrl: ARASAAC(10263), categoryId: 'body' },
];

// =============================================================================
// Play Phrases
// =============================================================================

export const PLAY_PHRASES: AACPhrase[] = [
  { id: 'play-play', text: 'play', imageUrl: ARASAAC(23392), categoryId: 'play' },
  { id: 'play-ball', text: 'ball', imageUrl: ARASAAC(3241), categoryId: 'play' },
  { id: 'play-blocks', text: 'blocks', imageUrl: ARASAAC(7182), categoryId: 'play' },
  { id: 'play-book', text: 'book', imageUrl: ARASAAC(25191), categoryId: 'play' },
  { id: 'play-draw', text: 'draw', imageUrl: ARASAAC(37042), categoryId: 'play' },
  { id: 'play-music', text: 'music', imageUrl: ARASAAC(7046), categoryId: 'play' },
  { id: 'play-tv', text: 'TV', imageUrl: ARASAAC(26358), categoryId: 'play' },
  { id: 'play-tablet', text: 'tablet', imageUrl: ARASAAC(7190), categoryId: 'play' },
  { id: 'play-outside', text: 'go outside', imageUrl: ARASAAC(2666), categoryId: 'play' },
  { id: 'play-swing', text: 'swing', imageUrl: ARASAAC(4608), categoryId: 'play' },
  { id: 'play-slide', text: 'slide', imageUrl: ARASAAC(4692), categoryId: 'play' },
  { id: 'play-swim', text: 'swim', imageUrl: ARASAAC(25038), categoryId: 'play' },
];

// =============================================================================
// Colours Phrases
// =============================================================================

export const COLOURS_PHRASES: AACPhrase[] = [
  { id: 'col-red', text: 'red', imageUrl: ARASAAC(2808), categoryId: 'colours' },
  { id: 'col-blue', text: 'blue', imageUrl: ARASAAC(4869), categoryId: 'colours' },
  { id: 'col-green', text: 'green', imageUrl: ARASAAC(4887), categoryId: 'colours' },
  { id: 'col-yellow', text: 'yellow', imageUrl: ARASAAC(2648), categoryId: 'colours' },
  { id: 'col-orange', text: 'orange', imageUrl: ARASAAC(2888), categoryId: 'colours' },
  { id: 'col-purple', text: 'purple', imageUrl: ARASAAC(2907), categoryId: 'colours' },
  { id: 'col-pink', text: 'pink', imageUrl: ARASAAC(2807), categoryId: 'colours' },
  { id: 'col-brown', text: 'brown', imageUrl: ARASAAC(2923), categoryId: 'colours' },
  { id: 'col-black', text: 'black', imageUrl: ARASAAC(2886), categoryId: 'colours' },
  { id: 'col-white', text: 'white', imageUrl: ARASAAC(8043), categoryId: 'colours' },
];

// =============================================================================
// Numbers Phrases
// =============================================================================

export const NUMBERS_PHRASES: AACPhrase[] = [
  { id: 'num-1', text: 'one', imageUrl: ARASAAC(2627), categoryId: 'numbers' },
  { id: 'num-2', text: 'two', imageUrl: ARASAAC(2628), categoryId: 'numbers' },
  { id: 'num-3', text: 'three', imageUrl: ARASAAC(2629), categoryId: 'numbers' },
  { id: 'num-4', text: 'four', imageUrl: ARASAAC(2630), categoryId: 'numbers' },
  { id: 'num-5', text: 'five', imageUrl: ARASAAC(2631), categoryId: 'numbers' },
  { id: 'num-6', text: 'six', imageUrl: ARASAAC(2632), categoryId: 'numbers' },
  { id: 'num-7', text: 'seven', imageUrl: ARASAAC(2633), categoryId: 'numbers' },
  { id: 'num-8', text: 'eight', imageUrl: ARASAAC(2634), categoryId: 'numbers' },
  { id: 'num-9', text: 'nine', imageUrl: ARASAAC(2635), categoryId: 'numbers' },
  { id: 'num-10', text: 'ten', imageUrl: ARASAAC(2636), categoryId: 'numbers' },
];

// =============================================================================
// Shapes Phrases
// =============================================================================

export const SHAPES_PHRASES: AACPhrase[] = [
  { id: 'shape-circle', text: 'circle', imageUrl: ARASAAC(4603), categoryId: 'shapes' },
  { id: 'shape-square', text: 'square', imageUrl: ARASAAC(4616), categoryId: 'shapes' },
  { id: 'shape-triangle', text: 'triangle', imageUrl: ARASAAC(2604), categoryId: 'shapes' },
  { id: 'shape-rectangle', text: 'rectangle', imageUrl: ARASAAC(4731), categoryId: 'shapes' },
  { id: 'shape-star', text: 'star', imageUrl: ARASAAC(2752), categoryId: 'shapes' },
  { id: 'shape-heart', text: 'heart', imageUrl: ARASAAC(4613), categoryId: 'shapes' },
];

// =============================================================================
// People Phrases
// =============================================================================

export const PEOPLE_PHRASES: AACPhrase[] = [
  { id: 'ppl-mom', text: 'mom', imageUrl: ARASAAC(2458), categoryId: 'people' },
  { id: 'ppl-dad', text: 'dad', imageUrl: ARASAAC(31146), categoryId: 'people' },
  { id: 'ppl-brother', text: 'brother', imageUrl: ARASAAC(2423), categoryId: 'people' },
  { id: 'ppl-sister', text: 'sister', imageUrl: ARASAAC(2422), categoryId: 'people' },
  { id: 'ppl-grandma', text: 'grandma', imageUrl: ARASAAC(23710), categoryId: 'people' },
  { id: 'ppl-grandpa', text: 'grandpa', imageUrl: ARASAAC(23718), categoryId: 'people' },
  { id: 'ppl-teacher', text: 'teacher', imageUrl: ARASAAC(6556), categoryId: 'people' },
  { id: 'ppl-friend', text: 'friend', imageUrl: ARASAAC(25790), categoryId: 'people' },
  { id: 'ppl-me', text: 'me', imageUrl: ARASAAC(24925), categoryId: 'people' },
];

// =============================================================================
// Places Phrases
// =============================================================================

export const PLACES_PHRASES: AACPhrase[] = [
  { id: 'place-home', text: 'home', imageUrl: ARASAAC(6964), categoryId: 'places' },
  { id: 'place-school', text: 'school', imageUrl: ARASAAC(32446), categoryId: 'places' },
  { id: 'place-park', text: 'park', imageUrl: ARASAAC(4608), categoryId: 'places' },
  { id: 'place-store', text: 'store', imageUrl: ARASAAC(35695), categoryId: 'places' },
  { id: 'place-car', text: 'car', imageUrl: ARASAAC(2339), categoryId: 'places' },
  { id: 'place-outside', text: 'outside', imageUrl: ARASAAC(2666), categoryId: 'places' },
  { id: 'place-inside', text: 'inside', imageUrl: ARASAAC(5439), categoryId: 'places' },
  { id: 'place-beach', text: 'beach', imageUrl: ARASAAC(2925), categoryId: 'places' },
];

// =============================================================================
// School Phrases
// =============================================================================

export const SCHOOL_PHRASES: AACPhrase[] = [
  { id: 'sch-school', text: 'school', imageUrl: ARASAAC(32446), categoryId: 'school' },
  { id: 'sch-teacher', text: 'teacher', imageUrl: ARASAAC(6556), categoryId: 'school' },
  { id: 'sch-class', text: 'class', imageUrl: ARASAAC(9815), categoryId: 'school' },
  { id: 'sch-break', text: 'break time', imageUrl: ARASAAC(27339), categoryId: 'school' },
  { id: 'sch-lunch', text: 'lunch time', imageUrl: ARASAAC(4611), categoryId: 'school' },
  { id: 'sch-work', text: 'do work', imageUrl: ARASAAC(6624), categoryId: 'school' },
];

// =============================================================================
// Home Phrases
// =============================================================================

export const HOME_PHRASES: AACPhrase[] = [
  { id: 'home-home', text: 'home', imageUrl: ARASAAC(6964), categoryId: 'home' },
  { id: 'home-bedroom', text: 'bedroom', imageUrl: ARASAAC(5988), categoryId: 'home' },
  { id: 'home-bathroom', text: 'bathroom', imageUrl: ARASAAC(2272), categoryId: 'home' },
  { id: 'home-kitchen', text: 'kitchen', imageUrl: ARASAAC(10752), categoryId: 'home' },
  { id: 'home-living', text: 'living room', imageUrl: ARASAAC(6211), categoryId: 'home' },
  { id: 'home-garden', text: 'garden', imageUrl: ARASAAC(2666), categoryId: 'home' },
];

// =============================================================================
// Get Phrases by Category
// =============================================================================

export function getPhrasesByCategory(categoryId: string): AACPhrase[] {
  switch (categoryId) {
    case 'general': return GENERAL_PHRASES;
    case 'feelings': return FEELINGS_PHRASES;
    case 'actions': return ACTIONS_PHRASES;
    case 'questions': return QUESTIONS_PHRASES;
    case 'food': return FOOD_PHRASES;
    case 'drinks': return DRINKS_PHRASES;
    case 'clothes': return CLOTHES_PHRASES;
    case 'body': return BODY_PHRASES;
    case 'play': return PLAY_PHRASES;
    case 'colours': return COLOURS_PHRASES;
    case 'numbers': return NUMBERS_PHRASES;
    case 'shapes': return SHAPES_PHRASES;
    case 'people': return PEOPLE_PHRASES;
    case 'places': return PLACES_PHRASES;
    case 'school': return SCHOOL_PHRASES;
    case 'home': return HOME_PHRASES;
    default: return [];
  }
}

// =============================================================================
// Get All Phrases
// =============================================================================

export function getAllPhrases(): AACPhrase[] {
  return [
    ...GENERAL_PHRASES,
    ...FEELINGS_PHRASES,
    ...ACTIONS_PHRASES,
    ...QUESTIONS_PHRASES,
    ...FOOD_PHRASES,
    ...DRINKS_PHRASES,
    ...CLOTHES_PHRASES,
    ...BODY_PHRASES,
    ...PLAY_PHRASES,
    ...COLOURS_PHRASES,
    ...NUMBERS_PHRASES,
    ...SHAPES_PHRASES,
    ...PEOPLE_PHRASES,
    ...PLACES_PHRASES,
    ...SCHOOL_PHRASES,
    ...HOME_PHRASES,
  ];
}
