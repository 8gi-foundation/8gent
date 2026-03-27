'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllPhrases, type AACPhrase } from '@/lib/aac/vocabulary';
import Image from 'next/image';

/**
 * ParentVoiceButton
 *
 * Mic button for parents to speak words and get matching AAC card suggestions.
 * Uses the Web Speech API (SpeechRecognition) built into browsers - no extra packages.
 *
 * Flow:
 * 1. Parent taps the mic button
 * 2. Speech is transcribed in real time
 * 3. Spoken words are matched against the full AAC vocabulary
 * 4. Matching cards appear as tappable suggestions
 * 5. Tapping a suggestion adds it to the sentence strip
 * 6. Listening stops after 5 s of silence or when mic is tapped again
 */

// Web Speech API types (not yet in standard TypeScript DOM lib)
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

interface ParentVoiceButtonProps {
  onCardSelect: (phrase: AACPhrase) => void;
  primaryColor?: string;
}

// Silence timeout in milliseconds
const SILENCE_TIMEOUT_MS = 5000;

export function ParentVoiceButton({ onCardSelect, primaryColor = '#4CAF50' }: ParentVoiceButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [matches, setMatches] = useState<AACPhrase[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allPhrases = useRef<AACPhrase[]>(getAllPhrases());

  // Feature detect on mount (client only)
  useEffect(() => {
    const w = window as WindowWithSpeech;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const matchPhrases = useCallback((transcript: string): AACPhrase[] => {
    const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    return allPhrases.current.filter((phrase) => {
      const phraseText = phrase.text.toLowerCase();
      const spokenText = (phrase.spokenText || '').toLowerCase();
      return words.some(
        (w) => phraseText.includes(w) || spokenText.includes(w) || w.includes(phraseText)
      );
    }).slice(0, 8); // cap at 8 suggestions to avoid overflow
  }, []);

  const startListening = useCallback(() => {
    const w = window as WindowWithSpeech;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IE';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Reset silence timer on every result
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(stopListening, SILENCE_TIMEOUT_MS);

      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      setMatches(matchPhrases(fullTranscript));
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setMatches([]);

    // Auto-stop after 5 s of silence from the start (no speech yet)
    silenceTimerRef.current = setTimeout(stopListening, SILENCE_TIMEOUT_MS);
  }, [matchPhrases, stopListening]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSuggestionTap = (phrase: AACPhrase) => {
    onCardSelect(phrase);
    // Clear matches after selection to keep the UI clean
    setMatches([]);
    stopListening();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  if (!isSupported) return null;

  return (
    <div className="relative">
      {/* Mic button */}
      <button
        onClick={handleToggle}
        title={isListening ? 'Stop listening' : 'Speak to find cards'}
        className={`min-w-[44px] min-h-[44px] sm:min-w-[50px] sm:min-h-[50px] rounded-xl
                   flex items-center justify-center gap-1.5 px-3 transition-all active:scale-95
                   ${isListening
                     ? 'text-white shadow-lg'
                     : 'border text-[#E8610A]'
                   }`}
        style={
          isListening
            ? { backgroundColor: '#E8610A', boxShadow: `0 0 0 4px ${primaryColor}40` }
            : { backgroundColor: 'var(--warm-bg-card, #FDFCFA)', borderColor: 'var(--warm-border, #E8E0D6)' }
        }
      >
        {/* Pulsing ring when listening */}
        {isListening && (
          <span
            className="absolute inset-0 rounded-xl animate-ping opacity-30"
            style={{ backgroundColor: '#E8610A' }}
          />
        )}
        <svg
          width="20" height="20"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="relative z-10 sm:w-[22px] sm:h-[22px]"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <span className="hidden sm:inline text-[15px] font-semibold relative z-10">
          {isListening ? 'Stop' : 'Voice'}
        </span>
      </button>

      {/* Suggestions tray - anchored below the sentence strip buttons row */}
      {isListening && matches.length > 0 && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                     flex flex-wrap gap-2 p-3 rounded-2xl shadow-xl border
                     w-[min(92vw,420px)] justify-start"
          style={{
            backgroundColor: 'var(--warm-bg-card, #FDFCFA)',
            borderColor: 'var(--warm-border-light, #F0EAE3)',
          }}
        >
          <p className="w-full text-[11px] font-semibold uppercase tracking-wide mb-1"
             style={{ color: 'var(--warm-text-placeholder, #B5ADA4)' }}>
            Tap a card to add it
          </p>
          {matches.map((phrase) => (
            <button
              key={phrase.id}
              onClick={() => handleSuggestionTap(phrase)}
              className="flex flex-col items-center justify-center rounded-xl p-1.5 border
                         active:scale-95 transition-all w-[72px] h-[72px]"
              style={{
                backgroundColor: 'var(--warm-bg-page, #F5F0EB)',
                borderColor: primaryColor,
              }}
            >
              <div className="relative w-8 h-8 mb-0.5">
                <Image
                  src={phrase.imageUrl}
                  alt={phrase.text}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span
                className="text-[10px] font-bold text-center leading-tight line-clamp-2"
                style={{ color: 'var(--warm-text, #1A1614)' }}
              >
                {phrase.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Listening with no matches yet */}
      {isListening && matches.length === 0 && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                     px-4 py-2.5 rounded-xl shadow-lg border text-sm whitespace-nowrap"
          style={{
            backgroundColor: 'var(--warm-bg-card, #FDFCFA)',
            borderColor: 'var(--warm-border-light, #F0EAE3)',
            color: 'var(--warm-text-secondary, #5C544A)',
          }}
        >
          Listening...
        </div>
      )}
    </div>
  );
}

export default ParentVoiceButton;
