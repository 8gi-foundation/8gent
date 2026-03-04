'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AAC_CATEGORIES,
  getPhrasesByCategory,
  type AACCategory,
  type AACPhrase,
} from '@/lib/aac/vocabulary';

/**
 * Main AAC App Page - iOS Style
 *
 * Grid 3 / Smartbox style AAC board using ARASAAC pictographic symbols.
 * Clean white cards, proper Fitzgerald Key color coding, iOS HIG patterns.
 */

export default function AACAppPage() {
  const [sentence, setSentence] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<AACCategory | null>(null);

  const handleCardTap = (phrase: AACPhrase) => {
    const textToSpeak = phrase.spokenText || phrase.text;
    setSentence([...sentence, phrase.text]);

    // Speak the word using Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      speechSynthesis.speak(utterance);
    }
  };

  const handleCategoryTap = (category: AACCategory) => {
    setActiveCategory(category);
  };

  const handleBack = () => {
    setActiveCategory(null);
  };

  const handleSpeak = () => {
    if (sentence.length === 0) return;

    const text = sentence.join(' ');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    setSentence([]);
  };

  const handleBackspace = () => {
    setSentence(sentence.slice(0, -1));
  };

  // Get phrases for active category
  const phrases = activeCategory ? getPhrasesByCategory(activeCategory.id) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f7]">
      {/* iOS Style Header - Blur glass effect */}
      <header className="sticky top-0 z-50 bg-[#4CAF50]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 safe-top">
          <div className="flex items-center gap-3">
            {activeCategory ? (
              <button
                onClick={handleBack}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-white/90 active:text-white"
              >
                <span className="text-[17px] flex items-center gap-1">
                  <span className="text-2xl">‹</span>
                  Back
                </span>
              </button>
            ) : (
              <span className="text-[20px] font-semibold text-white">8gent</span>
            )}
            {activeCategory && (
              <span className="text-[17px] font-semibold text-white">{activeCategory.name}</span>
            )}
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/voice"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center px-3 text-[15px] text-white/90 active:text-white"
            >
              Voice
            </Link>
            <Link
              href="/settings"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center px-3 text-[15px] text-white/90 active:text-white"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>

      {/* Sentence Strip - iOS Card Style */}
      <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex items-center gap-2 min-h-[56px] p-3 bg-[#f2f2f7] rounded-xl">
          {sentence.length === 0 ? (
            <span className="text-gray-400 text-[17px]">
              Tap cards to build a sentence...
            </span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sentence.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-[#007AFF] text-white rounded-lg font-medium text-[17px]"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSpeak}
            disabled={sentence.length === 0}
            className="flex-1 min-h-[50px] bg-[#34C759] text-white font-semibold rounded-xl
                     active:opacity-80 transition-opacity
                     disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[17px]"
          >
            <span className="text-xl">🔊</span>
            <span>Speak</span>
          </button>
          <button
            onClick={handleBackspace}
            disabled={sentence.length === 0}
            className="min-w-[50px] min-h-[50px] bg-white text-gray-700 font-semibold rounded-xl border border-gray-200
                     active:bg-gray-100 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xl"
          >
            ⌫
          </button>
          <button
            onClick={handleClear}
            disabled={sentence.length === 0}
            className="px-5 min-h-[50px] bg-white text-[#FF3B30] font-semibold rounded-xl border border-gray-200
                     active:bg-red-50 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed text-[17px]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Card Grid - iOS Inset Grouped Style */}
      <div className="flex-1 px-4 py-4 overflow-y-auto safe-bottom">
        {activeCategory ? (
          // Show phrases for selected category
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {phrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleCardTap(phrase)}
                className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center
                          aspect-square shadow-sm
                          active:scale-[0.97] active:shadow-none transition-all
                          border-2 border-transparent focus:outline-none"
                style={{ minHeight: '100px' }}
              >
                <div className="relative w-full h-3/5 mb-2">
                  <Image
                    src={phrase.imageUrl}
                    alt={phrase.text}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="text-[13px] font-semibold text-gray-800 text-center leading-tight">
                  {phrase.text}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Show categories
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {AAC_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryTap(category)}
                className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center
                          aspect-square shadow-sm
                          active:scale-[0.97] active:shadow-none transition-all
                          border-[3px]"
                style={{
                  borderColor: category.color,
                  minHeight: '100px',
                }}
              >
                <div className="relative w-full h-3/5 mb-2">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span
                  className="text-[13px] font-bold text-center leading-tight"
                  style={{ color: category.color }}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Minimal iOS Style */}
      <footer className="px-4 py-3 text-center text-[11px] text-gray-400 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 safe-bottom">
        8gent · Your Voice, Your Way · Symbols © ARASAAC
      </footer>
    </div>
  );
}
