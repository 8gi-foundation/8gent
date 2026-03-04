/**
 * @fileoverview TypeScript type definitions for the 8gent Jr AAC system.
 *
 * These types define the core data structures for:
 * - AAC cards and their visual/audio properties
 * - Card categories following Fitzgerald Key color coding
 * - GLP (Gestalt Language Processing) stages
 * - Speech synthesis configuration
 * - Voice designer settings
 *
 * @module types/aac
 */

/**
 * 18 categories following the Fitzgerald Key color coding system
 * Standard AAC categorization for children's communication boards
 */
export type AACCategoryId =
  | 'people'      // Yellow - People, pronouns
  | 'actions'     // Green - Verbs, actions
  | 'feelings'    // Blue - Emotions, states
  | 'questions'   // Purple - Question words
  | 'greetings'   // Orange - Social phrases
  | 'places'      // Brown - Locations
  | 'food'        // Red - Food items
  | 'drinks'      // Red - Beverages
  | 'animals'     // Green - Animals
  | 'colors'      // Various - Color words
  | 'numbers'     // White - Numerals
  | 'body'        // Pink - Body parts
  | 'clothes'     // Pink - Clothing items
  | 'toys'        // Yellow - Play items
  | 'time'        // White - Time concepts
  | 'weather'     // Blue - Weather conditions
  | 'safety'      // Red - Safety words (stop, help, no)
  | 'custom';     // Gray - User-created cards

/**
 * GLP (Gestalt Language Processing) Stage
 * Used to track language development stages for echolalic/gestalt learners
 *
 * Stage 1: Echolalia (full scripts)
 * Stage 2: Mix and match (combining gestalts)
 * Stage 3: Single words + combinations
 * Stage 4: Beginning grammar
 * Stage 5: More advanced grammar
 * Stage 6: Spontaneous, self-generated language
 */
export type GLPStage = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Represents a single AAC communication card.
 * Cards can be pre-built from the library or AI-generated.
 */
export interface AACCard {
  /** Unique identifier for the card */
  id: string;

  /** Display label shown on the card */
  label: string;

  /** Text to be spoken when card is activated */
  speechText: string;

  /** URL or path to the card's image */
  imageUrl: string;

  /** Category this card belongs to */
  categoryId: AACCategoryId;

  /** Whether this card was AI-generated vs pre-built */
  isGenerated: boolean;

  /** GLP stage this card is appropriate for (1-6) */
  glpStage?: GLPStage;

  /** Whether this is a custom user-created card */
  isCustom?: boolean;

  /** When the card was created (ISO string) */
  createdAt?: string;

  /** Optional custom voice ID for this specific card */
  voiceId?: string;

  /** Background color for the card (hex) */
  backgroundColor?: string;

  /** Border color for the card (hex) */
  borderColor?: string;

  /** Sort order within category */
  order?: number;

  /** Metadata for AI-generated cards */
  generationMeta?: CardGenerationMeta;

  /** Alternative text for accessibility */
  altText?: string;

  /** Symbol library source */
  symbolSource?: 'arasaac' | 'fal-generated' | 'custom' | 'stock';

  /** Tags for search and filtering */
  tags?: string[];
}

/**
 * Metadata for AI-generated cards
 */
export interface CardGenerationMeta {
  /** The prompt used to generate the image */
  prompt: string;

  /** Timestamp of generation */
  generatedAt: string;

  /** Model used for generation */
  model: string;

  /** Generation seed for reproducibility */
  seed?: number;
}

/**
 * Card category for organizing AAC cards
 * Follows Fitzgerald Key color coding system
 */
export interface AACCategory {
  /** Unique identifier for the category */
  id: AACCategoryId;

  /** Display name for the category */
  name: string;

  /** Icon identifier or emoji for the category */
  icon: string;

  /** Background color for category (Fitzgerald Key hex) */
  color: string;

  /** Border color for cards in this category */
  borderColor: string;

  /** Text color for this category */
  textColor: string;

  /** Sort order in navigation */
  order: number;

