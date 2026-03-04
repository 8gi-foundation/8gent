/**
 * @fileoverview AAC Layout Analyzer using AI Vision
 *
 * This module analyzes uploaded AAC screenshots using Claude's vision
 * capabilities to extract layout information, color schemes, and
 * category organization. The goal is to create a FamiliarityProfile
 * that can be applied to make the new AAC board feel like home.
 *
 * Key features:
 * - Multi-image analysis support
 * - Grid layout detection (rows x columns)
 * - Color scheme extraction
 * - Category identification and mapping
 * - Icon style detection (ARASAAC, PCS, SymbolStix, etc.)
 * - Known AAC app detection
 *
 * @module lib/aac/layoutAnalyzer
 */

import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import type {
  FamiliarityProfile,
  DetectedCategory,
  AACScreenshotAnalysis,
  CategoryMapping,
  LayoutAnalyzerOptions,
  ColorSchemeType,
  IconStyleType,
  CardSizeType,
  KNOWN_AAC_APPS,
} from '@/types/familiarity';
import { AAC_CATEGORIES, FITZGERALD_COLORS } from './categories';
import type { AACCategoryId } from '@/types/aac';

/**
 * Zod schema for detected category from AI analysis.
 */
const DetectedCategorySchema = z.object({
  name: z.string().describe('The name of the detected category'),
  color: z.string().describe('Primary background color in hex format'),
  position: z.object({
    row: z.number().describe('Row index (0-based)'),
    col: z.number().describe('Column index (0-based)'),
  }),
  cardCount: z.number().describe('Approximate number of cards in this category'),
  borderColor: z.string().optional().describe('Border color if visible'),
  confidence: z.number().min(0).max(1).describe('Detection confidence 0-1'),
  sampleLabels: z.array(z.string()).optional().describe('Sample card labels visible'),
});

/**
 * Zod schema for the AI vision analysis response.
 */
const AnalysisResponseSchema = z.object({
  gridLayout: z.object({
    rows: z.number().describe('Number of rows visible in the grid'),
    cols: z.number().describe('Number of columns visible in the grid'),
  }),
  colorScheme: z.enum(['fitzgerald', 'custom', 'high-contrast']).describe(
    'The color coding scheme detected'
  ),
  iconStyle: z.enum(['arasaac', 'pcs', 'symbolstix', 'photos', 'mixed']).describe(
    'The style of icons/symbols used'
  ),
  cardSize: z.enum(['small', 'medium', 'large']).describe(
    'Relative size of the cards'
  ),
  categories: z.array(DetectedCategorySchema).describe(
    'All detected categories with their properties'
  ),
  categoryOrder: z.array(z.string()).describe(
    'Order of categories as they appear (top-left to bottom-right)'
  ),
  showsLabels: z.boolean().describe('Whether cards show text labels'),
  detectedAppName: z.string().optional().describe(
    'Name of the AAC app if recognized'
  ),
  layoutNotes: z.string().optional().describe(
    'Any additional observations about the layout'
  ),
  overallConfidence: z.number().min(0).max(1).describe(
    'Overall confidence in the analysis'
  ),
});

type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;

/**
 * Default options for the layout analyzer.
 */
const DEFAULT_OPTIONS: Required<LayoutAnalyzerOptions> = {
  maxImages: 5,
  includeRawAnalysis: false,
  confidenceThreshold: 0.6,
  detectAppType: true,
};

/**
 * System prompt for the AI vision analysis.
 */
const ANALYSIS_SYSTEM_PROMPT = `You are an expert AAC (Augmentative and Alternative Communication) layout analyzer.
Your task is to analyze screenshots of AAC apps/devices to extract layout information.

Key things to identify:
1. GRID LAYOUT: Count the rows and columns of communication buttons/cards
2. COLOR SCHEME:
   - "fitzgerald" if using standard Fitzgerald Key colors (yellow=people, green=verbs, blue=feelings, etc.)
   - "high-contrast" if using black/white or high contrast colors
   - "custom" if using non-standard colors
3. ICON STYLE: Identify the symbol library being used
   - "arasaac" - ARASAAC open-source pictograms
   - "pcs" - Boardmaker PCS (Picture Communication Symbols)
   - "symbolstix" - SymbolStix symbols
   - "photos" - Real photographs
   - "mixed" - Combination of styles
4. CATEGORIES: For each visible category, detect:
   - Name (e.g., "People", "Actions", "Feelings")
   - Color (hex format)
   - Position in the grid
   - Approximate card count
   - Sample labels if visible
5. CARD SIZE: Relative to screen (small, medium, large)
6. APP DETECTION: Try to identify known apps like TouchChat, Proloquo2Go, LAMP, TD Snap

Be precise with colors (use actual hex values detected).
If uncertain, lower your confidence score.
Focus on extracting actionable layout data for recreation.`;

