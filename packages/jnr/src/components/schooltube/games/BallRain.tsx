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

// Gentle chime sound using Web Audio API
let audioCtx: AudioContext | null = null;
function playDropSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 400 + Math.random() * 200;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // AudioContext not available
  }
}

type Ball = {
  id: number;
  x: number;
  color: string;
  size: number;
};

type LandedBall = Ball & { y: number };

const TARGET = 20;

export function BallRainSensoryGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [landedBalls, setLandedBalls] = useState<LandedBall[]>([]);
  const [count, setCount] = useState(0);
  const ballIdRef = useRef(0);
  const countRef = useRef(0);
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnBall = useCallback(() => {
    const ball: Ball = {
      id: ballIdRef.current++,
      x: getRandomInt(5, 90),
      color: GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]],
      size: getRandomInt(24, 44),
    };
    setBalls((prev) => [...prev, ball]);
  }, []);

  const handleBallLand = useCallback(
    (ball: Ball) => {
      if (completedRef.current) return;
      setBalls((prev) => prev.filter((b) => b.id !== ball.id));
      setLandedBalls((prev) => [
        ...prev.slice(-40),
        {
          ...ball,
          y: 82 + Math.random() * 10 - Math.min(prev.length * 0.4, 25),
        },
      ]);

      countRef.current += 1;
      setCount(countRef.current);
      playDropSound();
      vibrate(15);
      onScore();

      if (countRef.current >= TARGET && !completedRef.current) {
        completedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        vibrate([80, 40, 80, 40, 160]);
        setTimeout(onComplete, 600);
      }
    },
    [onScore, onComplete],
  );

  // Auto-spawn interval
  useEffect(() => {
    if (!started || completedRef.current) return;
    intervalRef.current = setInterval(spawnBall, 220);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, spawnBall]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleTap = () => {
    if (!started) {
      setStarted(true);
      vibrate(40);
      return;
    }
    if (completedRef.current) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnBall, i * 50);
    }
    vibrate(20);
  };

  const progress = Math.min((count / TARGET) * 100, 100);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl cursor-pointer select-none"
      style={{ backgroundColor: '#FFFDF9' }}
      onClick={handleTap}
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #E8E0D6 0%, #FFF8F0 40%, #FFFDF9 100%)',
        }}
      />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-2 z-20" style={{ backgroundColor: '#E8E0D6' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: '#E8610A' }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      {/* Count display */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          key={count}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="rounded-full px-5 py-2 shadow-md"
          style={{ backgroundColor: '#FFF8F0', border: '2px solid #E8E0D6' }}
        >
          <span
            className="text-2xl"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#E8610A' }}
          >
            {count}
          </span>
          <span
            className="text-base"
            style={{ fontFamily: 'var(--font-inter)', color: '#1A1612', opacity: 0.5 }}
          >
            /{TARGET}
          </span>
        </motion.div>
      </div>

      {/* Falling balls */}
      <AnimatePresence>
        {balls.map((ball) => (
          <motion.div
            key={ball.id}
            initial={{ y: -60, x: `${ball.x}%`, scale: 0 }}
            animate={{ y: '82vh', scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              y: { duration: 1.6, ease: 'easeIn' },
              scale: { duration: 0.2 },
            }}
            onAnimationComplete={() => handleBallLand(ball)}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: ball.size,
              height: ball.size,
              backgroundColor: ball.color,
              boxShadow: `0 3px 10px ${ball.color}44, inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 4px 8px rgba(255,255,255,0.35)`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Landed balls pile */}
      {landedBalls.map((ball) => (
        <div
          key={ball.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: ball.size,
            height: ball.size,
            left: `${ball.x}%`,
            bottom: `${100 - ball.y}%`,
            backgroundColor: ball.color,
            boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.12), inset 0 3px 6px rgba(255,255,255,0.2)',
          }}
        />
      ))}

      {/* Start overlay */}
      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30"
            style={{ backgroundColor: 'rgba(255, 253, 249, 0.85)', backdropFilter: 'blur(4px)' }}
          >
            <div
              className="rounded-3xl p-8 shadow-xl text-center mx-4"
              style={{ backgroundColor: '#FFF8F0', border: '2px solid #E8E0D6' }}
            >
              {/* Animated ball icon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="mb-4 flex justify-center"
              >
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="#E8610A" />
                  <circle cx="24" cy="22" r="8" fill="rgba(255,255,255,0.35)" />
                </svg>
              </motion.div>
              <p
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612' }}
              >
                Ball Rain
              </p>
              <p
                className="text-lg mb-5"
                style={{ fontFamily: 'var(--font-inter)', color: '#1A1612', opacity: 0.6 }}
              >
                Collect {TARGET} balls
              </p>
              <motion.button
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
                whileTap={{ scale: 0.95 }}
              >
                Tap to Start
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap hint */}
      {started && !completedRef.current && count === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10"
          style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, color: '#1A1612', opacity: 0.5 }}
        >
          Tap for more balls
        </motion.div>
      )}

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 rounded-b-2xl pointer-events-none"
        style={{ background: 'linear-gradient(to top, #95E1D3, #98D8C8)' }}
      />
    </div>
  );
}
