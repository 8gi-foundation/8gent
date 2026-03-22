'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomInt, shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

const DOT_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#DDA0DD', '#FFB347', '#FFB6C1', '#87CEEB', '#98FB98', '#F0E68C'];
const MAX_ROUNDS = 6;

function DotDisplay({ count, color }: { count: number; color: string }) {
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
      {dots.map((i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

export function NumberBondsGame({ onScore, onComplete }: GameProps) {
  const [phase, setPhase] = useState<'start' | 'play' | 'celebrate'>('start');
  const [targetSum, setTargetSum] = useState(5);
  const [firstNumber, setFirstNumber] = useState(2);
  const [options, setOptions] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [dotColor1] = useState(DOT_COLORS[getRandomInt(0, 4)]);
  const [dotColor2] = useState(DOT_COLORS[getRandomInt(5, 9)]);
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
    setShowFeedback(null);
    setSelectedAnswer(null);

    const maxSum = Math.min(5 + Math.floor(round / 2), 10);
    const sum = getRandomInt(3, maxSum);
    const first = getRandomInt(1, sum - 1);
    const answer = sum - first;

    setTargetSum(sum);
    setFirstNumber(first);

    const wrongCandidates = [answer - 2, answer - 1, answer + 1, answer + 2, answer + 3].filter(
      (n) => n > 0 && n !== answer && n <= 10,
    );
    const wrong = shuffleArray(wrongCandidates).slice(0, 3);
    setOptions(shuffleArray([answer, ...wrong]));
  }, [round]);

  const handleStart = () => {
    setPhase('play');
    setRound(1);
    setScore(0);
    vibrate(20);
    addTimer(() => generateRound(), 200);
  };

  const handleAnswer = (answer: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    vibrate(20);

    const correct = targetSum - firstNumber;
    if (answer === correct) {
      setShowFeedback('correct');
      vibrate([50, 30, 50]);
      onScore();
      setScore((s) => s + 1);

      addTimer(() => {
        setShowFeedback(null);
        setSelectedAnswer(null);
        if (round >= MAX_ROUNDS) {
          setPhase('celebrate');
          vibrate([100, 50, 100, 50, 200]);
          onComplete();
        } else {
          setRound((r) => r + 1);
          generateRound();
        }
      }, 1200);
    } else {
      setShowFeedback('wrong');
      vibrate(200);
      addTimer(() => { setShowFeedback(null); setSelectedAnswer(null); }, 900);
    }
  };

  if (phase === 'start') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-7xl">🧮</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#4ECDC4]">Number Bonds!</h2>
        <p className="text-lg text-center text-gray-600 max-w-xs">Figure out which number is missing to make the equation work!</p>
        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#FF6B6B] flex items-center justify-center text-xl font-bold text-white">3</div>
          <span className="text-xl font-bold text-gray-500">+</span>
          <div className="w-12 h-12 rounded-full bg-[#4ECDC4] flex items-center justify-center text-xl font-bold text-white">?</div>
          <span className="text-xl font-bold text-gray-500">=</span>
          <div className="w-12 h-12 rounded-full bg-[#FFE66D] flex items-center justify-center text-xl font-bold text-gray-700">5</div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart} className="px-10 py-5 bg-[#4ECDC4] text-white text-2xl font-bold rounded-3xl shadow-xl">Start Adding! ➕</motion.button>
      </motion.div>
    );
  }

  if (phase === 'celebrate') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-8xl">🧮</motion.div>
        <h2 className="text-3xl font-bold text-center text-[#4ECDC4]">Math Wizard!</h2>
        <p className="text-xl text-center text-gray-700">Solved <span className="font-bold text-[#FF6B6B] text-2xl">{score}</span> of {MAX_ROUNDS} number bonds!</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: score }, (_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12 }} className="text-3xl">⭐</motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  const correctAnswer = targetSum - firstNumber;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: MAX_ROUNDS }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-[#4ECDC4]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <motion.div key={`${targetSum}-${round}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="relative flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#FFE66D] flex flex-col items-center justify-center shadow-xl mb-2">
            <span className="text-4xl font-black text-gray-700">{targetSum}</span>
            <span className="text-xs text-gray-500 font-medium">total</span>
          </div>

          <svg className="absolute" style={{ top: 80, left: '50%', transform: 'translateX(-50%)' }} width="160" height="50">
            <line x1="80" y1="0" x2="25" y2="45" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
            <line x1="80" y1="0" x2="135" y2="45" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
          </svg>

          <div className="flex justify-center gap-16 mt-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-[#FF6B6B] flex items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-white">{firstNumber}</span>
              </div>
              <DotDisplay count={firstNumber} color={dotColor1} />
            </div>

            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.08, 1], borderColor: ['#4ECDC4', '#FFE66D', '#4ECDC4'] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-dashed"
                style={{ borderColor: '#4ECDC4' }}
              >
                {showFeedback === 'correct' ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl font-black text-[#4ECDC4]">{correctAnswer}</motion.span>
                ) : (
                  <span className="text-3xl font-black text-[#4ECDC4]">?</span>
                )}
              </motion.div>
              {showFeedback === 'correct' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <DotDisplay count={correctAnswer} color={dotColor2} />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.p key={`eq-${round}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-gray-600 mt-2">
          {firstNumber} + <span className="text-[#4ECDC4]">?</span> = {targetSum}
        </motion.p>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        {options.map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.88 }}
            onClick={() => handleAnswer(num)}
            disabled={showFeedback !== null}
            className={`h-16 w-16 text-2xl font-bold rounded-2xl shadow-lg transition-all ${
              selectedAnswer === num && showFeedback === 'correct' ? 'bg-green-500 text-white scale-110 ring-4 ring-green-300'
              : selectedAnswer === num && showFeedback === 'wrong' ? 'bg-red-400 text-white'
              : 'bg-[#FF6B6B] text-white'
            }`}
          >
            {num}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`text-center text-lg font-bold ${showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
            {showFeedback === 'correct' ? `🎉 ${firstNumber} + ${correctAnswer} = ${targetSum}!` : 'Try a different number!'}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
