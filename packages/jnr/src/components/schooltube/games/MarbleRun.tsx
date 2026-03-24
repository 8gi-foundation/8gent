'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GAME_COLORS,
  COLOR_NAMES,
  getRandomInt,
  vibrate,
  type GameProps,
} from '@/lib/schooltube/game-utils';

// Gentle chime that rises in pitch as you collect more
let audioCtx: AudioContext | null = null;
function playCollectSound(index: number) {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const baseFreq = 300 + (index % 8) * 40;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // AudioContext not available
  }
}

type Marble = {
  id: number;
  color: string;
  path: number;
  size: number;
};

const TARGET = 15;

// Three lane paths for marbles to roll down
const PATHS = [
  {
    initial: { left: '15%', top: '-8%', scale: 0 },
    animate: {
      left: ['15%', '28%', '8%', '22%', '15%'],
      top: ['-8%', '20%', '45%', '70%', '90%'],
      scale: [0, 1, 1, 1, 1],
    },
  },
  {
    initial: { left: '48%', top: '-8%', scale: 0 },
    animate: {
      left: ['48%', '38%', '60%', '42%', '48%'],
      top: ['-8%', '20%', '45%', '70%', '90%'],
      scale: [0, 1, 1, 1, 1],
    },
  },
  {
    initial: { left: '80%', top: '-8%', scale: 0 },
    animate: {
      left: ['80%', '72%', '88%', '68%', '80%'],
      top: ['-8%', '20%', '45%', '70%', '90%'],
      scale: [0, 1, 1, 1, 1],
    },
  },
];

