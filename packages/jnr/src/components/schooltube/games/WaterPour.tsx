'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Glass = {
  id: number;
  color: string;
  colorName: string;
  level: number;
  targetLevel: number;
};

const GLASS_CONFIGS = [
  { color: '#FF6B6B', colorName: 'Red', target: 75 },
  { color: '#4ECDC4', colorName: 'Teal', target: 55 },
  { color: '#FFE66D', colorName: 'Yellow', target: 40 },
];

const LEVEL_THRESHOLD = 8;

export function WaterPourGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [glasses, setGlasses] = useState<Glass[]>(() =>
    GLASS_CONFIGS.map(({ color, colorName, target }, i) => ({
      id: i,
      color,
      colorName,
      level: 0,
      targetLevel: target,
    })),
  );
  const [isPouring, setIsPouring] = useState<number | null>(null);
  const pourIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const glassesRef = useRef(glasses);

  useEffect(() => {
    glassesRef.current = glasses;
  }, [glasses]);

  useEffect(() => {
    return () => {
      if (pourIntervalRef.current) clearInterval(pourIntervalRef.current);
    };
  }, []);

  const stopPour = useCallback(() => {
    if (pourIntervalRef.current) {
      clearInterval(pourIntervalRef.current);
      pourIntervalRef.current = null;
    }
    setIsPouring(null);
  }, []);

  const startPour = useCallback(
    (glassId: number) => {
      if (!started || completedRef.current) return;
      if (isPouring === glassId) return;

      const glass = glassesRef.current.find((g) => g.id === glassId);
      if (!glass || glass.level >= 100) return;

      setIsPouring(glassId);

      pourIntervalRef.current = setInterval(() => {
        setGlasses((prev) => {
          const next = prev.map((g) => {
            if (g.id !== glassId || g.level >= 100) return g;
            const newLevel = Math.min(g.level + 1.5, 100);

            const prevTen = Math.floor(g.level / 10);
            const nextTen = Math.floor(newLevel / 10);
            if (nextTen > prevTen) {
              vibrate(20);
              onScore();
            }

            return { ...g, level: newLevel };
          });

          const allDone = next.every(
            (g) => Math.abs(g.level - g.targetLevel) <= LEVEL_THRESHOLD,
          );
          if (allDone && !completedRef.current) {
            completedRef.current = true;
            clearInterval(pourIntervalRef.current!);
            vibrate([100, 50, 100, 50, 200]);
            setTimeout(onComplete, 600);
          }

          return next;
        });
      }, 60);
    },
    [started, isPouring, onScore, onComplete],
  );

  const doneCount = glasses.filter(
    (g) => Math.abs(g.level - g.targetLevel) <= LEVEL_THRESHOLD,
  ).length;
  const progress = Math.min((doneCount / glasses.length) * 100, 100);

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Progress bar */}
      <div className="h-2.5 bg-cyan-100 rounded-full overflow-hidden mx-1">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center" role="status" aria-live="polite">
        <p className="text-base font-bold text-teal-600">
          {doneCount}/{glasses.length} glasses filled!
        </p>
        <p className="text-xs text-gray-400">Hold a glass to pour</p>
      </div>

      {/* Glasses */}
      <div className="flex-1 flex items-end justify-center gap-4 pb-4">
        {glasses.map((glass) => {
          const atTarget = Math.abs(glass.level - glass.targetLevel) <= LEVEL_THRESHOLD;
          const pouring = isPouring === glass.id;

          return (
            <div key={glass.id} className="flex flex-col items-center gap-2">
              <AnimatePresence>
                {pouring && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 44, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="w-2 rounded-full mb-0"
                    style={{ backgroundColor: glass.color, opacity: 0.75 }}
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>

              <motion.button
                className="relative w-20 h-44 cursor-pointer select-none touch-none focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-xl"
                onMouseDown={() => startPour(glass.id)}
                onMouseUp={stopPour}
                onMouseLeave={stopPour}
                onTouchStart={() => startPour(glass.id)}
                onTouchEnd={stopPour}
                onTouchCancel={stopPour}
                whileTap={{ scale: 1.02 }}
                aria-label={`${glass.colorName} glass, ${Math.round(glass.level)}% filled, target ${glass.targetLevel}%. ${atTarget ? 'Done!' : 'Hold to pour.'}`}
              >
                <svg viewBox="0 0 80 170" className="w-full h-full" aria-hidden="true">
                  <path
                    d="M 10 5 L 10 148 Q 10 162 26 162 L 54 162 Q 70 162 70 148 L 70 5"
                    fill="none"
                    stroke={atTarget ? glass.color : '#d1d5db'}
                    strokeWidth={atTarget ? 4 : 3}
                  />
                  <line
                    x1="12"
                    x2="68"
                    y1={162 - glass.targetLevel * 1.55}
                    y2={162 - glass.targetLevel * 1.55}
                    stroke={glass.color}
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    opacity="0.75"
                  />
                  <path
                    d="M 18 15 L 18 145 Q 18 155 24 158"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    opacity="0.45"
                  />
                </svg>

                <motion.div
                  className="absolute left-[14%] right-[14%] bottom-[5%] rounded-b-xl overflow-hidden"
                  style={{ backgroundColor: glass.color, opacity: 0.72 }}
                  animate={{ height: `${glass.level * 0.855}%` }}
                  transition={{ ease: 'linear', duration: 0.06 }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-2 rounded-full opacity-60"
                    style={{ backgroundColor: 'white' }}
                  />
                </motion.div>

                {atTarget && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ boxShadow: `0 0 20px ${glass.color}88` }}
                  />
                )}
              </motion.button>

              <div className="text-center">
                <span className="text-sm font-bold" style={{ color: glass.color }}>
                  {Math.round(glass.level)}%
                </span>
                <span className="text-xs text-gray-400">/{glass.targetLevel}%</span>
              </div>
              <span className="text-xs font-medium text-gray-500">{glass.colorName}</span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 pb-1">
        Hold each glass to pour - Stop at the dashed line!
      </p>

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-cyan-50/90 backdrop-blur-sm rounded-2xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center mx-4">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="text-6xl mb-4"
                aria-hidden="true"
              >
                🫗
              </motion.div>
              <p className="text-2xl font-bold text-teal-600 mb-2">Water Pour!</p>
              <p className="text-teal-400 mb-1">Hold each glass to pour.</p>
              <p className="text-teal-400 mb-5">Fill to the dashed line!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStarted(true);
                  vibrate(50);
                }}
                className="bg-gradient-to-r from-cyan-400 to-teal-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Start Pouring!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
