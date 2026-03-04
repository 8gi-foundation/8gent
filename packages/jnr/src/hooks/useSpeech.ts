/**
 * @fileoverview Speech Synthesis Hook
 *
 * This hook provides a simple interface for text-to-speech functionality,
 * abstracting the underlying TTS engine (ElevenLabs or Web Speech API).
 *
 * Features:
 * - Easy speak/stop interface
 * - Loading and speaking state tracking
 * - Automatic fallback handling
 * - Voice configuration
 *
 * @module hooks/useSpeech
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { VoiceConfig, SpeechRequest } from '@/types/aac';
import { speak, stopSpeech, speakWithWebSpeech } from '@/lib/speech/tts';

/**
 * Speech hook options
 */
interface UseSpeechOptions {
  /** Voice configuration to use */
  voiceConfig?: VoiceConfig;
  /** ElevenLabs API key (enables ElevenLabs TTS) */
  elevenLabsApiKey?: string;
  /** Callback when speech starts */
  onSpeechStart?: () => void;
  /** Callback when speech ends */
  onSpeechEnd?: () => void;
  /** Callback on speech error */
  onError?: (error: Error) => void;
}

/**
 * Speech hook return value
 */
interface UseSpeechReturn {
  /** Speak the given text */
  speak: (text: string) => Promise<void>;
  /** Stop any ongoing speech */
  stop: () => void;
  /** Whether speech is currently playing */
  isSpeaking: boolean;
  /** Whether audio is loading */
  isLoading: boolean;
  /** Whether TTS is available */
  isAvailable: boolean;
  /** Current voice configuration */
  voiceConfig: VoiceConfig;
  /** Update voice configuration */
  setVoiceConfig: (config: VoiceConfig) => void;
}

/**
 * Default voice configuration
 */
const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceId: '',
  name: 'Default',
  stability: 0.5,
  similarityBoost: 0.75,
  speakingRate: 1.0,
  isDefault: true,
};

/**
 * Speech synthesis hook
 *
 * @param options - Configuration options
 * @returns Speech controls and state
 *
 * @example
 * ```tsx
 * function SpeakButton({ text }: { text: string }) {
 *   const { speak, isSpeaking, isLoading } = useSpeech({
 *     elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
 *   });
 *
 *   return (
 *     <button
 *       onClick={() => speak(text)}
 *       disabled={isSpeaking || isLoading}
 *     >
 *       {isLoading ? 'Loading...' : isSpeaking ? 'Speaking...' : 'Speak'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
  const {
    voiceConfig: initialVoiceConfig = DEFAULT_VOICE_CONFIG,
    elevenLabsApiKey,
    onSpeechStart,
    onSpeechEnd,
    onError,
  } = options;

  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(initialVoiceConfig);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const isMountedRef = useRef(true);

  // Check TTS availability on mount
  useEffect(() => {
    const checkAvailability = () => {
      // Web Speech API is widely available
      const webSpeechAvailable = 'speechSynthesis' in window;
      // ElevenLabs available if API key provided
      const elevenLabsAvailable = !!elevenLabsApiKey;
      setIsAvailable(webSpeechAvailable || elevenLabsAvailable);
    };

    checkAvailability();

    return () => {
      isMountedRef.current = false;
    };
  }, [elevenLabsApiKey]);

  const speakText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsLoading(true);
      onSpeechStart?.();

      try {
        const request: SpeechRequest = {
          text,
          voiceId: voiceConfig.voiceId,
          onComplete: () => {
            if (isMountedRef.current) {
              setIsSpeaking(false);
              setIsLoading(false);
              onSpeechEnd?.();
            }
          },
          onError: (error) => {
            if (isMountedRef.current) {
              setIsSpeaking(false);
              setIsLoading(false);
              onError?.(error);
            }
          },
        };

        setIsSpeaking(true);
        setIsLoading(false);

        if (elevenLabsApiKey) {
          await speak(request, voiceConfig, {
            apiKey: elevenLabsApiKey,
            modelId: 'eleven_turbo_v2_5',
            outputFormat: 'mp3_44100_128',
          });
        } else {
          await speakWithWebSpeech(text, voiceConfig.speakingRate);
          request.onComplete?.();
        }
      } catch (error) {
        if (isMountedRef.current) {
          setIsSpeaking(false);
          setIsLoading(false);
          onError?.(error instanceof Error ? error : new Error(String(error)));
        }
      }
    },
    [voiceConfig, elevenLabsApiKey, onSpeechStart, onSpeechEnd, onError]
  );

  const stop = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return {
    speak: speakText,
    stop,
    isSpeaking,
    isLoading,
    isAvailable,
    voiceConfig,
    setVoiceConfig,
  };
}

export default useSpeech;
