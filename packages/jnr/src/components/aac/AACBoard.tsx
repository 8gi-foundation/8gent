/**
 * @fileoverview Main AAC Board Layout Component
 *
 * The AACBoard is the primary interface for the AAC communication system.
 * It displays a grid of communication cards organized by categories,
 * with a sentence builder strip at the bottom for constructing multi-word phrases.
 *
 * Features:
 * - Responsive grid layout (3 cols phone, 4 cols tablet, 6+ cols desktop)
 * - Category tabs horizontally scrollable on mobile
 * - Sentence builder bar at bottom
 * - Always-visible speak button
 * - Safety phrases always visible
 * - Framer Motion animations
 * - 44pt+ touch targets
 *
 * @module components/aac/AACBoard
 */

'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AACCard, AACBoardConfig, AACCategory } from '@/types/aac';
import { AACCard as AACCardComponent } from './AACCard';
import { CategoryNav } from './CategoryNav';

// Safety card definitions
const SAFETY_CARDS = [
  { id: 'safety-help', label: 'I need help', icon: '🆘', speechText: 'I need help please', bgColor: '#EF4444' },
  { id: 'safety-hurts', label: 'Something hurts', icon: '🤕', speechText: 'Something hurts', bgColor: '#DC2626' },
  { id: 'safety-sick', label: 'I feel sick', icon: '🤢', speechText: 'I feel sick', bgColor: '#B91C1C' },
  { id: 'safety-stop', label: 'Stop', icon: '✋', speechText: 'Stop!', bgColor: '#991B1B' },
];

// Icons
const SpeakIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const ClearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BackspaceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <line x1="18" y1="9" x2="12" y2="15" />
    <line x1="12" y1="9" x2="18" y2="15" />
  </svg>
);

/**
 * Props for the AACBoard component
 */
export interface AACBoardProps {
  /** Array of cards to display */
  cards: AACCard[];
  /** Available categories */
  categories: AACCategory[];
  /** Currently selected category ID */
  activeCategoryId: string;
  /** Board configuration */
  config: AACBoardConfig;
  /** Callback when a card is tapped */
  onCardTap: (card: AACCard) => void;
  /** Callback when category changes */
  onCategoryChange: (categoryId: string) => void;
  /** Callback to speak the current sentence */
  onSpeak: () => void;
  /** Currently selected cards in sentence builder */
  selectedCards: AACCard[];
  /** Callback to clear sentence */
  onClearSentence: () => void;
  /** Callback to remove last card from sentence */
  onRemoveLastCard: () => void;
  /** Whether speech is currently playing */
  isSpeaking?: boolean;
  /** Custom speak handler for safety cards */
  onSafetySpeak?: (text: string) => void;
}

/**
 * Main AAC Board Layout Component - Mobile-First Design
 */
