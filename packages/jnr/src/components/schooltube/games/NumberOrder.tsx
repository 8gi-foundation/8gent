'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { shuffleArray, getRandomInt, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

const CARD_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD'];
const MAX_ROUNDS = 4;

export function NumberOrderGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [ascending, setAscending] = useState(true);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [cardColors] = useState(() => shuffleArray(CARD_COLORS));
  const [checked, setChecked] = useState(false);
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
    const isAsc = Math.random() > 0.5;
    setAscending(isAsc);
    setChecked(false);
    setShowFeedback(null);

    const start = getRandomInt(1, 6);
    const correct = [start, start + 1, start + 2, start + 3];
    setNumbers(shuffleArray([...correct]));
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleReorder = (newOrder: number[]) => {
    setNumbers(newOrder);
    setShowFeedback(null);
    setChecked(false);
    vibrate(20);
  };

  const isCurrentlyCorrect = () => {
    if (ascending) {
      return numbers.every((num, i) => i === 0 || num > numbers[i - 1]);
    } else {
      return numbers.every((num, i) => i === 0 || num < numbers[i - 1]);
    }
  };

  const checkAnswer = () => {
    if (checked) return;
    setChecked(true);
    vibrate(20);

    if (isCurrentlyCorrect()) {
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
      }, 1100);
    } else {
      setShowFeedback('wrong');
      vibrate(200);
      addTimer(() => { setShowFeedback(null); setChecked(false); }, 1000);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">🔢</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FFE66D]">Number Order!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Drag the number cards to put them in the right order!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 bg-[#FFE66D] text-gray-800 text-2xl font-bold rounded-3xl shadow-xl">Order Up! 📶</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-8xl">🥇</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FFE66D]">Number Ninja!</h2>
        <p className="text-xl text-center text-gray-700">
          Ordered <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> of <span className="font-bold text-2xl">{MAX_ROUNDS}</span> sequences correctly!
        </p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((n, i) => (
            <motion.div key={n} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ backgroundColor: CARD_COLORS[i] }}>
              {n}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#FFE66D]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="text-center">
        <motion.div key={ascending ? 'asc' : 'desc'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md">
          <span className="text-xl">{ascending ? '⬆️' : '⬇️'}</span>
          <span className="text-lg font-bold text-gray-700">{ascending ? 'Smallest to Biggest' : 'Biggest to Smallest'}</span>
        </motion.div>
        <p className="text-sm text-gray-400 mt-1">Drag the cards to reorder them</p>
      </div>

      <div className="flex justify-between px-4 text-sm text-gray-400 font-medium">
        <span>{ascending ? 'smallest' : 'biggest'} →</span>
        <span>→ {ascending ? 'biggest' : 'smallest'}</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Reorder.Group axis="x" values={numbers} onReorder={handleReorder} className="flex gap-3 items-center justify-center flex-wrap">
          {numbers.map((num, idx) => (
            <Reorder.Item key={num} value={num} className="cursor-grab active:cursor-grabbing select-none" whileDrag={{ scale: 1.15, zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
              <motion.div
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg"
                style={{ backgroundColor: cardColors[idx % cardColors.length] }}
                animate={
                  showFeedback === 'correct' ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                  : showFeedback === 'wrong' ? { x: [-4, 4, -4, 4, 0] }
                  : {}
                }
                transition={{ duration: 0.4 }}
              >
                <span className="text-4xl font-bold text-white drop-shadow-md">{num}</span>
                <span className="text-white/60 text-xs mt-0.5">drag me</span>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`text-center text-lg font-bold ${showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
            {showFeedback === 'correct' ? '🎉 Perfect order!' : 'Not quite! Try again!'}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.95 }} onClick={checkAnswer} disabled={checked && showFeedback !== null} className="mx-auto px-10 py-4 bg-[#4ECDC4] text-white text-xl font-bold rounded-2xl shadow-lg disabled:opacity-60">
        Check! ✓
      </motion.button>
    </div>
  );
}
