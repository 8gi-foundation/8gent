/**
 * @fileoverview Onboarding State Management Hook
 *
 * This hook manages the complete onboarding flow state including:
 * - Progress tracking across both phases
 * - State persistence for resume capability
 * - Navigation between steps
 * - Completion detection and celebration triggers
 *
 * @module hooks/useOnboarding
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  OnboardingState,
  ParentSetupData,
  ChildPersonalization,
  ChildProfile,
  CommunicationLevel,
  SafetySettings,
  VoiceCreationConfig,
  OnboardingStep,
} from '@/types/onboarding';
import {
  PARENT_SETUP_STEPS,
  CHILD_PERSONALIZATION_STEPS,
} from '@/types/onboarding';

/**
 * Storage key for persisting onboarding state
 */
const STORAGE_KEY = '8gent-jr-onboarding';

/**
 * Initial onboarding state
 */
const INITIAL_STATE: OnboardingState = {
  currentPhase: 'parent',
  currentStepId: 'welcome',
  parentSetupComplete: false,
  childPersonalizationComplete: false,
  parentSetupData: {},
  childPersonalization: {},
  startedAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
};

/**
 * Hook options
 */
interface UseOnboardingOptions {
  /** Callback when parent setup completes */
  onParentSetupComplete?: (data: ParentSetupData) => void;
  /** Callback when child personalization completes */
  onChildPersonalizationComplete?: (data: ChildPersonalization) => void;
  /** Callback when entire onboarding completes */
  onOnboardingComplete?: (state: OnboardingState) => void;
  /** Whether to persist state to localStorage */
  persist?: boolean;
}

/**
 * Hook return type
 */
interface UseOnboardingReturn {
  // State
  state: OnboardingState;
  currentStep: OnboardingStep | undefined;
  currentStepIndex: number;
  totalStepsInPhase: number;
  overallProgress: number;

  // Navigation
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepId: string) => void;
  canGoNext: boolean;
  canGoBack: boolean;

  // Data updates
  updateChildProfile: (data: Partial<ChildProfile>) => void;
  updateCommunicationLevel: (data: Partial<CommunicationLevel>) => void;
  updateSafetySettings: (data: Partial<SafetySettings>) => void;
  updateVoiceConfig: (data: Partial<VoiceCreationConfig>) => void;
  updateFamilyGoals: (goals: string[]) => void;
  updateAACImages: (images: string[]) => void;
  updateChildPersonalization: (data: Partial<ChildPersonalization>) => void;

  // Phase transitions
  completeParentSetup: () => void;
  completeChildPersonalization: () => void;
  startChildPersonalization: () => void;

  // Utilities
  resetOnboarding: () => void;
  isStepComplete: (stepId: string) => boolean;
  getStepData: (stepId: string) => unknown;

  // Celebration
  showCelebration: boolean;
  dismissCelebration: () => void;
}

/**
 * Onboarding state management hook
 *
 * @param options - Configuration options
 * @returns Onboarding state and controls
 *
 * @example
 * ```tsx
 * function OnboardingScreen() {
 *   const {
 *     state,
 *     currentStep,
 *     goToNextStep,
 *     updateChildProfile,
 *     overallProgress,
 *   } = useOnboarding({
 *     onOnboardingComplete: (state) => {
 *       // Navigate to main app
 *     },
 *   });
 *
 *   return (
 *     <OnboardingWizard
 *       step={currentStep}
 *       progress={overallProgress}
 *       onNext={goToNextStep}
 *       ...
 *     />
 *   );
 * }
 * ```
 */
