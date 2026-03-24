'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';

/**
 * Intuition Game — Pattern Recognition for Kids
 *
 * 4 colored cards, child guesses which one hides a picture.
 * Rounds-based with score, streak tracking, and gentle feedback.
 *
 * UX rules:
 * - 80px+ touch targets (cards fill half the grid)
 * - No emojis in UI — SVG icons and color only
 * - Warm palette, calm transitions
 * - Haptic feedback on guess
 */

const TOTAL_ROUNDS = 20;

const COLORS = [
  { name: 'red', bg: '#E05555' },
  { name: 'green', bg: '#3DA66A' },
  { name: 'blue', bg: '#4A8FE0' },
  { name: 'yellow', bg: '#E0B840' },
];

// SVG icons instead of emojis
const HIDDEN_ICONS = [
  // Star
  '<svg viewBox="0 0 24 24" fill="white" width="48" height="48"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  // Heart
  '<svg viewBox="0 0 24 24" fill="white" width="48" height="48"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  // Sun
  '<svg viewBox="0 0 24 24" fill="white" width="48" height="48"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="white" stroke-width="2"/></svg>',
  // Moon
  '<svg viewBox="0 0 24 24" fill="white" width="48" height="48"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
];

interface GameState {
  phase: 'intro' | 'playing' | 'result';
  round: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctCard: number;
  selectedCard: number | null;
  showResult: boolean;
  currentIcon: number;
}

const initialState = (): GameState => ({
  phase: 'intro',
  round: 1,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correctCard: Math.floor(Math.random() * 4),
  selectedCard: null,
  showResult: false,
  currentIcon: Math.floor(Math.random() * HIDDEN_ICONS.length),
});

