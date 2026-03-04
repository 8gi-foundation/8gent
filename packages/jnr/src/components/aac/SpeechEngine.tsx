/**
 * @fileoverview Speech Engine Component (TTS Integration)
 *
 * The SpeechEngine provides text-to-speech functionality for the AAC system.
 * It integrates with ElevenLabs for high-quality, natural-sounding voices,
 * with fallback to Web Speech API for offline use.
 *
 * Features:
 * - ElevenLabs TTS integration for natural voices
 * - Web Speech API fallback for offline mode
 * - Voice selection and customization
 * - Speech queue management
 * - Visual feedback during speech
 *
 * @module components/aac/SpeechEngine
 */

import React, { useEffect, useRef, useState } from 'react';
import type { VoiceConfig, SpeechRequest } from '@/types/aac';

/**
 * Props for the SpeechEngine component
 */
export interface SpeechEngineProps {
  /** Voice configuration to use */
  voiceConfig: VoiceConfig;

  /** Whether to use ElevenLabs (true) or Web Speech API (false) */
  useElevenLabs: boolean;

  /** ElevenLabs API key (required if useElevenLabs is true) */
  elevenLabsApiKey?: string;

  /** Callback when speech starts */
  onSpeechStart?: () => void;

  /** Callback when speech ends */
  onSpeechEnd?: () => void;

  /** Callback on speech error */
  onSpeechError?: (error: Error) => void;

  /** Children that can trigger speech */
  children?: React.ReactNode;
}

/**
 * Speech Engine Context for child components
 */
export interface SpeechEngineContextValue {
  speak: (request: SpeechRequest) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

export const SpeechEngineContext =
  React.createContext<SpeechEngineContextValue | null>(null);

/**
 * Speech Engine Component (TTS Integration)
 *
 * @example
 * ```tsx
 * <SpeechEngine
 *   voiceConfig={selectedVoice}
 *   useElevenLabs={true}
 *   elevenLabsApiKey={process.env.ELEVENLABS_API_KEY}
 * >
 *   <AACBoard ... />
 * </SpeechEngine>
 * ```
 */
export function SpeechEngine({
  voiceConfig,
  useElevenLabs,
  elevenLabsApiKey,
  onSpeechStart,
  onSpeechEnd,
  onSpeechError,
  children,
}: SpeechEngineProps): React.ReactElement {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // TODO: Implement ElevenLabs TTS API call
  // TODO: Implement Web Speech API fallback
  // TODO: Add speech queue for multiple cards
  // TODO: Implement audio caching for common phrases

  /**
   * Speak text using configured TTS engine
   */
  const speak = async (request: SpeechRequest): Promise<void> => {
    const { text, voiceId, onComplete, onError } = request;

    if (isSpeaking) {
      stop();
    }

    setIsLoading(true);
    onSpeechStart?.();

    try {
      if (useElevenLabs && elevenLabsApiKey) {
        await speakWithElevenLabs(text, voiceId || voiceConfig.voiceId);
      } else {
        await speakWithWebSpeech(text);
      }

      onComplete?.();
      onSpeechEnd?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      onSpeechError?.(err);
    } finally {
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  /**
   * Speak using ElevenLabs TTS API
   */
  const speakWithElevenLabs = async (
    text: string,
    voiceId: string
  ): Promise<void> => {
    // TODO: Implement ElevenLabs API call
    // const response = await fetch(
    //   `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'xi-api-key': elevenLabsApiKey!,
    //     },
    //     body: JSON.stringify({
    //       text,
    //       model_id: 'eleven_multilingual_v2',
    //       voice_settings: {
    //         stability: voiceConfig.stability,
    //         similarity_boost: voiceConfig.similarityBoost,
    //       },
    //     }),
    //   }
    // );
    // const audioBlob = await response.blob();
    // const audioUrl = URL.createObjectURL(audioBlob);
    // Play audio...

    console.log('ElevenLabs TTS:', text, voiceId);
    setIsSpeaking(true);
  };

  /**
   * Speak using Web Speech API (fallback)
   */
  const speakWithWebSpeech = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceConfig.speakingRate;
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(event.error));

      speechSynthRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  };

  /**
   * Stop current speech
   */
  const stop = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  const contextValue: SpeechEngineContextValue = {
    speak,
    stop,
    isSpeaking,
    isLoading,
  };

  return (
    <SpeechEngineContext.Provider value={contextValue}>
      {children}

      {/* Visual indicator during speech */}
      {isSpeaking && (
        <div
          className="speech-indicator"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span className="pulse-dot" />
          Speaking...
        </div>
      )}
    </SpeechEngineContext.Provider>
  );
}

export default SpeechEngine;
