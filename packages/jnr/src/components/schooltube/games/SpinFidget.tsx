'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';

const TARGET = 10;
const ARM_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D'];

export function SpinFidgetGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [blur, setBlur] = useState(false);
  const controls = useAnimation();
  const rotationRef = useRef(0);
  const spinCountRef = useRef(0);
  const completedRef = useRef(false);

  const handleSpin = useCallback(async () => {
    if (isSpinning || !started || completedRef.current) return;

    setIsSpinning(true);
    setBlur(true);

    const spinAmount = 720 + Math.random() * 1440;
    const duration = 1.8 + Math.random() * 1.2;

    vibrate(50);
    rotationRef.current += spinAmount;

    await controls.start({
      rotate: rotationRef.current,
      transition: { duration, ease: [0.25, 0.46, 0.45, 0.94] },
    });

    setBlur(false);
    setIsSpinning(false);
    vibrate([30, 20, 30]);

    spinCountRef.current += 1;
    setSpinCount(spinCountRef.current);
    onScore();

    if (spinCountRef.current >= TARGET && !completedRef.current) {
      completedRef.current = true;
      vibrate([100, 50, 100, 50, 200]);
      setTimeout(onComplete, 500);
    }
  }, [isSpinning, started, controls, onScore, onComplete]);

  const progress = Math.min((spinCount / TARGET) * 100, 100);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 relative">
      {/* Progress */}
      <div className="w-full max-w-xs px-4">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-400 via-amber-400 to-teal-500 rounded-full"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className="bg-gradient-to-r from-red-50 via-amber-50 to-teal-50 rounded-full px-6 py-2 shadow"
        role="status"
        aria-live="polite"
      >
        <span className="text-xl font-bold text-orange-600">
          {spinCount}/{TARGET} spins
        </span>
      </div>

      {/* Fidget spinner */}
      <motion.button
        animate={controls}
        initial={{ rotate: 0 }}
        onClick={handleSpin}
        whileTap={!isSpinning ? { scale: 0.93 } : {}}
        disabled={isSpinning || !started}
        className="relative w-52 h-52 cursor-pointer disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-full"
        style={{ transformOrigin: 'center center' }}
        aria-label={isSpinning ? 'Spinner is spinning' : 'Tap to spin the fidget spinner'}
      >
        {/* Spin blur ring */}
        <AnimatePresence>
          {blur && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${ARM_COLORS[0]}, ${ARM_COLORS[1]}, ${ARM_COLORS[2]}, ${ARM_COLORS[0]})`,
                filter: 'blur(8px)',
                opacity: 0.45,
              }}
            />
          )}
        </AnimatePresence>

        {/* Arms */}
        {ARM_COLORS.map((color, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: 90,
              height: 32,
              transform: `rotate(${i * 120}deg) translateY(-50%)`,
              marginLeft: 0,
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 left-4 w-16 h-6 rounded-full"
              style={{ backgroundColor: color, opacity: 0.8 }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 right-0 w-14 h-14 rounded-full shadow-lg"
              style={{
                backgroundColor: color,
                boxShadow: `inset 0 -4px 10px rgba(0,0,0,0.3), inset 0 4px 10px rgba(255,255,255,0.3), 0 4px 18px ${color}55`,
              }}
            >
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-white/40" />
            </div>
          </div>
        ))}

        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 shadow-2xl z-10">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-400 to-gray-700">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-500 to-gray-900" />
          </div>
        </div>

        {/* Spin effect rings */}
        <AnimatePresence>
          {isSpinning && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-dashed border-white/25"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 0.45 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-dashed border-white/20"
                animate={{ scale: [1, 1.9], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 0.65, delay: 0.15 }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.p
        animate={{ opacity: isSpinning ? 0.3 : 1 }}
        className="text-xl font-bold text-gray-500 text-center"
        aria-hidden="true"
      >
        {isSpinning ? 'Spinning...' : 'Tap to spin!'}
      </motion.p>

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm rounded-2xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center mx-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="text-6xl mb-4 inline-block"
                aria-hidden="true"
              >
                🌀
              </motion.div>
              <p className="text-2xl font-bold text-orange-600 mb-2">Spin Fidget!</p>
              <p className="text-orange-400 mb-1">Tap the spinner.</p>
              <p className="text-orange-400 mb-5">Spin it {TARGET} times!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStarted(true);
                  vibrate(50);
                }}
                className="bg-gradient-to-r from-red-400 via-amber-400 to-teal-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Let's Spin!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
