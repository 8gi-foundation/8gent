/**
 * @fileoverview AAC Category Definitions (Fitzgerald Key)
 *
 * This module defines the 18 standard AAC categories following the
 * Fitzgerald Key color coding system. The Fitzgerald Key is a widely
 * used color-coding system in AAC that helps organize vocabulary by
 * grammatical function.
 *
 * Color coding helps children learn word categories and sentence structure:
 * - Yellow: People, pronouns (who)
 * - Green: Verbs, actions (doing words)
 * - Blue: Descriptors, feelings (describing words)
 * - Orange: Social/greetings (social words)
 * - Purple: Questions (asking words)
 * - Brown: Places (where)
 * - Red: Important items (food, drinks, safety)
 * - Pink: Body-related (body, clothes)
 * - White: Numbers, time concepts
 *
 * @module lib/aac/categories
 */

import type { AACCategory, AACCategoryId } from '@/types/aac';

/**
 * Fitzgerald Key color definitions
 */
export const FITZGERALD_COLORS: Record<
  AACCategoryId,
  { bg: string; border: string; text: string }
> = {
  people: { bg: '#FFF59D', border: '#F9A825', text: '#5D4037' },
  actions: { bg: '#A5D6A7', border: '#388E3C', text: '#1B5E20' },
  feelings: { bg: '#90CAF9', border: '#1976D2', text: '#0D47A1' },
  questions: { bg: '#FFE0B2', border: '#E8610A', text: '#7C3700' },
  greetings: { bg: '#FFCC80', border: '#F57C00', text: '#E65100' },
  places: { bg: '#BCAAA4', border: '#6D4C41', text: '#3E2723' },
  food: { bg: '#EF9A9A', border: '#D32F2F', text: '#B71C1C' },
  drinks: { bg: '#EF9A9A', border: '#D32F2F', text: '#B71C1C' },
  animals: { bg: '#A5D6A7', border: '#388E3C', text: '#1B5E20' },
  colors: { bg: '#E0E0E0', border: '#757575', text: '#212121' },
  numbers: { bg: '#F5F5F5', border: '#9E9E9E', text: '#212121' },
  body: { bg: '#FFE0B2', border: '#E65100', text: '#7C3700' },
  clothes: { bg: '#FFE0B2', border: '#E65100', text: '#7C3700' },
  toys: { bg: '#FFF59D', border: '#F9A825', text: '#5D4037' },
  time: { bg: '#F5F5F5', border: '#9E9E9E', text: '#212121' },
  weather: { bg: '#90CAF9', border: '#1976D2', text: '#0D47A1' },
  safety: { bg: '#FF8A80', border: '#D50000', text: '#B71C1C' },
  custom: { bg: '#CFD8DC', border: '#607D8B', text: '#263238' },
};

/**
 * Category icons (emoji for prototype, replace with custom icons later)
 */
export const CATEGORY_ICONS: Record<AACCategoryId, string> = {
  people: '👤',
  actions: '🏃',
  feelings: '😊',
  questions: '❓',
  greetings: '👋',
  places: '🏠',
  food: '🍎',
  drinks: '🥤',
  animals: '🐕',
  colors: '🎨',
  numbers: '🔢',
  body: '🖐️',
  clothes: '👕',
  toys: '🧸',
  time: '⏰',
  weather: '☀️',
  safety: '🛑',
  custom: '⭐',
};

/**
 * Category descriptions for tooltips/help
 */
export const CATEGORY_DESCRIPTIONS: Record<AACCategoryId, string> = {
  people: 'People and pronouns - I, you, mom, dad, teacher, friend',
  actions: 'Doing words - want, go, eat, play, help',
  feelings: 'Emotions and states - happy, sad, tired, hungry',
  questions: 'Question words - what, where, who, when, why',
  greetings: 'Social words - hello, goodbye, please, thank you',
  places: 'Location words - home, school, bathroom, outside',
  food: 'Food items - apple, pizza, snack, cookie',
  drinks: 'Beverages - water, milk, juice',
  animals: 'Animal words - dog, cat, bird, fish',
  colors: 'Color words - red, blue, green, yellow',
  numbers: 'Numbers and quantity - 1, 2, 3, more, all done',
  body: 'Body parts - head, hand, tummy, foot',
  clothes: 'Clothing items - shirt, pants, shoes, coat',
  toys: 'Play items - ball, blocks, book, tablet',
  time: 'Time concepts - now, later, wait, today',
  weather: 'Weather words - sunny, rainy, hot, cold',
  safety: 'Safety words - STOP, HELP, NO, hurt',
  custom: 'Your custom cards',
};

/**
 * All 18 AAC categories with Fitzgerald Key colors
 */
