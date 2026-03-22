'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type SizeItem = {
  id: number;
  size: number;
  color: string;
  label: string;
};

const SIZE_LABELS = ['tiny', 'small', 'medium', 'large'];
const MAX_ROUNDS = 4;

export function SizeSortGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [items, setItems] = useState<SizeItem[]>([]);
  const [ascending, setAscending] = useState(true);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [useAnimals, setUseAnimals] = useState(false);
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
    const animals = Math.random() > 0.5;
    setAscending(isAsc);
    setUseAnimals(animals);
    setChecked(false);
    setShowFeedback(null);

    const baseColors = shuffleArray([...COLOR_NAMES]).slice(0, 4);
    const sizes = [32, 48, 64, 80];
    const newItems: SizeItem[] = sizes.map((size, i) => ({
      id: i,
      size,
      color: GAME_COLORS[baseColors[i]],
      label: SIZE_LABELS[i],
    }));
    setItems(shuffleArray(newItems));
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleReorder = (newOrder: SizeItem[]) => {
    setItems(newOrder);
    setChecked(false);
    setShowFeedback(null);
    vibrate(20);
  };

  const isCorrect = () => {
    const sizes = items.map((i) => i.size);
    return ascending
      ? sizes.every((s, i) => i === 0 || s > sizes[i - 1])
      : sizes.every((s, i) => i === 0 || s < sizes[i - 1]);
  };

  const checkAnswer = () => {
    if (checked) return;
    setChecked(true);
    vibrate(20);

    if (isCorrect()) {
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
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl">🐛 🐕 🦁 🐘</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FFB347]">Size Sort!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Drag the shapes to sort them by size. Smallest to biggest, or biggest to smallest!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 text-white text-2xl font-bold rounded-3xl shadow-xl" style={{ backgroundColor: '#FFB347' }}>Sort Sizes! 📏</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ scale: [1, 1.2, 1], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-8xl">📏</motion.div>
        <h2 className="text-3xl font-bold text-center" style={{ color: '#FFB347' }}>Size Expert!</h2>
        <p className="text-xl text-center text-gray-700">Sorted <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> of {MAX_ROUNDS} correctly!</p>
        <div className="flex items-end gap-2 justify-center">
          {[32, 48, 64, 80].map((size, i) => (
            <motion.div key={size} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-2xl shadow-lg" style={{ width: size * 0.6, height: size * 0.6, backgroundColor: GAME_COLORS[COLOR_NAMES[i]] }} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#FFB347]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="text-center">
        <motion.div key={ascending ? 'asc' : 'desc'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-3 bg-white rounded-2xl px-5 py-2 shadow-md">
          {ascending ? (
            <><span className="text-2xl">🐛</span><span className="text-base font-bold text-gray-600">→ smallest to biggest →</span><span className="text-2xl">🐘</span></>
          ) : (
            <><span className="text-2xl">🐘</span><span className="text-base font-bold text-gray-600">→ biggest to smallest →</span><span className="text-2xl">🐛</span></>
          )}
        </motion.div>
        <p className="text-sm text-gray-400 mt-1">Drag the shapes to order them</p>
      </div>

      <div className="flex-1 flex items-end justify-center pb-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl border-2 border-orange-100 p-4">
        <Reorder.Group axis="x" values={items} onReorder={handleReorder} className="flex gap-4 items-end justify-center w-full">
          {items.map((item) => (
            <Reorder.Item key={item.id} value={item} className="cursor-grab active:cursor-grabbing select-none" whileDrag={{ scale: 1.12, zIndex: 10 }}>
              <motion.div
                className="rounded-2xl shadow-lg flex flex-col items-center justify-end pb-2 gap-1"
                style={{ width: item.size, height: item.size, backgroundColor: item.color }}
                animate={
                  showFeedback === 'correct' ? { y: [0, -8, 0], scale: [1, 1.08, 1] }
                  : showFeedback === 'wrong' ? { x: [-4, 4, -4, 4, 0] }
                  : {}
                }
                transition={{ duration: 0.4 }}
              >
                {useAnimals && item.size === 32 && <span className="text-sm">🐛</span>}
                {useAnimals && item.size === 48 && <span className="text-base">🐕</span>}
                {useAnimals && item.size === 64 && <span className="text-lg">🦁</span>}
                {useAnimals && item.size === 80 && <span className="text-xl">🐘</span>}
              </motion.div>
              <p className="text-center text-xs text-gray-400 mt-1 capitalize">{item.label}</p>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`text-center text-lg font-bold ${showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
            {showFeedback === 'correct' ? '🎉 Perfect sorting!' : 'Look at the sizes carefully!'}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.95 }} onClick={checkAnswer} disabled={checked && showFeedback !== null} className="mx-auto px-10 py-4 text-white text-xl font-bold rounded-2xl shadow-lg disabled:opacity-60" style={{ backgroundColor: '#FFB347' }}>
        Check Order! ✓
      </motion.button>
    </div>
  );
}
