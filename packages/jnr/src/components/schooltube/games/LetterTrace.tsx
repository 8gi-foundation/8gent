'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomInt, shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const LETTER_WORDS: Record<string, string> = {
  A: 'Apple 🍎', B: 'Ball ⚽', C: 'Cat 🐱', D: 'Dog 🐶',
  E: 'Elephant 🐘', F: 'Fish 🐟', G: 'Grapes 🍇', H: 'House 🏠',
  I: 'Ice cream 🍦', J: 'Jellyfish 🪼', K: 'Kite 🪁', L: 'Lion 🦁',
  M: 'Moon 🌙', N: 'Nest 🪺', O: 'Orange 🍊', P: 'Penguin 🐧',
  Q: 'Queen 👑', R: 'Rainbow 🌈', S: 'Star ⭐', T: 'Tiger 🐯',
  U: 'Umbrella ☂️', V: 'Volcano 🌋', W: 'Whale 🐋', X: 'Xylophone 🎼',
  Y: 'Yo-yo 🪀', Z: 'Zebra 🦓',
};

const LETTER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD', '#FFB347'];
const MAX_ROUNDS = 5;

export function LetterTraceGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [currentLetter, setCurrentLetter] = useState('A');
  const [letterColor, setLetterColor] = useState(LETTER_COLORS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const generateRound = useCallback(() => {
    const letter = LETTERS[getRandomInt(0, LETTERS.length - 1)];
    const color = LETTER_COLORS[getRandomInt(0, LETTER_COLORS.length - 1)];
    setCurrentLetter(letter);
    setLetterColor(color);
    setPoints([]);
    setHasDrawn(false);
    setShowFeedback(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    const wrongLetters = LETTERS.filter((l) => l !== letter);
    const shuffledWrong = shuffleArray(wrongLetters).slice(0, 3);
    setOptions(shuffleArray([letter, ...shuffledWrong]));
  }, []);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (points.length < 2) return;

    ctx.strokeStyle = letterColor;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = letterColor;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }, [points, letterColor]);

  const getPos = (e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleDrawStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setHasDrawn(true);
    vibrate(20);
    setPoints([getPos(e, canvas)]);
  };

  const handleDrawMove = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPoints((prev) => [...prev, getPos(e, canvas)]);
  };

  const handleDrawEnd = () => { setIsDrawing(false); };

  const clearTrace = () => {
    setPoints([]);
    setHasDrawn(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    vibrate(20);
  };

  const handleAnswer = (letter: string) => {
    if (showFeedback) return;
    vibrate(20);

    if (letter === currentLetter) {
      setShowFeedback('correct');
      vibrate([50, 30, 50]);
      onScore();
      setScore((s) => s + 1);

      addTimer(() => {
        setShowFeedback(null);
        if (round >= MAX_ROUNDS) {
          setPhase('celebrate');
          vibrate([100, 50, 100, 50, 200]);
          onComplete();
        } else {
          setRound((r) => r + 1);
          generateRound();
        }
      }, 1100);
    } else {
      setShowFeedback('wrong');
      vibrate(200);
      addTimer(() => setShowFeedback(null), 900);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">✏️</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#4ECDC4]">Letter Trace!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Trace the letter with your finger, then tap the matching letter below!</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 bg-[#4ECDC4] text-white text-2xl font-bold rounded-3xl shadow-xl">Start Tracing! 🖊️</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-8xl">🎓</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#4ECDC4]">Letter Champion!</h2>
        <p className="text-xl text-center text-gray-700">You traced <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> letters perfectly!</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: score }, (_, i) => (
            <motion.span key={i} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.15 }} className="text-3xl">✏️</motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#4ECDC4]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">{LETTER_WORDS[currentLetter] || currentLetter}</p>
      </div>

      <div className="relative flex-1 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl overflow-hidden border-2 border-yellow-200 min-h-[160px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <motion.span
            key={currentLetter}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.18 }}
            className="font-black"
            style={{ fontSize: 'min(45vw, 160px)', color: letterColor, lineHeight: 1 }}
          >
            {currentLetter}
          </motion.span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-black" style={{ fontSize: 'min(45vw, 160px)', color: 'transparent', WebkitTextStroke: `3px ${letterColor}44`, lineHeight: 1 }}>
            {currentLetter}
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="absolute inset-0 w-full h-full touch-none"
          onTouchStart={handleDrawStart}
          onTouchMove={handleDrawMove}
          onTouchEnd={handleDrawEnd}
          onMouseDown={handleDrawStart}
          onMouseMove={handleDrawMove}
          onMouseUp={handleDrawEnd}
        />

        {!hasDrawn && (
          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
            <span className="text-sm font-medium text-gray-400">Trace the letter!</span>
          </motion.div>
        )}

        {hasDrawn && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }} onClick={clearTrace} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 text-sm font-bold">
            ✕
          </motion.button>
        )}

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`absolute inset-0 flex items-center justify-center rounded-3xl ${showFeedback === 'correct' ? 'bg-green-400/35' : 'bg-red-400/35'}`}
            >
              <span className="text-7xl">{showFeedback === 'correct' ? '✅' : '❌'}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="text-base font-bold text-[#4ECDC4] mb-2">Which letter is that?</p>
        <div className="flex gap-3 justify-center">
          {options.map((letter) => (
            <motion.button key={letter} whileTap={{ scale: 0.9 }} onClick={() => handleAnswer(letter)} className="h-14 w-14 text-2xl font-bold rounded-2xl text-white shadow-lg" style={{ backgroundColor: letterColor }}>
              {letter}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
