import { mutation } from "./_generated/server";

/**
 * ARASAAC pictogram ID mapping
 * Source: https://arasaac.org/pictograms/search
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
  "how-many": 27414,

  // Greetings
  hello: 2423,
  goodbye: 2424,
  please: 2475,
  "thank-you": 2508,
  sorry: 2507,
  yes: 2552,
  no: 2553,
  "excuse-me": 7114,

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
  "all-done": 6524,

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
  "car-toy": 2389,
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
  "stop-safety": 5007,
  "help-safety": 2550,
  "no-safety": 2553,
  hurt: 2434,
  "bathroom-emergency": 2362,
};

function getArasaacUrl(id: string): string {
  const arasaacId = ARASAAC_IDS[id];
  if (arasaacId) {
    return `https://static.arasaac.org/pictograms/${arasaacId}/${arasaacId}_500.png`;
  }
  return `https://static.arasaac.org/pictograms/2550/2550_500.png`;
}

type CardDef = {
  id: string;
  label: string;
  speechText: string;
  categoryId: string;
  glpStage?: number;
};

const CARD_DEFINITIONS: CardDef[] = [
  // People (Yellow)
  { id: "i", label: "I", speechText: "I", categoryId: "people" },
  { id: "you", label: "you", speechText: "you", categoryId: "people" },
  { id: "he", label: "he", speechText: "he", categoryId: "people" },
  { id: "she", label: "she", speechText: "she", categoryId: "people" },
  { id: "we", label: "we", speechText: "we", categoryId: "people" },
  { id: "they", label: "they", speechText: "they", categoryId: "people" },
  { id: "mom", label: "mom", speechText: "mommy", categoryId: "people" },
  { id: "dad", label: "dad", speechText: "daddy", categoryId: "people" },
  { id: "teacher", label: "teacher", speechText: "teacher", categoryId: "people" },
  { id: "friend", label: "friend", speechText: "friend", categoryId: "people" },

  // Actions (Green)
  { id: "want", label: "want", speechText: "want", categoryId: "actions", glpStage: 2 },
  { id: "go", label: "go", speechText: "go", categoryId: "actions" },
  { id: "stop", label: "stop", speechText: "stop", categoryId: "actions", glpStage: 1 },
  { id: "help", label: "help", speechText: "help", categoryId: "actions", glpStage: 1 },
  { id: "eat", label: "eat", speechText: "eat", categoryId: "actions" },
  { id: "drink", label: "drink", speechText: "drink", categoryId: "actions" },
  { id: "play", label: "play", speechText: "play", categoryId: "actions" },
  { id: "read", label: "read", speechText: "read", categoryId: "actions" },
  { id: "sleep", label: "sleep", speechText: "sleep", categoryId: "actions" },
  { id: "give", label: "give", speechText: "give", categoryId: "actions" },
  { id: "take", label: "take", speechText: "take", categoryId: "actions" },
  { id: "look", label: "look", speechText: "look", categoryId: "actions" },

  // Feelings (Blue)
  { id: "happy", label: "happy", speechText: "happy", categoryId: "feelings", glpStage: 2 },
  { id: "sad", label: "sad", speechText: "sad", categoryId: "feelings", glpStage: 2 },
  { id: "angry", label: "angry", speechText: "angry", categoryId: "feelings" },
  { id: "scared", label: "scared", speechText: "scared", categoryId: "feelings" },
  { id: "tired", label: "tired", speechText: "tired", categoryId: "feelings" },
  { id: "hungry", label: "hungry", speechText: "hungry", categoryId: "feelings", glpStage: 1 },
  { id: "thirsty", label: "thirsty", speechText: "thirsty", categoryId: "feelings" },
  { id: "sick", label: "sick", speechText: "sick", categoryId: "feelings" },
  { id: "excited", label: "excited", speechText: "excited", categoryId: "feelings" },
  { id: "confused", label: "confused", speechText: "confused", categoryId: "feelings" },

  // Questions (Purple)
  { id: "what", label: "what", speechText: "what", categoryId: "questions" },
  { id: "where", label: "where", speechText: "where", categoryId: "questions" },
  { id: "who", label: "who", speechText: "who", categoryId: "questions" },
  { id: "when", label: "when", speechText: "when", categoryId: "questions" },
  { id: "why", label: "why", speechText: "why", categoryId: "questions" },
  { id: "how", label: "how", speechText: "how", categoryId: "questions" },
  { id: "how-many", label: "how many", speechText: "how many", categoryId: "questions" },

  // Greetings (Orange)
  { id: "hello", label: "hello", speechText: "hello", categoryId: "greetings", glpStage: 1 },
  { id: "goodbye", label: "goodbye", speechText: "goodbye", categoryId: "greetings", glpStage: 1 },
  { id: "please", label: "please", speechText: "please", categoryId: "greetings", glpStage: 1 },
  { id: "thank-you", label: "thank you", speechText: "thank you", categoryId: "greetings", glpStage: 1 },
  { id: "sorry", label: "sorry", speechText: "sorry", categoryId: "greetings" },
  { id: "yes", label: "yes", speechText: "yes", categoryId: "greetings", glpStage: 1 },
  { id: "no", label: "no", speechText: "no", categoryId: "greetings", glpStage: 1 },
  { id: "excuse-me", label: "excuse me", speechText: "excuse me", categoryId: "greetings" },

  // Places (Brown)
  { id: "home", label: "home", speechText: "home", categoryId: "places" },
  { id: "school", label: "school", speechText: "school", categoryId: "places" },
  { id: "bathroom", label: "bathroom", speechText: "bathroom", categoryId: "places", glpStage: 1 },
  { id: "outside", label: "outside", speechText: "outside", categoryId: "places" },
  { id: "inside", label: "inside", speechText: "inside", categoryId: "places" },
  { id: "park", label: "park", speechText: "park", categoryId: "places" },
  { id: "store", label: "store", speechText: "store", categoryId: "places" },
  { id: "car", label: "car", speechText: "car", categoryId: "places" },

  // Food (Red)
  { id: "apple", label: "apple", speechText: "apple", categoryId: "food" },
  { id: "banana", label: "banana", speechText: "banana", categoryId: "food" },
  { id: "pizza", label: "pizza", speechText: "pizza", categoryId: "food" },
  { id: "cookie", label: "cookie", speechText: "cookie", categoryId: "food" },
  { id: "bread", label: "bread", speechText: "bread", categoryId: "food" },
  { id: "chicken", label: "chicken", speechText: "chicken", categoryId: "food" },
  { id: "rice", label: "rice", speechText: "rice", categoryId: "food" },
  { id: "pasta", label: "pasta", speechText: "pasta", categoryId: "food" },
  { id: "snack", label: "snack", speechText: "snack", categoryId: "food" },

  // Drinks (Red)
  { id: "water", label: "water", speechText: "water", categoryId: "drinks", glpStage: 1 },
  { id: "milk", label: "milk", speechText: "milk", categoryId: "drinks" },
  { id: "juice", label: "juice", speechText: "juice", categoryId: "drinks" },

  // Animals (Green)
  { id: "dog", label: "dog", speechText: "dog", categoryId: "animals" },
  { id: "cat", label: "cat", speechText: "cat", categoryId: "animals" },
  { id: "bird", label: "bird", speechText: "bird", categoryId: "animals" },
  { id: "fish", label: "fish", speechText: "fish", categoryId: "animals" },

  // Colors
  { id: "red", label: "red", speechText: "red", categoryId: "colors" },
  { id: "blue", label: "blue", speechText: "blue", categoryId: "colors" },
  { id: "green", label: "green", speechText: "green", categoryId: "colors" },
  { id: "yellow", label: "yellow", speechText: "yellow", categoryId: "colors" },
  { id: "orange", label: "orange", speechText: "orange", categoryId: "colors" },
  { id: "purple", label: "purple", speechText: "purple", categoryId: "colors" },
  { id: "pink", label: "pink", speechText: "pink", categoryId: "colors" },
  { id: "black", label: "black", speechText: "black", categoryId: "colors" },
  { id: "white", label: "white", speechText: "white", categoryId: "colors" },
  { id: "brown", label: "brown", speechText: "brown", categoryId: "colors" },

  // Numbers (White)
  { id: "one", label: "1", speechText: "one", categoryId: "numbers" },
  { id: "two", label: "2", speechText: "two", categoryId: "numbers" },
  { id: "three", label: "3", speechText: "three", categoryId: "numbers" },
  { id: "four", label: "4", speechText: "four", categoryId: "numbers" },
  { id: "five", label: "5", speechText: "five", categoryId: "numbers" },
  { id: "more", label: "more", speechText: "more", categoryId: "numbers", glpStage: 1 },
  { id: "all-done", label: "all done", speechText: "all done", categoryId: "numbers", glpStage: 1 },

  // Body (Pink)
  { id: "head", label: "head", speechText: "head", categoryId: "body" },
  { id: "hand", label: "hand", speechText: "hand", categoryId: "body" },
  { id: "tummy", label: "tummy", speechText: "tummy", categoryId: "body" },
  { id: "foot", label: "foot", speechText: "foot", categoryId: "body" },
  { id: "ear", label: "ear", speechText: "ear", categoryId: "body" },
  { id: "eye", label: "eye", speechText: "eye", categoryId: "body" },
  { id: "mouth", label: "mouth", speechText: "mouth", categoryId: "body" },
  { id: "nose", label: "nose", speechText: "nose", categoryId: "body" },

  // Clothes (Pink)
  { id: "shirt", label: "shirt", speechText: "shirt", categoryId: "clothes" },
  { id: "pants", label: "pants", speechText: "pants", categoryId: "clothes" },
  { id: "shoes", label: "shoes", speechText: "shoes", categoryId: "clothes" },
  { id: "socks", label: "socks", speechText: "socks", categoryId: "clothes" },
  { id: "coat", label: "coat", speechText: "coat", categoryId: "clothes" },
  { id: "hat", label: "hat", speechText: "hat", categoryId: "clothes" },

  // Toys (Yellow)
  { id: "ball", label: "ball", speechText: "ball", categoryId: "toys" },
  { id: "blocks", label: "blocks", speechText: "blocks", categoryId: "toys" },
  { id: "doll", label: "doll", speechText: "doll", categoryId: "toys" },
  { id: "car-toy", label: "car", speechText: "car", categoryId: "toys" },
  { id: "book", label: "book", speechText: "book", categoryId: "toys" },
  { id: "puzzle", label: "puzzle", speechText: "puzzle", categoryId: "toys" },
  { id: "tablet", label: "tablet", speechText: "tablet", categoryId: "toys" },

  // Time (White)
  { id: "now", label: "now", speechText: "now", categoryId: "time" },
  { id: "later", label: "later", speechText: "later", categoryId: "time" },
  { id: "wait", label: "wait", speechText: "wait", categoryId: "time", glpStage: 1 },
  { id: "morning", label: "morning", speechText: "morning", categoryId: "time" },
  { id: "night", label: "night", speechText: "night", categoryId: "time" },
  { id: "today", label: "today", speechText: "today", categoryId: "time" },
  { id: "tomorrow", label: "tomorrow", speechText: "tomorrow", categoryId: "time" },

  // Weather (Blue)
  { id: "sunny", label: "sunny", speechText: "sunny", categoryId: "weather" },
  { id: "rainy", label: "rainy", speechText: "rainy", categoryId: "weather" },
  { id: "cloudy", label: "cloudy", speechText: "cloudy", categoryId: "weather" },
  { id: "snowy", label: "snowy", speechText: "snowy", categoryId: "weather" },
  { id: "hot", label: "hot", speechText: "hot", categoryId: "weather" },
  { id: "cold", label: "cold", speechText: "cold", categoryId: "weather" },

  // Safety (Red)
  { id: "stop-safety", label: "STOP", speechText: "stop", categoryId: "safety", glpStage: 1 },
  { id: "help-safety", label: "HELP", speechText: "help me", categoryId: "safety", glpStage: 1 },
  { id: "no-safety", label: "NO", speechText: "no", categoryId: "safety", glpStage: 1 },
  { id: "hurt", label: "hurt", speechText: "I am hurt", categoryId: "safety" },
  { id: "bathroom-emergency", label: "bathroom", speechText: "I need the bathroom", categoryId: "safety", glpStage: 1 },
];

/**
 * Seed the default card pack with version 1.0.0
 * Run this once to initialize the database
 */
export const seedDefaultCardPack = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if v1.0.0 already exists
    const existing = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_version", (q) => q.eq("version", "1.0.0"))
      .first();

    if (existing) {
      return { success: false, message: "Version 1.0.0 already exists" };
    }

    // Unset any current latest
    const currentLatest = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_latest", (q) => q.eq("isLatest", true))
      .first();

    if (currentLatest) {
      await ctx.db.patch(currentLatest._id, { isLatest: false });
    }

    // Build cards with ARASAAC URLs
    const cards = CARD_DEFINITIONS.map((def) => ({
      id: def.id,
      label: def.label,
      speechText: def.speechText,
      imageUrl: getArasaacUrl(def.id),
      categoryId: def.categoryId,
      arasaacId: ARASAAC_IDS[def.id],
      glpStage: def.glpStage || 3,
    }));

    // Create the card pack
    const packId = await ctx.db.insert("defaultCardPack", {
      version: "1.0.0",
      cards,
      changelog: "Initial release with 140 ARASAAC cards across 18 categories",
      isLatest: true,
      createdAt: Date.now(),
    });

    return {
      success: true,
      packId,
      cardCount: cards.length,
    };
  },
});
