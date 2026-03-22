'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Orb = {
  id: number;
  color: keyof typeof GAME_COLORS;
  placed: boolean;
};

type Bucket = {
  color: keyof typeof GAME_COLORS;
  orbIds: number[];
};

const TARGET_COLORS_PER_ROUND = 2;
const ORBS_PER_COLOR = 3;
const MAX_ROUNDS = 4;

export function ColorSortGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedOrbId, setSelectedOrbId] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [wrongBucket, setWrongBucket] = useState<keyof typeof GAME_COLORS | null>(null);
  const [correctBucket, setCorrectBucket] = useState<keyof typeof GAME_COLORS | null>(null);
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
    setSelectedOrbId(null);
    setWrongBucket(null);

    const pickedColors = shuffleArray([...COLOR_NAMES]).slice(0, TARGET_COLORS_PER_ROUND);
    const newOrbs: Orb[] = [];
    let idCounter = 0;
    pickedColors.forEach((color) => {
      for (let i = 0; i < ORBS_PER_COLOR; i++) {
        newOrbs.push({ id: idCounter++, color, placed: false });
      }
    });
    setOrbs(shuffleArray(newOrbs));
    setBuckets(pickedColors.map((c) => ({ color: c, orbIds: [] })));
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleOrbTap = (orb: Orb) => {
    if (orb.placed) return;
    if (selectedOrbId === orb.id) {
      setSelectedOrbId(null);
      return;
    }
    setSelectedOrbId(orb.id);
    vibrate(20);
  };

  const handleBucketTap = (bucket: Bucket) => {
    if (selectedOrbId === null) return;

    const orb = orbs.find((o) => o.id === selectedOrbId);
    if (!orb) return;

    if (orb.color === bucket.color) {
      vibrate([50, 30, 50]);
      setCorrectBucket(bucket.color);
      addTimer(() => setCorrectBucket(null), 500);

      const newOrbs = orbs.map((o) => (o.id === selectedOrbId ? { ...o, placed: true } : o));
      setOrbs(newOrbs);
      const newBuckets = buckets.map((b) =>
        b.color === bucket.color ? { ...b, orbIds: [...b.orbIds, selectedOrbId] } : b,
      );
      setBuckets(newBuckets);
      setSelectedOrbId(null);
      onScore();
      setScore((s) => s + 1);

      const remaining = newOrbs.filter((o) => !o.placed).length;
      if (remaining === 0) {
        addTimer(() => {
          if (round >= MAX_ROUNDS) {
            setPhase('celebrate');
            vibrate([100, 50, 100, 50, 200]);
            onComplete();
          } else {
            setRound((r) => r + 1);
            generateRound();
          }
        }, 700);
      }
    } else {
      setWrongBucket(bucket.color);
      vibrate(200);
      addTimer(() => setWrongBucket(null), 700);
    }
  };

  const selectedOrb = orbs.find((o) => o.id === selectedOrbId);

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-7xl">🎨</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FFE66D]" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Color Sort!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Tap an orb, then tap its matching color bucket to sort them!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 bg-[#FFE66D] text-gray-800 text-2xl font-bold rounded-3xl shadow-xl">Sort! 🪣</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-8xl">🌈</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FFE66D]">Color Master!</h2>
        <p className="text-xl text-center text-gray-700">Sorted <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> orbs into the right buckets!</p>
      </motion.div>
    );
  }

  const totalOrbs = orbs.length;
  const placedOrbs = orbs.filter((o) => o.placed).length;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#FFE66D]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-gray-500">Sorted: {placedOrbs} / {totalOrbs}</p>
        {selectedOrb && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-md">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: GAME_COLORS[selectedOrb.color] }} />
            <span className="text-sm font-semibold text-gray-600">selected!</span>
          </motion.div>
        )}
      </div>

      <div className="flex gap-4 justify-center">
        {buckets.map((bucket) => (
          <motion.button
            key={bucket.color}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleBucketTap(bucket)}
            animate={
              wrongBucket === bucket.color ? { x: [-6, 6, -6, 6, 0] }
              : correctBucket === bucket.color ? { scale: [1, 1.12, 1] }
              : {}
            }
            transition={{ duration: 0.3 }}
            className="flex-1 max-w-[120px] min-h-[80px] rounded-b-3xl rounded-t-lg border-4 flex flex-col items-center justify-end p-2 shadow-lg relative"
            style={{ borderColor: GAME_COLORS[bucket.color], backgroundColor: `${GAME_COLORS[bucket.color]}22` }}
          >
            <div className="flex flex-wrap gap-1 justify-center">
              {bucket.orbIds.map((id) => (
                <motion.div key={id} initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} className="w-5 h-5 rounded-full" style={{ backgroundColor: GAME_COLORS[bucket.color] }} />
              ))}
            </div>
            <span className="text-xs font-bold mt-1 capitalize" style={{ color: GAME_COLORS[bucket.color] }}>{bucket.color}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-3 overflow-hidden border-2 border-gray-100">
        <p className="text-center text-sm font-medium text-gray-400 mb-2">Tap an orb, then tap its bucket!</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <AnimatePresence>
            {orbs.filter((o) => !o.placed).map((orb) => (
              <motion.button
                key={orb.id}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: selectedOrbId === orb.id ? 1.2 : 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleOrbTap(orb)}
                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
                style={{
                  backgroundColor: GAME_COLORS[orb.color],
                  border: selectedOrbId === orb.id ? '3px solid white' : '3px solid transparent',
                  boxShadow: selectedOrbId === orb.id ? `0 0 20px ${GAME_COLORS[orb.color]}, 0 4px 12px rgba(0,0,0,0.2)` : '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {selectedOrbId === orb.id && <span className="text-white text-xl">✓</span>}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
