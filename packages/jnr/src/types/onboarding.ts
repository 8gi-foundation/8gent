/**
 * @fileoverview Onboarding Types for 8gent Jr
 *
 * Type definitions for the dual onboarding flow:
 * - Phase 1: Parent Setup (configuration, safety, goals)
 * - Phase 2: Child Personalization (fun, visual, engaging)
 *
 * @module types/onboarding
 */

import type { GLPStage, AACCategoryId, VoiceConfig } from './aac';

/**
 * Child profile information collected during parent setup
 */
export interface ChildProfile {
  /** Child's legal/given first name */
  firstName: string;
  /** Preferred name or nickname the child wants to be called */
  preferredName: string;
  /** Child's age in years */
  age: number;
  /** Pronouns selection */
  pronouns: 'he' | 'she' | 'they' | 'custom';
  /** Custom pronouns if selected */
  customPronouns?: string;
  /** Avatar image URL or identifier */
  avatar?: string;
}

/**
 * Communication level assessment
 */
export interface CommunicationLevel {
  /** GLP (Gestalt Language Processing) stage 1-6 */
  glpStage: GLPStage;
  /** Whether child has prior AAC experience */
  hasUsedAAC: boolean;
  /** Name of current/previous AAC system if any */
  currentAACName?: string;
  /** Current speech ability level */
  speechAbility: 'nonverbal' | 'some-words' | 'phrases' | 'sentences';
}

/**
 * Safety and supervision settings configured by parent
 */
export interface SafetySettings {
  /** Content filtering level */
  contentFilter: 'strict' | 'moderate' | 'minimal';
  /** Level of parent supervision required */
  supervisionLevel: 'always' | 'check-ins' | 'independent';
  /** List of enabled feature IDs */
  allowedFeatures: string[];
  /** Parent PIN for accessing settings (hashed) */
  parentPIN: string;
}

/**
 * Voice creation configuration during onboarding
 */
export interface VoiceCreationConfig {
  /** Whether to use Voice Designer or clone from samples */
  method: 'designer' | 'clone' | 'skip';
  /** ElevenLabs Voice Designer settings */
  designerSettings?: {
    age: 'young' | 'middle_aged' | 'old';
    gender: 'male' | 'female' | 'neutral';
    accent: string;
    description: string;
  };
  /** Voice samples for cloning */
  cloneSamples?: File[];
  /** Created voice configuration */
  createdVoice?: VoiceConfig;
}

/**
 * Complete parent setup data structure
 */
export interface ParentSetupData {
  /** Child profile information */
  childProfile: ChildProfile;
  /** Communication level assessment */
  communicationLevel: CommunicationLevel;
  /** Uploaded existing AAC screenshots (base64 or URLs) */
  existingAACImages: string[];
  /** Voice creation configuration */
  voiceConfig: VoiceCreationConfig;
  /** Safety and supervision settings */
  safetySettings: SafetySettings;
  /** Family goals for using 8gent Jr */
  familyGoals: string[];
  /** Custom goals text */
  customGoals?: string;
}

/**
 * Child personalization preferences
 */
export interface ChildPersonalization {
  /** Primary theme color choice */
  themeColor: string;
  /** Avatar customization */
  avatarCustomization: AvatarCustomization;
  /** Favorite categories identified */
  favoriteCategories: AACCategoryId[];
  /** Initial home board layout */
  homeBoardLayout: string[];
  /** First sentence built during onboarding */
  firstSentence: string[];
}

/**
 * Avatar customization options
 */
export interface AvatarCustomization {
  /** Base avatar style */
  style: 'animal' | 'character' | 'abstract' | 'photo';
  /** Primary color */
  primaryColor: string;
  /** Secondary color */
  secondaryColor: string;
  /** Avatar identifier or URL */
  avatarId: string;
  /** Custom accessories or decorations */
  accessories?: string[];
}

/**
 * Onboarding step definition
 */
