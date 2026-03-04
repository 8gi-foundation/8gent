/**
 * @fileoverview AAC Familiarity Hook
 *
 * Manages the AAC Familiarity system state for analyzing existing
 * AAC setups and applying familiarity profiles to the new board.
 *
 * Features:
 * - Multi-image upload and analysis
 * - Profile generation and persistence
 * - User adjustment tracking
 * - Board configuration application
 *
 * @module hooks/useAACFamiliarity
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  FamiliarityProfile,
  AACScreenshotAnalysis,
  AACAnalysisState,
  CategoryMapping,
  AppliedProfileResult,
} from '@/types/familiarity';
import type { AACBoardConfig, VoiceConfig } from '@/types/aac';
import {
  analyzeAACScreenshot,
  analyzeMultipleScreenshots,
  validateImageForAnalysis,
} from '@/lib/aac/layoutAnalyzer';
import {
  mapCategoriesToFitzgerald,
  applyFamiliarityProfile,
  suggestHomeScreenCards,
} from '@/lib/aac/layoutMatcher';

/**
 * Storage key for persisting familiarity profile
 */
const STORAGE_KEY = '8gent-jr-familiarity-profile';

/**
 * Hook options
 */
interface UseAACFamiliarityOptions {
  /** Maximum images allowed for upload */
  maxImages?: number;
  /** Minimum confidence threshold for analysis */
  confidenceThreshold?: number;
  /** Whether to persist profile to storage */
  persist?: boolean;
  /** Default voice config for board generation */
  defaultVoice?: VoiceConfig;
  /** Callback when profile is applied */
  onProfileApplied?: (result: AppliedProfileResult) => void;
}

/**
 * Hook return type
 */
interface UseAACFamiliarityReturn {
  // State
  state: AACAnalysisState;
  profile: FamiliarityProfile | null;
  mappings: CategoryMapping[];
  isAnalyzing: boolean;
  error: string | null;

  // Image handling
  addImages: (images: string[]) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;

  // Analysis
  analyzeImages: () => Promise<void>;
  reanalyze: () => Promise<void>;

  // Profile management
  confirmProfile: () => void;
  adjustProfile: (adjustments: Partial<FamiliarityProfile>) => void;
  resetProfile: () => void;

  // Application
  applyProfile: () => AppliedProfileResult | null;
  suggestCards: (glpStage: 1 | 2 | 3 | 4 | 5 | 6, maxCards?: number) => string[];

  // Utilities
  validateImage: (imageUrl: string) => { isValid: boolean; error?: string };
  canProceed: boolean;
}

/**
 * Default voice configuration
 */
const DEFAULT_VOICE: VoiceConfig = {
  voiceId: 'default',
  name: 'Default Voice',
  stability: 0.5,
  similarityBoost: 0.75,
  speakingRate: 1.0,
  isDefault: true,
};

/**
 * Initial state for AAC analysis
 */
const INITIAL_STATE: AACAnalysisState = {
  step: 'upload',
  uploadedImages: [],
  analyses: [],
  mergedProfile: null,
  isConfirmed: false,
  userAdjustments: {},
  error: null,
  progress: 0,
};

