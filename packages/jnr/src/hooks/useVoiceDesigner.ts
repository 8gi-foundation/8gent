/**
 * @fileoverview Voice Designer Hook
 *
 * This hook provides an interface for creating custom voices using
 * ElevenLabs Voice Designer. It manages the voice creation workflow:
 * preview -> approve -> create.
 *
 * @module hooks/useVoiceDesigner
 */

import { useState, useCallback } from 'react';
import type { VoiceDesignerConfig, VoiceConfig } from '@/types/aac';
import {
  createVoicePreview,
  createVoiceFromPreview,
  getChildVoicePresets,
  listCustomVoices,
  deleteVoice,
} from '@/lib/voice/voiceDesigner';

/**
 * Voice designer hook options
 */
interface UseVoiceDesignerOptions {
  /** ElevenLabs API key */
  apiKey: string;
  /** Callback when voice is created */
  onVoiceCreated?: (voice: VoiceConfig) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Voice preview state
 */
interface VoicePreview {
  audioUrl: string;
  voiceId: string;
  config: VoiceDesignerConfig;
}

/**
 * Voice designer hook return value
 */
interface UseVoiceDesignerReturn {
  /** Generate a voice preview */
  generatePreview: (config: VoiceDesignerConfig) => Promise<void>;
  /** Create voice from current preview */
  createVoice: (name: string) => Promise<void>;
  /** Current preview (if any) */
  preview: VoicePreview | null;
  /** Clear current preview */
  clearPreview: () => void;
  /** Whether preview is being generated */
  isGenerating: boolean;
  /** Whether voice is being created */
  isCreating: boolean;
  /** Available presets */
  presets: VoiceDesignerConfig[];
  /** User's custom voices */
  customVoices: VoiceConfig[];
  /** Load user's custom voices */
  loadCustomVoices: () => Promise<void>;
  /** Delete a custom voice */
  removeVoice: (voiceId: string) => Promise<void>;
}

/**
 * Voice Designer hook
 *
 * @param options - Configuration options
 * @returns Voice designer controls and state
 *
 * @example
 * ```tsx
 * function VoiceCreator() {
 *   const {
 *     generatePreview,
 *     createVoice,
 *     preview,
 *     isGenerating,
 *     presets,
 *   } = useVoiceDesigner({
 *     apiKey: process.env.ELEVENLABS_API_KEY!,
 *     onVoiceCreated: (voice) => console.log('Created:', voice),
 *   });
 *
 *   return (
 *     <div>
 *       {presets.map((preset, i) => (
 *         <button key={i} onClick={() => generatePreview(preset)}>
 *           {preset.description}
 *         </button>
 *       ))}
 *
 *       {preview && (
 *         <div>
 *           <audio src={preview.audioUrl} controls />
 *           <button onClick={() => createVoice('My Voice')}>
 *             Save Voice
 *           </button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useVoiceDesigner(
  options: UseVoiceDesignerOptions
): UseVoiceDesignerReturn {
  const { apiKey, onVoiceCreated, onError } = options;

  const [preview, setPreview] = useState<VoicePreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customVoices, setCustomVoices] = useState<VoiceConfig[]>([]);

  const presets = getChildVoicePresets();

  const generatePreview = useCallback(
    async (config: VoiceDesignerConfig) => {
      setIsGenerating(true);
      setPreview(null);

      try {
        const result = await createVoicePreview(config, apiKey);
        setPreview({
          audioUrl: result.audioUrl,
          voiceId: result.voiceId,
          config,
        });
      } catch (error) {
        onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [apiKey, onError]
  );

  const createVoice = useCallback(
    async (name: string) => {
      if (!preview) {
        onError?.(new Error('No preview to create voice from'));
        return;
      }

      setIsCreating(true);

      try {
        const result = await createVoiceFromPreview(
          preview.voiceId,
          name,
          apiKey
        );

        if (result.success && result.voiceConfig) {
          onVoiceCreated?.(result.voiceConfig);
          setPreview(null);
          // Refresh custom voices list
          await loadCustomVoices();
        } else {
          throw new Error(result.error || 'Failed to create voice');
        }
      } catch (error) {
        onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        setIsCreating(false);
      }
    },
    [preview, apiKey, onVoiceCreated, onError]
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const loadCustomVoices = useCallback(async () => {
    try {
      const voices = await listCustomVoices(apiKey);
      setCustomVoices(voices);
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [apiKey, onError]);

  const removeVoice = useCallback(
    async (voiceId: string) => {
      try {
        const success = await deleteVoice(voiceId, apiKey);
        if (success) {
          setCustomVoices((prev) => prev.filter((v) => v.voiceId !== voiceId));
        } else {
          throw new Error('Failed to delete voice');
        }
      } catch (error) {
        onError?.(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
    [apiKey, onError]
  );

  return {
    generatePreview,
    createVoice,
    preview,
    clearPreview,
    isGenerating,
    isCreating,
    presets,
    customVoices,
    loadCustomVoices,
    removeVoice,
  };
}

export default useVoiceDesigner;
