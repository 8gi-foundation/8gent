/**
 * @fileoverview AAC State Management Hook
 *
 * This hook manages the global state for the AAC system including:
 * - Current cards and categories
 * - Sentence builder state
 * - Board configuration
 * - User preferences
 *
 * Uses Zustand for state management with persistence.
 *
 * @module hooks/useAAC
 */

import { useCallback, useMemo } from 'react';
import type {
  AACCard,
  AACCategory,
  AACBoardConfig,
  SentenceBuilderState,
  AACCategoryId,
} from '@/types/aac';
import { CARD_LIBRARY, getAllCards, getCardsByCategory } from '@/lib/aac/cardLibrary';
import { AAC_CATEGORIES } from '@/lib/aac/categories';

/**
 * AAC state interface
 */
interface AACState {
  /** All available cards */
  cards: AACCard[];
  /** All categories */
  categories: AACCategory[];
  /** Currently active category */
  activeCategoryId: AACCategoryId;
  /** Sentence builder state */
  sentence: SentenceBuilderState;
  /** Board configuration */
  config: AACBoardConfig;
  /** Custom user cards */
  customCards: AACCard[];
  /** Favorite card IDs */
  favorites: string[];
  /** Recently used card IDs */
  recentlyUsed: string[];
}

/**
 * AAC actions interface
 */
interface AACActions {
  /** Set active category */
  setActiveCategory: (categoryId: AACCategoryId) => void;
  /** Add card to sentence */
  addToSentence: (card: AACCard) => void;
  /** Remove last card from sentence */
  removeLastFromSentence: () => void;
  /** Clear sentence */
  clearSentence: () => void;
  /** Get sentence text */
  getSentenceText: () => string;
  /** Add custom card */
  addCustomCard: (card: AACCard) => void;
  /** Remove custom card */
  removeCustomCard: (cardId: string) => void;
  /** Toggle favorite */
  toggleFavorite: (cardId: string) => void;
  /** Record card usage */
  recordUsage: (cardId: string) => void;
  /** Update board config */
  updateConfig: (config: Partial<AACBoardConfig>) => void;
  /** Get cards for current category */
  getCurrentCards: () => AACCard[];
}

/**
 * Default board configuration
 */
const DEFAULT_CONFIG: AACBoardConfig = {
  columns: 4,
  rows: 3,
  cardSize: 100,
  gap: 8,
  showLabels: true,
  defaultVoice: {
    voiceId: '',
    name: 'Default',
    stability: 0.5,
    similarityBoost: 0.75,
    speakingRate: 1.0,
    isDefault: true,
  },
  enabledCategories: AAC_CATEGORIES.map((c) => c.id),
};

/**
 * Default sentence state
 */
const DEFAULT_SENTENCE: SentenceBuilderState = {
  selectedCards: [],
  maxCards: 8,
  isSpeaking: false,
};

/**
 * AAC state management hook
 *
 * @returns AAC state and actions
 *
 * @example
 * ```tsx
 * function AACScreen() {
 *   const {
 *     cards,
 *     categories,
 *     activeCategoryId,
 *     sentence,
 *     setActiveCategory,
 *     addToSentence,
 *     clearSentence,
 *     getSentenceText,
 *   } = useAAC();
 *
 *   const handleCardTap = (card: AACCard) => {
 *     addToSentence(card);
 *   };
 *
 *   return (
 *     <AACBoard
 *       cards={cards}
 *       categories={categories}
 *       activeCategoryId={activeCategoryId}
 *       onCardTap={handleCardTap}
 *       ...
 *     />
 *   );
 * }
 * ```
 */
export function useAAC(): AACState & AACActions {
  // TODO: Replace with Zustand store for persistence
  // For now, using local state simulation

  const state: AACState = {
    cards: getAllCards(),
    categories: AAC_CATEGORIES,
    activeCategoryId: 'greetings',
    sentence: DEFAULT_SENTENCE,
    config: DEFAULT_CONFIG,
    customCards: [],
    favorites: [],
    recentlyUsed: [],
  };

  const setActiveCategory = useCallback((categoryId: AACCategoryId) => {
    // TODO: Update Zustand store
    console.log('Set active category:', categoryId);
  }, []);

  const addToSentence = useCallback((card: AACCard) => {
    // TODO: Update Zustand store
    console.log('Add to sentence:', card.label);
  }, []);

  const removeLastFromSentence = useCallback(() => {
    // TODO: Update Zustand store
    console.log('Remove last from sentence');
  }, []);

  const clearSentence = useCallback(() => {
    // TODO: Update Zustand store
    console.log('Clear sentence');
  }, []);

  const getSentenceText = useCallback(() => {
    return state.sentence.selectedCards.map((c) => c.speechText).join(' ');
  }, [state.sentence.selectedCards]);

  const addCustomCard = useCallback((card: AACCard) => {
    // TODO: Update Zustand store and sync to backend
    console.log('Add custom card:', card.label);
  }, []);

  const removeCustomCard = useCallback((cardId: string) => {
    // TODO: Update Zustand store and sync to backend
    console.log('Remove custom card:', cardId);
  }, []);

  const toggleFavorite = useCallback((cardId: string) => {
    // TODO: Update Zustand store
    console.log('Toggle favorite:', cardId);
  }, []);

  const recordUsage = useCallback((cardId: string) => {
    // TODO: Update Zustand store and sync usage analytics
    console.log('Record usage:', cardId);
  }, []);

  const updateConfig = useCallback((config: Partial<AACBoardConfig>) => {
    // TODO: Update Zustand store
    console.log('Update config:', config);
  }, []);

  const getCurrentCards = useCallback(() => {
    return getCardsByCategory(state.activeCategoryId);
  }, [state.activeCategoryId]);

  return {
    ...state,
    setActiveCategory,
    addToSentence,
    removeLastFromSentence,
    clearSentence,
    getSentenceText,
    addCustomCard,
    removeCustomCard,
    toggleFavorite,
    recordUsage,
    updateConfig,
    getCurrentCards,
  };
}

export default useAAC;
