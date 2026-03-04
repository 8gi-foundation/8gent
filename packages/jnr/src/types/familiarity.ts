/**
 * @fileoverview TypeScript type definitions for the AAC Familiarity System.
 *
 * The Familiarity System enables "zero friction" onboarding by analyzing
 * a user's existing AAC device/app screenshots and generating a profile
 * that makes their new 8gent Jr AAC feel immediately familiar.
 *
 * Key concepts:
 * - FamiliarityProfile: The result of analyzing a user's existing AAC setup
 * - DetectedCategory: Individual category information extracted from screenshots
 * - CategoryMapping: How detected categories map to Fitzgerald Key categories
 * - AACScreenshotAnalysis: Full analysis result for a single screenshot
 *
 * @module types/familiarity
 */

import type { AACCategoryId } from './aac';

/**
 * Color scheme types for AAC boards.
 * - 'fitzgerald': Standard Fitzgerald Key color coding
 * - 'custom': User's own color scheme
 * - 'high-contrast': High contrast for visual accessibility
 */
export type ColorSchemeType = 'fitzgerald' | 'custom' | 'high-contrast';

/**
 * Icon/symbol library types commonly used in AAC.
 * - 'arasaac': ARASAAC open-source symbols
 * - 'pcs': Boardmaker PCS symbols
 * - 'symbolstix': SymbolStix symbols
 * - 'photos': Real photographs
 * - 'mixed': Combination of multiple styles
 */
export type IconStyleType = 'arasaac' | 'pcs' | 'symbolstix' | 'photos' | 'mixed';

/**
 * Card size variants for the AAC board.
 */
export type CardSizeType = 'small' | 'medium' | 'large';

/**
 * Position of a category or card in the grid.
 */
export interface GridPosition {
  /** Row index (0-based) */
  row: number;
  /** Column index (0-based) */
  col: number;
}

/**
 * Represents a single detected category from an AAC screenshot.
 * Contains information about the category's visual appearance and position.
 */
export interface DetectedCategory {
  /**
   * Human-readable name of the category as detected.
   * This may not exactly match Fitzgerald Key category names.
   * @example "Feelings", "I want", "Actions", "People"
   */
  name: string;

  /**
   * Primary color of the category as detected (hex format).
   * Used for matching to Fitzgerald Key colors.
   * @example "#FFCC80", "#A5D6A7"
   */
  color: string;

  /**
   * Position of the category in the grid layout.
   */
  position: GridPosition;

  /**
   * Number of cards visible in this category.
   * Used to estimate category importance/size.
   */
  cardCount: number;

  /**
   * Optional border color if different from background.
   */
  borderColor?: string;

  /**
   * Confidence score for this category detection (0-1).
   */
  confidence?: number;

  /**
   * Sample card labels detected in this category.
   * Helps with category identification.
   */
  sampleLabels?: string[];
}

/**
 * Mapping between a detected category and a Fitzgerald Key category.
 */
export interface CategoryMapping {
  /**
   * The detected category from the user's existing AAC.
   */
  detectedCategory: DetectedCategory;

  /**
   * The suggested Fitzgerald Key category ID to map to.
   */
  suggestedFitzgeraldId: AACCategoryId;

  /**
   * Confidence score for this mapping (0-1).
   * Higher values indicate a more certain match.
   */
  confidence: number;

  /**
   * Whether this mapping was manually confirmed by the user.
   */
  isUserConfirmed?: boolean;

  /**
   * Alternative Fitzgerald Key categories that could also match.
   * Sorted by confidence descending.
   */
  alternatives?: Array<{
    categoryId: AACCategoryId;
    confidence: number;
  }>;
}

/**
 * Profile generated from analyzing a user's existing AAC setup.
 * This profile is applied to configure their new 8gent Jr AAC board
 * to feel immediately familiar.
 */
export interface FamiliarityProfile {
  /**
   * Unique identifier for this profile.
   */
  id: string;

  /**
   * The color scheme detected in the user's existing AAC.
   * - 'fitzgerald': Standard Fitzgerald Key colors detected
   * - 'custom': Non-standard color scheme
   * - 'high-contrast': High contrast accessibility colors
   */
  colorScheme: ColorSchemeType;

  /**
   * Grid layout dimensions detected from screenshots.
   */
  gridLayout: {
    /** Number of rows in the grid */
    rows: number;
    /** Number of columns in the grid */
    cols: number;
  };

  /**
   * Card size as detected from the screenshots.
   * Maps to 8gent Jr card size settings.
   */
  cardSize: CardSizeType;

  /**
   * Icon/symbol style detected in the screenshots.
   * Helps determine which symbol library to use.
   */
  iconStyle: IconStyleType;

  /**
   * Order of categories as they appear in the user's existing AAC.
   * Used to replicate familiar navigation patterns.
   */
  categoryOrder: string[];

  /**
   * All categories detected from the analyzed screenshots.
   */
  detectedCategories: DetectedCategory[];

  /**
   * Overall similarity score between detected layout and
   * standard Fitzgerald Key layout (0-100).
   * Higher score = more similar to standard AAC conventions.
   */
  layoutSimilarityScore: number;

  /**
   * Custom color mappings if the detected scheme is 'custom'.
   * Maps category names to their detected colors.
   */
  customColors?: Record<string, string>;

  /**
   * Whether the user's existing AAC shows category labels.
   */
  showsCategoryLabels?: boolean;

  /**
   * Whether the user's existing AAC shows card labels.
   */
  showsCardLabels?: boolean;

