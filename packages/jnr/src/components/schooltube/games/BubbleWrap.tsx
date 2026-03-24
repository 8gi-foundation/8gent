'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GAME_COLORS,
  COLOR_NAMES,
  getRandomInt,
  vibrate,
  type GameProps,
} from '@/lib/schooltube/game-utils';

// Soft pop sound
let audioCtx: AudioContext | null = null;
function playPopSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600 + Math.random() * 300;
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // AudioContext not available
  }
}

type Bubble = {
  id: number;
  popped: boolean;
  color: string;
};

const GRID = 5;
const TOTAL = GRID * GRID;

function makeBubbles(): Bubble[] {
  return Array.from({ length: TOTAL }, (_, i) => ({
    id: i,
    popped: false,
    color: GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]],
  }));
}

export function BubbleWrapSensoryGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>(() => makeBubbles());
  const [lastPop, setLastPop] = useState<number | null>(null);
  const [round, setRound] = useState(1);

  const poppedCount = useMemo(() => bubbles.filter((b) => b.popped).length, [bubbles]);

  const popBubble = useCallback(
    (id: number) => {
      if (!started) return;
      setBubbles((prev) => {
        const bubble = prev.find((b) => b.id === id);
        if (!bubble || bubble.popped) return prev;

        playPopSound();
        vibrate(25);
        onScore();
        setLastPop(id);
        setTimeout(() => setLastPop(null), 200);

        const next = prev.map((b) => (b.id === id ? { ...b, popped: true } : b));
        const allPopped = next.every((b) => b.popped);

        if (allPopped) {
          setTimeout(() => {
            vibrate([80, 40, 80, 40, 160]);
            onComplete();
          }, 400);
        }

        return next;
      });
    },
    [started, onScore, onComplete],
  );

  const resetBubbles = () => {
    setBubbles(makeBubbles());
    setRound((r) => r + 1);
    vibrate(30);
  };

  const progress = Math.round((poppedCount / TOTAL) * 100);

  return (
    <div className="h-full flex flex-col gap-3 relative" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Progress bar */}
      <div className="h-3 rounded-full overflow-hidden mx-2" style={{ backgroundColor: '#E8E0D6' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: '#E8610A' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      {/* Header row */}
      <div className="flex justify-between items-center px-2">
        <div className="rounded-full px-4 py-1.5" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8E0D6' }}>
          <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#E8610A', fontSize: '1.125rem' }}>
            {poppedCount}/{TOTAL}
          </span>
        </div>
        <button
          onClick={resetBubbles}
          className="px-5 py-2 rounded-full text-white text-sm shadow"
          style={{
            backgroundColor: '#E8610A',
            fontFamily: 'var(--font-inter)',
            fontWeight: 600,
            minHeight: 44,
          }}
        >
          New Sheet
        </button>
      </div>

      {/* Bubble grid */}
      <div className="flex-1 flex items-center justify-center p-2">
        <div
          className="grid gap-3 p-4 rounded-2xl"
          style={{
            gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            backgroundColor: '#FFF8F0',
            border: '2px solid #E8E0D6',
          }}
        >
          {bubbles.map((bubble) => (
            <button
              key={`${bubble.id}-r${round}`}
              onClick={() => popBubble(bubble.id)}
              disabled={bubble.popped || !started}
              className="relative rounded-full cursor-pointer disabled:cursor-default"
              style={{ width: 56, height: 56 }}
              aria-label={bubble.popped ? 'Popped bubble' : 'Pop this bubble'}
            >
              <AnimatePresence>
                {!bubble.popped && (
                  <motion.div
                    initial={{ scale: 1 }}
                    exit={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: bubble.color,
                      boxShadow: `inset 0 -6px 12px rgba(0,0,0,0.12), inset 0 6px 12px rgba(255,255,255,0.4), 0 3px 8px ${bubble.color}44`,
                    }}
                  >
                    {/* Shine highlight */}
                    <div
                      className="absolute top-2 left-3 w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'rgba(255,255,255,0.5)', filter: 'blur(1px)' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pop flash */}
              <AnimatePresence>
                {lastPop === bubble.id && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ backgroundColor: bubble.color }}
                  />
                )}
              </AnimatePresence>

              {/* Popped dimple */}
              {bubble.popped && (
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed opacity-20"
                  style={{ borderColor: bubble.color }}
                />
              )}
            </button>
          ))}
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
              {/* Bubble SVG icon */}
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="mb-4 flex justify-center"
              >
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="#4ECDC4" opacity="0.7" />
                  <circle cx="22" cy="20" r="7" fill="rgba(255,255,255,0.45)" />
                  <circle cx="38" cy="38" r="3" fill="rgba(255,255,255,0.25)" />
                </svg>
              </motion.div>
              <p
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612' }}
              >
                Bubble Wrap
              </p>
              <p
                className="text-lg mb-5"
                style={{ fontFamily: 'var(--font-inter)', color: '#1A1612', opacity: 0.6 }}
              >
                Pop all {TOTAL} bubbles
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStarted(true);
                  vibrate(40);
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
                Start Popping
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
