/**
 * @fileoverview ElevenLabs Voice Designer Integration
 *
 * This module integrates with ElevenLabs Voice Designer API to create
 * custom voices for AAC users. Voice Designer allows generating unique
 * voices based on descriptive parameters rather than voice cloning.
 *
 * This is particularly valuable for AAC users who want a voice that:
 * - Matches their age and gender identity
 * - Has specific accent or regional characteristics
 * - Feels personal and unique to them
 *
 * @module lib/voice/voiceDesigner
 */

import type { VoiceDesignerConfig, VoiceConfig } from '@/types/aac';

/**
 * ElevenLabs Voice Designer API response
 */
interface VoiceDesignerResponse {
  voice_id: string;
  name: string;
  preview_url: string;
  labels: Record<string, string>;
}

/**
 * Voice preview result
 */
interface VoicePreviewResult {
  audioUrl: string;
  voiceId: string;
  expiresAt: number;
}

/**
 * Voice creation result
 */
interface VoiceCreationResult {
  success: boolean;
  voiceConfig?: VoiceConfig;
  error?: string;
}

/**
 * Create a voice preview using Voice Designer
 *
 * This generates a temporary voice preview that can be played before
 * committing to create a permanent voice.
 *
 * @param config - Voice designer configuration
 * @param apiKey - ElevenLabs API key
 * @returns Promise resolving to preview result
 *
 * @example
 * ```ts
 * const preview = await createVoicePreview({
 *   age: 'young',
 *   gender: 'female',
 *   accent: 'american',
 *   description: 'A warm, friendly voice for a young girl',
 *   sampleText: 'I want apple please',
 * }, apiKey);
 *
 * // Play preview
 * const audio = new Audio(preview.audioUrl);
 * audio.play();
 * ```
 */
export async function createVoicePreview(
  config: VoiceDesignerConfig,
  apiKey: string
): Promise<VoicePreviewResult> {
  const response = await fetch(
    'https://api.elevenlabs.io/v1/voice-generation/generate-voice/previews',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        voice_description: buildVoiceDescription(config),
        text: config.sampleText || 'Hello, how are you today?',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voice Designer API error: ${error}`);
  }

  const data = await response.json();

  return {
    audioUrl: data.preview_url,
    voiceId: data.generated_voice_id,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
}

/**
 * Create a permanent voice from a preview
 *
 * After previewing and approving a voice, this creates a permanent
 * voice that can be used for TTS.
 *
 * @param previewVoiceId - The voice ID from the preview
 * @param name - Name for the new voice
 * @param apiKey - ElevenLabs API key
 * @returns Promise resolving to creation result
 */
export async function createVoiceFromPreview(
  previewVoiceId: string,
  name: string,
  apiKey: string
): Promise<VoiceCreationResult> {
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/voice-generation/create-voice-from-preview',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          voice_name: name,
          voice_description: `Custom AAC voice - ${name}`,
          generated_voice_id: previewVoiceId,
          labels: {
            use_case: 'AAC',
            app: '8gent-jr',
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Failed to create voice: ${error}`,
      };
    }

    const data: VoiceDesignerResponse = await response.json();

    const voiceConfig: VoiceConfig = {
      voiceId: data.voice_id,
      name: data.name,
      stability: 0.5,
      similarityBoost: 0.75,
      speakingRate: 1.0,
      isDefault: false,
    };

    return {
      success: true,
      voiceConfig,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build a voice description from configuration
 *
 * Converts structured config into a natural language description
 * for the Voice Designer API.
 */
function buildVoiceDescription(config: VoiceDesignerConfig): string {
  const ageDescriptions = {
    young: 'young child',
    middle_aged: 'middle-aged',
    old: 'elderly',
  };

  const genderDescriptions = {
    male: 'male',
    female: 'female',
    neutral: 'gender-neutral',
  };

  let description = `A ${ageDescriptions[config.age]} ${genderDescriptions[config.gender]} voice`;

  if (config.accent) {
    description += ` with a ${config.accent} accent`;
  }

  if (config.description) {
    description += `. ${config.description}`;
  }

  return description;
}

/**
 * Get child-friendly voice presets
 *
 * Returns pre-configured voice settings optimized for children's AAC.
 */
export function getChildVoicePresets(): VoiceDesignerConfig[] {
  return [
    {
      age: 'young',
      gender: 'male',
      accent: 'american',
      description: 'A friendly, clear voice for a young boy',
      sampleText: 'I want to play outside',
    },
    {
      age: 'young',
      gender: 'female',
      accent: 'american',
      description: 'A warm, cheerful voice for a young girl',
      sampleText: 'Can I have more please',
    },
    {
      age: 'young',
      gender: 'neutral',
      accent: 'american',
      description: 'A gentle, neutral voice for a child',
      sampleText: 'Hello, my name is',
    },
    {
      age: 'young',
      gender: 'male',
      accent: 'british',
      description: 'A clear British voice for a young boy',
      sampleText: 'I feel happy today',
    },
    {
      age: 'young',
      gender: 'female',
      accent: 'british',
      description: 'A soft British voice for a young girl',
      sampleText: 'I am hungry',
    },
  ];
}

/**
 * Delete a custom voice
 *
 * @param voiceId - Voice ID to delete
 * @param apiKey - ElevenLabs API key
 */
export async function deleteVoice(
  voiceId: string,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/voices/${voiceId}`,
      {
        method: 'DELETE',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List user's custom voices
 *
 * @param apiKey - ElevenLabs API key
 * @returns Array of voice configurations
 */
export async function listCustomVoices(
  apiKey: string
): Promise<VoiceConfig[]> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.voices
      .filter((v: any) => v.labels?.app === '8gent-jr')
      .map((v: any) => ({
        voiceId: v.voice_id,
        name: v.name,
        stability: 0.5,
        similarityBoost: 0.75,
        speakingRate: 1.0,
        isDefault: false,
      }));
  } catch {
    return [];
  }
}

export default {
  createVoicePreview,
  createVoiceFromPreview,
  getChildVoicePresets,
  deleteVoice,
  listCustomVoices,
};