  /**
   * Font size preference detected (relative scale).
   * 1.0 = standard, <1.0 = smaller, >1.0 = larger
   */
  fontScale?: number;

  /**
   * Spacing between cards (dense, normal, spacious).
   */
  cardSpacing?: 'dense' | 'normal' | 'spacious';

  /**
   * Timestamp when this profile was created.
   */
  createdAt: string;

  /**
   * Timestamp when this profile was last updated.
   */
  updatedAt: string;
}

/**
 * Full analysis result for a single AAC screenshot.
 */
export interface AACScreenshotAnalysis {
  /**
   * URL or data URI of the analyzed image.
   */
  imageUrl: string;

  /**
   * The familiarity profile extracted from this image.
   */
  analysis: Partial<FamiliarityProfile>;

  /**
   * Overall confidence in the analysis (0-1).
   * Based on image quality, clarity, and detection certainty.
   */
  confidence: number;

  /**
   * Suggested mappings from detected categories to Fitzgerald Key.
   */
  suggestedMappings: CategoryMapping[];

  /**
   * Raw AI analysis response for debugging.
   */
  rawAnalysis?: string;

  /**
   * Any warnings or issues detected during analysis.
   * @example ["Low image quality", "Some categories may be occluded"]
   */
  warnings?: string[];

  /**
   * Processing time in milliseconds.
   */
  processingTimeMs?: number;
}

/**
 * State for the AAC upload and analysis process.
 */
export interface AACAnalysisState {
  /** Current step in the analysis flow */
  step: 'upload' | 'analyzing' | 'review' | 'complete';

  /** Uploaded image URLs/data URIs */
  uploadedImages: string[];

  /** Analysis results for each uploaded image */
  analyses: AACScreenshotAnalysis[];

  /** Combined/merged profile from all analyses */
  mergedProfile: FamiliarityProfile | null;

  /** Whether the user has confirmed the detected layout */
  isConfirmed: boolean;

  /** Any user adjustments to the detected profile */
  userAdjustments: Partial<FamiliarityProfile>;

  /** Error message if analysis failed */
  error: string | null;

  /** Progress percentage during analysis (0-100) */
  progress: number;
}

/**
 * Options for the layout analyzer.
 */
export interface LayoutAnalyzerOptions {
  /**
   * Maximum number of images to analyze.
   * @default 5
   */
  maxImages?: number;

  /**
   * Whether to include detailed raw analysis in results.
   * @default false
   */
  includeRawAnalysis?: boolean;

  /**
   * Minimum confidence threshold for category detection.
   * Categories below this threshold are excluded.
   * @default 0.6
   */
  confidenceThreshold?: number;

  /**
   * Whether to attempt to detect specific AAC apps
   * (e.g., TouchChat, LAMP, Proloquo2Go).
   * @default true
   */
  detectAppType?: boolean;
}

/**
 * Result of applying a familiarity profile to an AAC board.
 */
export interface AppliedProfileResult {
  /** Whether the profile was successfully applied */
  success: boolean;

  /** The board configuration after applying the profile */
  boardConfig: {
    columns: number;
    rows: number;
    cardSize: number;
    gap: number;
    showLabels: boolean;
  };

  /** Category order applied */
  categoryOrder: AACCategoryId[];

  /** Any categories that couldn't be mapped */
  unmappedCategories: string[];

  /** User-facing summary of what was applied */
  summary: string;
}

/**
 * Known AAC app signatures for detection.
 */
export interface KnownAACApp {
  /** Name of the AAC app */
  name: string;

  /** Visual characteristics that help identify this app */
  characteristics: {
    /** Typical grid dimensions */
    gridLayout?: { rows: number; cols: number };
    /** Common color scheme */
    colorScheme?: ColorSchemeType;
    /** Icon style used */
    iconStyle?: IconStyleType;
    /** Distinctive UI elements */
    distinctiveElements?: string[];
  };

  /** Confidence threshold for positive identification */
  detectionThreshold: number;
}

/**
 * List of known AAC apps for detection.
 */
export const KNOWN_AAC_APPS: KnownAACApp[] = [
  {
    name: 'TouchChat',
    characteristics: {
      iconStyle: 'pcs',
      colorScheme: 'fitzgerald',
      distinctiveElements: ['navigation bar', 'sentence strip'],
    },
    detectionThreshold: 0.7,
  },
  {
    name: 'Proloquo2Go',
    characteristics: {
      iconStyle: 'symbolstix',
      colorScheme: 'fitzgerald',
      distinctiveElements: ['grid layout', 'category tabs'],
    },
    detectionThreshold: 0.7,
  },
  {
    name: 'LAMP Words for Life',
    characteristics: {
      iconStyle: 'pcs',
      colorScheme: 'custom',
      gridLayout: { rows: 5, cols: 9 },
      distinctiveElements: ['motor planning layout', 'unity symbols'],
    },
    detectionThreshold: 0.75,
  },
  {
    name: 'GoTalk NOW',
    characteristics: {
      iconStyle: 'mixed',
      colorScheme: 'custom',
      distinctiveElements: ['page navigation', 'record button'],
    },
    detectionThreshold: 0.65,
  },
  {
    name: 'TD Snap',
    characteristics: {
      iconStyle: 'pcs',
      colorScheme: 'fitzgerald',
      distinctiveElements: ['toolbar', 'message window'],
    },
    detectionThreshold: 0.7,
  },
];

export default {};
