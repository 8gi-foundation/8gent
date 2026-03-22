'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, getRandomInt, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Bubble = {
  id: number;
  number: number;
  color: string;
  x: number;
  y: number;
  popped: boolean;
  size: number;
};

const MAX_NUMBER = 6;
const MAX_ROUNDS = 3;

export function BubblePopNumbersGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [nextTarget, setNextTarget] = useState(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [showWrong, setShowWrong] = useState(false);
  const [popEffect, setPopEffect] = useState<{ x: number; y: number; id: number } | null>(null);
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
    setNextTarget(1);
    const newBubbles: Bubble[] = Array.from({ length: MAX_NUMBER }, (_, i) => ({
      id: i,
      number: i + 1,
      color: GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]],
      x: getRandomInt(6, 76),
      y: getRandomInt(6, 66),
      popped: false,
      size: getRandomInt(60, 75),
    }));
    setBubbles(newBubbles);
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleBubbleTap = (bubble: Bubble, el: HTMLButtonElement | null) => {
    if (bubble.popped || !el) return;
    vibrate(20);

    if (bubble.number === nextTarget) {
      const rect = el.getBoundingClientRect();
      setPopEffect({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, id: Date.now() });
      addTimer(() => setPopEffect(null), 600);

      vibrate([50, 30, 50]);
      setBubbles((prev) => prev.map((b) => (b.id === bubble.id ? { ...b, popped: true } : b)));
      onScore();
      const newScore = score + 1;
      setScore(newScore);

      const next = nextTarget + 1;
      if (next <= MAX_NUMBER) {
        setNextTarget(next);
      } else {
        addTimer(() => {
          if (round >= MAX_ROUNDS) {
            setPhase('celebrate');
            vibrate([100, 50, 100, 50, 200]);
            onComplete();
          } else {
            setRound((r) => r + 1);
            generateRound();
          }
        }, 600);
      }
    } else {
      setShowWrong(true);
      vibrate(200);
      addTimer(() => setShowWrong(false), 600);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-6 p-4"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-7xl"
        >
          🫧
        </motion.div>
        <h2 className="text-3xl font-bold text-center text-[#4ECDC4]">Bubble Pop!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">
          Pop the bubbles in order from 1 to {MAX_NUMBER}. Find the right number each time!
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="px-10 py-5 bg-[#4ECDC4] text-white text-2xl font-bold rounded-3xl shadow-xl"
        >
          Pop! 💥
        </motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-6 p-4"
      >
        <motion.div
          animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-8xl"
        >
          🌟
        </motion.div>
        <h2 className="text-3xl font-bold text-center text-[#4ECDC4]">You did it!</h2>
        <p className="text-xl text-center text-gray-700">
          Popped <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> bubbles perfectly!
        </p>
        <div className="flex gap-1 flex-wrap justify-center">
          {Array.from({ length: Math.min(score, 18) }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="text-2xl"
            >
              🫧
            </motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#4ECDC4]' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-base font-medium text-gray-500">Pop the bubbles in order!</p>
        <div className="flex items-center justify-center gap-3 mt-1">
          <span className="text-lg font-medium text-gray-500">Find:</span>
          <motion.div
            key={nextTarget}
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-14 h-14 rounded-full bg-[#FF6B6B] flex items-center justify-center shadow-lg"
          >
            <span className="text-2xl font-bold text-white">{nextTarget}</span>
          </motion.div>
        </div>
      </div>

      <div className="relative flex-1 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-3xl overflow-hidden border-2 border-cyan-200 min-h-[200px]">
        <AnimatePresence>
          {bubbles.map(
            (bubble) =>
              !bubble.popped && (
                <motion.button
                  key={bubble.id}
                  initial={{ scale: 0, y: 60 }}
                  animate={{
                    scale: 1,
                    y: [0, -8, 0],
                  }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{
                    y: { repeat: Infinity, duration: 2 + bubble.id * 0.25, ease: 'easeInOut' },
                    scale: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.7 }}
                  onClick={(e) => handleBubbleTap(bubble, e.currentTarget as HTMLButtonElement)}
                  className="absolute rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: bubble.size,
                    height: bubble.size,
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, ${bubble.color} 40%, ${bubble.color}cc 100%)`,
                    boxShadow: `0 4px 15px ${bubble.color}66, inset 0 -4px 12px rgba(0,0,0,0.1)`,
                  }}
                >
                  <span className="text-xl font-bold text-white drop-shadow-md">{bubble.number}</span>
                </motion.button>
              ),
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showWrong && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-red-400/20 rounded-3xl pointer-events-none"
            >
              <span className="text-5xl">🙅</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {popEffect && (
            <motion.div
              key={popEffect.id}
              initial={{ opacity: 1, scale: 0 }}
              animate={{ opacity: 0, scale: 3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed w-16 h-16 rounded-full bg-yellow-300 pointer-events-none"
              style={{
                left: popEffect.x - 32,
                top: popEffect.y - 32,
                zIndex: 50,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
