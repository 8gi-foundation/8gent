'use client';

import { motion, AnimatePresence } from 'framer-motion';

/**
 * CardSuggestion Component
 *
 * Shows inline prompts when AI detects vocabulary gaps.
 * Allows users to quickly create new cards for missing words.
 */

interface MissingVocabulary {
  word: string;
  category: string;
  reason: string;
}

interface CardSuggestionProps {
  /** List of missing vocabulary suggestions */
  suggestions: MissingVocabulary[];
  /** Callback to dismiss the suggestions */
  onDismiss: () => void;
  /** Callback when user wants to create a card */
  onCreateCard: (word: string, category: string) => void;
}

export function CardSuggestion({
  suggestions,
  onDismiss,
  onCreateCard,
}: CardSuggestionProps) {
  if (suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-medium text-orange-800">
              Vocabulary suggestions
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={`${suggestion.word}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 capitalize">
                    {suggestion.word}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                    {suggestion.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {suggestion.reason}
                </p>
              </div>
              <button
                onClick={() => onCreateCard(suggestion.word, suggestion.category)}
                className="px-3 py-1.5 bg-[#E8610A] hover:bg-[#D15709] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                + Create
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CardSuggestion;
