'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, SHAPES, SHAPE_PATHS, shuffleArray, getRandomInt, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type PatternItem = {
  shape: (typeof SHAPES)[number];
  color: string;
};

const MAX_ROUNDS = 5;

export function PatternCompleteGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [pattern, setPattern] = useState<PatternItem[]>([]);
  const [missingIndices, setMissingIndices] = useState<number[]>([]);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [answeredSlots, setAnsweredSlots] = useState<Record<number, PatternItem>>({});
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
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
    setAnsweredSlots({});
    setShowFeedback(null);

    const patternLen = round <= 2 ? 2 : getRandomInt(2, 3);
    const shapes = shuffleArray([...SHAPES]).slice(0, patternLen);
    const colors = shuffleArray([...COLOR_NAMES]).slice(0, patternLen);

    const basePattern: PatternItem[] = shapes.map((shape, i) => ({
      shape,
      color: GAME_COLORS[colors[i]],
    }));

    const totalSlots = 6;
    const fullPattern: PatternItem[] = [];
    for (let i = 0; i < totalSlots; i++) {
      fullPattern.push(basePattern[i % patternLen]);
    }

    const candidateSlots = [2, 3, 4, 5];
    const numMissing = round >= 3 ? 2 : 1;
    const missing = shuffleArray(candidateSlots).slice(0, numMissing).sort((a, b) => a - b);

    setPattern(fullPattern);
    setMissingIndices(missing);

    const correctItems = missing.map((i) => fullPattern[i]);
    const decoyPool = SHAPES.filter((s) => !correctItems.map((c) => c.shape).includes(s));
    const decoys = shuffleArray([...decoyPool])
      .slice(0, Math.max(2, 4 - correctItems.length))
      .map((s) => ({
        shape: s,
        color: GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]],
      }));

    const allOpts = [...correctItems, ...decoys];
    const seen = new Set<string>();
    const deduped = allOpts.filter((o) => {
      if (seen.has(o.shape)) return false;
      seen.add(o.shape);
      return true;
    });
    setOptions(shuffleArray(deduped).slice(0, 4));
  }, [round]);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleOptionSelect = (option: PatternItem) => {
    if (showFeedback === 'correct') return;

    const nextSlot = missingIndices.find((i) => !answeredSlots[i]);
    if (nextSlot === undefined) return;

    const correct = pattern[nextSlot];
    vibrate(20);

    if (option.shape === correct.shape) {
      vibrate([50, 30, 50]);
      const newAnswered = { ...answeredSlots, [nextSlot]: option };
      setAnsweredSlots(newAnswered);

      const allFilled = missingIndices.every((i) => newAnswered[i] !== undefined);
      if (allFilled) {
        setShowFeedback('correct');
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
      }
    } else {
      vibrate(200);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">🔁</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#DDA0DD]">Pattern Power!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Look at the repeating pattern and figure out what's missing!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 text-white text-2xl font-bold rounded-3xl shadow-xl" style={{ backgroundColor: '#DDA0DD' }}>Find Patterns! 🔍</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-8xl">✨</motion.div>
        <h2 className="text-3xl font-bold text-center" style={{ color: '#DDA0DD' }}>Pattern Pro!</h2>
        <p className="text-xl text-center text-gray-700">Completed <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> patterns!</p>
      </motion.div>
    );
  }

  const nextUnfilled = missingIndices.find((i) => !answeredSlots[i]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#DDA0DD]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <p className="text-center text-lg font-bold text-[#4ECDC4]">What comes next in the pattern?</p>

      <div className="flex gap-2 justify-center flex-wrap p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-100">
        {pattern.map((item, index) => {
          const isMissing = missingIndices.includes(index);
          const isNextToFill = index === nextUnfilled;
          const answered = answeredSlots[index];

          return (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.06 }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isMissing
                  ? isNextToFill
                    ? 'bg-white border-4 border-dashed border-[#DDA0DD] shadow-inner'
                    : answered
                    ? 'bg-white shadow-md'
                    : 'bg-white border-2 border-gray-200'
                  : 'bg-white shadow-sm'
              }`}
            >
              {isMissing ? (
                answered ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <svg width="32" height="32" viewBox="0 0 100 100">
                      <path d={SHAPE_PATHS[answered.shape]} fill={answered.color} />
                    </svg>
                  </motion.div>
                ) : isNextToFill ? (
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="text-xl" style={{ color: '#DDA0DD' }}>?</motion.span>
                ) : (
                  <span className="text-lg text-gray-300">?</span>
                )
              ) : (
                <svg width="32" height="32" viewBox="0 0 100 100">
                  <path d={SHAPE_PATHS[item.shape]} fill={item.color} />
                </svg>
              )}
            </motion.div>
          );
        })}
      </div>

      {nextUnfilled !== undefined && (
        <p className="text-center text-sm text-gray-500">
          Fill slot #{missingIndices.indexOf(nextUnfilled) + 1} of {missingIndices.length}
        </p>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        <AnimatePresence>
          {options.map((item, index) => (
            <motion.button
              key={`${item.shape}-${index}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0 }}
              transition={{ delay: index * 0.08 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleOptionSelect(item)}
              disabled={showFeedback === 'correct'}
              className="rounded-2xl bg-white shadow-lg flex items-center justify-center border-2 border-transparent hover:border-purple-200 transition-colors"
              style={{ width: 72, height: 72 }}
            >
              <svg width="48" height="48" viewBox="0 0 100 100">
                <path d={SHAPE_PATHS[item.shape]} fill={item.color} />
              </svg>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`text-center text-xl font-bold ${showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
            {showFeedback === 'correct' ? '🎉 Pattern complete!' : 'Try again!'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
