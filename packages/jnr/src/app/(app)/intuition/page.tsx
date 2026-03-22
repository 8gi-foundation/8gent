'use client';

import { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';

/**
 * Intuition Game - Telepathy/guessing game for kids
 *
 * Simplified version of the main 8gent Intuition game.
 * 4 colored cards, child guesses which one hides the picture.
 */

const TOTAL_ROUNDS = 20; // Shorter for kids

const COLORS = [
  { name: 'red', bg: '#EF4444', light: '#FEE2E2' },
  { name: 'green', bg: '#22C55E', light: '#DCFCE7' },
  { name: 'blue', bg: '#3B82F6', light: '#DBEAFE' },
  { name: 'yellow', bg: '#EAB308', light: '#FEF9C3' },
];

const IMAGES = ['🌟', '🦋', '🌈', '🎈', '🐬', '🌺', '🍎', '🌙', '🐶', '🎨', '🚀', '🎵', '🌻', '🐱', '🍕'];

export default function IntuitionPage() {
  const { settings } = useApp();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCard, setCorrectCard] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentImage, setCurrentImage] = useState('🌟');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const primaryColor = settings.primaryColor || '#4CAF50';

  // Initialize a new round
  const initRound = useCallback(() => {
    const randomCard = Math.floor(Math.random() * 4);
    setCorrectCard(randomCard);
    setSelectedCard(null);
    setShowResult(false);
    setCurrentImage(IMAGES[Math.floor(Math.random() * IMAGES.length)]);
  }, []);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    initRound();
  };

  // Vibrate feedback
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Handle card selection
  const selectCard = (index: number) => {
    if (showResult) return;

    setSelectedCard(index);
    setShowResult(true);

    const isCorrect = index === correctCard;

    if (isCorrect) {
      vibrate([50, 30, 50]);
      setScore((s) => s + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      vibrate(200);
      setStreak(0);
    }

    // Next round after delay
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setGameState('result');
      } else {
        setRound((r) => r + 1);
        initRound();
      }
    }, isCorrect ? 1500 : 1000);
  };

  // Calculate results
  const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
  const rating =
    percentage >= 50
      ? '🌟 Super Intuitive!'
      : percentage >= 35
        ? '✨ Great Job!'
        : percentage >= 25
          ? '👍 Nice Try!'
          : '💪 Keep Practicing!';

  // Init round when playing starts
  useEffect(() => {
    if (gameState === 'playing' && round === 1) {
      initRound();
    }
  }, [gameState, round, initRound]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl safe-top"
        style={{ backgroundColor: `${primaryColor}F2` }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[18px] font-semibold text-white">Intuition</span>
          {gameState === 'playing' && (
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-[15px]">
                {round}/{TOTAL_ROUNDS}
              </span>
              {streak > 1 && <span className="text-yellow-400">🔥 {streak}</span>}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-28">
        {/* INTRO SCREEN */}
        {gameState === 'intro' && (
          <div className="text-center max-w-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🧠</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Intuition</h1>
            <p className="text-amber-200/70 mb-8">
              Can you sense which card hides the picture? Trust your feelings!
            </p>

            <div className="bg-white/10 rounded-2xl p-5 mb-8 text-left">
              <h3 className="text-white font-semibold mb-3">How to play:</h3>
              <ul className="text-amber-200/80 text-sm space-y-2">
                <li>• 4 colored cards, 1 hides a picture</li>
                <li>• Tap the card you feel is right</li>
                <li>• Get it right = you see the picture!</li>
                <li>• {TOTAL_ROUNDS} rounds - how many can you get?</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl text-white text-lg font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              Start Game
            </button>
          </div>
        )}

        {/* PLAYING SCREEN */}
        {gameState === 'playing' && (
          <div className="w-full max-w-sm">
            {/* Progress Bar */}
            <div className="h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
              />
            </div>

            {/* Score */}
            <div className="text-center mb-4">
              <span className="text-amber-300/80 text-lg">Score: </span>
              <span className="text-white text-3xl font-bold">{score}</span>
            </div>

            {/* Instruction */}
            <div className="text-center mb-6">
              <p className="text-amber-200/80 text-lg">
                {showResult
                  ? selectedCard === correctCard
                    ? '✨ You sensed it!'
                    : 'Not this time...'
                  : 'Which card hides the picture?'}
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {COLORS.map((color, index) => {
                const isTarget = index === correctCard;
                const isSelected = index === selectedCard;
                const showImage = showResult && isTarget;

                return (
                  <button
                    key={color.name}
                    onClick={() => selectCard(index)}
                    disabled={showResult}
                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      showResult && !isTarget ? 'opacity-40' : ''
                    } ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: color.bg }}
                  >
                    {showImage ? (
                      <div className="relative">
                        <span className="text-6xl">{currentImage}</span>
                        {isSelected && (
                          <span className="absolute -top-2 -right-2 text-2xl">✨</span>
                        )}
                      </div>
                    ) : showResult && isSelected && !isTarget ? (
                      <span className="text-5xl">✕</span>
                    ) : (
                      <span className="text-5xl text-white/30">?</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {gameState === 'result' && (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏆</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-2xl text-amber-200 mb-6">{rating}</p>

            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <div className="text-5xl font-bold text-white mb-2">
                {score}
                <span className="text-amber-300 text-2xl">/{TOTAL_ROUNDS}</span>
              </div>
              <div className="text-amber-200">{percentage}% accuracy</div>
              <div className="text-amber-300/60 text-sm mt-2">
                Chance level: 25%
              </div>
              {bestStreak > 1 && (
                <div className="text-yellow-400 mt-3">
                  Best streak: 🔥 {bestStreak}
                </div>
              )}
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl text-white text-lg font-semibold mb-3"
              style={{ backgroundColor: primaryColor }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
