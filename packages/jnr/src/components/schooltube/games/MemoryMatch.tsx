'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, SHAPES, SHAPE_PATHS, shuffleArray, getRandomInt, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Card = {
  id: number;
  shape: (typeof SHAPES)[number];
  color: string;
  flipped: boolean;
  matched: boolean;
};

const ROUND_CONFIGS = [
  { pairs: 4, label: 'Round 1 - 4 pairs' },
  { pairs: 5, label: 'Round 2 - 5 pairs' },
  { pairs: 6, label: 'Round 3 - 6 pairs' },
];

const EMOJI_BACKS = ['🌟', '🌈', '🎈', '🎯', '🦋', '🌺'];

export function MemoryMatchGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [canFlip, setCanFlip] = useState(true);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(4);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const generateGame = useCallback((roundIndex: number) => {
    const config = ROUND_CONFIGS[Math.min(roundIndex, ROUND_CONFIGS.length - 1)];
    const numPairs = config.pairs;
    setTotalPairs(numPairs);
    setMatchedPairs(0);
    setFlippedIds([]);
    setCanFlip(true);
    setMoves(0);

    const selectedShapes = shuffleArray([...SHAPES]).slice(0, numPairs);
    const pairs: Card[] = [];

    selectedShapes.forEach((shape, i) => {
      const color = GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]];
      pairs.push(
        { id: i * 2, shape, color, flipped: false, matched: false },
        { id: i * 2 + 1, shape, color, flipped: false, matched: false },
      );
    });

    setCards(shuffleArray(pairs));
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(0);
    setTotalScore(0);
    vibrate(20);
    addTimer(() => generateGame(0), 200);
  };

  const handleCardTap = (cardId: number) => {
    if (!canFlip) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    vibrate(20);
    const newFlipped = [...flippedIds, cardId];
    setFlippedIds(newFlipped);
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)));

    if (newFlipped.length === 2) {
      setCanFlip(false);
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId)!;
      const secondCard = cards.find((c) => c.id === secondId)!;

      if (firstCard.shape === secondCard.shape) {
        vibrate([50, 30, 50]);
        onScore();
        setTotalScore((s) => s + 1);
        const newMatched = matchedPairs + 1;
        setMatchedPairs(newMatched);

        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, matched: true, flipped: true } : c,
          ),
        );
        setFlippedIds([]);
        setCanFlip(true);

        if (newMatched >= totalPairs) {
          const nextRound = round + 1;
          if (nextRound >= ROUND_CONFIGS.length) {
            addTimer(() => {
              setPhase('celebrate');
              vibrate([100, 50, 100, 50, 200]);
              onComplete();
            }, 700);
          } else {
            addTimer(() => {
              setRound(nextRound);
              generateGame(nextRound);
            }, 900);
          }
        }
      } else {
        vibrate(100);
        addTimer(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c,
            ),
          );
          setFlippedIds([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotateY: [0, 180, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} className="text-7xl">🃏</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#95E1D3]">Memory Match!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Flip cards to find matching pairs! Remember where each shape is hiding!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 text-white text-2xl font-bold rounded-3xl shadow-xl" style={{ backgroundColor: '#95E1D3' }}>Flip Cards! 🔄</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-8xl">🧠</motion.div>
        <h2 className="text-3xl font-bold text-center" style={{ color: '#95E1D3' }}>Memory Master!</h2>
        <p className="text-xl text-center text-gray-700">You matched <span className="font-bold text-[#FF6B6B] text-2xl">{totalScore}</span> pairs across all rounds!</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: Math.min(totalScore, 15) }, (_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} className="text-2xl">{EMOJI_BACKS[i % EMOJI_BACKS.length]}</motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  const config = ROUND_CONFIGS[Math.min(round, ROUND_CONFIGS.length - 1)];
  const cols = totalPairs <= 4 ? 4 : totalPairs <= 5 ? 5 : 6;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-1">
          {ROUND_CONFIGS.map((_, i) => (
            <div key={i} className={`h-2 w-6 rounded-full transition-colors ${i <= round ? 'bg-[#95E1D3]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <div className="text-sm font-medium text-gray-500">{matchedPairs}/{totalPairs} pairs</div>
        <div className="text-sm font-medium text-gray-400">{moves} moves</div>
      </div>

      <p className="text-center text-sm font-semibold text-gray-500">{config.label}</p>

      <div className="flex-1 grid gap-2 p-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleCardTap(card.id)}
            className="aspect-square rounded-xl shadow-md overflow-hidden"
            style={{ perspective: 600 }}
          >
            <motion.div
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ backfaceVisibility: 'hidden', background: 'linear-gradient(135deg, #4ECDC4, #95E1D3)' }}>
                <span className="text-lg">🌟</span>
              </div>
              <div
                className={`absolute inset-0 rounded-xl flex items-center justify-center ${card.matched ? 'bg-green-50' : 'bg-white'}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', boxShadow: card.matched ? 'inset 0 0 0 2px #4ade80' : undefined }}
              >
                <svg width="70%" height="70%" viewBox="0 0 100 100">
                  <path d={SHAPE_PATHS[card.shape]} fill={card.color} />
                  {card.matched && <path d="M 35 50 L 45 62 L 65 38" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />}
                </svg>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {matchedPairs > 0 && matchedPairs >= totalPairs && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center text-2xl font-bold text-green-500">
            🎉 Round {round + 1} complete!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