export function AACBoard({
  cards,
  categories,
  activeCategoryId,
  config,
  onCardTap,
  onCategoryChange,
  onSpeak,
  selectedCards,
  onClearSentence,
  onRemoveLastCard,
  isSpeaking = false,
  onSafetySpeak,
}: AACBoardProps): React.ReactElement {
  const sentenceBarRef = useRef<HTMLDivElement>(null);

  // Filter cards by active category
  const filteredCards = useMemo(() => {
    return cards.filter((card) => card.categoryId === activeCategoryId);
  }, [cards, activeCategoryId]);

  // Handle safety card tap - speaks immediately
  const handleSafetyTap = useCallback((safetyCard: typeof SAFETY_CARDS[0]) => {
    if (navigator.vibrate) navigator.vibrate(100);
    if (onSafetySpeak) {
      onSafetySpeak(safetyCard.speechText);
    }
  }, [onSafetySpeak]);

  // Handle card tap with haptic feedback
  const handleCardTap = useCallback((card: AACCard) => {
    if (navigator.vibrate) navigator.vibrate(10);
    onCardTap(card);
  }, [onCardTap]);

  // Scroll sentence bar to end when cards are added
  React.useEffect(() => {
    if (sentenceBarRef.current) {
      sentenceBarRef.current.scrollLeft = sentenceBarRef.current.scrollWidth;
    }
  }, [selectedCards.length]);

  return (
    <div
      className="aac-board min-h-screen bg-gray-50 flex flex-col"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Safety Phrases - Always Visible */}
      <div className="safety-bar bg-red-50 border-b border-red-100 px-2 py-2">
        <div className="grid grid-cols-4 gap-1.5 max-w-2xl mx-auto">
          {SAFETY_CARDS.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleSafetyTap(card)}
              disabled={isSpeaking}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl text-white font-semibold shadow-md min-h-[52px]"
              style={{ backgroundColor: card.bgColor }}
              whileTap={{ scale: 0.95 }}
              aria-label={card.speechText}
            >
              <span className="text-lg leading-none">{card.icon}</span>
              <span className="text-[10px] leading-tight text-center mt-0.5">{card.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Category Navigation - Horizontally Scrollable */}
      <div className="category-nav-wrapper bg-white border-b border-gray-100">
        <CategoryNav
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* Card Grid - Responsive */}
      <div className="flex-1 overflow-y-auto px-3 py-3 pb-48">
        <div
          className="grid gap-2 max-w-5xl mx-auto"
          style={{
            gridTemplateColumns: 'repeat(var(--grid-cols), 1fr)',
          }}
        >
          <style jsx>{`
            div {
              --grid-cols: 3;
            }
            @media (min-width: 640px) {
              div { --grid-cols: 4; }
            }
            @media (min-width: 768px) {
              div { --grid-cols: 5; }
            }
            @media (min-width: 1024px) {
              div { --grid-cols: 6; }
            }
          `}</style>
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, index) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15, delay: index * 0.02 }}
              >
                <AACCardComponent
                  card={card}
                  size={config.cardSize || 100}
                  showLabel={config.showLabels ?? true}
                  isSelected={selectedCards.some((c) => c.id === card.id)}
                  onTap={handleCardTap}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Sentence Builder - Fixed at Bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Selected Cards Strip */}
        <div
          ref={sentenceBarRef}
          className="flex items-center gap-2 px-3 py-2 overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {selectedCards.length === 0 ? (
            <p className="text-gray-400 flex-1 text-center py-2 text-sm">
              Tap cards to build a sentence
            </p>
          ) : (
            <>
              <div className="flex-1 flex gap-1.5 overflow-x-auto">
                <AnimatePresence mode="popLayout">
                  {selectedCards.map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 rounded-full text-blue-800 font-medium whitespace-nowrap text-sm"
                    >
                      {card.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Backspace Button */}
              <button
                onClick={onRemoveLastCard}
                className="p-2 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Remove last"
              >
                <BackspaceIcon />
              </button>

              {/* Clear Button */}
              <button
                onClick={onClearSentence}
                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Clear all"
              >
                <ClearIcon />
              </button>
            </>
          )}
        </div>

        {/* Speak Button */}
        <div className="px-3 pb-3">
          <motion.button
            onClick={onSpeak}
            disabled={selectedCards.length === 0 || isSpeaking}
            className={`w-full min-h-[56px] rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-colors ${
              selectedCards.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isSpeaking
                  ? 'bg-green-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
            }`}
            whileTap={selectedCards.length > 0 && !isSpeaking ? { scale: 0.98 } : {}}
            aria-label={isSpeaking ? 'Speaking' : 'Speak sentence'}
          >
            <SpeakIcon />
            {isSpeaking ? 'Speaking...' : 'Speak'}
          </motion.button>
        </div>
      </div>

      {/* Scrollbar hide styles */}
      <style jsx global>{`
        .aac-board ::-webkit-scrollbar {
          display: none;
        }
        .aac-board {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default AACBoard;