/**
 * AAC Familiarity management hook
 *
 * @param options - Configuration options
 * @returns Familiarity state and controls
 *
 * @example
 * ```tsx
 * function AACSetup() {
 *   const {
 *     state,
 *     addImages,
 *     analyzeImages,
 *     profile,
 *     confirmProfile,
 *     applyProfile,
 *   } = useAACFamiliarity({
 *     onProfileApplied: (result) => {
 *       console.log('Profile applied:', result.summary);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {state.step === 'upload' && <ImageUploader onUpload={addImages} />}
 *       {state.step === 'analyzing' && <AnalysisProgress progress={state.progress} />}
 *       {state.step === 'review' && <ProfileReview profile={profile} onConfirm={confirmProfile} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAACFamiliarity(
  options: UseAACFamiliarityOptions = {}
): UseAACFamiliarityReturn {
  const {
    maxImages = 5,
    confidenceThreshold = 0.6,
    persist = true,
    defaultVoice = DEFAULT_VOICE,
    onProfileApplied,
  } = options;

  // Load persisted profile if available
  const loadPersistedProfile = (): FamiliarityProfile | null => {
    if (typeof window === 'undefined' || !persist) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load familiarity profile:', error);
    }
    return null;
  };

  const [state, setState] = useState<AACAnalysisState>(() => {
    const persisted = loadPersistedProfile();
    if (persisted) {
      return {
        ...INITIAL_STATE,
        step: 'complete',
        mergedProfile: persisted,
        isConfirmed: true,
      };
    }
    return INITIAL_STATE;
  });

  // Derived state
  const profile = useMemo(() => {
    if (!state.mergedProfile) return null;

    // Apply user adjustments
    return {
      ...state.mergedProfile,
      ...state.userAdjustments,
      updatedAt: new Date().toISOString(),
    };
  }, [state.mergedProfile, state.userAdjustments]);

  const mappings = useMemo(() => {
    if (!profile) return [];
    return mapCategoriesToFitzgerald(profile.detectedCategories);
  }, [profile]);

  const isAnalyzing = state.step === 'analyzing';
  const error = state.error;

  // Persist profile changes
  const persistProfile = useCallback(
    (profileToSave: FamiliarityProfile) => {
      if (typeof window === 'undefined' || !persist) return;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profileToSave));
      } catch (error) {
        console.warn('Failed to persist familiarity profile:', error);
      }
    },
    [persist]
  );

  // Add images for analysis
  const addImages = useCallback(
    (images: string[]) => {
      setState((prev) => {
        const newImages = [...prev.uploadedImages, ...images].slice(0, maxImages);
        return {
          ...prev,
          uploadedImages: newImages,
          error: null,
        };
      });
    },
    [maxImages]
  );

  // Remove image by index
  const removeImage = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
    }));
  }, []);

  // Clear all images
  const clearImages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      uploadedImages: [],
      analyses: [],
      mergedProfile: null,
      step: 'upload',
    }));
  }, []);

  // Analyze uploaded images
  const analyzeImages = useCallback(async () => {
    if (state.uploadedImages.length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'Please upload at least one AAC screenshot',
      }));
      return;
    }

    // Validate all images first
    for (const imageUrl of state.uploadedImages) {
      const validation = validateImageForAnalysis(imageUrl);
      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          error: validation.error || 'Invalid image',
        }));
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      step: 'analyzing',
      error: null,
      progress: 0,
    }));

    try {
      // Analyze each image and update progress
      const analyses: AACScreenshotAnalysis[] = [];
      const totalImages = state.uploadedImages.length;

      for (let i = 0; i < totalImages; i++) {
        const imageUrl = state.uploadedImages[i];

        setState((prev) => ({
          ...prev,
          progress: Math.round(((i + 0.5) / totalImages) * 100),
        }));

        const analysis = await analyzeAACScreenshot(imageUrl, {
          confidenceThreshold,
          includeRawAnalysis: false,
        });

        analyses.push(analysis);

        setState((prev) => ({
          ...prev,
          progress: Math.round(((i + 1) / totalImages) * 100),
        }));
      }

      // Merge all analyses
      const { mergedProfile } = await analyzeMultipleScreenshots(
        state.uploadedImages,
        { confidenceThreshold }
      );

      setState((prev) => ({
        ...prev,
        step: 'review',
        analyses,
        mergedProfile,
        progress: 100,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Analysis failed';
      setState((prev) => ({
        ...prev,
        step: 'upload',
        error: errorMessage,
        progress: 0,
      }));
    }
  }, [state.uploadedImages, confidenceThreshold]);

  // Reanalyze images
  const reanalyze = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      mergedProfile: null,
      analyses: [],
      isConfirmed: false,
      userAdjustments: {},
    }));
    await analyzeImages();
  }, [analyzeImages]);

  // Confirm profile
  const confirmProfile = useCallback(() => {
    if (!profile) return;

    setState((prev) => ({
      ...prev,
      step: 'complete',
      isConfirmed: true,
    }));

    persistProfile(profile);
  }, [profile, persistProfile]);

  // Adjust profile
  const adjustProfile = useCallback(
    (adjustments: Partial<FamiliarityProfile>) => {
      setState((prev) => ({
        ...prev,
        userAdjustments: {
          ...prev.userAdjustments,
          ...adjustments,
        },
      }));
    },
    []
  );

  // Reset profile
  const resetProfile = useCallback(() => {
    if (typeof window !== 'undefined' && persist) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState(INITIAL_STATE);
  }, [persist]);

  // Apply profile to generate board config
  const applyProfile = useCallback((): AppliedProfileResult | null => {
    if (!profile) return null;

    const result = applyFamiliarityProfile(profile, defaultVoice);
    onProfileApplied?.(result);
    return result;
  }, [profile, defaultVoice, onProfileApplied]);

  // Suggest home screen cards
  const suggestCards = useCallback(
    (glpStage: 1 | 2 | 3 | 4 | 5 | 6, maxCards = 24): string[] => {
      if (!profile) return [];
      return suggestHomeScreenCards(profile, glpStage, maxCards);
    },
    [profile]
  );

  // Validate image
  const validateImage = useCallback(
    (imageUrl: string): { isValid: boolean; error?: string } => {
      return validateImageForAnalysis(imageUrl);
    },
    []
  );

  // Can proceed to next step
  const canProceed = useMemo(() => {
    switch (state.step) {
      case 'upload':
        return state.uploadedImages.length > 0;
      case 'analyzing':
        return false;
      case 'review':
        return !!profile;
      case 'complete':
        return state.isConfirmed;
      default:
        return false;
    }
  }, [state.step, state.uploadedImages.length, state.isConfirmed, profile]);

  return {
    // State
    state,
    profile,
    mappings,
    isAnalyzing,
    error,

    // Image handling
    addImages,
    removeImage,
    clearImages,

    // Analysis
    analyzeImages,
    reanalyze,

    // Profile management
    confirmProfile,
    adjustProfile,
    resetProfile,

    // Application
    applyProfile,
    suggestCards,

    // Utilities
    validateImage,
    canProceed,
  };
}

export default useAACFamiliarity;
