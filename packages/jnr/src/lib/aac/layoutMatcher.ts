/**
 * @fileoverview AAC Layout Matcher - Maps Detected Categories to Fitzgerald Key
 *
 * This module takes a FamiliarityProfile and generates an optimized
 * AAC board configuration that preserves the user's muscle memory
 * from their existing AAC while using Fitzgerald Key categories.
 *
 * Key features:
 * - Intelligent category mapping based on color and name
 * - Muscle memory preservation (position-aware)
 * - Fallback strategies for unmapped categories
 * - Board configuration generation
 *
 * @module lib/aac/layoutMatcher
 */

import type { AACCategoryId, AACBoardConfig, VoiceConfig } from '@/types/aac';
import type {
  FamiliarityProfile,
  DetectedCategory,
  CategoryMapping,
  AppliedProfileResult,
} from '@/types/familiarity';
import { AAC_CATEGORIES, FITZGERALD_COLORS, getCategoryById } from './categories';
import { CARD_LIBRARY, getCardsByCategory } from './cardLibrary';

/**
 * Card size mappings to pixels
 */
const CARD_SIZE_MAP: Record<'small' | 'medium' | 'large', number> = {
  small: 80,
  medium: 100,
  large: 120,
};

/**
 * Gap size mappings to pixels
 */
const GAP_SIZE_MAP: Record<'dense' | 'normal' | 'spacious', number> = {
  dense: 4,
  normal: 8,
  spacious: 12,
};

/**
 * Generates the optimal category order based on detected categories
 * and Fitzgerald Key conventions.
 *
 * @param profile - The familiarity profile from layout analysis
 * @param mappings - Category mappings from detected to Fitzgerald
 * @returns Ordered array of Fitzgerald Key category IDs
 *
 * @example
 * ```typescript
 * const order = generateCategoryOrder(profile, mappings);
 * // ['greetings', 'people', 'actions', ...]
 * ```
 */