export const AAC_CATEGORIES: AACCategory[] = [
  {
    id: 'greetings',
    name: 'Greetings',
    icon: CATEGORY_ICONS.greetings,
    color: FITZGERALD_COLORS.greetings.bg,
    borderColor: FITZGERALD_COLORS.greetings.border,
    textColor: FITZGERALD_COLORS.greetings.text,
    order: 1,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.greetings,
  },
  {
    id: 'people',
    name: 'People',
    icon: CATEGORY_ICONS.people,
    color: FITZGERALD_COLORS.people.bg,
    borderColor: FITZGERALD_COLORS.people.border,
    textColor: FITZGERALD_COLORS.people.text,
    order: 2,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.people,
  },
  {
    id: 'actions',
    name: 'Actions',
    icon: CATEGORY_ICONS.actions,
    color: FITZGERALD_COLORS.actions.bg,
    borderColor: FITZGERALD_COLORS.actions.border,
    textColor: FITZGERALD_COLORS.actions.text,
    order: 3,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.actions,
  },
  {
    id: 'feelings',
    name: 'Feelings',
    icon: CATEGORY_ICONS.feelings,
    color: FITZGERALD_COLORS.feelings.bg,
    borderColor: FITZGERALD_COLORS.feelings.border,
    textColor: FITZGERALD_COLORS.feelings.text,
    order: 4,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.feelings,
  },
  {
    id: 'questions',
    name: 'Questions',
    icon: CATEGORY_ICONS.questions,
    color: FITZGERALD_COLORS.questions.bg,
    borderColor: FITZGERALD_COLORS.questions.border,
    textColor: FITZGERALD_COLORS.questions.text,
    order: 5,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.questions,
  },
  {
    id: 'places',
    name: 'Places',
    icon: CATEGORY_ICONS.places,
    color: FITZGERALD_COLORS.places.bg,
    borderColor: FITZGERALD_COLORS.places.border,
    textColor: FITZGERALD_COLORS.places.text,
    order: 6,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.places,
  },
  {
    id: 'food',
    name: 'Food',
    icon: CATEGORY_ICONS.food,
    color: FITZGERALD_COLORS.food.bg,
    borderColor: FITZGERALD_COLORS.food.border,
    textColor: FITZGERALD_COLORS.food.text,
    order: 7,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.food,
  },
  {
    id: 'drinks',
    name: 'Drinks',
    icon: CATEGORY_ICONS.drinks,
    color: FITZGERALD_COLORS.drinks.bg,
    borderColor: FITZGERALD_COLORS.drinks.border,
    textColor: FITZGERALD_COLORS.drinks.text,
    order: 8,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.drinks,
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: CATEGORY_ICONS.animals,
    color: FITZGERALD_COLORS.animals.bg,
    borderColor: FITZGERALD_COLORS.animals.border,
    textColor: FITZGERALD_COLORS.animals.text,
    order: 9,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.animals,
  },
  {
    id: 'colors',
    name: 'Colors',
    icon: CATEGORY_ICONS.colors,
    color: FITZGERALD_COLORS.colors.bg,
    borderColor: FITZGERALD_COLORS.colors.border,
    textColor: FITZGERALD_COLORS.colors.text,
    order: 10,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.colors,
  },
  {
    id: 'numbers',
    name: 'Numbers',
    icon: CATEGORY_ICONS.numbers,
    color: FITZGERALD_COLORS.numbers.bg,
    borderColor: FITZGERALD_COLORS.numbers.border,
    textColor: FITZGERALD_COLORS.numbers.text,
    order: 11,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.numbers,
  },
  {
    id: 'body',
    name: 'Body',
    icon: CATEGORY_ICONS.body,
    color: FITZGERALD_COLORS.body.bg,
    borderColor: FITZGERALD_COLORS.body.border,
    textColor: FITZGERALD_COLORS.body.text,
    order: 12,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.body,
  },
  {
    id: 'clothes',
    name: 'Clothes',
    icon: CATEGORY_ICONS.clothes,
    color: FITZGERALD_COLORS.clothes.bg,
    borderColor: FITZGERALD_COLORS.clothes.border,
    textColor: FITZGERALD_COLORS.clothes.text,
    order: 13,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.clothes,
  },
  {
    id: 'toys',
    name: 'Toys',
    icon: CATEGORY_ICONS.toys,
    color: FITZGERALD_COLORS.toys.bg,
    borderColor: FITZGERALD_COLORS.toys.border,
    textColor: FITZGERALD_COLORS.toys.text,
    order: 14,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.toys,
  },
  {
    id: 'time',
    name: 'Time',
    icon: CATEGORY_ICONS.time,
    color: FITZGERALD_COLORS.time.bg,
    borderColor: FITZGERALD_COLORS.time.border,
    textColor: FITZGERALD_COLORS.time.text,
    order: 15,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.time,
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: CATEGORY_ICONS.weather,
    color: FITZGERALD_COLORS.weather.bg,
    borderColor: FITZGERALD_COLORS.weather.border,
    textColor: FITZGERALD_COLORS.weather.text,
    order: 16,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.weather,
  },
  {
    id: 'safety',
    name: 'Safety',
    icon: CATEGORY_ICONS.safety,
    color: FITZGERALD_COLORS.safety.bg,
    borderColor: FITZGERALD_COLORS.safety.border,
    textColor: FITZGERALD_COLORS.safety.text,
    order: 17,
    isSystem: true,
    description: CATEGORY_DESCRIPTIONS.safety,
  },
  {
    id: 'custom',
    name: 'My Cards',
    icon: CATEGORY_ICONS.custom,
    color: FITZGERALD_COLORS.custom.bg,
    borderColor: FITZGERALD_COLORS.custom.border,
    textColor: FITZGERALD_COLORS.custom.text,
    order: 18,
    isSystem: false,
    description: CATEGORY_DESCRIPTIONS.custom,
  },
];

/**
 * Get category by ID
 */
export function getCategoryById(id: AACCategoryId): AACCategory | undefined {
  return AAC_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get Fitzgerald Key colors for a category
 */
export function getCategoryColors(
  id: AACCategoryId
): { bg: string; border: string; text: string } {
  return FITZGERALD_COLORS[id] || FITZGERALD_COLORS.custom;
}

/**
 * Get essential categories (for simplified boards)
 * These are the most commonly used categories for beginners
 */
export function getEssentialCategories(): AACCategory[] {
  const essentialIds: AACCategoryId[] = [
    'greetings',
    'people',
    'actions',
    'feelings',
    'food',
    'drinks',
    'safety',
  ];
  return AAC_CATEGORIES.filter((cat) =>
    essentialIds.includes(cat.id as AACCategoryId)
  );
}

export default AAC_CATEGORIES;