  /** Whether this is a system category (non-deletable) */
  isSystem: boolean;

  /** Description of what cards belong in this category */
  description?: string;
}

/**
 * Fitzgerald Key category metadata (18 standard categories)
 */
export interface FitzgeraldKeyMeta {
  categories: AACCategory[];
}

/**
 * Voice configuration for TTS
 */
export interface VoiceConfig {
  /** ElevenLabs voice ID */
  voiceId: string;

  /** Display name for the voice */
  name: string;

  /** Voice stability (0-1) */
  stability: number;

  /** Voice similarity boost (0-1) */
  similarityBoost: number;

  /** Speaking rate multiplier */
  speakingRate: number;

  /** Whether this is the default voice */
  isDefault: boolean;
}

/**
 * Voice Designer configuration for creating custom voices
 */
export interface VoiceDesignerConfig {
  /** Age descriptor (young, middle_aged, old) */
  age: 'young' | 'middle_aged' | 'old';

  /** Gender (male, female, neutral) */
  gender: 'male' | 'female' | 'neutral';

  /** Accent/language */
  accent: string;

  /** Text description of voice characteristics */
  description: string;

  /** Sample text for voice preview */
  sampleText: string;
}

/**
 * User's AAC board configuration
 */
export interface AACBoardConfig {
  /** Number of columns in the grid */
  columns: number;

  /** Number of rows visible */
  rows: number;

  /** Card size in pixels */
  cardSize: number;

  /** Gap between cards in pixels */
  gap: number;

  /** Whether to show labels on cards */
  showLabels: boolean;

  /** Default voice configuration */
  defaultVoice: VoiceConfig;

  /** Enabled categories */
  enabledCategories: string[];
}

/**
 * State for the AAC sentence builder
 */
export interface SentenceBuilderState {
  /** Currently selected cards forming the sentence */
  selectedCards: AACCard[];

  /** Maximum cards allowed in sentence */
  maxCards: number;

  /** Whether sentence is currently being spoken */
  isSpeaking: boolean;
}

/**
 * Card generation request
 */
export interface CardGenerationRequest {
  /** Text description of what to generate */
  prompt: string;

  /** Label for the new card */
  label: string;

  /** Speech text (defaults to label if not provided) */
  speechText?: string;

  /** Category to add card to */
  categoryId: AACCategoryId;

  /** GLP stage for the card */
  glpStage?: GLPStage;

  /** User ID for storing custom cards */
  userId?: string;

  /** Image style preset */
  style?: 'arasaac' | 'cartoon' | 'realistic' | 'simple';
}

/**
 * Card generation result from Fal.ai
 */
export interface CardGenerationResult {
  success: boolean;
  card?: AACCard;
  error?: string;
  cached: boolean;
}

/**
 * User's personal card library
 */
export interface UserCardLibrary {
  userId: string;
  cards: AACCard[];
  favorites: string[];
  recentlyUsed: string[];
  customCategories?: CustomCategoryDef[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Custom category definition
 */
export interface CustomCategoryDef {
  id: string;
  label: string;
  color: string;
  icon: string;
  parentCategory?: AACCategoryId;
}

/**
 * Card filter options
 */
export interface CardFilterOptions {
  categories?: AACCategoryId[];
  glpStages?: GLPStage[];
  searchQuery?: string;
  showCustomOnly?: boolean;
  showFavoritesOnly?: boolean;
}

/**
 * Card display size variants
 */
export type CardSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Card display configuration
 */
export interface CardDisplayConfig {
  size: CardSize;
  showLabel: boolean;
  showCategory: boolean;
  labelPosition: 'top' | 'bottom' | 'overlay';
  aspectRatio: '1:1' | '4:3' | '3:4';
}

/**
 * Speech synthesis request
 */
export interface SpeechRequest {
  /** Text to speak */
  text: string;

  /** Voice ID to use (defaults to user's default) */
  voiceId?: string;

  /** Optional callback when speech completes */
  onComplete?: () => void;

  /** Optional callback on error */
  onError?: (error: Error) => void;
}

export default {};