export function generateCategoryOrder(
  profile: FamiliarityProfile,
  mappings: CategoryMapping[]
): AACCategoryId[] {
  const result: AACCategoryId[] = [];
  const usedCategories = new Set<AACCategoryId>();

  // First, preserve detected category positions
  for (const categoryName of profile.categoryOrder) {
    const mapping = mappings.find(
      (m) => m.detectedCategory.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (mapping && !usedCategories.has(mapping.suggestedFitzgeraldId)) {
      result.push(mapping.suggestedFitzgeraldId);
      usedCategories.add(mapping.suggestedFitzgeraldId);
    }
  }

  // Add essential categories that weren't detected (for beginners)
  const essentialCategories: AACCategoryId[] = [
    'greetings',
    'people',
    'actions',
    'feelings',
    'safety',
  ];

  for (const essential of essentialCategories) {
    if (!usedCategories.has(essential)) {
      result.push(essential);
      usedCategories.add(essential);
    }
  }

  // Add remaining standard categories in default order
  for (const category of AAC_CATEGORIES) {
    const catId = category.id as AACCategoryId;
    if (!usedCategories.has(catId)) {
      result.push(catId);
      usedCategories.add(catId);
    }
  }

  return result;
}

/**
 * Maps all detected categories to their best Fitzgerald Key matches.
 *
 * @param detectedCategories - Categories from layout analysis
 * @returns Array of category mappings with confidence scores
 */
export function mapCategoriesToFitzgerald(
  detectedCategories: DetectedCategory[]
): CategoryMapping[] {
  const mappings: CategoryMapping[] = [];
  const usedFitzgeraldIds = new Set<AACCategoryId>();

  // Sort by confidence to prioritize better matches
  const sortedCategories = [...detectedCategories].sort(
    (a, b) => (b.confidence ?? 0.5) - (a.confidence ?? 0.5)
  );

  for (const detected of sortedCategories) {
    const matches = findMatchingFitzgeraldCategories(detected, usedFitzgeraldIds);

    if (matches.length > 0) {
      const bestMatch = matches[0];
      usedFitzgeraldIds.add(bestMatch.categoryId);

      mappings.push({
        detectedCategory: detected,
        suggestedFitzgeraldId: bestMatch.categoryId,
        confidence: bestMatch.confidence,
        alternatives: matches.slice(1, 4),
      });
    } else {
      // No match found - suggest 'custom' category
      mappings.push({
        detectedCategory: detected,
        suggestedFitzgeraldId: 'custom',
        confidence: 0.3,
        alternatives: [],
      });
    }
  }

  return mappings;
}

/**
 * Finds matching Fitzgerald Key categories for a detected category.
 *
 * @param detected - The detected category
 * @param usedIds - Set of already-used Fitzgerald IDs (for uniqueness)
 * @returns Sorted array of potential matches
 */
function findMatchingFitzgeraldCategories(
  detected: DetectedCategory,
  usedIds: Set<AACCategoryId>
): Array<{ categoryId: AACCategoryId; confidence: number }> {
  const matches: Array<{ categoryId: AACCategoryId; confidence: number }> = [];

  for (const category of AAC_CATEGORIES) {
    const catId = category.id as AACCategoryId;

    // Skip already used categories
    if (usedIds.has(catId)) continue;

    // Calculate match score
    const colorScore = calculateColorMatch(
      detected.color,
      FITZGERALD_COLORS[catId].bg
    );
    const nameScore = calculateNameMatch(detected.name, category.name);

    // Check sample labels for additional context
    const labelScore = calculateLabelMatch(
      detected.sampleLabels || [],
      catId
    );

    // Weighted average: name (50%), color (30%), labels (20%)
    const confidence = nameScore * 0.5 + colorScore * 0.3 + labelScore * 0.2;

    if (confidence >= 0.3) {
      matches.push({ categoryId: catId, confidence });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculates color similarity between two hex colors.
 */
function calculateColorMatch(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  // Max distance is ~441 (black to white)
  return Math.max(0, 1 - distance / 441.67);
}

/**
 * Converts hex to RGB.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates name similarity using keywords and synonyms.
 */
function calculateNameMatch(detected: string, fitzgerald: string): number {
  const d = detected.toLowerCase().trim();
  const f = fitzgerald.toLowerCase().trim();

  if (d === f) return 1;
  if (d.includes(f) || f.includes(d)) return 0.9;

  // Category-specific synonyms
  const synonymMap: Record<string, string[]> = {
    people: ['person', 'who', 'pronouns', 'names', 'family', 'i', 'you', 'we'],
    actions: ['verbs', 'doing', 'do', 'action', 'go', 'want', 'like'],
    feelings: ['emotions', 'feel', 'mood', 'happy', 'sad', 'how i feel'],
    questions: ['ask', 'question', 'wh', 'what', 'where', 'when', 'why'],
    greetings: ['hello', 'hi', 'social', 'polite', 'manners', 'please', 'thanks'],
    places: ['where', 'locations', 'go to', 'home', 'school'],
    food: ['eat', 'snacks', 'meals', 'hungry', 'yummy'],
    drinks: ['beverages', 'drink', 'thirsty', 'water', 'juice'],
    animals: ['pets', 'animal', 'dog', 'cat'],
    colors: ['colour', 'color', 'rainbow'],
    numbers: ['counting', 'math', 'quantity', 'more', '1', '2', '3'],
    body: ['body parts', 'my body', 'head', 'hand', 'tummy'],
    clothes: ['clothing', 'wear', 'dress', 'shirt', 'pants'],
    toys: ['play', 'games', 'fun', 'ball', 'blocks'],
    time: ['when', 'clock', 'schedule', 'now', 'later', 'wait'],
    weather: ['outside', 'sky', 'sunny', 'rain', 'hot', 'cold'],
    safety: ['stop', 'help', 'emergency', 'important', 'no', 'hurt'],
  };

  const synonyms = synonymMap[f] || [];
  if (synonyms.some((s) => d.includes(s))) {
    return 0.75;
  }

  return 0;
}

/**
 * Calculates how well sample labels match expected category cards.
 */
function calculateLabelMatch(
  sampleLabels: string[],
  categoryId: AACCategoryId
): number {
  if (sampleLabels.length === 0) return 0.5; // Neutral when no labels

  const categoryCards = getCardsByCategory(categoryId);
  const cardLabels = categoryCards.map((c) => c.label.toLowerCase());

  let matches = 0;
  for (const label of sampleLabels) {
    const normalized = label.toLowerCase().trim();
    if (cardLabels.some((cl) => cl.includes(normalized) || normalized.includes(cl))) {
      matches++;
    }
  }

  return sampleLabels.length > 0 ? matches / sampleLabels.length : 0;
}

/**
 * Generates an AACBoardConfig from a FamiliarityProfile.
 *
 * @param profile - The analyzed familiarity profile
 * @param defaultVoice - Default voice config to use
 * @returns Complete board configuration
 */
export function generateBoardConfig(
  profile: FamiliarityProfile,
  defaultVoice: VoiceConfig
): AACBoardConfig {
  const mappings = mapCategoriesToFitzgerald(profile.detectedCategories);
  const categoryOrder = generateCategoryOrder(profile, mappings);

  return {
    columns: profile.gridLayout.cols,
    rows: profile.gridLayout.rows,
    cardSize: CARD_SIZE_MAP[profile.cardSize] || CARD_SIZE_MAP.medium,
    gap: GAP_SIZE_MAP[profile.cardSpacing || 'normal'],
    showLabels: profile.showsCardLabels ?? true,
    defaultVoice,
    enabledCategories: categoryOrder,
  };
}

/**
 * Applies a FamiliarityProfile to generate a complete board setup.
 *
 * @param profile - The familiarity profile to apply
 * @param defaultVoice - Default voice configuration
 * @returns Result with board config and any unmapped categories
 *
 * @example
 * ```typescript
 * const result = applyFamiliarityProfile(profile, defaultVoice);
 * console.log(result.summary);
 * // "Applied layout with 5x8 grid, 12 categories mapped successfully"
 * ```
 */
export function applyFamiliarityProfile(
  profile: FamiliarityProfile,
  defaultVoice: VoiceConfig
): AppliedProfileResult {
  const mappings = mapCategoriesToFitzgerald(profile.detectedCategories);
  const categoryOrder = generateCategoryOrder(profile, mappings);
  const boardConfig = generateBoardConfig(profile, defaultVoice);

  // Find unmapped categories
  const unmappedCategories = mappings
    .filter((m) => m.suggestedFitzgeraldId === 'custom' || m.confidence < 0.4)
    .map((m) => m.detectedCategory.name);

  // Generate summary
  const mappedCount = mappings.length - unmappedCategories.length;
  const summary =
    unmappedCategories.length === 0
      ? `Applied layout with ${profile.gridLayout.rows}x${profile.gridLayout.cols} grid, all ${mappedCount} categories mapped successfully.`
      : `Applied layout with ${profile.gridLayout.rows}x${profile.gridLayout.cols} grid. ${mappedCount} categories mapped, ${unmappedCategories.length} need manual review.`;

  return {
    success: true,
    boardConfig: {
      columns: boardConfig.columns,
      rows: boardConfig.rows,
      cardSize: boardConfig.cardSize,
      gap: boardConfig.gap,
      showLabels: boardConfig.showLabels,
    },
    categoryOrder,
    unmappedCategories,
    summary,
  };
}

/**
 * Suggests home screen cards based on detected favorites and GLP stage.
 *
 * @param profile - The familiarity profile
 * @param glpStage - User's GLP stage (1-6)
 * @param maxCards - Maximum cards to suggest
 * @returns Array of card IDs for home screen
 */
export function suggestHomeScreenCards(
  profile: FamiliarityProfile,
  glpStage: 1 | 2 | 3 | 4 | 5 | 6,
  maxCards: number = 24
): string[] {
  const suggestions: string[] = [];
  const mappings = mapCategoriesToFitzgerald(profile.detectedCategories);

  // Prioritize categories that were detected
  const prioritizedCategories = mappings
    .filter((m) => m.confidence >= 0.5)
    .sort((a, b) => b.confidence - a.confidence)
    .map((m) => m.suggestedFitzgeraldId);

  // Add safety cards first (always important)
  const safetyCards = getCardsByCategory('safety')
    .filter((c) => !c.glpStage || c.glpStage <= glpStage)
    .slice(0, 3);
  suggestions.push(...safetyCards.map((c) => c.id));

  // Add cards from prioritized categories
  for (const categoryId of prioritizedCategories) {
    if (suggestions.length >= maxCards) break;

    const cards = getCardsByCategory(categoryId)
      .filter((c) => !c.glpStage || c.glpStage <= glpStage)
      .slice(0, Math.ceil(maxCards / prioritizedCategories.length));

    for (const card of cards) {
      if (suggestions.length >= maxCards) break;
      if (!suggestions.includes(card.id)) {
        suggestions.push(card.id);
      }
    }
  }

  // Fill remaining slots with essential cards
  const essentialIds = ['hello', 'yes', 'no', 'help', 'want', 'more', 'stop'];
  for (const id of essentialIds) {
    if (suggestions.length >= maxCards) break;
    if (!suggestions.includes(id)) {
      suggestions.push(id);
    }
  }

  return suggestions.slice(0, maxCards);
}

export default {
  generateCategoryOrder,
  mapCategoriesToFitzgerald,
  generateBoardConfig,
  applyFamiliarityProfile,
  suggestHomeScreenCards,
};
