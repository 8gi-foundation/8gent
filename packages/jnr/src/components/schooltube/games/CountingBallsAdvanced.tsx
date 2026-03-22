'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, getRandomInt, shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

const EMOJIS = ['⭐', '🍎', '🐸', '🦋', '🌸', '🍭', '🚀', '💎'];

export function CountingBallsAdvancedGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [targetCount, setTargetCount] = useState(0);
  const [balls, setBalls] = useState<{ id: number; color: string; x: number; y: number; emoji: string }[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [tappedBalls, setTappedBalls] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const maxRounds = 5;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const generateRound = useCallback(() => {
    const count = getRandomInt(2, 9);
    setTargetCount(count);
    setTappedBalls([]);
    const emoji = EMOJIS[getRandomInt(0, EMOJIS.length - 1)];

    const newBalls = Array.from({ length: count }, (_, i) => ({
      id: i,
      color: GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]],
      x: getRandomInt(8, 72),
      y: getRandomInt(8, 62),
      emoji,
    }));
    setBalls(newBalls);

    const wrongAnswers = [count - 2, count - 1, count + 1, count + 2].filter((n) => n > 0 && n <= 10 && n !== count);
    const selectedWrong = shuffleArray(wrongAnswers).slice(0, 3);
    setOptions(shuffleArray([count, ...selectedWrong]));
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleBallTap = (ballId: number) => {
    if (tappedBalls.includes(ballId)) return;
    const newTapped = [...tappedBalls, ballId];
    setTappedBalls(newTapped);
    vibrate(30);
  };

  const handleAnswer = (answer: number) => {
    if (showFeedback) return;
    vibrate(20);

    if (answer === targetCount) {
      setShowFeedback('correct');
      vibrate([50, 30, 50]);
      onScore();
      setScore((s) => s + 1);

      addTimer(() => {
        setShowFeedback(null);
        if (round >= maxRounds) {
          setPhase('celebrate');
          vibrate([100, 50, 100, 50, 200]);
          onComplete();
        } else {
          setRound((r) => r + 1);
          generateRound();
        }
      }, 1000);
    } else {
      setShowFeedback('wrong');
      vibrate(200);
      addTimer(() => setShowFeedback(null), 800);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">🔢</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FF6B6B]">Counting Balls!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Tap each ball to count it, then pick the right number!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 bg-[#FF6B6B] text-white text-2xl font-bold rounded-3xl shadow-xl">Let's Count! 🎉</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-8xl">🏆</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FFE66D] drop-shadow-md">Amazing!</h2>
        <p className="text-xl text-center text-gray-700">You got <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> out of <span className="font-bold text-2xl">{maxRounds}</span> right!</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: score }, (_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="text-3xl">⭐</motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: maxRounds }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <p className="text-center text-base font-semibold text-gray-500">Round {round} of {maxRounds}</p>

      <div className="relative flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl min-h-[180px] overflow-hidden border-2 border-purple-100">
        <AnimatePresence>
          {balls.map((ball) => (
            <motion.button
              key={ball.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: ball.id * 0.05 }}
              whileTap={{ scale: 0.85 }}
              className="absolute w-14 h-14 rounded-full flex items-center justify-center cursor-pointer text-2xl shadow-lg"
              style={{
                backgroundColor: ball.color,
                left: `${ball.x}%`,
                top: `${ball.y}%`,
                border: tappedBalls.includes(ball.id) ? '3px solid white' : 'none',
                boxShadow: tappedBalls.includes(ball.id) ? '0 0 16px rgba(255,255,255,0.9)' : '0 4px 12px rgba(0,0,0,0.15)',
              }}
              onClick={() => handleBallTap(ball.id)}
            >
              {tappedBalls.includes(ball.id) ? (
                <span className="text-white font-bold text-lg drop-shadow-md">{tappedBalls.indexOf(ball.id) + 1}</span>
              ) : (
                ball.emoji
              )}
            </motion.button>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`absolute inset-0 flex items-center justify-center rounded-3xl ${showFeedback === 'correct' ? 'bg-green-400/40' : 'bg-red-400/40'}`}
            >
              <span className="text-7xl">{showFeedback === 'correct' ? '✅' : '❌'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tappedBalls.length > 0 && (
        <p className="text-center text-sm font-medium text-[#4ECDC4]">Counted: {tappedBalls.length} so far...</p>
      )}

      <div className="text-center">
        <p className="text-lg font-bold text-[#4ECDC4] mb-2">How many? Tap to count, then pick!</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {options.map((num) => (
            <motion.button key={num} whileTap={{ scale: 0.9 }} onClick={() => handleAnswer(num)} className="h-14 w-14 text-2xl font-bold rounded-2xl bg-[#FF6B6B] text-white shadow-lg">
              {num}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
