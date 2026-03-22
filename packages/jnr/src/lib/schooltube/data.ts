/**
 * SchoolTube Data - Videos and Games
 * Ported from Nick's SchoolTube for 8gent Jr
 */

export type Reel = {
  id: string;
  title: string;
  emoji: string;
  type: 'video' | 'game';
  category: 'numbers' | 'letters' | 'colors' | 'shapes' | 'sensory' | 'learning' | 'patterns';
  gameType?: string;
  videoUrl?: string;
  duration?: string;
};

export const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📺' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'numbers', label: 'Numbers', emoji: '🔢' },
  { id: 'letters', label: 'Letters', emoji: '✏️' },
  { id: 'colors', label: 'Colors', emoji: '🌈' },
  { id: 'shapes', label: 'Shapes', emoji: '🔷' },
  { id: 'patterns', label: 'Patterns', emoji: '🔁' },
  { id: 'sensory', label: 'Sensory', emoji: '✨' },
];

export const REELS_DATA: Reel[] = [
  // Numbers - Educational Games
  {
    id: 'count-balls',
    title: 'Count the Balls',
    emoji: '🔴',
    type: 'game',
    category: 'numbers',
    gameType: 'counting',
  },
  {
    id: 'number-order',
    title: 'Number Order 1-10',
    emoji: '🔢',
    type: 'game',
    category: 'numbers',
    gameType: 'numberOrder',
  },
  {
    id: 'bubble-pop',
    title: 'Pop the Numbers!',
    emoji: '🫧',
    type: 'game',
    category: 'numbers',
    gameType: 'bubblePop',
  },

  {
    id: 'counting-advanced',
    title: 'Count Objects!',
    emoji: '⭐',
    type: 'game',
    category: 'numbers',
    gameType: 'countingAdvanced',
  },
  {
    id: 'number-bonds',
    title: 'Number Bonds',
    emoji: '🧮',
    type: 'game',
    category: 'numbers',
    gameType: 'numberBonds',
  },

  // Letters - Educational Games
  {
    id: 'letter-trace',
    title: 'Letter Trace',
    emoji: '✏️',
    type: 'game',
    category: 'letters',
    gameType: 'letterTrace',
  },

  // Colors - Educational Games
  {
    id: 'color-sort',
    title: 'Color Sorting',
    emoji: '🎨',
    type: 'game',
    category: 'colors',
    gameType: 'colorSort',
  },
  {
    id: 'color-match',
    title: 'Match the Colors',
    emoji: '🌈',
    type: 'game',
    category: 'colors',
    gameType: 'colorMatch',
  },
  {
    id: 'color-mix',
    title: 'Color Mixing Lab',
    emoji: '🖌️',
    type: 'game',
    category: 'colors',
    gameType: 'colorMix',
  },

  // Shapes - Educational Games
  {
    id: 'shape-match',
    title: 'Shape Match',
    emoji: '🔷',
    type: 'game',
    category: 'shapes',
    gameType: 'matching',
  },
  {
    id: 'shape-match-advanced',
    title: 'Shape Expert',
    emoji: '🎯',
    type: 'game',
    category: 'shapes',
    gameType: 'shapeMatchAdvanced',
  },
  {
    id: 'size-sort',
    title: 'Size Sorting',
    emoji: '📏',
    type: 'game',
    category: 'shapes',
    gameType: 'sizeSort',
  },

  // Patterns & Memory
  {
    id: 'pattern-complete',
    title: 'Pattern Power',
    emoji: '🔁',
    type: 'game',
    category: 'patterns',
    gameType: 'patternComplete',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    emoji: '🃏',
    type: 'game',
    category: 'patterns',
    gameType: 'memoryMatch',
  },

  // SENSORY GAMES - High engagement, minimal cognitive demand
  {
    id: 'ball-rain',
    title: 'Ball Rain',
    emoji: '🌧️',
    type: 'game',
    category: 'sensory',
    gameType: 'ballRain',
  },
  {
    id: 'bubble-wrap',
    title: 'Bubble Wrap Pop',
    emoji: '🫧',
    type: 'game',
    category: 'sensory',
    gameType: 'bubbleWrap',
  },
  {
    id: 'fireworks',
    title: 'Fireworks Show',
    emoji: '🎆',
    type: 'game',
    category: 'sensory',
    gameType: 'fireworks',
  },
  {
    id: 'rainbow-paint',
    title: 'Rainbow Painting',
    emoji: '🖌️',
    type: 'game',
    category: 'sensory',
    gameType: 'rainbowPaint',
  },

  // Learning Videos
  {
    id: 'vid-colors',
    title: 'Learn Your Colors',
    emoji: '🌈',
    type: 'video',
    category: 'learning',
    duration: '3:20',
  },
  {
    id: 'vid-counting',
    title: 'Counting to 20',
    emoji: '🔢',
    type: 'video',
    category: 'learning',
    duration: '4:15',
  },
  {
    id: 'vid-animals',
    title: 'Animal Sounds',
    emoji: '🐮',
    type: 'video',
    category: 'learning',
    duration: '2:45',
  },
  {
    id: 'vid-abc',
    title: 'ABC Alphabet Song',
    emoji: '🎶',
    type: 'video',
    category: 'learning',
    duration: '2:30',
  },
];

export function getReelsByCategory(category: string): Reel[] {
  if (category === 'all') return REELS_DATA;
  return REELS_DATA.filter((reel) => reel.category === category);
}
