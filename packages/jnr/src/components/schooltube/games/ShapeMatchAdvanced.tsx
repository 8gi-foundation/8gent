'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, SHAPES, SHAPE_PATHS, shuffleArray, getRandomInt, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type ShapeItem = {
  shape: (typeof SHAPES)[number];
  color: string;
};

const SHAPE_EMOJIS: Record<string, string> = {
  circle: '⭕', square: '🟦', triangle: '🔺', star: '⭐', heart: '❤️', diamond: '💎',
};

const MAX_ROUNDS = 6;

export function ShapeMatchAdvancedGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [targetShape, setTargetShape] = useState<ShapeItem | null>(null);
  const [options, setOptions] = useState<ShapeItem[]>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
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
    const shape = SHAPES[getRandomInt(0, SHAPES.length - 1)];
    const color = GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]];
    setTargetShape({ shape, color });
    setSelectedIndex(null);
    setShowFeedback(null);

    const wrongShapes = SHAPES.filter((s) => s !== shape);
    const wrongOptions = shuffleArray([...wrongShapes])
      .slice(0, 3)
      .map((s) => ({ shape: s, color: GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]] }));

    setOptions(shuffleArray([{ shape, color }, ...wrongOptions]));
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleSelect = (index: number, item: ShapeItem) => {
    if (showFeedback) return;
    setSelectedIndex(index);
    vibrate(20);

    if (item.shape === targetShape?.shape) {
      setShowFeedback('correct');
      vibrate([50, 30, 50]);
      onScore();
      setScore((s) => s + 1);

      addTimer(() => {
        setShowFeedback(null);
        if (round >= MAX_ROUNDS) {
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
      addTimer(() => { setShowFeedback(null); setSelectedIndex(null); }, 900);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">🔷</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FF6B6B]">Shape Match!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Look at the shape, then find the same shape in the grid!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 bg-[#FF6B6B] text-white text-2xl font-bold rounded-3xl shadow-xl">Match Shapes! 🎯</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-8xl">🏆</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FF6B6B]">Shape Expert!</h2>
        <p className="text-xl text-center text-gray-700">
          Matched <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> of <span className="font-bold text-2xl">{MAX_ROUNDS}</span> shapes!
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          {SHAPES.slice(0, score).map((s, i) => (
            <motion.span key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.1 }} className="text-3xl">{SHAPE_EMOJIS[s]}</motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#FF6B6B]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-lg font-bold text-[#4ECDC4] mb-2">Find the <span className="text-[#FF6B6B] capitalize">{targetShape?.shape}</span>!</p>
        {targetShape && (
          <div className="flex items-center justify-center gap-4">
            <motion.div key={`target-${round}`} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="bg-white rounded-2xl p-2 shadow-lg inline-block">
              <svg width="90" height="90" viewBox="0 0 100 100">
                <path d={SHAPE_PATHS[targetShape.shape]} fill={targetShape.color} stroke="white" strokeWidth="3" />
              </svg>
            </motion.div>
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-3xl">👉</motion.span>
            <div className="w-10 h-10 rounded-xl border-4 border-dashed border-[#4ECDC4] flex items-center justify-center">
              <span className="text-xl text-[#4ECDC4]">?</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        <AnimatePresence>
          {options.map((item, index) => (
            <motion.button
              key={`${item.shape}-${index}-${round}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.08, type: 'spring' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect(index, item)}
              disabled={showFeedback === 'correct'}
              className={`rounded-3xl flex items-center justify-center shadow-lg transition-all min-h-[100px] ${
                selectedIndex === index
                  ? showFeedback === 'correct' ? 'ring-4 ring-green-500 bg-green-50 scale-105'
                  : showFeedback === 'wrong' ? 'ring-4 ring-red-400 bg-red-50'
                  : 'bg-white'
                  : 'bg-white hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <svg width="72" height="72" viewBox="0 0 100 100">
                <path d={SHAPE_PATHS[item.shape]} fill={item.color} stroke="white" strokeWidth="2" />
              </svg>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`text-center text-lg font-bold ${showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
            {showFeedback === 'correct' ? '🎉 Great match!' : `Try again! Find the ${targetShape?.shape}!`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