export function MarbleRunSensoryGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [marbles, setMarbles] = useState<Marble[]>([]);
  const [collected, setCollected] = useState(0);
  const marbleIdRef = useRef(0);
  const collectedRef = useRef(0);
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dropMarble = useCallback(() => {
    if (collectedRef.current >= TARGET || completedRef.current) return;
    const marble: Marble = {
      id: marbleIdRef.current++,
      color: GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]],
      path: getRandomInt(0, 2),
      size: getRandomInt(28, 40),
    };
    setMarbles((prev) => [...prev, marble]);
    vibrate(15);
  }, []);

  const collectMarble = useCallback(
    (marbleId: number, tapped: boolean) => {
      if (completedRef.current) return;
      setMarbles((prev) => prev.filter((m) => m.id !== marbleId));

      collectedRef.current += 1;
      setCollected(collectedRef.current);
      playCollectSound(collectedRef.current);

      vibrate(tapped ? [30, 15, 30] : 15);
      onScore();

      if (collectedRef.current >= TARGET && !completedRef.current) {
        completedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        vibrate([80, 40, 80, 40, 160]);
        setTimeout(onComplete, 500);
      }
    },
    [onScore, onComplete],
  );

  // Auto-drop marbles on interval
  useEffect(() => {
    if (!started || completedRef.current) return;
    intervalRef.current = setInterval(() => {
      setMarbles((prev) => {
        if (prev.length < 4) dropMarble();
        return prev;
      });
    }, 1500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, dropMarble]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = Math.min((collected / TARGET) * 100, 100);

  return (
    <div className="h-full flex flex-col gap-3" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Progress bar */}
      <div className="h-3 rounded-full overflow-hidden mx-2" style={{ backgroundColor: '#E8E0D6' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: '#E8610A' }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div className="rounded-full px-4 py-1.5" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8E0D6' }}>
          <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#E8610A', fontSize: '1.125rem' }}>
            {collected}/{TARGET}
          </span>
        </div>
        <button
          onClick={dropMarble}
          disabled={!started}
          className="px-5 py-2 rounded-full text-white text-sm shadow disabled:opacity-40"
          style={{
            backgroundColor: '#E8610A',
            fontFamily: 'var(--font-inter)',
            fontWeight: 600,
            minHeight: 44,
          }}
        >
          Drop
        </button>
      </div>

      {/* Marble run area */}
      <div
        className="flex-1 relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #FFF8F0, #E8E0D6)' }}
      >
        {/* Track lanes SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Lane 1 */}
          <path d="M 15 0 Q 28 25 8 50 Q 22 75 15 100" stroke="#E8E0D6" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 15 0 Q 28 25 8 50 Q 22 75 15 100" stroke="#FFF8F0" strokeWidth="7" fill="none" strokeLinecap="round" />
          {/* Lane 2 */}
          <path d="M 48 0 Q 38 25 60 50 Q 42 75 48 100" stroke="#E8E0D6" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 48 0 Q 38 25 60 50 Q 42 75 48 100" stroke="#FFF8F0" strokeWidth="7" fill="none" strokeLinecap="round" />
          {/* Lane 3 */}
          <path d="M 80 0 Q 72 25 88 50 Q 68 75 80 100" stroke="#E8E0D6" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M 80 0 Q 72 25 88 50 Q 68 75 80 100" stroke="#FFF8F0" strokeWidth="7" fill="none" strokeLinecap="round" />
          {/* Bumper dots */}
          {[
            { cx: 25, cy: 28 }, { cx: 40, cy: 48 }, { cx: 62, cy: 48 },
            { cx: 75, cy: 28 }, { cx: 28, cy: 70 }, { cx: 68, cy: 70 }, { cx: 50, cy: 85 },
          ].map(({ cx, cy }, i) => (
            <circle key={i} cx={cx} cy={cy} r="2.5" fill="#E8610A" opacity="0.35" />
          ))}
        </svg>

        {/* Marbles */}
        <AnimatePresence>
          {marbles.map((marble) => {
            const pathDef = PATHS[marble.path];
            return (
              <motion.button
                key={marble.id}
                className="absolute rounded-full cursor-pointer z-10"
                style={{
                  width: marble.size,
                  height: marble.size,
                  backgroundColor: marble.color,
                  boxShadow: `inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.4), 0 3px 10px ${marble.color}55`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={pathDef.initial}
                animate={pathDef.animate}
                transition={{
                  duration: 3.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  times: [0, 0.25, 0.5, 0.75, 1],
                }}
                onAnimationComplete={() => collectMarble(marble.id, false)}
                onClick={(e) => {
                  e.stopPropagation();
                  collectMarble(marble.id, true);
                }}
                whileTap={{ scale: 1.4 }}
                aria-label="Tap to catch this marble"
              >
                {/* Shine */}
                <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-white/50" />
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Collection tray */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-center"
          style={{ background: 'linear-gradient(to top, #E8610A, #FFB347)' }}
        >
          <span
            className="text-white text-xs"
            style={{ fontFamily: 'var(--font-inter)', fontWeight: 600 }}
          >
            Tap marbles to catch them
          </span>
        </div>
      </div>

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(255, 253, 249, 0.9)', backdropFilter: 'blur(4px)' }}
          >
            <div
              className="rounded-3xl p-8 shadow-xl text-center mx-4"
              style={{ backgroundColor: '#FFF8F0', border: '2px solid #E8E0D6' }}
            >
              {/* Marble SVG icon */}
              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 6, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="mb-4 flex justify-center"
              >
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="#4ECDC4" />
                  <circle cx="20" cy="18" r="7" fill="rgba(255,255,255,0.4)" />
                  <circle cx="36" cy="36" r="3" fill="rgba(255,255,255,0.2)" />
                </svg>
              </motion.div>
              <p
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612' }}
              >
                Marble Run
              </p>
              <p
                className="mb-1"
                style={{ fontFamily: 'var(--font-inter)', color: '#1A1612', opacity: 0.6 }}
              >
                Watch the marbles roll.
              </p>
              <p
                className="mb-5"
                style={{ fontFamily: 'var(--font-inter)', color: '#1A1612', opacity: 0.6 }}
              >
                Tap them to collect {TARGET}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStarted(true);
                  vibrate(40);
                  setTimeout(dropMarble, 300);
                }}
                className="px-8 py-4 rounded-full text-lg text-white shadow-lg"
                style={{
                  fontFamily: 'var(--font-fraunces)',
                  fontWeight: 700,
                  backgroundColor: '#E8610A',
                  minHeight: 56,
                  minWidth: 180,
                }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Start Run
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
