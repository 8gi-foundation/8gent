'use client';

import type React from 'react';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';

type Stroke = {
  id: number;
  points: { x: number; y: number }[];
  color: string;
  width: number;
};

const RAINBOW_COLORS = [
  { hex: '#FF2D55', name: 'Red' },
  { hex: '#FF9500', name: 'Orange' },
  { hex: '#FFCC00', name: 'Yellow' },
  { hex: '#34C759', name: 'Green' },
  { hex: '#007AFF', name: 'Blue' },
  { hex: '#5856D6', name: 'Indigo' },
  { hex: '#AF52DE', name: 'Violet' },
];

const BRUSH_SIZES = [8, 18, 32, 50];
const TARGET_STROKES = 7;

export function RainbowPaintGame({ onScore, onComplete }: GameProps) {
  const [started, setStarted] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedColor, setSelectedColor] = useState(RAINBOW_COLORS[0].hex);
  const [brushSize, setBrushSize] = useState(20);
  const [strokeCount, setStrokeCount] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const strokeIdRef = useRef(0);
  const strokeCountRef = useRef(0);
  const completedRef = useRef(false);
  const isDrawing = useRef(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startStroke = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!started || completedRef.current) return;
      e.preventDefault();
      const pos = getPos(e);
      if (!pos) return;
      isDrawing.current = true;
      setCurrentStroke({
        id: strokeIdRef.current++,
        points: [pos],
        color: selectedColor,
        width: brushSize,
      });
      vibrate(20);
    },
    [started, selectedColor, brushSize],
  );

  const continueStroke = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current || !started) return;
      e.preventDefault();
      const pos = getPos(e);
      if (!pos) return;
      setCurrentStroke((prev) => (prev ? { ...prev, points: [...prev.points, pos] } : null));
    },
    [started],
  );

  const endStroke = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    setCurrentStroke((prev) => {
      if (!prev || prev.points.length < 2) return null;

      setStrokes((s) => [...s, prev]);
      strokeCountRef.current += 1;
      setStrokeCount(strokeCountRef.current);
      onScore();
      vibrate([50, 30, 50]);

      if (strokeCountRef.current >= TARGET_STROKES && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => {
          vibrate([100, 50, 100, 50, 200]);
          onComplete();
        }, 500);
      }

      return null;
    });
  }, [onScore, onComplete]);

  const clearCanvas = () => {
    if (completedRef.current) return;
    setStrokes([]);
    strokeCountRef.current = 0;
    setStrokeCount(0);
    vibrate(20);
  };

  const progress = Math.min((strokeCount / TARGET_STROKES) * 100, 100);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="h-2.5 rounded-full overflow-hidden mx-1" style={{ background: 'linear-gradient(to right, #FF2D55, #FF9500, #FFCC00, #34C759, #007AFF, #5856D6, #AF52DE)' }}>
        <motion.div className="h-full bg-white/50 rounded-full" animate={{ width: `${100 - progress}%`, marginLeft: `${progress}%` }} transition={{ ease: 'easeOut' }} />
      </div>

      <div className="flex justify-between items-center px-1">
        <div className="bg-purple-50 rounded-full px-3 py-1 shadow">
          <span className="text-base font-bold text-purple-600">{strokeCount}/{TARGET_STROKES} strokes 🎨</span>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={clearCanvas} className="px-3 py-1 bg-gray-100 rounded-full text-gray-500 font-medium text-sm">Clear 🗑️</motion.button>
      </div>

      <div className="flex justify-center gap-2 px-1">
        {RAINBOW_COLORS.map(({ hex }) => (
          <motion.button
            key={hex}
            whileTap={{ scale: 0.85 }}
            onClick={() => { setSelectedColor(hex); vibrate(20); }}
            className="w-9 h-9 rounded-full shadow-md"
            animate={selectedColor === hex ? { scale: 1.25 } : { scale: 1 }}
            style={{
              backgroundColor: hex,
              border: selectedColor === hex ? '3px solid white' : '3px solid transparent',
              boxShadow: selectedColor === hex ? `0 0 12px ${hex}` : `0 2px 6px ${hex}44`,
            }}
          />
        ))}
      </div>

      <div className="flex justify-center items-center gap-3">
        {BRUSH_SIZES.map((size) => (
          <motion.button
            key={size}
            whileTap={{ scale: 0.85 }}
            onClick={() => { setBrushSize(size); vibrate(20); }}
            className="rounded-full"
            animate={brushSize === size ? { scale: 1.2 } : { scale: 1 }}
            style={{
              width: Math.max(size * 0.7, 12),
              height: Math.max(size * 0.7, 12),
              backgroundColor: brushSize === size ? selectedColor : '#ddd',
              border: brushSize === size ? '2px solid white' : 'none',
              boxShadow: brushSize === size ? `0 0 8px ${selectedColor}` : 'none',
            }}
          />
        ))}
      </div>

      <div
        ref={canvasRef}
        className="flex-1 relative bg-white rounded-2xl overflow-hidden shadow-inner cursor-crosshair touch-none"
        onMouseDown={startStroke}
        onMouseMove={continueStroke}
        onMouseUp={endStroke}
        onMouseLeave={endStroke}
        onTouchStart={startStroke}
        onTouchMove={continueStroke}
        onTouchEnd={endStroke}
        onTouchCancel={endStroke}
      >
        <svg className="absolute inset-0 w-full h-full">
          {strokes.map((stroke) => (
            <path
              key={stroke.id}
              d={`M ${stroke.points.map((p) => `${p.x},${p.y}`).join(' L ')}`}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.85"
            />
          ))}
          {currentStroke && currentStroke.points.length > 1 && (
            <path
              d={`M ${currentStroke.points.map((p) => `${p.x},${p.y}`).join(' L ')}`}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.85"
            />
          )}
        </svg>

        {strokes.length === 0 && !currentStroke && started && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl mb-2">🖌️</motion.div>
              <p className="text-xl font-bold text-gray-300">Paint a rainbow!</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-purple-50/90 backdrop-blur-sm rounded-2xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center mx-4">
              <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-4">🌈</motion.div>
              <p className="text-2xl font-bold text-purple-600 mb-2">Rainbow Paint!</p>
              <p className="text-purple-400 mb-1">Pick a color and brush size.</p>
              <p className="text-purple-400 mb-5">Draw {TARGET_STROKES} strokes!</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setStarted(true); vibrate(50); }}
                className="bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Start Painting! 🎨
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