export default function IntuitionPage() {
  const router = useRouter();
  const { settings } = useApp();
  const [game, setGame] = useState<GameState>(initialState);
  const primaryColor = settings.primaryColor || '#E8610A';

  const startGame = useCallback(() => {
    setGame({
      ...initialState(),
      phase: 'playing',
      correctCard: Math.floor(Math.random() * 4),
      currentIcon: Math.floor(Math.random() * HIDDEN_ICONS.length),
    });
  }, []);

  const selectCard = useCallback((index: number) => {
    if (game.showResult) return;

    const isCorrect = index === game.correctCard;

    if (navigator.vibrate) {
      navigator.vibrate(isCorrect ? [40, 30, 40] : 150);
    }

    setGame((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        ...prev,
        selectedCard: index,
        showResult: true,
        score: isCorrect ? prev.score + 1 : prev.score,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });

    // Advance after delay
    setTimeout(() => {
      setGame((prev) => {
        if (prev.round >= TOTAL_ROUNDS) {
          return { ...prev, phase: 'result' };
        }
        return {
          ...prev,
          round: prev.round + 1,
          correctCard: Math.floor(Math.random() * 4),
          selectedCard: null,
          showResult: false,
          currentIcon: Math.floor(Math.random() * HIDDEN_ICONS.length),
        };
      });
    }, isCorrect ? 1400 : 1000);
  }, [game.showResult, game.correctCard]);

  const percentage = game.phase === 'result' ? Math.round((game.score / TOTAL_ROUNDS) * 100) : 0;
  const progressWidth = (game.round / TOTAL_ROUNDS) * 100;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFDF9' }}>
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b" style={{ borderColor: '#E8E0D6' }}>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center"
          style={{ width: 44, height: 44 }}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1
          className="flex-1 text-center text-xl font-semibold"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#1A1612' }}
        >
          Intuition
        </h1>
        {game.phase === 'playing' ? (
          <span style={{ width: 44, textAlign: 'center', color: '#9A9088', fontSize: 14 }}>
            {game.round}/{TOTAL_ROUNDS}
          </span>
        ) : (
          <div style={{ width: 44 }} />
        )}
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-28">
        {/* INTRO */}
        {game.phase === 'intro' && (
          <div className="text-center max-w-sm">
            {/* Icon instead of emoji */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: primaryColor }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#1A1612' }}
            >
              Intuition
            </h2>
            <p className="mb-8" style={{ color: '#5C544A', fontSize: 16 }}>
              Can you sense which card hides the picture? Trust your feelings!
            </p>

            <div
              className="rounded-2xl p-5 mb-8 text-left"
              style={{ backgroundColor: '#FFF3E8', border: '1px solid #E8E0D6' }}
            >
              <h3 className="font-semibold mb-3" style={{ color: '#1A1612' }}>How to play:</h3>
              <ul className="space-y-2" style={{ color: '#5C544A', fontSize: 14 }}>
                <li>- 4 colored cards, 1 hides a picture</li>
                <li>- Tap the card you feel is right</li>
                <li>- Get it right and you see the picture!</li>
                <li>- {TOTAL_ROUNDS} rounds — how many can you get?</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl text-white text-lg font-semibold"
              style={{ backgroundColor: primaryColor, minHeight: 56 }}
            >
              Start Game
            </button>
          </div>
        )}

        {/* PLAYING */}
        {game.phase === 'playing' && (
          <div className="w-full max-w-sm">
            {/* Progress bar */}
            <div
              className="h-2 rounded-full mb-6 overflow-hidden"
              style={{ backgroundColor: '#E8E0D6' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressWidth}%`, backgroundColor: primaryColor }}
              />
            </div>

            {/* Score + Streak */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div>
                <span style={{ color: '#9A9088', fontSize: 14 }}>Score </span>
                <span className="text-2xl font-bold" style={{ color: '#1A1612' }}>{game.score}</span>
              </div>
              {game.streak > 1 && (
                <div
                  className="px-3 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: '#FFF3E8', color: primaryColor, fontSize: 14 }}
                >
                  {game.streak}x streak
                </div>
              )}
            </div>

            {/* Instruction */}
            <p className="text-center mb-6" style={{ color: '#5C544A', fontSize: 18 }}>
              {game.showResult
                ? game.selectedCard === game.correctCard
                  ? 'You sensed it!'
                  : 'Not this time'
                : 'Which card hides the picture?'
              }
            </p>

            {/* Card grid */}
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map((color, index) => {
                const isTarget = index === game.correctCard;
                const isSelected = index === game.selectedCard;
                const showIcon = game.showResult && isTarget;
                const dimmed = game.showResult && !isTarget;

                return (
                  <button
                    key={color.name}
                    onClick={() => selectCard(index)}
                    disabled={game.showResult}
                    className="aspect-square rounded-2xl flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: color.bg,
                      opacity: dimmed ? 0.35 : 1,
                      outline: isSelected ? '4px solid white' : 'none',
                      outlineOffset: isSelected ? 2 : 0,
                      boxShadow: isSelected
                        ? '0 0 0 6px rgba(0,0,0,0.15)'
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      minHeight: 120,
                    }}
                    aria-label={`${color.name} card`}
                  >
                    {showIcon ? (
                      <svg viewBox="0 0 24 24" fill="white" width="56" height="56">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : game.showResult && isSelected && !isTarget ? (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            <p className="text-center mt-6" style={{ color: '#9A9088', fontSize: 14 }}>
              {game.score} correct of {game.round} guesses
            </p>
          </div>
        )}

        {/* RESULT */}
        {game.phase === 'result' && (
          <div className="text-center max-w-sm">
            {/* Trophy icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: primaryColor }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>

            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-fraunces)', color: '#1A1612' }}
            >
              Game Over
            </h2>
            <p className="text-xl mb-6" style={{ color: '#5C544A' }}>
              {percentage >= 50
                ? 'Super Intuitive!'
                : percentage >= 35
                  ? 'Great Job!'
                  : percentage >= 25
                    ? 'Nice Try!'
                    : 'Keep Practicing!'}
            </p>

            <div
              className="rounded-2xl p-6 mb-6"
              style={{ backgroundColor: '#FFF3E8', border: '1px solid #E8E0D6' }}
            >
              <div className="text-5xl font-bold mb-2" style={{ color: '#1A1612' }}>
                {game.score}
                <span className="text-2xl" style={{ color: '#9A9088' }}>/{TOTAL_ROUNDS}</span>
              </div>
              <div style={{ color: '#5C544A' }}>{percentage}% accuracy</div>
              <div className="mt-1" style={{ color: '#9A9088', fontSize: 13 }}>
                Chance level: 25%
              </div>
              {game.bestStreak > 1 && (
                <div className="mt-3 font-semibold" style={{ color: primaryColor }}>
                  Best streak: {game.bestStreak}
                </div>
              )}
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl text-white text-lg font-semibold"
              style={{ backgroundColor: primaryColor, minHeight: 56 }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <Dock primaryColor={primaryColor} />
    </div>
  );
}
