'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

/* ── TTS helper (browser SpeechSynthesis) ── */
function speak(text: string, rate = 0.85) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
}

/* ── Palette ── */
const BG = '#FFFDF9';
const TEXT = '#1A1612';
const CARD = '#FFF8F0';
const BORDER = '#E8E0D6';
const ACCENT = '#E8610A';
const SUCCESS = '#4CAF50';

/* ── Data ── */
type NatureItem = {
  name: string;
  svgColor: string;
  fact: string;
  question: string;
  answers: { text: string; correct: boolean }[];
  sound: string;
  category: 'plant' | 'animal' | 'weather' | 'place';
};

const natureItems: NatureItem[] = [
  { name: 'Tree', svgColor: '#2ECC71', fact: 'Trees give us air to breathe and homes for animals!', question: 'What do trees give us?', answers: [{ text: 'Fresh air', correct: true }, { text: 'Pizza', correct: false }, { text: 'Electricity', correct: false }], sound: 'Rustle rustle!', category: 'plant' },
  { name: 'Rain', svgColor: '#3498DB', fact: 'Rain falls from clouds and helps flowers grow!', question: 'What does rain help to do?', answers: [{ text: 'Make noise', correct: false }, { text: 'Grow plants', correct: true }, { text: 'Make sunsets', correct: false }], sound: 'Pitter patter!', category: 'weather' },
  { name: 'Butterfly', svgColor: '#9B59B6', fact: 'Butterflies start as caterpillars, then change into butterflies!', question: 'What do butterflies start as?', answers: [{ text: 'A caterpillar', correct: true }, { text: 'A fish', correct: false }, { text: 'A flower', correct: false }], sound: 'Flutter flutter!', category: 'animal' },
  { name: 'Sun', svgColor: '#F1C40F', fact: 'The sun gives us warmth and light!', question: 'What does the sun give us?', answers: [{ text: 'Rain', correct: false }, { text: 'Warmth and light', correct: true }, { text: 'Snow', correct: false }], sound: 'Warm and bright!', category: 'weather' },
  { name: 'Bird', svgColor: '#E74C3C', fact: 'Birds have wings and feathers. They build nests for eggs!', question: 'What do birds build?', answers: [{ text: 'A nest', correct: true }, { text: 'A sandcastle', correct: false }, { text: 'A hole', correct: false }], sound: 'Tweet tweet!', category: 'animal' },
  { name: 'Flower', svgColor: '#FF69B4', fact: 'Flowers smell sweet and bees visit them to collect nectar!', question: 'Why do bees visit flowers?', answers: [{ text: 'To sleep', correct: false }, { text: 'To collect nectar', correct: true }, { text: 'To play', correct: false }], sound: 'So beautiful!', category: 'plant' },
];

/* ── Simple colored circle as icon replacement ── */
function NatureIcon({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="42" fill={color} opacity={0.85} />
      <circle cx="50" cy="50" r="28" fill={color} />
    </svg>
  );
}

const TOTAL = 6;