/**
 * Analyzes a single AAC screenshot using AI vision.
 *
 * @param imageUrl - URL or base64 data URI of the screenshot
 * @param options - Analysis options
 * @returns Promise resolving to the screenshot analysis
 *
 * @example
 * ```typescript
 * const analysis = await analyzeAACScreenshot(
 *   'data:image/png;base64,...',
 *   { includeRawAnalysis: true }
 * );
 * console.log(analysis.analysis.gridLayout); // { rows: 4, cols: 6 }
 * ```
 */
export async function analyzeAACScreenshot(
  imageUrl: string,
  options: LayoutAnalyzerOptions = {}
): Promise<AACScreenshotAnalysis> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  try {
    const { object: response } = await generateObject({
      model: anthropic('claude-sonnet-4-20250514'),
      schema: AnalysisResponseSchema,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: imageUrl,
            },
            {
              type: 'text',
              text: `Analyze this AAC (Augmentative and Alternative Communication) screenshot.
Extract the grid layout, color scheme, icon style, and all visible categories.
Be as precise as possible with colors (use hex values).
Identify the app if you recognize it.`,
            },
          ],
        },
      ],
    });

    // Filter categories by confidence threshold
    const filteredCategories = response.categories.filter(
      (cat) => (cat.confidence ?? 0) >= opts.confidenceThreshold
    );

    // Generate category mappings to Fitzgerald Key
    const suggestedMappings = generateCategoryMappings(filteredCategories);

    // Build partial familiarity profile
    const analysis: Partial<FamiliarityProfile> = {
      gridLayout: response.gridLayout,
      colorScheme: response.colorScheme,
      iconStyle: response.iconStyle,
      cardSize: response.cardSize,
      categoryOrder: response.categoryOrder,
      detectedCategories: filteredCategories as DetectedCategory[],
      showsCardLabels: response.showsLabels,
    };

    const result: AACScreenshotAnalysis = {
      imageUrl,
      analysis,
      confidence: response.overallConfidence,
      suggestedMappings,
      processingTimeMs: Date.now() - startTime,
    };

    // Include raw analysis if requested
    if (opts.includeRawAnalysis) {
      result.rawAnalysis = JSON.stringify(response, null, 2);
    }

    // Add warnings if needed
    const warnings: string[] = [];
    if (response.overallConfidence < 0.7) {
      warnings.push('Low confidence analysis - image may be unclear');
    }
    if (filteredCategories.length < response.categories.length) {
      warnings.push(
        `${response.categories.length - filteredCategories.length} categories excluded due to low confidence`
      );
    }
    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to analyze AAC screenshot: ${errorMessage}`);
  }
}

/**
 * Analyzes multiple AAC screenshots and merges the results.
 *
 * @param imageUrls - Array of image URLs or data URIs
 * @param options - Analysis options
 * @returns Promise resolving to merged analysis and full profile
 *
 * @example
 * ```typescript
 * const result = await analyzeMultipleScreenshots([
 *   'data:image/png;base64,img1...',
 *   'data:image/png;base64,img2...',
 * ]);
 * console.log(result.mergedProfile.layoutSimilarityScore); // 85
 * ```
 */
export async function analyzeMultipleScreenshots(
  imageUrls: string[],
  options: LayoutAnalyzerOptions = {}
): Promise<{
  analyses: AACScreenshotAnalysis[];
  mergedProfile: FamiliarityProfile;
}> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const imagesToAnalyze = imageUrls.slice(0, opts.maxImages);

  // Analyze all screenshots in parallel
  const analyses = await Promise.all(
    imagesToAnalyze.map((url) => analyzeAACScreenshot(url, opts))
  );

  // Merge analyses into a single profile
  const mergedProfile = mergeAnalyses(analyses);

  return {
    analyses,
    mergedProfile,
  };
}

/**
 * Generates category mappings from detected categories to Fitzgerald Key.
 *
 * @param detectedCategories - Categories detected from screenshot
 * @returns Array of category mappings with confidence scores
 */
function generateCategoryMappings(
  detectedCategories: z.infer<typeof DetectedCategorySchema>[]
): CategoryMapping[] {
  return detectedCategories.map((detected) => {
    const matches = findBestFitzgeraldMatch(detected);
    const bestMatch = matches[0];

    return {
      detectedCategory: detected as DetectedCategory,
      suggestedFitzgeraldId: bestMatch.categoryId,
      confidence: bestMatch.confidence,
      alternatives: matches.slice(1, 4), // Top 3 alternatives
    };
  });
}

/**
 * Finds the best matching Fitzgerald Key category for a detected category.
 * Uses both color matching and name similarity.
 *
 * @param detected - The detected category to match
 * @returns Sorted array of potential matches with confidence scores
 */
function findBestFitzgeraldMatch(
  detected: z.infer<typeof DetectedCategorySchema>
): Array<{ categoryId: AACCategoryId; confidence: number }> {
  const matches: Array<{ categoryId: AACCategoryId; confidence: number }> = [];

  for (const category of AAC_CATEGORIES) {
    let confidence = 0;

    // Color similarity (40% weight)
    const colorSim = calculateColorSimilarity(
      detected.color,
      FITZGERALD_COLORS[category.id as AACCategoryId].bg
    );
    confidence += colorSim * 0.4;

    // Name similarity (60% weight)
    const nameSim = calculateNameSimilarity(detected.name, category.name);
    confidence += nameSim * 0.6;

    matches.push({
      categoryId: category.id as AACCategoryId,
      confidence: Math.min(confidence, 1),
    });
  }

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculates color similarity between two hex colors.
 *
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Similarity score 0-1
 */
function calculateColorSimilarity(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  // Calculate Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  // Max possible distance is sqrt(3 * 255^2) = ~441
  const maxDistance = 441.67;
  return 1 - distance / maxDistance;
}

/**
 * Converts hex color to RGB.
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
 * Calculates name similarity using simple string matching.
 *
 * @param name1 - First name
 * @param name2 - Second name
 * @returns Similarity score 0-1
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const n1 = name1.toLowerCase().trim();
  const n2 = name2.toLowerCase().trim();

  // Exact match
  if (n1 === n2) return 1;

  // Contains match
  if (n1.includes(n2) || n2.includes(n1)) return 0.8;

  // Common synonyms/aliases for AAC categories
  const synonyms: Record<string, string[]> = {
    people: ['person', 'who', 'pronouns', 'names', 'family'],
    actions: ['verbs', 'doing', 'do', 'action words'],
    feelings: ['emotions', 'how i feel', 'feel', 'mood'],
    questions: ['ask', 'question words', 'wh words'],
    greetings: ['hello', 'social', 'hi', 'polite words'],
    places: ['where', 'locations', 'go to'],
    food: ['eat', 'snacks', 'meals', 'foods'],
    drinks: ['beverages', 'drink', 'thirsty'],
    animals: ['pets', 'animal'],
    colors: ['colour', 'color words'],
    numbers: ['counting', 'math', 'quantity'],
    body: ['body parts', 'my body'],
    clothes: ['clothing', 'wear', 'dress'],
    toys: ['play', 'games', 'fun'],
    time: ['when', 'clock', 'schedule'],
    weather: ['outside', 'sky'],
    safety: ['stop', 'help', 'emergency', 'important'],
  };

  // Check synonym matches
  for (const [key, syns] of Object.entries(synonyms)) {
    if (
      (n2 === key && syns.some((s) => n1.includes(s))) ||
      (n1 === key && syns.some((s) => n2.includes(s)))
    ) {
      return 0.7;
    }
  }

  // Levenshtein distance for fuzzy matching
  const levenshtein = calculateLevenshteinDistance(n1, n2);
  const maxLen = Math.max(n1.length, n2.length);
  return Math.max(0, 1 - levenshtein / maxLen);
}

/**
 * Calculates Levenshtein edit distance between two strings.
 */
function calculateLevenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Merges multiple screenshot analyses into a single FamiliarityProfile.
 *
 * @param analyses - Array of screenshot analyses
 * @returns Merged FamiliarityProfile
 */
function mergeAnalyses(analyses: AACScreenshotAnalysis[]): FamiliarityProfile {
  if (analyses.length === 0) {
    throw new Error('Cannot merge empty analyses array');
  }

  // Use weighted voting based on confidence
  const weightedVote = <T extends string>(
    getter: (a: AACScreenshotAnalysis) => T | undefined
  ): T => {
    const votes: Record<string, number> = {};
    for (const analysis of analyses) {
      const value = getter(analysis);
      if (value) {
        votes[value] = (votes[value] || 0) + analysis.confidence;
      }
    }
    const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] as T;
  };

  // Average numeric values weighted by confidence
  const weightedAverage = (getter: (a: AACScreenshotAnalysis) => number): number => {
    let sum = 0;
    let totalWeight = 0;
    for (const analysis of analyses) {
      const value = getter(analysis);
      const weight = analysis.confidence;
      sum += value * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? sum / totalWeight : 0;
  };

  // Merge detected categories (dedupe by name similarity)
  const allCategories: DetectedCategory[] = [];
  const seenNames = new Set<string>();

  for (const analysis of analyses) {
    for (const cat of analysis.analysis.detectedCategories || []) {
      const normalizedName = cat.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        allCategories.push(cat);
      }
    }
  }

  // Calculate layout similarity to Fitzgerald Key
  const layoutSimilarityScore = calculateLayoutSimilarity(allCategories);

  // Build merged profile
  const now = new Date().toISOString();
  const profile: FamiliarityProfile = {
    id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    colorScheme: weightedVote((a) => a.analysis.colorScheme),
    gridLayout: {
      rows: Math.round(weightedAverage((a) => a.analysis.gridLayout?.rows || 4)),
      cols: Math.round(weightedAverage((a) => a.analysis.gridLayout?.cols || 6)),
    },
    cardSize: weightedVote((a) => a.analysis.cardSize),
    iconStyle: weightedVote((a) => a.analysis.iconStyle),
    categoryOrder: mergeCategoryOrders(analyses),
    detectedCategories: allCategories,
    layoutSimilarityScore,
    showsCardLabels: analyses.some((a) => a.analysis.showsCardLabels),
    createdAt: now,
    updatedAt: now,
  };

  return profile;
}

/**
 * Merges category orders from multiple analyses.
 */
function mergeCategoryOrders(analyses: AACScreenshotAnalysis[]): string[] {
  const orderCounts: Record<string, Record<number, number>> = {};

  // Count position occurrences for each category
  for (const analysis of analyses) {
    const order = analysis.analysis.categoryOrder || [];
    for (let i = 0; i < order.length; i++) {
      const cat = order[i];
      if (!orderCounts[cat]) orderCounts[cat] = {};
      orderCounts[cat][i] = (orderCounts[cat][i] || 0) + analysis.confidence;
    }
  }

  // Determine best position for each category
  const categoryPositions: Array<{ name: string; position: number }> = [];
  for (const [cat, positions] of Object.entries(orderCounts)) {
    const bestPos = Object.entries(positions).sort((a, b) => b[1] - a[1])[0];
    categoryPositions.push({ name: cat, position: parseInt(bestPos[0]) });
  }

  // Sort by position
  return categoryPositions.sort((a, b) => a.position - b.position).map((c) => c.name);
}

/**
 * Calculates how similar the detected layout is to standard Fitzgerald Key.
 *
 * @param detectedCategories - Categories detected from screenshots
 * @returns Similarity score 0-100
 */
function calculateLayoutSimilarity(detectedCategories: DetectedCategory[]): number {
  if (detectedCategories.length === 0) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  for (const detected of detectedCategories) {
    const matches = findBestFitzgeraldMatch({
      ...detected,
      confidence: detected.confidence ?? 0.8,
    });
    const bestMatch = matches[0];

    // Weight by detection confidence
    const weight = detected.confidence ?? 0.8;
    totalScore += bestMatch.confidence * weight * 100;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

/**
 * Validates that an image URL/data URI is suitable for analysis.
 *
 * @param imageUrl - The image URL or data URI to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateImageForAnalysis(imageUrl: string): {
  isValid: boolean;
  error?: string;
} {
  // Check if it's a data URI
  if (imageUrl.startsWith('data:')) {
    // Validate data URI format
    const match = imageUrl.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/);
    if (!match) {
      return {
        isValid: false,
        error: 'Invalid image data URI format. Supported formats: PNG, JPEG, WebP, GIF',
      };
    }

    // Check if base64 data is present
    const base64Data = imageUrl.split(',')[1];
    if (!base64Data || base64Data.length < 100) {
      return {
        isValid: false,
        error: 'Image data appears to be empty or too small',
      };
    }

    return { isValid: true };
  }

  // Check if it's a valid URL
  try {
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS URLs are supported',
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid image URL format',
    };
  }
}

export default {
  analyzeAACScreenshot,
  analyzeMultipleScreenshots,
  validateImageForAnalysis,
};
