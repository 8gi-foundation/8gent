/**
 * GLP (Gestalt Language Processing) Stage System
 *
 * Based on Marge Blanc's Natural Language Acquisition (NLA) framework.
 * Defines 6 stages of gestalt language development with stage-adaptive
 * configurations for 8gent Jr AAC interface.
 *
 * Key principle: NEVER remove earlier-stage content. GLPs regress under
 * stress and need access to whole gestalts even at later stages.
 *
 * Originally from 8gent Jr prototype
 */

export type GLPStage = 1 | 2 | 3 | 4 | 5 | 6;

export type LayoutType =
  | 'vsd'           // Visual Scene Displays -- whole scenes with hotspots
  | 'gestalt-grid'  // Grid of whole gestalt phrases
  | 'mitigable'     // Mitigable gestalt templates with fill-in slots
  | 'core-words'    // Core vocabulary grid (Fitzgerald Key coded)
  | 'full-grammar'; // Full vocabulary with sentence builder

export interface GLPStageConfig {
  stage: GLPStage;
  name: string;
  description: string;
  layoutType: LayoutType;
  showCoreWords: boolean;
  showGestalts: boolean;
  showVisualScenes: boolean;
  showSentenceBuilder: boolean;
  maxWordsPerUtterance: number;
  features: string[];
}

export const GLP_STAGES: Record<GLPStage, GLPStageConfig> = {
  1: {
    stage: 1,
    name: 'Whole Gestalts',
    description: 'Echoes whole phrases from media/people',
    layoutType: 'vsd',
    showCoreWords: false,
    showGestalts: true,
    showVisualScenes: true,
    showSentenceBuilder: false,
    maxWordsPerUtterance: 10,
    features: ['visual-scenes', 'gestalt-library', 'music-gestalts'],
  },
  2: {
    stage: 2,
    name: 'Mitigable Gestalts',
    description: 'Breaking gestalts into smaller chunks',
    layoutType: 'mitigable',
    showCoreWords: false,
    showGestalts: true,
    showVisualScenes: true,
    showSentenceBuilder: false,
    maxWordsPerUtterance: 6,
    features: ['mitigable-builder', 'visual-scenes', 'gestalt-library'],
  },
  3: {
    stage: 3,
    name: 'Single Words + Combinations',
    description: 'Using individual words and 2-word combos',
    layoutType: 'core-words',
    showCoreWords: true,
    showGestalts: true,
    showVisualScenes: false,
    showSentenceBuilder: true,
    maxWordsPerUtterance: 3,
    features: ['core-words', 'word-combos', 'gestalt-library'],
  },
  4: {
    stage: 4,
    name: 'Early Sentences',
    description: 'Building simple sentences',
    layoutType: 'core-words',
    showCoreWords: true,
    showGestalts: true,
    showVisualScenes: false,
    showSentenceBuilder: true,
    maxWordsPerUtterance: 5,
    features: ['core-words', 'sentence-builder', 'grammar-support'],
  },
  5: {
    stage: 5,
    name: 'Complex Sentences',
    description: 'Using grammar and longer sentences',
    layoutType: 'full-grammar',
    showCoreWords: true,
    showGestalts: false,
    showVisualScenes: false,
    showSentenceBuilder: true,
    maxWordsPerUtterance: 10,
    features: ['full-vocabulary', 'sentence-builder', 'grammar-support'],
  },
  6: {
    stage: 6,
    name: 'Advanced Grammar',
    description: 'Full grammatical structures',
    layoutType: 'full-grammar',
    showCoreWords: true,
    showGestalts: false,
    showVisualScenes: false,
    showSentenceBuilder: true,
    maxWordsPerUtterance: 20,
    features: ['full-vocabulary', 'sentence-builder', 'advanced-grammar'],
  },
};

export function getStageConfig(stage: GLPStage): GLPStageConfig {
  return GLP_STAGES[stage];
}

export function isFeatureEnabled(stage: GLPStage, feature: string): boolean {
  return GLP_STAGES[stage].features.includes(feature);
}

export function getNextStage(stage: GLPStage): GLPStage | null {
  return stage < 6 ? ((stage + 1) as GLPStage) : null;
}

export function getPreviousStage(stage: GLPStage): GLPStage | null {
  return stage > 1 ? ((stage - 1) as GLPStage) : null;
}

/**
 * Get all stages up to and including the current one.
 * A Stage 3 child should see all Stage 1-3 content (never remove earlier material).
 */
export function getStagesUpTo(stage: GLPStage): GLPStage[] {
  return Array.from({ length: stage }, (_, i) => (i + 1) as GLPStage);
}
