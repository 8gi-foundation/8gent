'use client';

import type React from 'react';
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Scoop = {
  id: number;
  color: string;
  x: number;
  y: number;
};

const FLAVORS = [
  { name: 'Strawberry', color: '#FFB6C1' },
  { name: 'Blueberry', color: '#4ECDC4' },
  { name: 'Lemon', color: '#FFE66D' },
  { name: 'Mint', color: '#95E1D3' },
  { name: 'Watermelon', color: '#FF6B6B' },
  { name: 'Caramel', color: '#E8610A' },
];

const TARGET = 12;

export function IceCreamBuilderGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [scoops, setScoops] = useState<Scoop[]>([]);
  const [currentFlavor, setCurrentFlavor] = useState(FLAVORS[0]);
  const [showComplete, setShowComplete] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const addScoop = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!started || completedRef.current) return;
      if (scoops.length >= TARGET) return;

      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      if (y > 82) return;

      const newScoop: Scoop = {
        id: Date.now() + Math.random(),
        color: currentFlavor.color,
        x: Math.max(20, Math.min(80, x)),
        y: Math.max(10, Math.min(80, y)),
      };

      setScoops((prev) => {
        const next = [...prev, newScoop];
        vibrate(30);
        onScore();

        if (next.length >= TARGET && !completedRef.current) {
          completedRef.current = true;
          setShowComplete(true);
          vibrate([100, 50, 100, 50, 200]);
          setTimeout(onComplete, 2000);
        }

        return next;
      });
    },
    [started, scoops.length, currentFlavor, onScore, onComplete],
  );

  const progress = Math.min((scoops.length / TARGET) * 100, 100);

  return (
    <div className="relative h-full w-full flex flex-col gap-3">
      {/* Progress */}
      <div className="h-2.5 bg-orange-100 rounded-full overflow-hidden mx-1">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="bg-orange-50 rounded-full px-3 py-1 shadow" role="status" aria-live="polite">
          <span className="text-base font-bold text-orange-600">
            {scoops.length}/{TARGET} scoops
          </span>
        </div>
        <span className="text-sm text-gray-400 font-medium">Tap to add!</span>
      </div>

      {/* Flavor picker */}
      <div className="flex justify-center gap-2 flex-wrap px-1" role="radiogroup" aria-label="Ice cream flavors">
        {FLAVORS.map((flavor) => (
          <motion.button
            key={flavor.name}
            whileTap={{ scale: 0.88 }}
            onClick={() => setCurrentFlavor(flavor)}
            className="flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-full"
            role="radio"
            aria-checked={currentFlavor.color === flavor.color}
            aria-label={flavor.name}
          >
            <motion.div
              animate={
                currentFlavor.color === flavor.color
                  ? { scale: [1, 1.15, 1] }
                  : { scale: 1 }
              }
              transition={{
                repeat: currentFlavor.color === flavor.color ? Infinity : 0,
                duration: 1,
              }}
              className="w-10 h-10 rounded-full shadow-lg"
              style={{
                backgroundColor: flavor.color,
                border:
                  currentFlavor.color === flavor.color
                    ? '3px solid white'
                    : '3px solid transparent',
                boxShadow:
                  currentFlavor.color === flavor.color
                    ? `0 0 15px ${flavor.color}88`
                    : '0 2px 8px rgba(0,0,0,0.2)',
              }}
            />
            <span className="text-[10px] text-gray-400 mt-0.5">{flavor.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Ice cream building area */}
      <div
        ref={canvasRef}
        className="flex-1 relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-2xl overflow-hidden cursor-pointer touch-none select-none"
        onClick={addScoop}
        onTouchStart={addScoop}
        role="application"
        aria-label="Ice cream building canvas. Tap to add scoops."
      >
        {/* Waffle cone */}
        <svg
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-44 pointer-events-none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D2691E" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
          </defs>
          <polygon points="50,98 18,33 82,33" fill="url(#coneGrad)" />
          <polygon points="50,97 22,37 78,37" fill="#CD853F" opacity="0.5" />
          {[0, 1, 2, 3].map((i) => (
            <line
              key={`h${i}`}
              x1={22 + i * 4}
              y1={40 + i * 3}
              x2={78 - i * 4}
              y2={40 + i * 3}
              stroke="#8B4513"
              strokeWidth="0.8"
              opacity="0.35"
            />
          ))}
          <line x1="18" y1="33" x2="82" y2="33" stroke="#8B4513" strokeWidth="2" opacity="0.5" />
        </svg>

        {/* Placed scoops */}
        <AnimatePresence>
          {scoops.map((scoop, index) => (
            <motion.div
              key={scoop.id}
              initial={{ scale: 0, y: -30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${scoop.x}%`,
                top: `${scoop.y}%`,
                zIndex: index + 5,
              }}
            >
              <div
                className="w-10 h-10 rounded-full"
                style={{
                  backgroundColor: scoop.color,
                  boxShadow: `inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.4), 0 4px 10px ${scoop.color}55`,
                }}
              >
                <div className="w-3 h-3 rounded-full bg-white/40 absolute top-1.5 left-2" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {scoops.length === 0 && started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none"
          >
            <p className="text-lg font-bold text-amber-700">Tap to add scoops!</p>
          </motion.div>
        )}

        <AnimatePresence>
          {showComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/85 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-8xl"
                  aria-hidden="true"
                >
                  🍦
                </motion.div>
                <p className="text-3xl font-bold text-orange-600 mt-4">Delicious!</p>
                <p className="text-orange-400 mt-1">{scoops.length} scoops!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-amber-50/90 backdrop-blur-sm rounded-2xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center mx-4">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-7xl mb-4"
                aria-hidden="true"
              >
                🍦
              </motion.div>
              <p className="text-2xl font-bold text-orange-600 mb-2">Ice Cream Builder!</p>
              <p className="text-orange-400 mb-1">Choose your flavor.</p>
              <p className="text-orange-400 mb-5">Add {TARGET} scoops to finish!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStarted(true);
                  vibrate(50);
                }}
                className="bg-gradient-to-r from-orange-400 to-amber-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Build It!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