export interface OnboardingStep {
  /** Unique step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Whether this step is optional */
  optional: boolean;
  /** Phase this step belongs to */
  phase: 'parent' | 'child';
  /** Order within the phase */
  order: number;
}

/**
 * Parent setup wizard steps
 */
export const PARENT_SETUP_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to 8gent Jr',
    description: 'Learn about our philosophy: your child owns their voice',
    optional: false,
    phase: 'parent',
    order: 1,
  },
  {
    id: 'child-profile',
    title: 'About Your Child',
    description: 'Tell us about your child so we can personalize their experience',
    optional: false,
    phase: 'parent',
    order: 2,
  },
  {
    id: 'communication-level',
    title: 'Communication Level',
    description: 'Help us understand your child\'s current communication abilities',
    optional: false,
    phase: 'parent',
    order: 3,
  },
  {
    id: 'existing-aac',
    title: 'Current AAC System',
    description: 'Upload screenshots of existing AAC boards to import familiar vocabulary',
    optional: true,
    phase: 'parent',
    order: 4,
  },
  {
    id: 'voice-creation',
    title: 'Create Their Voice',
    description: 'Design a unique voice that represents your child',
    optional: true,
    phase: 'parent',
    order: 5,
  },
  {
    id: 'safety-settings',
    title: 'Safety Settings',
    description: 'Configure content filters and supervision levels',
    optional: false,
    phase: 'parent',
    order: 6,
  },
  {
    id: 'goals',
    title: 'Family Goals',
    description: 'What does your family want to achieve with 8gent Jr?',
    optional: false,
    phase: 'parent',
    order: 7,
  },
  {
    id: 'review',
    title: 'Review & Continue',
    description: 'Review your choices before starting child personalization',
    optional: false,
    phase: 'parent',
    order: 8,
  },
];

/**
 * Child personalization wizard steps
 */
export const CHILD_PERSONALIZATION_STEPS: OnboardingStep[] = [
  {
    id: 'meet-voice',
    title: 'Meet Your Voice!',
    description: 'Hear your new voice say hello',
    optional: false,
    phase: 'child',
    order: 1,
  },
  {
    id: 'choose-look',
    title: 'Choose Your Look',
    description: 'Pick your avatar and favorite colors',
    optional: false,
    phase: 'child',
    order: 2,
  },
  {
    id: 'favorites',
    title: 'Your Favorites',
    description: 'Tap the cards you use most',
    optional: false,
    phase: 'child',
    order: 3,
  },
  {
    id: 'arrange-board',
    title: 'Make It Yours',
    description: 'Drag cards to arrange your home screen',
    optional: false,
    phase: 'child',
    order: 4,
  },
  {
    id: 'first-words',
    title: 'First Words',
    description: 'Build your first sentence and hear it spoken',
    optional: false,
    phase: 'child',
    order: 5,
  },
  {
    id: 'celebration',
    title: "You're Ready!",
    description: 'Celebration time - your 8gent Jr is ready to use',
    optional: false,
    phase: 'child',
    order: 6,
  },
];

/**
 * Onboarding state for persistence
 */
export interface OnboardingState {
  /** Current phase */
  currentPhase: 'parent' | 'child' | 'complete';
  /** Current step ID within phase */
  currentStepId: string;
  /** Whether parent setup is complete */
  parentSetupComplete: boolean;
  /** Whether child personalization is complete */
  childPersonalizationComplete: boolean;
  /** Parent setup data (partial during onboarding) */
  parentSetupData: Partial<ParentSetupData>;
  /** Child personalization data (partial during onboarding) */
  childPersonalization: Partial<ChildPersonalization>;
  /** Timestamp when onboarding started */
  startedAt: string;
  /** Timestamp when last updated */
  lastUpdatedAt: string;
}

/**
 * Predefined family goals options
 */
