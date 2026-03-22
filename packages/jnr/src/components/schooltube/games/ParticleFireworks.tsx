'use client';

import type React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_COLORS, COLOR_NAMES, getRandomInt, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Particle = {
  id: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
};

type Explosion = {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
  baseColor: string;
};

type Sparkle = {
  id: number;
  x: number;
  y: number;
  color: string;
};

const TARGET = 15;

export function ParticleFireworksGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [displayCount, setDisplayCount] = useState(0);
  const countRef = useRef(0);
  const completedRef = useRef(false);
  const explosionIdRef = useRef(0);
  const sparkleIdRef = useRef(0);

  const stars = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 1 + Math.random() * 2,
      delay: Math.random() * 2,
    })),
  );

  useEffect(() => {
    return () => { completedRef.current = true; };
  }, []);

  const createExplosion = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!started || completedRef.current) return;
      e.preventDefault();

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const baseColor = GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]];
      const particleCount = 18 + getRandomInt(0, 8);

      const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        color: i % 3 === 0 ? baseColor : GAME_COLORS[COLOR_NAMES[getRandomInt(0, COLOR_NAMES.length - 1)]],
        angle: (Math.PI * 2 * i) / particleCount + Math.random() * 0.4,
        speed: 60 + Math.random() * 80,
        size: 6 + Math.random() * 10,
      }));

      const explId = explosionIdRef.current++;
      setExplosions((prev) => [...prev, { id: explId, x, y, particles, baseColor }]);

      const newSparkles: Sparkle[] = Array.from({ length: 6 }, () => ({
        id: sparkleIdRef.current++,
        x: x + (Math.random() - 0.5) * 120,
        y: y + (Math.random() - 0.5) * 120,
        color: baseColor,
      }));
      setSparkles((prev) => [...prev, ...newSparkles]);

      vibrate([50, 30, 50]);
      onScore();

      setTimeout(() => {
        setExplosions((prev) => prev.filter((exp) => exp.id !== explId));
      }, 1600);

      const sparkleIds = newSparkles.map((s) => s.id);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => !sparkleIds.includes(s.id)));
      }, 1000);

      countRef.current += 1;
      setDisplayCount(countRef.current);
      if (countRef.current >= TARGET && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => {
          vibrate([100, 50, 100, 50, 200]);
          onComplete();
        }, 1600);
      }
    },
    [started, onScore, onComplete],
  );

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex justify-center">
        <div className="bg-indigo-900/80 rounded-full px-4 py-1.5 shadow">
          <span className="text-lg font-bold text-yellow-300">{Math.min(displayCount, TARGET)}/{TARGET} 🎆</span>
        </div>
      </div>

      <div
        className="flex-1 relative bg-gradient-to-b from-indigo-950 via-purple-950 to-black rounded-2xl overflow-hidden cursor-crosshair"
        onClick={createExplosion}
        onTouchStart={createExplosion}
      >
        {stars.current.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
            style={{ left: star.left, top: star.top }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: star.duration, delay: star.delay }}
          />
        ))}

        <AnimatePresence>
          {explosions.map((explosion) => (
            <div key={explosion.id} className="absolute pointer-events-none" style={{ left: explosion.x, top: explosion.y }}>
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white pointer-events-none"
                style={{ boxShadow: '0 0 30px white, 0 0 60px white' }}
              />
              {explosion.particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos(particle.angle) * particle.speed,
                    y: Math.sin(particle.angle) * particle.speed + particle.speed * 0.4,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ duration: 1.3, ease: 'easeOut' }}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    boxShadow: `0 0 8px ${particle.color}, 0 0 16px ${particle.color}`,
                    marginLeft: -particle.size / 2,
                    marginTop: -particle.size / 2,
                  }}
                />
              ))}
            </div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              initial={{ scale: 0, opacity: 1, rotate: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], rotate: 180 }}
              exit={{}}
              transition={{ duration: 0.7 }}
              className="absolute pointer-events-none"
              style={{ left: sparkle.x, top: sparkle.y }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 0 L11.5 8 L20 10 L11.5 12 L10 20 L8.5 12 L0 10 L8.5 8 Z" fill={sparkle.color} style={{ filter: `drop-shadow(0 0 6px ${sparkle.color})` }} />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>

        {started && displayCount === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-white/70">Tap anywhere! ✨</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-indigo-950/90 backdrop-blur-sm rounded-2xl"
          >
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-8 shadow-2xl text-center mx-4">
              <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-7xl mb-4">🎆</motion.div>
              <p className="text-2xl font-bold text-white mb-2">Fireworks Show!</p>
              <p className="text-white/70 mb-5">Tap anywhere to launch {TARGET} fireworks!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setStarted(true); vibrate(50); }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Launch! 🚀
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