export function NatureExploreGame({ onScore, onComplete }: GameProps) {
  const [pool] = useState(() => shuffleArray([...natureItems]).slice(0, TOTAL));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'explore' | 'quiz' | 'result'>('explore');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [explored, setExplored] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const delay = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const item = pool[index] ?? null;

  useEffect(() => {
    if (item && phase === 'explore') {
      delay(() => speak(`${item.name}! ${item.fact}`), 400);
    }
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuiz = () => {
    if (!item) return;
    vibrate(20);
    setPhase('quiz');
    delay(() => speak(item.question), 300);
  };

  const handleAnswer = (answer: { text: string; correct: boolean }) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer.text);
    vibrate(20);

    if (answer.correct) {
      setIsCorrect(true);
      speak(`Correct! ${answer.text}!`);
      onScore();
      delay(() => setPhase('result'), 1200);
    } else {
      setIsCorrect(false);
      speak('Not quite! Try again!');
      delay(() => { setSelectedAnswer(null); setIsCorrect(null); }, 900);
    }
  };

  const handleNext = () => {
    const next = index + 1;
    setExplored((e) => e + 1);
    onScore();

    if (next >= TOTAL) {
      setDone(true);
      vibrate([50, 50, 50]);
      speak('You explored all of nature! You are a nature expert!');
      delay(() => onComplete(), 2500);
      return;
    }
    setIndex(next);
    setPhase('explore');
    setSelectedAnswer(null);
    setIsCorrect(null);
    vibrate(20);
  };

  if (done) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-6" style={{ background: BG }}>
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <NatureIcon color={SUCCESS} size={96} />
        </motion.div>
        <h2 style={{ color: TEXT, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl text-center">
          Nature Expert!
        </h2>
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }}>You explored {TOTAL} amazing things in nature!</p>
        <div className="flex gap-3">
          {pool.map((p, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }}>
              <NatureIcon color={p.svgColor} size={40} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center gap-4 p-4 overflow-y-auto" style={{ background: BG }}>
      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-xs mb-1 flex justify-between">
          <span>Exploring {index + 1} of {TOTAL}</span>
          <span>{explored} done</span>
        </p>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: BORDER }}>
          <motion.div className="h-full rounded-full" style={{ background: ACCENT }} animate={{ width: `${(index / TOTAL) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {item && phase === 'explore' && (
          <motion.div key={`explore-${index}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center gap-4 w-full max-w-xs">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="rounded-3xl p-6 flex flex-col items-center shadow-md" style={{ background: CARD, border: `2px solid ${BORDER}` }}>
              <NatureIcon color={item.svgColor} size={80} />
            </motion.div>
            <h3 style={{ color: item.svgColor, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl">{item.name}</h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white capitalize" style={{ background: item.svgColor }}>{item.category}</span>
            <div className="rounded-2xl p-4 shadow-sm text-center" style={{ background: CARD, border: `2px solid ${item.svgColor}40` }}>
              <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-base font-medium">{item.fact}</p>
              <p className="text-sm mt-2 italic" style={{ color: BORDER }}>&quot;{item.sound}&quot;</p>
            </div>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => speak(`${item.name}! ${item.fact}`)} className="px-5 py-4 rounded-2xl font-bold text-white shadow-md text-base" style={{ background: item.svgColor, minHeight: 56 }}>
                Hear Fact
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={handleQuiz} className="px-5 py-4 rounded-2xl font-extrabold text-white shadow-md text-base" style={{ background: ACCENT, minHeight: 56 }}>
                Quiz Me
              </motion.button>
            </div>
          </motion.div>
        )}

        {item && phase === 'quiz' && (
          <motion.div key={`quiz-${index}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="flex items-center gap-3 w-full">
              <NatureIcon color={item.svgColor} size={48} />
              <div className="rounded-2xl px-4 py-3 shadow-sm flex-1" style={{ background: CARD, border: `2px solid ${item.svgColor}40` }}>
                <p className="font-extrabold text-base" style={{ color: item.svgColor, fontFamily: 'var(--font-fraunces)' }}>{item.question}</p>
              </div>
            </div>
            <div className="space-y-3 w-full">
              {item.answers.map((answer, i) => {
                const selected = selectedAnswer === answer.text;
                const right = selected && answer.correct;
                const wrong = selected && !answer.correct;
                return (
                  <motion.button key={answer.text} initial={{ opacity: 0, x: -20 }} animate={right ? { scale: [1, 1.04, 1] } : wrong ? { x: [-4, 4, -4, 0] } : { opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} whileTap={{ scale: 0.94 }} onClick={() => handleAnswer(answer)} disabled={!!(selectedAnswer && isCorrect)} className="w-full p-5 rounded-xl text-left font-bold shadow-sm text-lg" style={{ minHeight: 64, background: right ? SUCCESS : wrong ? '#FFE0D0' : CARD, color: right ? '#fff' : wrong ? '#999' : TEXT, border: !selected ? `2px solid ${BORDER}` : 'none', fontFamily: 'var(--font-inter)' }}>
                    {answer.text}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {item && phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 max-w-xs">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.6 }}>
              <NatureIcon color={item.svgColor} size={96} />
            </motion.div>
            <h3 style={{ color: item.svgColor, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl">Great Job!</h3>
            <div className="rounded-2xl p-3 shadow-sm text-center" style={{ background: CARD, border: `2px solid ${item.svgColor}40` }}>
              <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-sm">{item.fact}</p>
            </div>
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleNext} className="px-10 py-5 rounded-3xl text-white font-extrabold text-xl shadow-md" style={{ background: ACCENT, minHeight: 64 }}>
              {index + 1 >= TOTAL ? 'Finish' : 'Next Discovery'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
