/**
 * Voice Designer Types for 8gent Jr
 *
 * Types for ElevenLabs Voice Designer integration
 */

export interface VoiceSample {
  id: string;
  blob: Blob;
  duration: number;
  recordedAt: Date;
  phrase: string;
}

export interface VoiceGenerationStatus {
  status: 'idle' | 'recording' | 'uploading' | 'generating' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
}

export interface GeneratedVoice {
  voiceId: string;
  name: string;
  previewUrl?: string;
  createdAt: Date;
}

export interface VoiceDesignerConfig {
  apiKey: string;
  baseUrl?: string;
  modelId?: string;
}

export interface VoiceSettings {
  stability: number; // 0-1, lower = more expressive
  similarityBoost: number; // 0-1, higher = more similar to samples
  style?: number; // 0-1, style exaggeration
  useSpeakerBoost?: boolean;
}

export interface VoiceCloneRequest {
  name: string;
  description?: string;
  files: File[];
  labels?: Record<string, string>;
}

export interface VoiceCloneResponse {
  voice_id: string;
  name: string;
  samples?: VoiceSampleInfo[];
  category?: string;
  labels?: Record<string, string>;
  description?: string;
  preview_url?: string;
  settings?: VoiceSettings;
}

export interface VoiceSampleInfo {
  sample_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  hash: string;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
  outputFormat?: 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
}

export interface TTSResponse {
  audioUrl: string;
  audioBlob: Blob;
  contentType: string;
}

// Onboarding phrases for voice recording
export const VOICE_RECORDING_PHRASES = [
  "I am happy today!",
  "Can I have some water please?",
  "I want to play with my toys.",
  "Thank you very much!",
  "I need help please.",
] as const;

export type RecordingPhrase = typeof VOICE_RECORDING_PHRASES[number];
