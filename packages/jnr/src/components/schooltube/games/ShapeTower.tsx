'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GAME_COLORS,
  COLOR_NAMES,
  vibrate,
  type GameProps,
} from '@/lib/schooltube/game-utils';

// Rising xylophone tone
let audioCtx: AudioContext | null = null;
function playStackSound(index: number) {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
    const freq = scale[index % scale.length];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch {
    // AudioContext not available
  }
}

type StackedShape = {
  id: number;
  shape: string;
  color: string;
  size: number;
};

const SHAPES = ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond'] as const;
const TARGET = 12;

function renderShape(shape: string, color: string, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.min(cx, cy) - 2;

  switch (shape) {
    case 'circle':
      return <circle cx={cx} cy={cy} r={r} fill={color} />;
    case 'square':
      return <rect x={3} y={3} width={size - 6} height={size - 6} fill={color} rx={6} />;
    case 'triangle':
      return <polygon points={`${cx},3 ${size - 3},${size - 3} 3,${size - 3}`} fill={color} />;
    case 'star': {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? r : r * 0.42;
        const ang = (Math.PI / 5) * i - Math.PI / 2;
        pts.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`);
      }
      return <polygon points={pts.join(' ')} fill={color} />;
    }
    case 'hexagon': {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i - Math.PI / 2;
        pts.push(`${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`);
      }
      return <polygon points={pts.join(' ')} fill={color} />;
    }
    case 'diamond':
      return <polygon points={`${cx},3 ${size - 3},${cy} ${cx},${size - 3} 3,${cy}`} fill={color} />;
    default:
      return null;
  }
}

export function ShapeTowerSensoryGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [stack, setStack] = useState<StackedShape[]>([]);
  const [currentShape, setCurrentShape] = useState<string>(SHAPES[0]);
  const [currentColor, setCurrentColor] = useState<string>(GAME_COLORS.red);
  const [wobble, setWobble] = useState(false);
  const countRef = useRef(0);
  const completedRef = useRef(false);

  const addShape = useCallback(() => {
    if (!started || completedRef.current) return;
    if (countRef.current >= TARGET) return;

    const newShape: StackedShape = {
      id: Date.now() + Math.random(),
      shape: currentShape,
      color: currentColor,
      size: 56 - countRef.current * 2,
    };

    setStack((prev) => [...prev, newShape]);
    setWobble(true);
    setTimeout(() => setWobble(false), 350);

    playStackSound(countRef.current);
    vibrate(30);
    onScore();

    countRef.current += 1;

    if (countRef.current >= TARGET && !completedRef.current) {
      completedRef.current = true;
      vibrate([80, 40, 80, 40, 160]);
      setTimeout(onComplete, 600);
    }
  }, [started, currentShape, currentColor, onScore, onComplete]);

  const progress = Math.min((stack.length / TARGET) * 100, 100);

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

      {/* Score */}
      <div className="flex justify-center">
        <div className="rounded-full px-4 py-1.5" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8E0D6' }}>
          <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#E8610A', fontSize: '1rem' }}>
            {stack.length}/{TARGET} blocks
          </span>
        </div>
      </div>

      {/* Shape selector - large touch targets */}
      <div className="flex justify-center gap-2 flex-wrap px-2">
        {SHAPES.map((shape) => (
          <button
            key={shape}
            onClick={() => {
              setCurrentShape(shape);
              vibrate(15);
            }}
            className="rounded-xl flex items-center justify-center"
            style={{
              width: 52,
              height: 52,
              backgroundColor: '#FFF8F0',
              border: currentShape === shape ? `3px solid ${currentColor}` : '3px solid #E8E0D6',
              boxShadow: currentShape === shape ? `0 0 8px ${currentColor}44` : '0 1px 3px rgba(0,0,0,0.08)',
            }}
            aria-label={`Select ${shape} shape`}
          >
            <svg width="30" height="30" viewBox="0 0 30 30">
              {renderShape(shape, currentShape === shape ? currentColor : '#E8E0D6', 30)}
            </svg>
          </button>
        ))}
      </div>

      {/* Color selector */}
      <div className="flex justify-center gap-2">
        {COLOR_NAMES.slice(0, 7).map((name) => (
          <button
            key={name}
            onClick={() => {
              setCurrentColor(GAME_COLORS[name]);
              vibrate(15);
            }}
            className="rounded-full shadow-sm"
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              backgroundColor: GAME_COLORS[name],
              border: currentColor === GAME_COLORS[name] ? '3px solid #1A1612' : '3px solid transparent',
              boxShadow: currentColor === GAME_COLORS[name] ? `0 0 8px ${GAME_COLORS[name]}` : undefined,
            }}
            aria-label={`Select ${name} color`}
          />
        ))}
      </div>

      {/* Tower building area */}
      <div
        className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer"
        style={{ background: 'linear-gradient(to bottom, #FFF8F0, #E8E0D6)' }}
        onClick={addShape}
      >
        {/* Clouds */}
        <div className="absolute top-3 left-6 w-8 h-4 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} />
        <div className="absolute top-5 left-14 w-12 h-5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} />
        <div className="absolute top-3 right-8 w-10 h-4 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }} />

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #95E1D3, #98D8C8)' }}
        />

        {/* Platform */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-36 h-5 rounded-t-lg shadow-md pointer-events-none"
          style={{ backgroundColor: '#E8610A' }}
        />

        {/* Stacked shapes */}
        <motion.div
          className="absolute bottom-11 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center pointer-events-none"
          animate={wobble ? { rotate: [-2, 2, -1, 1, 0] } : {}}
          transition={{ duration: 0.35 }}
        >
          {stack.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ y: -60, scale: 0, rotate: -120 }}
              animate={{ y: 0, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ marginTop: index > 0 ? -8 : 0 }}
            >
              <svg
                width={item.size}
                height={item.size}
                viewBox={`0 0 ${item.size} ${item.size}`}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}
              >
                {renderShape(item.shape, item.color, item.size)}
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* Preview shape - gentle bob at top */}
        {started && !completedRef.current && (
          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg
              width={48}
              height={48}
              viewBox="0 0 48 48"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
            >
              {renderShape(currentShape, currentColor, 48)}
            </svg>
            <p
              className="text-sm drop-shadow"
              style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, color: '#1A1612', opacity: 0.5 }}
            >
              Tap to drop
            </p>
          </motion.div>
        )}
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
              {/* Tower SVG icon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.3 }}
                className="mb-4 flex justify-center"
              >
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <rect x="14" y="36" width="28" height="12" rx="4" fill="#FF6B6B" />
                  <rect x="18" y="24" width="20" height="12" rx="4" fill="#4ECDC4" />
                  <rect x="22" y="12" width="12" height="12" rx="4" fill="#FFE66D" />
                </svg>
              </motion.div>
              <p
                className="text-2xl mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612' }}
              >
                Shape Tower
              </p>
              <p
                className="mb-1"
                style={{ fontFamily: 'var(--font-inter)', color: '#1A1612', opacity: 0.6 }}
              >
                Pick a shape and color.
              </p>
              <p
                className="mb-5"
                style={{ fontFamily: 'var(--font-inter)', color: '#1A1612', opacity: 0.6 }}
              >
                Stack {TARGET} blocks to the sky
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
                Build
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
