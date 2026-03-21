'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakWithKitten } from '@/lib/speech/tts';

/**
 * MagicButton Component
 *
 * Purple sparkle button that improves grammar and speaks the result.
 * Placed next to the green Speak button in the sentence strip.
 */

interface MissingVocabulary {
  word: string;
  category: string;
  reason: string;
}

interface MagicButtonProps {
  /** Array of selected card labels */
  cards: string[];
  /** Voice ID for ElevenLabs TTS */
  voiceId?: string;
  /** TTS speech rate */
  ttsRate?: number;
  /** Callback when vocabulary gaps are detected */
  onMissingVocabulary?: (missing: MissingVocabulary[]) => void;
  /** Disabled state */
  disabled?: boolean;
}

export function MagicButton({
  cards,
  voiceId,
  ttsRate = 1,
  onMissingVocabulary,
  disabled = false,
}: MagicButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMagic = useCallback(async () => {
    if (cards.length === 0 || isLoading) return;

    setIsLoading(true);

    try {
      // Call the improve API
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });

      if (!response.ok) {
        throw new Error('Failed to improve sentence');
      }

      const data = await response.json();
      const improvedText = data.improved;

      // Speak the improved sentence — KittenTTS (Kiki) first
      const kittenOk = await speakWithKitten(improvedText, ttsRate || 0.85);
      if (!kittenOk) {
        // Try ElevenLabs if voice is selected
        if (voiceId) {
          try {
            const ttsResponse = await fetch('/api/voice/speak', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: improvedText, voiceId }),
            });

            if (ttsResponse.ok) {
              const blob = await ttsResponse.blob();
              const url = URL.createObjectURL(blob);
              const audio = new Audio(url);
              audio.play();
            } else {
              speakWithBrowser(improvedText, ttsRate);
            }
          } catch {
            speakWithBrowser(improvedText, ttsRate);
          }
        } else {
          speakWithBrowser(improvedText, ttsRate);
        }
      }

      // Report missing vocabulary
      if (data.missing && data.missing.length > 0 && onMissingVocabulary) {
        onMissingVocabulary(data.missing);
      }

      // Show tooltip briefly
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } catch (error) {
      console.error('Magic button error:', error);
      // Fallback: speak the raw sentence
      const fallbackText = cards.join(' ');
      speakWithBrowser(fallbackText, ttsRate);
    } finally {
      setIsLoading(false);
    }
  }, [cards, voiceId, ttsRate, isLoading, onMissingVocabulary]);

  const isDisabled = disabled || cards.length === 0 || isLoading;

  return (
    <div className="relative">
      <motion.button
        onClick={handleMagic}
        disabled={isDisabled}
        className={`min-w-[44px] min-h-[44px] sm:min-w-[50px] sm:min-h-[50px] rounded-xl font-semibold
                   flex items-center justify-center gap-1.5 px-3 transition-all
                   ${isDisabled
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                     : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                   }`}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        title="Magic: Improve grammar and speak"
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="text-lg">✨</span>
            <span className="hidden sm:inline text-[15px]">Magic</span>
          </>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap"
          >
            Sentence improved!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Helper to speak text using browser's speech synthesis
 */
function speakWithBrowser(text: string, rate: number = 1) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    speechSynthesis.speak(utterance);
  }
}

export default MagicButton;
