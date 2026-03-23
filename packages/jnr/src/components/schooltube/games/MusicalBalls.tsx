'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';

const NOTES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
const NOTE_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do!'];

const BALL_COLORS = [
  '#FF6B6B', '#FFB347', '#FFE66D', '#95E1D3',
  '#87CEEB', '#4ECDC4', '#FFB6C1', '#E8610A',
];

const TARGET = 24;

let audioCtx: AudioContext | null = null;

function playTone(freq: number) {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    // AudioContext not available
  }
}

export function MusicalBallsGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [lastNote, setLastNote] = useState('');
  const [ripples, setRipples] = useState<{ id: number; index: number }[]>([]);
  const playCountRef = useRef(0);
  const completedRef = useRef(false);

  const handlePlay = useCallback(
    (index: number) => {
      if (!started || completedRef.current) return;

      setActiveIndex(index);
      setLastNote(NOTE_NAMES[index]);
      playTone(NOTES[index]);
      vibrate(30);

      const rippleId = Date.now() + index;
      setRipples((prev) => [...prev, { id: rippleId, index }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== rippleId)), 700);
      setTimeout(() => setActiveIndex(null), 250);

      playCountRef.current += 1;
      setPlayCount(playCountRef.current);
      onScore();

      if (playCountRef.current >= TARGET && !completedRef.current) {
        completedRef.current = true;
        vibrate([100, 50, 100, 50, 200]);
        setTimeout(onComplete, 500);
      }
    },
    [started, onScore, onComplete],
  );

  const progress = Math.min((playCount / TARGET) * 100, 100);

  return (
    <div className="h-full flex flex-col gap-3 relative">
      {/* Progress bar */}
      <div className="h-2.5 bg-orange-100 rounded-full overflow-hidden mx-1">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-full px-3 py-1 shadow"
          role="status"
          aria-live="polite"
        >
          <span className="text-base font-bold text-orange-600">
            {playCount}/{TARGET} notes
          </span>
        </div>
        <AnimatePresence mode="wait">
          {lastNote && (
            <motion.div
              key={lastNote + playCount}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-amber-100 rounded-full px-3 py-1"
            >
              <span className="font-bold text-amber-700 text-sm">{lastNote}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-base font-medium text-gray-500">
        Tap the balls to make music!
      </p>

      {/* Musical balls grid - 2 rows of 4 */}
      <div className="flex-1 flex items-center justify-center" role="group" aria-label="Musical balls">
        <div className="grid grid-cols-4 gap-4 p-2">
          {BALL_COLORS.map((color, index) => (
            <div key={index} className="relative flex flex-col items-center gap-1">
              {ripples
                .filter((r) => r.index === index)
                .map((ripple) => (
                  <motion.div
                    key={ripple.id}
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.65 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ backgroundColor: color, zIndex: 0 }}
                  />
                ))}

              <motion.button
                whileTap={{ scale: 0.8 }}
                animate={{
                  scale: activeIndex === index ? 1.25 : 1,
                  boxShadow:
                    activeIndex === index
                      ? `0 0 30px ${color}, 0 0 60px ${color}`
                      : `0 8px 20px ${color}44`,
                }}
                onClick={() => handlePlay(index)}
                disabled={!started}
                className="relative w-16 h-16 rounded-full cursor-pointer z-10 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-orange-400"
                style={{ backgroundColor: color }}
                aria-label={`Play note ${NOTE_NAMES[index]}`}
                role="button"
              >
                <div
                  className="absolute top-2 left-2.5 w-4 h-4 rounded-full bg-white/50"
                  style={{ filter: 'blur(2px)' }}
                />
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/20" />
              </motion.button>

              <motion.div
                animate={activeIndex === index ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
                className="text-xs font-bold text-gray-500"
              >
                {NOTE_NAMES[index]}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Piano-style visualizer */}
      <div className="flex justify-center gap-1 pb-2" aria-hidden="true">
        {BALL_COLORS.map((color, i) => (
          <motion.div
            key={i}
            className="w-6 rounded-b-lg"
            style={{ backgroundColor: color }}
            animate={activeIndex === i ? { height: 28, opacity: 1 } : { height: 16, opacity: 0.5 }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-orange-50/90 backdrop-blur-sm rounded-2xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center mx-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-6xl mb-4"
                aria-hidden="true"
              >
                🎵
              </motion.div>
              <p className="text-2xl font-bold text-orange-600 mb-2">Musical Balls!</p>
              <p className="text-orange-400 mb-1">Each ball plays a note.</p>
              <p className="text-orange-400 mb-5">Tap {TARGET} notes to finish!</p>
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
                Play Music!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
