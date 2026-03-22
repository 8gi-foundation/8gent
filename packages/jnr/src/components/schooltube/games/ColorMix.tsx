'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray, getRandomInt, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

const COLOR_MIXES = [
  { colors: ['Red', 'Yellow'], result: 'Orange', hex1: '#FF6B6B', hex2: '#FFE66D', hexResult: '#FFB347', emoji1: '🔴', emoji2: '🟡', emojiResult: '🟠' },
  { colors: ['Blue', 'Yellow'], result: 'Green', hex1: '#4169E1', hex2: '#FFE66D', hexResult: '#4CAF50', emoji1: '🔵', emoji2: '🟡', emojiResult: '🟢' },
  { colors: ['Red', 'Blue'], result: 'Purple', hex1: '#FF6B6B', hex2: '#4169E1', hexResult: '#9C27B0', emoji1: '🔴', emoji2: '🔵', emojiResult: '🟣' },
  { colors: ['White', 'Red'], result: 'Pink', hex1: '#F5F5F5', hex2: '#FF6B6B', hexResult: '#FFB6C1', emoji1: '⬜', emoji2: '🔴', emojiResult: '🩷' },
  { colors: ['Red', 'Orange'], result: 'Dark Orange', hex1: '#FF6B6B', hex2: '#FFB347', hexResult: '#FF7043', emoji1: '🔴', emoji2: '🟠', emojiResult: '🎃' },
];

const ALL_RESULTS = ['Orange', 'Green', 'Purple', 'Pink', 'Dark Orange', 'Blue', 'Yellow', 'Red'];
const MAX_ROUNDS = 5;

export function ColorMixGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'mixing' | 'play' | 'celebrate'>('start');
  const [currentMix, setCurrentMix] = useState(COLOR_MIXES[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [mixProgress, setMixProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [stirAngle, setStirAngle] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stirRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (stirRef.current) clearInterval(stirRef.current);
    };
  }, []);

  const generateRound = useCallback(() => {
    setShowFeedback(null);
    setMixProgress(0);
    setStirAngle(0);

    const mix = COLOR_MIXES[getRandomInt(0, COLOR_MIXES.length - 1)];
    setCurrentMix(mix);

    const wrongResults = ALL_RESULTS.filter((r) => r !== mix.result);
    const wrongOpts = shuffleArray(wrongResults).slice(0, 3);
    setOptions(shuffleArray([mix.result, ...wrongOpts]));

    setPhase('mixing');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.04;
      setMixProgress(Math.min(progress, 1));
      setStirAngle((a) => a + 15);
      if (progress >= 1) {
        clearInterval(interval);
        addTimer(() => setPhase('play'), 200);
      }
    }, 50);
    stirRef.current = interval;
  }, []);

  const handleStart = () => {
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    vibrate(20);

    if (answer === currentMix.result) {
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-6 p-4"
      >
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">
          🎨
        </motion.div>
        <h2 className="text-3xl font-bold text-center text-[#FFB347]">Color Mix!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">
          Watch the colors mix together and guess what new color you get!
        </p>
        <div className="flex items-center gap-2 text-3xl">
          <span>🔴</span><span className="text-xl">+</span><span>🔵</span><span className="text-xl">=</span><span>🟣</span>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 text-white text-2xl font-bold rounded-3xl shadow-xl" style={{ backgroundColor: '#FFB347' }}>
          Mix Colors! 🖌️
        </motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-8xl">🌈</motion.div>
        <h2 className="text-3xl font-bold text-center" style={{ color: '#FFB347' }}>Color Scientist!</h2>
        <p className="text-xl text-center text-gray-700">
          Got <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> of {MAX_ROUNDS} color mixes right!
        </p>
        <div className="flex gap-2">
          {['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'].map((e, i) => (
            <motion.span key={e} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="text-3xl">{e}</motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  const interpolatedColor = (color1: string, color2: string, t: number) => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);
    const r = Math.round(((c1 >> 16) & 0xff) + (((c2 >> 16) & 0xff) - ((c1 >> 16) & 0xff)) * t);
    const g = Math.round(((c1 >> 8) & 0xff) + (((c2 >> 8) & 0xff) - ((c1 >> 8) & 0xff)) * t);
    const b = Math.round((c1 & 0xff) + ((c2 & 0xff) - (c1 & 0xff)) * t);
    return `rgb(${r},${g},${b})`;
  };

  const midColor = interpolatedColor(currentMix.hex1, currentMix.hex2, 0.5);
  const displayColor = mixProgress < 0.5
    ? interpolatedColor(currentMix.hex1, midColor, mixProgress * 2)
    : interpolatedColor(midColor, currentMix.hexResult, (mixProgress - 0.5) * 2);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#FFB347]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <p className="text-center text-lg font-bold text-[#4ECDC4]">What color do you get?</p>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-2">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl" style={{ backgroundColor: currentMix.hex1 }}>{currentMix.emoji1}</div>
            <span className="text-sm font-bold text-gray-600">{currentMix.colors[0]}</span>
          </div>
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-2xl font-bold text-gray-400">+</motion.div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl" style={{ backgroundColor: currentMix.hex2 }}>{currentMix.emoji2}</div>
            <span className="text-sm font-bold text-gray-600">{currentMix.colors[1]}</span>
          </div>
        </div>

        <motion.div animate={{ rotate: stirAngle }} className="text-3xl select-none" style={{ display: 'inline-block' }}>
          {phase === 'mixing' ? '🌀' : '⬇️'}
        </motion.div>

        <motion.div className="w-28 h-28 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: phase === 'play' ? currentMix.hexResult : displayColor }}>
          {phase === 'play' ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">{currentMix.emojiResult}</motion.span>
          ) : (
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
          )}
        </motion.div>

        {phase === 'mixing' && (
          <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-sm font-medium text-gray-400">Mixing...</motion.p>
        )}
      </div>

      <AnimatePresence>
        {phase === 'play' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
            {options.map((color) => (
              <motion.button
                key={color}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleAnswer(color)}
                disabled={showFeedback === 'correct'}
                className={`h-14 text-base font-bold rounded-2xl border-2 shadow-md capitalize transition-all ${
                  showFeedback === 'correct' && color === currentMix.result
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                {color}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center text-xl font-bold ${showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}
          >
            {showFeedback === 'correct' ? `🎨 Yes! ${currentMix.result}!` : 'Try again!'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
