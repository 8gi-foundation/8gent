'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { SUPERCORE_50, FITZGERALD_COLORS, arasaacUrl } from '@/lib/aac/core-words';
import type { CoreWord } from '@/lib/aac/core-words';
import { speakWithKitten } from '@/lib/speech/tts';
import { MagicButton } from '@/components/aac/MagicButton';
import { Dock } from '@/components/dock/Dock';

/**
 * Core Words Page
 *
 * 50 high-frequency words in a fixed grid (motor planning lock).
 * Words NEVER move. Positions are permanent for muscle memory.
 */

export default function CoreWordsPage() {
  const [sentence, setSentence] = useState<CoreWord[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const addWord = useCallback((word: CoreWord) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setSentence((prev) => [...prev, word]);
  }, []);

  const removeLastWord = useCallback(() => {
    setSentence((prev) => prev.slice(0, -1));
  }, []);

  const clearSentence = useCallback(() => {
    setSentence([]);
  }, []);

  const speakSentence = useCallback(async () => {
    if (sentence.length === 0 || isSpeaking) return;
    setIsSpeaking(true);
    const text = sentence.map((w) => w.label).join(' ');
    const ok = await speakWithKitten(text, 0.85);
    if (!ok && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      speechSynthesis.speak(u);
    }
    setIsSpeaking(false);
  }, [sentence, isSpeaking]);

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col pb-24">
      {/* Sentence Strip */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 min-h-[56px]">
          <div className="flex-1 flex gap-1.5 overflow-x-auto items-center">
            {sentence.length === 0 ? (
              <span className="text-gray-400 text-sm">Tap words to build a sentence</span>
            ) : (
              sentence.map((w, i) => {
                const fc = FITZGERALD_COLORS[w.color];
                return (
                  <span
                    key={`${w.id}-${i}`}
                    className={`px-2.5 py-1 rounded-full text-sm font-medium whitespace-nowrap border ${fc.bg} ${fc.border} ${fc.text}`}
                  >
                    {w.label}
                  </span>
                );
              })
            )}
          </div>

          {/* Backspace */}
          {sentence.length > 0 && (
            <button
              onClick={removeLastWord}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50"
              aria-label="Remove last word"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          )}

          {/* Clear */}
          {sentence.length > 0 && (
            <button
              onClick={clearSentence}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
              aria-label="Clear sentence"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Speak */}
          <button
            onClick={speakSentence}
            disabled={sentence.length === 0 || isSpeaking}
            className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center ${
              sentence.length === 0
                ? 'bg-gray-200 text-gray-400'
                : isSpeaking
                  ? 'bg-green-600 text-white'
                  : 'bg-green-500 text-white shadow-md shadow-green-500/30'
            }`}
            aria-label="Speak sentence"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </button>

          {/* Magic (Kiki sentence improvement) */}
          <MagicButton
            cards={sentence.map((w) => w.label)}
            disabled={sentence.length === 0}
          />
        </div>
      </div>

      {/* Core Word Grid - FIXED positions, never reorder */}
      <div className="flex-1 px-2 py-3">
        <div
          className="grid gap-1.5 max-w-5xl mx-auto"
          style={{ gridTemplateColumns: 'repeat(var(--core-cols), 1fr)' }}
        >
          <style>{`
            :root { --core-cols: 5; }
            @media (min-width: 640px) { :root { --core-cols: 10; } }
          `}</style>
          {SUPERCORE_50.map((word) => {
            const fc = FITZGERALD_COLORS[word.color];
            return (
              <button
                key={word.id}
                onClick={() => addWord(word)}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-1.5
                  min-h-[72px] sm:min-h-[80px] transition-transform active:scale-95
                  ${fc.bg} ${fc.border}`}
                aria-label={word.label}
              >
                <Image
                  src={arasaacUrl(word.pictogramId)}
                  alt={word.label}
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                  unoptimized
                />
                <span className={`text-[11px] sm:text-xs font-semibold mt-0.5 leading-tight ${fc.text}`}>
                  {word.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Dock />
    </div>
  );
}
