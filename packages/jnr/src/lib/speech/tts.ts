/**
 * @fileoverview Text-to-Speech Integration
 *
 * This module provides text-to-speech functionality for the AAC system,
 * supporting both ElevenLabs for high-quality voices and Web Speech API
 * for offline fallback.
 *
 * Features:
 * - ElevenLabs TTS with custom voices
 * - Web Speech API fallback
 * - Audio caching for common phrases
 * - Queue management for multiple utterances
 * - Voice parameter customization
 *
 * @module lib/speech/tts
 */

import type { VoiceConfig, SpeechRequest } from '@/types/aac';

/**
 * ElevenLabs API configuration
 */
interface ElevenLabsConfig {
  apiKey: string;
  modelId: string;
  outputFormat: 'mp3_44100_128' | 'mp3_22050_32' | 'pcm_16000';
}

/**
 * Audio cache for frequently used phrases
 */
const audioCache = new Map<string, string>();

/**
 * Default ElevenLabs configuration
 */
const DEFAULT_ELEVENLABS_CONFIG: Partial<ElevenLabsConfig> = {
  modelId: 'eleven_turbo_v2_5',
  outputFormat: 'mp3_44100_128',
};

/**
 * Speak text using ElevenLabs TTS
 *
 * @param text - Text to speak
 * @param voiceConfig - Voice configuration
 * @param config - ElevenLabs API configuration
 * @returns Promise that resolves when speech completes
 *
 * @example
 * ```ts
 * await speakWithElevenLabs('Hello, how are you?', {
 *   voiceId: 'your-voice-id',
 *   name: 'Custom Voice',
 *   stability: 0.5,
 *   similarityBoost: 0.75,
 *   speakingRate: 1.0,
 *   isDefault: true,
 * });
 * ```
 */
export async function speakWithElevenLabs(
  text: string,
  voiceConfig: VoiceConfig,
  config: ElevenLabsConfig
): Promise<void> {
  const fullConfig = { ...DEFAULT_ELEVENLABS_CONFIG, ...config };

  // Check cache first
  const cacheKey = `${voiceConfig.voiceId}-${text}`;
  let audioUrl = audioCache.get(cacheKey);

  if (!audioUrl) {
    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': fullConfig.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: fullConfig.modelId,
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarityBoost,
            style: 0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const audioBlob = await response.blob();
    audioUrl = URL.createObjectURL(audioBlob);

    // Cache for reuse (limit cache size)
    if (audioCache.size > 100) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) {
        URL.revokeObjectURL(audioCache.get(firstKey)!);
        audioCache.delete(firstKey);
      }
    }
    audioCache.set(cacheKey, audioUrl);
  }

  // Play the audio
  return playAudio(audioUrl);
}

/**
 * Speak text using Web Speech API (fallback)
 *
 * @param text - Text to speak
 * @param rate - Speaking rate (0.1 to 10, default 1)
 * @param pitch - Voice pitch (0 to 2, default 1)
 * @returns Promise that resolves when speech completes
 */
export function speakWithWebSpeech(
  text: string,
  rate: number = 1,
  pitch: number = 1
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Web Speech API not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to use a child-friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('child')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) =>
      reject(new Error(`Speech error: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speak text using local KittenTTS (Kiki voice) via /api/tts
 *
 * Posts to the local KittenTTS API route and plays the returned WAV.
 * Returns false if the API is unavailable (204) so callers can fall back.
 *
 * @param text - Text to speak
 * @param speed - Speaking speed (default 0.85)
 * @returns true if audio played, false if caller should fall back
 */
export async function speakWithKitten(
  text: string,
  speed: number = 0.85
): Promise<boolean> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'Kiki', speed }),
    });

    if (!response.ok || response.status === 204) {
      return false;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    await playAudio(url);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Play an audio file from URL
 */
function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

/**
 * Speak text using the best available method
 *
 * Tries ElevenLabs first, falls back to Web Speech API if unavailable.
 *
 * @param request - Speech request with text and optional voice
 * @param voiceConfig - Voice configuration
 * @param elevenLabsConfig - Optional ElevenLabs configuration
 */
export async function speak(
  request: SpeechRequest,
  voiceConfig: VoiceConfig,
  elevenLabsConfig?: ElevenLabsConfig
): Promise<void> {
  try {
    if (elevenLabsConfig?.apiKey) {
      await speakWithElevenLabs(request.text, voiceConfig, elevenLabsConfig);
    } else {
      await speakWithWebSpeech(request.text, voiceConfig.speakingRate);
    }
    request.onComplete?.();
  } catch (error) {
    // Fallback to Web Speech if ElevenLabs fails
    if (elevenLabsConfig?.apiKey) {
      try {
        await speakWithWebSpeech(request.text, voiceConfig.speakingRate);
        request.onComplete?.();
        return;
      } catch (fallbackError) {
        // Both methods failed
      }
    }
    request.onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Preload audio for common phrases
 *
 * This improves latency for frequently used AAC cards by pre-generating
 * and caching the audio.
 *
 * @param phrases - Array of phrases to preload
 * @param voiceConfig - Voice configuration
 * @param config - ElevenLabs configuration
 */
export async function preloadPhrases(
  phrases: string[],
  voiceConfig: VoiceConfig,
  config: ElevenLabsConfig
): Promise<void> {
  // Preload in background without blocking
  for (const phrase of phrases) {
    const cacheKey = `${voiceConfig.voiceId}-${phrase}`;
    if (!audioCache.has(cacheKey)) {
      // Don't await - let them load in parallel in background
      speakWithElevenLabs(phrase, voiceConfig, config).catch(() => {
        // Ignore preload errors
      });
    }
  }
}

/**
 * Clear the audio cache
 */
export function clearAudioCache(): void {
  audioCache.forEach((url) => URL.revokeObjectURL(url));
  audioCache.clear();
}

/**
 * Get available Web Speech voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export default speak;
