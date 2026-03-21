'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AAC_CATEGORIES,
  getPhrasesByCategory,
  type AACCategory,
  type AACPhrase,
} from '@/lib/aac/vocabulary';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { MagicButton } from '@/components/aac/MagicButton';
import { CardSuggestion } from '@/components/ai/CardSuggestion';
import { speakWithKitten } from '@/lib/speech/tts';
import { getSessionLogger } from '@/lib/session-logger';
import { trackCardTap, trackSentenceSpeak } from '@/lib/personalization';

/**
 * Main AAC App Page - Mobile-First iOS Style
 *
 * Grid 3 / Smartbox style AAC board using ARASAAC pictographic symbols.
 * Mobile responsive with bottom dock navigation.
 */

interface MissingVocabulary {
  word: string;
  category: string;
  reason: string;
}

export default function AACAppPage() {
  const router = useRouter();
  const { settings, isLoaded } = useApp();
  const [sentence, setSentence] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<AACCategory | null>(null);
  const [missingVocabulary, setMissingVocabulary] = useState<MissingVocabulary[]>([]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (isLoaded && !settings.hasCompletedOnboarding) {
      router.push('/onboarding');
    }
  }, [isLoaded, settings.hasCompletedOnboarding, router]);

  const primaryColor = settings.primaryColor || '#4CAF50';

  const handleCardTap = async (phrase: AACPhrase) => {
    const textToSpeak = phrase.spokenText || phrase.text;
    setSentence([...sentence, phrase.text]);

    // Log to session logger and personalization
    getSessionLogger().logCardTap(phrase.text, activeCategory?.id ?? 'unknown');
    trackCardTap(phrase.text, activeCategory?.id ?? 'unknown');

    // Try KittenTTS (Kiki voice) first
    const kittenOk = await speakWithKitten(textToSpeak, settings.ttsRate || 0.85);
    if (kittenOk) return;

    // Try ElevenLabs if voice is selected
    if (settings.selectedVoiceId) {
      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSpeak, voiceId: settings.selectedVoiceId }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
          return;
        }
      } catch {
        // Fallback
      }
    }

    // Browser TTS fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = settings.ttsRate;
      speechSynthesis.speak(utterance);
    }
  };

  const handleCategoryTap = (category: AACCategory) => {
    setActiveCategory(category);
    getSessionLogger().logCategoryTap(category.id, category.name);
  };

  const handleBack = () => {
    setActiveCategory(null);
  };

  const handleSpeak = async () => {
    if (sentence.length === 0) return;

    const text = sentence.join(' ');

    // Log sentence speak
    getSessionLogger().logSentenceSpeak(text);
    trackSentenceSpeak(sentence);

    // Try KittenTTS (Kiki voice) first
    const kittenOk = await speakWithKitten(text, settings.ttsRate || 0.85);
    if (kittenOk) return;

    // Try ElevenLabs if voice is selected
    if (settings.selectedVoiceId) {
      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId: settings.selectedVoiceId }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
          return;
        }
      } catch {
        // Fallback
      }
    }

    // Browser TTS fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.ttsRate;
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

  // Grid columns based on settings (mobile: 4, tablet: 5, desktop: 6)
  const gridCols = settings.gridColumns || 4;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f2f2f7] overflow-hidden">
      {/* Header - Sticky with blur */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl safe-top"
        style={{ backgroundColor: `${primaryColor}F2` }}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2">
            {activeCategory ? (
              <button
                onClick={handleBack}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-white/90 active:text-white"
              >
                <span className="text-[17px] flex items-center">
                  <span className="text-2xl">‹</span>
                  <span className="hidden sm:inline ml-1">Back</span>
                </span>
              </button>
            ) : (
              <span className="text-[18px] sm:text-[20px] font-semibold text-white">
                {settings.childName ? `${settings.childName}'s Talk` : '8gent'}
              </span>
            )}
            {activeCategory && (
              <span className="text-[17px] font-semibold text-white">{activeCategory.name}</span>
            )}
          </div>
          {/* Settings Icon */}
          <Link
            href="/settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 active:text-white"
          >
            <span className="text-2xl">⚙️</span>
          </Link>
        </div>
      </header>

      {/* Sentence Strip */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="flex items-center gap-2 min-h-[48px] sm:min-h-[56px] p-2 sm:p-3 bg-[#f2f2f7] rounded-xl overflow-x-auto">
          {sentence.length === 0 ? (
            <span className="text-gray-400 text-[15px] sm:text-[17px] whitespace-nowrap">
              Tap cards to build a sentence...
            </span>
          ) : (
            <div className="flex gap-1.5 sm:gap-2">
              {sentence.map((word, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-white rounded-lg font-medium text-[15px] sm:text-[17px] whitespace-nowrap"
                  style={{ backgroundColor: primaryColor }}
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-2 sm:mt-3">
          <button
            onClick={handleSpeak}
            disabled={sentence.length === 0}
            className="flex-1 min-h-[44px] sm:min-h-[50px] text-white font-semibold rounded-xl
                     active:opacity-80 transition-opacity
                     disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[15px] sm:text-[17px]"
            style={{ backgroundColor: '#34C759' }}
          >
            <span className="text-lg sm:text-xl">🔊</span>
            <span>Speak</span>
          </button>
          {/* Magic Button - AI Grammar Improvement */}
          <MagicButton
            cards={sentence}
            voiceId={settings.selectedVoiceId ?? undefined}
            ttsRate={settings.ttsRate}
            onMissingVocabulary={setMissingVocabulary}
            disabled={sentence.length === 0}
          />
          <button
            onClick={handleBackspace}
            disabled={sentence.length === 0}
            className="min-w-[44px] sm:min-w-[50px] min-h-[44px] sm:min-h-[50px] bg-white text-gray-700 font-semibold rounded-xl border border-gray-200
                     active:bg-gray-100 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-lg sm:text-xl"
          >
            ⌫
          </button>
          <button
            onClick={handleClear}
            disabled={sentence.length === 0}
            className="px-3 sm:px-5 min-h-[44px] sm:min-h-[50px] bg-white text-[#FF3B30] font-semibold rounded-xl border border-gray-200
                     active:bg-red-50 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed text-[15px] sm:text-[17px]"
          >
            Clear
          </button>
        </div>

        {/* Card Suggestions from AI */}
        {missingVocabulary.length > 0 && (
          <CardSuggestion
            suggestions={missingVocabulary}
            onDismiss={() => setMissingVocabulary([])}
            onCreateCard={(word) => {
              // TODO: Navigate to card creator or show card generation modal
              console.log('Create card for:', word);
              setMissingVocabulary([]);
            }}
          />
        )}
      </div>

      {/* Card Grid - Responsive */}
      <div className="flex-1 px-2 sm:px-4 py-3 sm:py-4 overflow-y-auto pb-24">
        {activeCategory ? (
          // Show phrases for selected category
          <div
            className="grid gap-2 sm:gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {phrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleCardTap(phrase)}
                className="bg-white rounded-lg sm:rounded-xl p-1 sm:p-2 flex flex-col items-center justify-center
                          aspect-square shadow-sm
                          active:scale-[0.95] active:shadow-none transition-all
                          border border-transparent focus:outline-none"
              >
                <div className="relative w-full h-[60%] mb-0.5 sm:mb-1">
                  <Image
                    src={phrase.imageUrl}
                    alt={phrase.text}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="text-[9px] sm:text-[11px] font-semibold text-gray-800 text-center leading-tight line-clamp-2">
                  {phrase.text}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Show categories
          <div
            className="grid gap-2 sm:gap-3"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {AAC_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryTap(category)}
                className="bg-white rounded-lg sm:rounded-xl p-1 sm:p-2 flex flex-col items-center justify-center
                          aspect-square shadow-sm
                          active:scale-[0.95] active:shadow-none transition-all
                          border-2"
                style={{ borderColor: category.color }}
              >
                <div className="relative w-full h-[60%] mb-0.5 sm:mb-1">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span
                  className="text-[9px] sm:text-[11px] font-bold text-center leading-tight"
                  style={{ color: category.color }}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