export const FAMILY_GOAL_OPTIONS = [
  {
    id: 'express-needs',
    label: 'Express basic needs',
    description: 'Help my child communicate hunger, thirst, bathroom needs, etc.',
    icon: '🗣️',
  },
  {
    id: 'social-interaction',
    label: 'Social interaction',
    description: 'Enable greetings, conversations with family and friends',
    icon: '👋',
  },
  {
    id: 'emotional-expression',
    label: 'Express emotions',
    description: 'Help my child share feelings and emotional states',
    icon: '💭',
  },
  {
    id: 'school-participation',
    label: 'Participate at school',
    description: 'Support classroom activities and academic communication',
    icon: '📚',
  },
  {
    id: 'independence',
    label: 'Increase independence',
    description: 'Help my child communicate independently in various settings',
    icon: '🌟',
  },
  {
    id: 'expand-vocabulary',
    label: 'Expand vocabulary',
    description: 'Build a richer, more diverse communication repertoire',
    icon: '📖',
  },
  {
    id: 'reduce-frustration',
    label: 'Reduce frustration',
    description: 'Decrease communication breakdowns and associated behaviors',
    icon: '😌',
  },
  {
    id: 'play-activities',
    label: 'Play and activities',
    description: 'Enable participation in games, hobbies, and leisure activities',
    icon: '🎮',
  },
] as const;

/**
 * Available feature flags for allowedFeatures
 */
export const AVAILABLE_FEATURES = [
  { id: 'card-generator', label: 'AI Card Generator', description: 'Create custom cards with AI' },
  { id: 'voice-messages', label: 'Voice Messages', description: 'Record and send voice messages' },
  { id: 'music-player', label: 'Music Player', description: 'Play calming music and sounds' },
  { id: 'timer-visual', label: 'Visual Timer', description: 'Visual countdown timers' },
  { id: 'games', label: 'Learning Games', description: 'Educational games and activities' },
  { id: 'chat-ai', label: 'AI Chat', description: 'Conversational AI assistance' },
  { id: 'schedule', label: 'Visual Schedule', description: 'Daily routine visual schedules' },
  { id: 'story-mode', label: 'Story Mode', description: 'Interactive story creation' },
] as const;

/**
 * Theme color options for child personalization
 */
export const THEME_COLOR_OPTIONS = [
  { id: 'blue', name: 'Ocean Blue', color: '#60A5FA', gradient: 'from-blue-400 to-blue-600' },
  { id: 'amber', name: 'Golden Amber', color: '#F59E0B', gradient: 'from-amber-400 to-amber-600' },
  { id: 'coral', name: 'Warm Coral', color: '#F97316', gradient: 'from-orange-400 to-orange-600' },
  { id: 'green', name: 'Forest Green', color: '#34D399', gradient: 'from-green-400 to-green-600' },
  { id: 'orange', name: 'Sunset Orange', color: '#FB923C', gradient: 'from-orange-400 to-orange-600' },
  { id: 'yellow', name: 'Sunshine', color: '#FBBF24', gradient: 'from-yellow-400 to-yellow-600' },
  { id: 'red', name: 'Cherry Red', color: '#EF4444', gradient: 'from-red-400 to-red-600' },
  { id: 'teal', name: 'Turquoise', color: '#2DD4BF', gradient: 'from-teal-400 to-teal-600' },
] as const;

/**
 * Avatar style options
 */
export const AVATAR_STYLE_OPTIONS = [
  { id: 'animal', name: 'Friendly Animals', examples: ['🐱', '🐶', '🐰', '🦊', '🐼'] },
  { id: 'character', name: 'Fun Characters', examples: ['🦸', '🧙', '🤖', '👽', '🦄'] },
  { id: 'abstract', name: 'Cool Shapes', examples: ['⭐', '💫', '🌈', '🎨', '💎'] },
  { id: 'photo', name: 'My Photo', examples: ['📸'] },
] as const;

export default {};