export function useOnboarding(
  options: UseOnboardingOptions = {}
): UseOnboardingReturn {
  const {
    onParentSetupComplete,
    onChildPersonalizationComplete,
    onOnboardingComplete,
    persist = true,
  } = options;

  // Load initial state from storage if available
  const loadInitialState = (): OnboardingState => {
    if (typeof window === 'undefined' || !persist) {
      return INITIAL_STATE;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the stored state has required fields
        if (parsed.currentPhase && parsed.currentStepId) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load onboarding state:', error);
    }

    return INITIAL_STATE;
  };

  const [state, setState] = useState<OnboardingState>(loadInitialState);
  const [showCelebration, setShowCelebration] = useState(false);

  // Persist state changes
  useEffect(() => {
    if (typeof window === 'undefined' || !persist) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist onboarding state:', error);
    }
  }, [state, persist]);

  // Get current steps based on phase
  const currentSteps = useMemo(() => {
    return state.currentPhase === 'parent'
      ? PARENT_SETUP_STEPS
      : CHILD_PERSONALIZATION_STEPS;
  }, [state.currentPhase]);

  // Find current step
  const currentStep = useMemo(() => {
    return currentSteps.find((s) => s.id === state.currentStepId);
  }, [currentSteps, state.currentStepId]);

  // Current step index
  const currentStepIndex = useMemo(() => {
    return currentSteps.findIndex((s) => s.id === state.currentStepId);
  }, [currentSteps, state.currentStepId]);

  // Total steps in current phase
  const totalStepsInPhase = currentSteps.length;

  // Overall progress (0-100)
  const overallProgress = useMemo(() => {
    const parentSteps = PARENT_SETUP_STEPS.length;
    const childSteps = CHILD_PERSONALIZATION_STEPS.length;
    const totalSteps = parentSteps + childSteps;

    if (state.currentPhase === 'complete') {
      return 100;
    }

    if (state.currentPhase === 'parent') {
      return Math.round((currentStepIndex / totalSteps) * 100);
    }

    // Child phase
    return Math.round(
      ((parentSteps + currentStepIndex) / totalSteps) * 100
    );
  }, [state.currentPhase, currentStepIndex]);

  // Navigation checks
  const canGoNext = currentStepIndex < totalStepsInPhase - 1;
  const canGoBack = currentStepIndex > 0;

  // Update state helper
  const updateState = useCallback(
    (updates: Partial<OnboardingState>) => {
      setState((prev) => ({
        ...prev,
        ...updates,
        lastUpdatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Navigation: go to next step
  const goToNextStep = useCallback(() => {
    if (!canGoNext) {
      // End of phase
      if (state.currentPhase === 'parent') {
        // Transition to child phase handled by completeParentSetup
        return;
      }
      if (state.currentPhase === 'child') {
        // Transition to complete handled by completeChildPersonalization
        return;
      }
      return;
    }

    const nextStep = currentSteps[currentStepIndex + 1];
    if (nextStep) {
      updateState({ currentStepId: nextStep.id });
    }
  }, [canGoNext, currentSteps, currentStepIndex, state.currentPhase, updateState]);

  // Navigation: go to previous step
  const goToPreviousStep = useCallback(() => {
    if (!canGoBack) return;

    const prevStep = currentSteps[currentStepIndex - 1];
    if (prevStep) {
      updateState({ currentStepId: prevStep.id });
    }
  }, [canGoBack, currentSteps, currentStepIndex, updateState]);

  // Navigation: go to specific step
  const goToStep = useCallback(
    (stepId: string) => {
      const step = currentSteps.find((s) => s.id === stepId);
      if (step) {
        updateState({ currentStepId: stepId });
      }
    },
    [currentSteps, updateState]
  );

  // Data updates: Child Profile
  const updateChildProfile = useCallback(
    (data: Partial<ChildProfile>) => {
      setState((prev) => ({
        ...prev,
        parentSetupData: {
          ...prev.parentSetupData,
          childProfile: {
            ...prev.parentSetupData.childProfile,
            ...data,
          } as ChildProfile,
        },
        lastUpdatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Data updates: Communication Level
  const updateCommunicationLevel = useCallback(
    (data: Partial<CommunicationLevel>) => {
      setState((prev) => ({
        ...prev,
        parentSetupData: {
          ...prev.parentSetupData,
          communicationLevel: {
            ...prev.parentSetupData.communicationLevel,
            ...data,
          } as CommunicationLevel,
        },
        lastUpdatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Data updates: Safety Settings
  const updateSafetySettings = useCallback(
    (data: Partial<SafetySettings>) => {
      setState((prev) => ({
        ...prev,
        parentSetupData: {
          ...prev.parentSetupData,
          safetySettings: {
            ...prev.parentSetupData.safetySettings,
            ...data,
          } as SafetySettings,
        },
        lastUpdatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Data updates: Voice Config
  const updateVoiceConfig = useCallback(
    (data: Partial<VoiceCreationConfig>) => {
      setState((prev) => ({
        ...prev,
        parentSetupData: {
          ...prev.parentSetupData,
          voiceConfig: {
            ...prev.parentSetupData.voiceConfig,
            ...data,
          } as VoiceCreationConfig,
        },
        lastUpdatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Data updates: Family Goals
  const updateFamilyGoals = useCallback((goals: string[]) => {
    setState((prev) => ({
      ...prev,
      parentSetupData: {
        ...prev.parentSetupData,
        familyGoals: goals,
      },
      lastUpdatedAt: new Date().toISOString(),
    }));
  }, []);

  // Data updates: AAC Images
  const updateAACImages = useCallback((images: string[]) => {
    setState((prev) => ({
      ...prev,
      parentSetupData: {
        ...prev.parentSetupData,
        existingAACImages: images,
      },
      lastUpdatedAt: new Date().toISOString(),
    }));
  }, []);

  // Data updates: Child Personalization
  const updateChildPersonalization = useCallback(
    (data: Partial<ChildPersonalization>) => {
      setState((prev) => ({
        ...prev,
        childPersonalization: {
          ...prev.childPersonalization,
          ...data,
        },
        lastUpdatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Complete parent setup phase
  const completeParentSetup = useCallback(() => {
    const parentData = state.parentSetupData as ParentSetupData;

    setState((prev) => ({
      ...prev,
      parentSetupComplete: true,
      currentPhase: 'child',
      currentStepId: CHILD_PERSONALIZATION_STEPS[0].id,
      lastUpdatedAt: new Date().toISOString(),
    }));

    onParentSetupComplete?.(parentData);
  }, [state.parentSetupData, onParentSetupComplete]);

  // Start child personalization (explicit transition)
  const startChildPersonalization = useCallback(() => {
    updateState({
      currentPhase: 'child',
      currentStepId: CHILD_PERSONALIZATION_STEPS[0].id,
    });
  }, [updateState]);

  // Complete child personalization phase
  const completeChildPersonalization = useCallback(() => {
    const childData = state.childPersonalization as ChildPersonalization;

    setShowCelebration(true);

    setState((prev) => ({
      ...prev,
      childPersonalizationComplete: true,
      currentPhase: 'complete',
      lastUpdatedAt: new Date().toISOString(),
    }));

    onChildPersonalizationComplete?.(childData);
    onOnboardingComplete?.(state);
  }, [
    state,
    onChildPersonalizationComplete,
    onOnboardingComplete,
  ]);

  // Reset onboarding
  const resetOnboarding = useCallback(() => {
    if (typeof window !== 'undefined' && persist) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState(INITIAL_STATE);
    setShowCelebration(false);
  }, [persist]);

  // Check if a step is complete
  const isStepComplete = useCallback(
    (stepId: string) => {
      const step = [...PARENT_SETUP_STEPS, ...CHILD_PERSONALIZATION_STEPS].find(
        (s) => s.id === stepId
      );

      if (!step) return false;

      // Check based on step ID and data presence
      switch (stepId) {
        case 'welcome':
          return true; // Welcome is always "complete" once viewed
        case 'child-profile':
          return !!(
            state.parentSetupData.childProfile?.firstName &&
            state.parentSetupData.childProfile?.age
          );
        case 'communication-level':
          return !!(
            state.parentSetupData.communicationLevel?.glpStage &&
            state.parentSetupData.communicationLevel?.speechAbility
          );
        case 'existing-aac':
          return true; // Optional step
        case 'voice-creation':
          return true; // Optional step
        case 'safety-settings':
          return !!(
            state.parentSetupData.safetySettings?.parentPIN &&
            state.parentSetupData.safetySettings?.contentFilter
          );
        case 'goals':
          return (state.parentSetupData.familyGoals?.length ?? 0) > 0;
        case 'review':
          return state.parentSetupComplete;
        case 'meet-voice':
          return true; // Complete after viewing
        case 'choose-look':
          return !!state.childPersonalization.themeColor;
        case 'favorites':
          return (state.childPersonalization.favoriteCategories?.length ?? 0) > 0;
        case 'arrange-board':
          return (state.childPersonalization.homeBoardLayout?.length ?? 0) > 0;
        case 'first-words':
          return (state.childPersonalization.firstSentence?.length ?? 0) > 0;
        case 'celebration':
          return state.childPersonalizationComplete;
        default:
          return false;
      }
    },
    [state]
  );

  // Get data for a specific step
  const getStepData = useCallback(
    (stepId: string): unknown => {
      switch (stepId) {
        case 'child-profile':
          return state.parentSetupData.childProfile;
        case 'communication-level':
          return state.parentSetupData.communicationLevel;
        case 'existing-aac':
          return state.parentSetupData.existingAACImages;
        case 'voice-creation':
          return state.parentSetupData.voiceConfig;
        case 'safety-settings':
          return state.parentSetupData.safetySettings;
        case 'goals':
          return state.parentSetupData.familyGoals;
        default:
          return null;
      }
    },
    [state.parentSetupData]
  );

  // Dismiss celebration
  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  return {
    // State
    state,
    currentStep,
    currentStepIndex,
    totalStepsInPhase,
    overallProgress,

    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canGoNext,
    canGoBack,

    // Data updates
    updateChildProfile,
    updateCommunicationLevel,
    updateSafetySettings,
    updateVoiceConfig,
    updateFamilyGoals,
    updateAACImages,
    updateChildPersonalization,

    // Phase transitions
    completeParentSetup,
    completeChildPersonalization,
    startChildPersonalization,

    // Utilities
    resetOnboarding,
    isStepComplete,
    getStepData,

    // Celebration
    showCelebration,
    dismissCelebration,
  };
}

export default useOnboarding;
