'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Ball = {
  id: number;
  color: string;
  bottleIndex: number;
};

type Bottle = {
  color: string;
  label: string;
  balls: Ball[];
  targetCount: number;
};

const BOTTLE_CONFIGS = [
  { color: '#FF6B6B', label: 'Red' },
  { color: '#4ECDC4', label: 'Teal' },
  { color: '#FFE66D', label: 'Yellow' },
];

const TARGET = 7;

export function BottleFillGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [bottles, setBottles] = useState<Bottle[]>(() =>
    BOTTLE_CONFIGS.map(({ color, label }) => ({
      color,
      label,
      balls: [],
      targetCount: TARGET,
    })),
  );
  const [selectedColor, setSelectedColor] = useState<string>(BOTTLE_CONFIGS[0].color);
  const [fallingBalls, setFallingBalls] = useState<{ id: number; color: string; x: number }[]>([]);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const ballIdRef = useRef(0);
  const completedRef = useRef(false);

  const totalBalls = bottles.reduce((sum, b) => sum + b.balls.length, 0);
  const totalTarget = bottles.reduce((sum, b) => sum + b.targetCount, 0);
  const progress = Math.min((totalBalls / totalTarget) * 100, 100);

  const handleBottleTap = useCallback(
    (bottleIndex: number) => {
      if (!started || completedRef.current) return;

      const bottle = bottles[bottleIndex];
      if (bottle.balls.length >= bottle.targetCount) return;

      const isCorrect = selectedColor === bottle.color;

      if (!isCorrect) {
        vibrate(100);
        setWrongFlash(bottleIndex);
        setTimeout(() => setWrongFlash(null), 400);
        return;
      }

      const positions = [20, 50, 80];
      const ballId = ballIdRef.current++;
      setFallingBalls((prev) => [
        ...prev,
        { id: ballId, color: selectedColor, x: positions[bottleIndex] },
      ]);

      setTimeout(() => {
        setBottles((prev) => {
          const next = [...prev];
          const newBall: Ball = { id: ballId, color: selectedColor, bottleIndex };
          next[bottleIndex] = {
            ...next[bottleIndex],
            balls: [...next[bottleIndex].balls, newBall],
          };

          vibrate(30);
          onScore();

          const allFilled = next.every((b) => b.balls.length >= b.targetCount);
          if (allFilled && !completedRef.current) {
            completedRef.current = true;
            vibrate([100, 50, 100, 50, 200]);
            setTimeout(onComplete, 500);
          }

          return next;
        });
        setFallingBalls((prev) => prev.filter((b) => b.id !== ballId));
      }, 550);
    },
    [started, bottles, selectedColor, onScore, onComplete],
  );

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mx-1">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 to-orange-500 rounded-full"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-center" role="status" aria-live="polite">
        <div className="bg-teal-50 rounded-full px-4 py-1.5 shadow">
          <span className="text-lg font-bold text-teal-600">
            {totalBalls}/{totalTarget} balls
          </span>
        </div>
      </div>

      {/* Color selector */}
      <div className="flex justify-center gap-4" role="radiogroup" aria-label="Ball color selector">
        {BOTTLE_CONFIGS.map(({ color, label }) => (
          <motion.button
            key={color}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedColor(color)}
            className="flex flex-col items-center gap-1 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-full"
            role="radio"
            aria-checked={selectedColor === color}
            aria-label={label}
          >
            <motion.div
              animate={selectedColor === color ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ repeat: selectedColor === color ? Infinity : 0, duration: 1 }}
              className="w-14 h-14 rounded-full shadow-xl"
              style={{
                backgroundColor: color,
                border: selectedColor === color ? '4px solid white' : '4px solid transparent',
                boxShadow:
                  selectedColor === color
                    ? `0 0 20px ${color}88, 0 4px 15px rgba(0,0,0,0.3)`
                    : '0 4px 15px rgba(0,0,0,0.2)',
              }}
            />
            <span className="text-xs font-bold text-gray-500">{label}</span>
          </motion.button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400">
        Select a color, then tap the matching bottle!
      </p>

      {/* Bottles area */}
      <div className="flex-1 relative flex items-end justify-around px-4 pb-6">
        <AnimatePresence>
          {fallingBalls.map((ball) => (
            <motion.div
              key={ball.id}
              initial={{ top: 20, opacity: 0, scale: 0 }}
              animate={{ top: '55%', opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeIn' }}
              className="absolute w-7 h-7 rounded-full z-20 pointer-events-none"
              style={{
                backgroundColor: ball.color,
                left: `${ball.x}%`,
                transform: 'translateX(-50%)',
                boxShadow: `inset 0 -2px 5px rgba(0,0,0,0.25), inset 0 2px 5px rgba(255,255,255,0.4), 0 2px 8px ${ball.color}55`,
              }}
            />
          ))}
        </AnimatePresence>

        {bottles.map((bottle, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleBottleTap(index)}
            className="relative w-24 h-52 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-xl"
            animate={wrongFlash === index ? { x: [-5, 5, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
            aria-label={`${bottle.label} bottle, ${bottle.balls.length}/${bottle.targetCount} balls`}
          >
            <svg viewBox="0 0 80 200" className="w-full h-full absolute inset-0" aria-hidden="true">
              <rect x="28" y="0" width="24" height="35" fill={bottle.color} opacity="0.25" rx="5" />
              <rect x="24" y="-5" width="32" height="12" fill={bottle.color} opacity="0.5" rx="6" />
              <path
                d="M 14 45 Q 8 55 8 65 L 8 175 Q 8 192 24 192 L 56 192 Q 72 192 72 175 L 72 65 Q 72 55 66 45 L 52 35 L 28 35 Z"
                fill={bottle.color}
                opacity={wrongFlash === index ? 0.5 : 0.15}
                stroke={bottle.color}
                strokeWidth="3"
              />
              <path
                d="M 18 55 L 18 170 Q 18 180 24 185"
                fill="none"
                stroke="white"
                strokeWidth="3"
                opacity="0.5"
              />
            </svg>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-0.5 z-10">
              {bottle.balls.map((ball, ballIndex) => (
                <motion.div
                  key={ball.id}
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="w-6 h-6 rounded-full"
                  style={{
                    backgroundColor: ball.color,
                    marginLeft: ballIndex % 2 === 0 ? -5 : 5,
                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>

            <div
              className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
              style={{ color: bottle.color }}
            >
              {bottle.balls.length}/{bottle.targetCount}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-teal-50/90 backdrop-blur-sm rounded-2xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center mx-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-6xl mb-4"
                aria-hidden="true"
              >
                🍶
              </motion.div>
              <p className="text-2xl font-bold text-teal-600 mb-2">Bottle Fill!</p>
              <p className="text-teal-400 mb-1">Pick a color.</p>
              <p className="text-teal-400 mb-5">Fill the matching bottle!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStarted(true);
                  vibrate(50);
                }}
                className="bg-gradient-to-r from-teal-400 to-orange-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Let's Fill!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
