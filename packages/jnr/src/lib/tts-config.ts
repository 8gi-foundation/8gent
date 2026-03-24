/**
 * 8gent Jr TTS Configuration
 *
 * KittenTTS is the default engine for warmer, child-friendly voices.
 * Falls back to browser SpeechSynthesis if KittenTTS is unavailable,
 * or to cloud TTS when online.
 *
 * Engine priority: kitten > browser > cloud
 */

// =============================================================================
// Types
// =============================================================================

/** Available TTS engine backends */
export type TTSEngine = 'kitten' | 'browser' | 'cloud';

/** Full TTS configuration */
export interface TTSConfig {
  /** Which engine to use */
  engine: TTSEngine;
  /** Voice name (engine-specific) */
  voice: string;
  /** Speech rate 0.5-2.0 (default slower for children) */
  rate: number;
  /** Pitch for browser SpeechSynthesis (0-2) */
  pitch: number;
  /** Volume 0-1 */
  volume: number;
}

// =============================================================================
// Default Configuration
// =============================================================================

/** Default TTS settings — optimized for child comprehension */
export const TTS_DEFAULT: TTSConfig = {
  engine: 'kitten',
  voice: 'Kiki',
  rate: 0.85,
  pitch: 1.1,
  volume: 1.0,
};

// =============================================================================
// Voice Presets
// =============================================================================

/** Pre-configured voice profiles for different contexts */
export const TTS_VOICES = {
  /** Default conversational voice */
  default: { engine: 'kitten' as const, voice: 'Kiki', rate: 0.85 },
  /** Slower, warmer voice for reading stories */
  storytime: { engine: 'kitten' as const, voice: 'Rosie', rate: 0.75 },
  /** Clear enunciation for learning new words */
  learning: { engine: 'kitten' as const, voice: 'Luna', rate: 0.7 },
  /** Deeper voice option */
  deep: { engine: 'kitten' as const, voice: 'Hugo', rate: 0.85 },
  /** Encouraging tone for sentence building */
  encouragement: { engine: 'kitten' as const, voice: 'Kiki', rate: 0.9 },
} as const;

/** Available voice preset names */
export type VoicePreset = keyof typeof TTS_VOICES;

// =============================================================================
// KittenTTS Model Configuration
// =============================================================================

/** Model used for server-side KittenTTS generation */
export const KITTEN_TTS_MODEL = 'KittenML/kitten-tts-nano-0.8';

/** API endpoint for KittenTTS (server-side route) */
export const KITTEN_TTS_API = '/api/jr/tts';

/** Maximum text length for a single KittenTTS request */
export const KITTEN_TTS_MAX_LENGTH = 500;

// =============================================================================
// Helpers
// =============================================================================

/**
 * Resolve a voice preset into a full TTS config.
 * Merges the preset with defaults, then applies any overrides.
 *
 * @param preset - Named preset from TTS_VOICES
 * @param overrides - Optional partial config to override preset values
 */
export function resolveVoicePreset(
  preset: VoicePreset,
  overrides?: Partial<TTSConfig>,
): TTSConfig {
  const base = TTS_VOICES[preset];
  return {
    ...TTS_DEFAULT,
    engine: base.engine,
    voice: base.voice,
    rate: base.rate,
    ...overrides,
  };
}
