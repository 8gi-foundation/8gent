'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Voice, VoiceSettings, RecordingState } from './types';
import { DEFAULT_VOICES, ELEVENLABS_VOICES } from './types';
import { speakWithKitten } from '@/lib/speech/tts';

const STORAGE_KEY = '8gent-voice-settings';

const DEFAULT_SETTINGS: VoiceSettings = {
  selectedVoiceId: 'browser-default',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

/**
 * Hook for managing voice settings
 */
export function useVoiceSettings() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch {
          // Use defaults
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  return { settings, updateSettings, isLoaded };
}

/**
 * Hook for audio recording
 */
export function useAudioRecording() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setState((prev) => ({
          ...prev,
          isRecording: false,
          audioBlob,
          audioUrl,
        }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setState({ isRecording: true, duration: 0 });

      // Start duration timer
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state.isRecording]);

  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState({
      isRecording: false,
      duration: 0,
      audioBlob: undefined,
      audioUrl: undefined,
    });
  }, [state.audioUrl]);

  return { ...state, startRecording, stopRecording, clearRecording };
}

/**
 * Hook for text-to-speech
 */
export function useTTS(settings: VoiceSettings) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        const browserVoices: Voice[] = voices.slice(0, 10).map((voice) => ({
          id: voice.voiceURI,
          name: voice.name,
          description: voice.lang,
          category: 'default' as const,
        }));
        setAvailableVoices([...DEFAULT_VOICES, ...browserVoices, ...ELEVENLABS_VOICES]);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text) return;

      // Check if using ElevenLabs voice
      const isElevenLabs = settings.selectedVoiceId.length > 15;

      if (isElevenLabs) {
        // Use ElevenLabs API
        setIsSpeaking(true);
        try {
          const response = await fetch('/api/voice/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              voiceId: settings.selectedVoiceId,
            }),
          });

          if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
            };
            await audio.play();
          } else {
            // Fallback to browser TTS
            fallbackSpeak(text);
          }
        } catch {
          fallbackSpeak(text);
        }
      } else {
        fallbackSpeak(text);
      }

      async function fallbackSpeak(textToSpeak: string) {
        // Try Kiki TTS first
        setIsSpeaking(true);
        const kittenOk = await speakWithKitten(textToSpeak, settings.rate || 0.85);
        if (kittenOk) {
          setIsSpeaking(false);
          return;
        }

        // Fall back to browser speechSynthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = settings.rate;
          utterance.pitch = settings.pitch;
          utterance.volume = settings.volume;

          // Find matching voice
          const voices = speechSynthesis.getVoices();
          const selectedVoice = voices.find((v) => v.voiceURI === settings.selectedVoiceId);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
      }
    },
    [settings]
  );

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, availableVoices };
}
