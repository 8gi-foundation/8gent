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
import { ParentVoiceButton } from '@/components/aac/ParentVoiceButton';
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

function isDemoHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'demo.8gentjr.com';
}

export default function AACAppPage() {
  const router = useRouter();
  const { settings, isLoaded } = useApp();
  const [sentence, setSentence] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<AACCategory | null>(null);
  const [missingVocabulary, setMissingVocabulary] = useState<MissingVocabulary[]>([]);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoHost());
  }, []);

  // Redirect to onboarding if not completed (skip if accessed via /jr/[tenant] path or demo)
  useEffect(() => {
    const isJrRoute = window.location.pathname.startsWith('/jr/');
    if (isLoaded && !settings.hasCompletedOnboarding && !isJrRoute && !isDemoHost()) {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--warm-bg-page, #F5F0EB)' }}>
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--warm-bg-page, #F5F0EB)' }}>
      {/* Demo mode banner */}
      {isDemo && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 text-white text-[13px] sm:text-[14px] font-medium"
          style={{ backgroundColor: '#E8610A' }}
        >
          <span>Demo Mode - Try 8gent Jr</span>
          <a
            href="https://8gentjr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 opacity-90 active:opacity-100"
          >
            Learn more
          </a>
        </div>
      )}
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
                {settings.childName ? `${settings.childName}'s Talk` : '8gent Jr'}
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Sentence Strip */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-sm border-b" style={{ backgroundColor: 'rgba(253,252,250,0.7)', borderColor: 'var(--warm-border-light, #F0EAE3)' }}>
        <div className="flex items-center gap-2 min-h-[48px] sm:min-h-[56px] p-2 sm:p-3 rounded-2xl overflow-x-auto" style={{ backgroundColor: 'rgba(253,252,250,0.5)' }}>
          {sentence.length === 0 ? (
            <span className="text-[15px] sm:text-[17px] whitespace-nowrap" style={{ color: 'var(--warm-text-placeholder, #B5ADA4)' }}>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
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
          {/* Parent Voice Input - speak to find AAC cards */}
          <ParentVoiceButton
            onCardSelect={handleCardTap}
            primaryColor={primaryColor}
          />
          <button
            onClick={handleBackspace}
            disabled={sentence.length === 0}
            className="min-w-[44px] sm:min-w-[50px] min-h-[44px] sm:min-h-[50px] font-semibold rounded-2xl border
                     transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-lg sm:text-xl"
            style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)', color: 'var(--warm-text-secondary, #5C544A)', borderColor: 'var(--warm-border, #E8E0D6)' }}
          >
            ⌫
          </button>
          <button
            onClick={handleClear}
            disabled={sentence.length === 0}
            className="px-3 sm:px-5 min-h-[44px] sm:min-h-[50px] text-[#FF3B30] font-semibold rounded-xl border
                     active:bg-red-50 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed text-[15px] sm:text-[17px]"
            style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)', borderColor: 'var(--warm-border, #E8E0D6)' }}
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
            className="grid gap-2.5 sm:gap-3.5"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {phrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleCardTap(phrase)}
                className="rounded-[16px] sm:rounded-[20px] p-2 sm:p-3 flex flex-col items-center justify-center
                          aspect-square min-w-[48px] min-h-[48px]
                          shadow-[0_2px_8px_rgba(26,22,20,0.06),0_1px_3px_rgba(26,22,20,0.04)]
                          active:scale-[0.95] active:shadow-sm transition-all
                          border focus:outline-none"
                style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)', borderColor: 'var(--warm-border-light, #F0EAE3)' }}
              >
                <div className="relative w-full h-[58%] mb-1 sm:mb-1.5">
                  <Image
                    src={phrase.imageUrl}
                    alt={phrase.text}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="text-[14px] sm:text-[15px] font-bold text-center leading-tight line-clamp-2" style={{ color: 'var(--warm-text, #1A1614)' }}>
                  {phrase.text}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Show categories
          <div
            className="grid gap-2.5 sm:gap-3.5"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {AAC_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryTap(category)}
                className="rounded-[16px] sm:rounded-[20px] p-2 sm:p-3 flex flex-col items-center justify-center
                          aspect-square min-w-[48px] min-h-[48px]
                          shadow-[0_2px_8px_rgba(26,22,20,0.06),0_1px_3px_rgba(26,22,20,0.04)]
                          active:scale-[0.95] active:shadow-sm transition-all
                          border-2"
                style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)', borderColor: category.color }}
              >
                <div className="relative w-full h-[58%] mb-1 sm:mb-1.5">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span
                  className="text-[14px] sm:text-[16px] font-bold text-center leading-tight"
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
