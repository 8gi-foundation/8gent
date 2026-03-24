'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

/* ── TTS helper ── */
function speakWord(text: string, rate = 0.65, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = 1.1;
  if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
  window.speechSynthesis.speak(u);
}

function speak(text: string) { speakWord(text, 0.85); }

/* ── Palette ── */
const BG = '#FFFDF9';
const TEXT = '#1A1612';
const CARD = '#FFF8F0';
const BORDER = '#E8E0D6';
const ACCENT = '#E8610A';
const SUCCESS = '#4CAF50';
const PURPLE = '#9B59B6';

/* ── Data ── */
type Word = { word: string; syllables: string; color: string };

const words: Word[] = [
  { word: 'Ball', syllables: 'ball', color: '#FF6B6B' },
  { word: 'Cat', syllables: 'cat', color: '#FFB347' },
  { word: 'Dog', syllables: 'dog', color: '#E8A87C' },
  { word: 'Apple', syllables: 'ap-ple', color: '#FF6B6B' },
  { word: 'Banana', syllables: 'ba-na-na', color: '#FFE66D' },
  { word: 'Elephant', syllables: 'el-e-phant', color: '#95E1D3' },
  { word: 'Rainbow', syllables: 'rain-bow', color: '#DDA0DD' },
  { word: 'Butterfly', syllables: 'but-ter-fly', color: '#9B59B6' },
  { word: 'Umbrella', syllables: 'um-brel-la', color: '#74B9FF' },
  { word: 'Dinosaur', syllables: 'di-no-saur', color: '#4ECDC4' },
  { word: 'Watermelon', syllables: 'wa-ter-mel-on', color: '#2ECC71' },
  { word: 'Strawberry', syllables: 'straw-ber-ry', color: '#FF6B6B' },
  { word: 'Octopus', syllables: 'oc-to-pus', color: '#686DE0' },
];

const TOTAL_WORDS = 8;
const REPEATS_NEEDED = 3;

export function WordRepeatGame({ onScore, onComplete }: GameProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [repeatCount, setRepeatCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [wordPool] = useState(() => shuffleArray([...words]).slice(0, TOTAL_WORDS));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completedRef = useRef<string[]>([]);
  const poolIdx = useRef(0);

  const delay = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.current.push(t); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const hearWord = useCallback((w: string) => {
    setIsSpeaking(true);
    vibrate(20);
    speakWord(w, 0.65, () => setIsSpeaking(false));
  }, []);

  const pickNext = useCallback(() => {
    if (poolIdx.current >= TOTAL_WORDS) {
      setCelebration(true);
      vibrate([50, 50, 50]);
      speak('Incredible! You practiced all the words! Your voice is amazing!');
      delay(() => onComplete(), 2500);
      return;
    }
    const next = wordPool[poolIdx.current];
    poolIdx.current += 1;
    setCurrentWord(next);
    setRepeatCount(0);
    setShowStars(false);
    delay(() => hearWord(next.word), 500);
  }, [wordPool, hearWord, onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { pickNext(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaidIt = () => {
    if (!currentWord) return;
    const newCount = repeatCount + 1;
    setRepeatCount(newCount);
    vibrate(20);

    const encouragements = ['Great! Say it again!', 'Beautiful! One more time!', 'Perfect!'];
    if (newCount < REPEATS_NEEDED) speak(encouragements[newCount - 1] ?? '');

    if (newCount >= REPEATS_NEEDED) {
      setShowStars(true);
      vibrate([30, 30, 30]);
      speak(`Amazing! You said ${currentWord.word} perfectly!`);
      onScore();
      delay(() => {
        const newCompleted = [...completedRef.current, currentWord.word];
        completedRef.current = newCompleted;
        setCompletedWords(newCompleted);
        pickNext();
      }, 1800);
    }
  };

  const progress = completedWords.length / TOTAL_WORDS;

  if (celebration) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-6" style={{ background: BG }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
          <svg width="80" height="80" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill={PURPLE} /><text x="50" y="60" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="bold">WR</text></svg>
        </motion.div>
        <h2 style={{ color: TEXT, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl text-center">Word Master!</h2>
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-lg">You practiced {TOTAL_WORDS} words!</p>
        <div className="flex flex-wrap justify-center gap-2">
          {wordPool.map((w) => (
            <motion.div key={w.word} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: Math.random() * 0.4 }} className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ background: w.color }}>
              {w.word}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center gap-4 p-4 overflow-y-auto" style={{ background: BG }}>
      {/* Progress */}
      <div className="w-full max-w-xs">
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-xs mb-1 flex justify-between">
          <span>{completedWords.length} done</span>
          <span>{TOTAL_WORDS - completedWords.length} left</span>
        </p>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: BORDER }}>
          <motion.div className="h-full rounded-full" style={{ background: PURPLE }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentWord && !showStars && (
          <motion.div key={currentWord.word} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-5 w-full">
            {/* Word display */}
            <motion.div animate={isSpeaking ? { scale: [1, 1.06, 1] } : {}} transition={isSpeaking ? { repeat: Infinity, duration: 0.4 } : {}} className="w-40 h-40 rounded-3xl flex items-center justify-center shadow-md" style={{ background: `${currentWord.color}20`, border: `3px solid ${currentWord.color}60` }}>
              <svg width="80" height="80" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill={currentWord.color} opacity={0.8} /></svg>
            </motion.div>

            {/* Word with syllables */}
            <div className="text-center">
              <motion.h2 animate={isSpeaking ? { color: [currentWord.color, `${currentWord.color}80`, currentWord.color] } : {}} transition={isSpeaking ? { repeat: Infinity, duration: 0.5 } : {}} className="text-4xl" style={{ color: currentWord.color, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }}>
                {currentWord.word}
              </motion.h2>
              <p className="text-sm mt-1 tracking-widest" style={{ color: BORDER, fontFamily: 'var(--font-inter)' }}>{currentWord.syllables}</p>
            </div>

            {/* Repeat dots */}
            <div className="flex items-center gap-3">
              {Array.from({ length: REPEATS_NEEDED }).map((_, i) => (
                <motion.div key={i} animate={i < repeatCount ? { scale: [0, 1.3, 1] } : {}} className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold" style={{ background: i < repeatCount ? SUCCESS : BORDER, color: i < repeatCount ? '#fff' : '#999', fontFamily: 'var(--font-inter)' }}>
                  {i < repeatCount ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : i + 1}
                </motion.div>
              ))}
            </div>
            <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-base">
              Say it <strong>{REPEATS_NEEDED - repeatCount}</strong> more {REPEATS_NEEDED - repeatCount === 1 ? 'time' : 'times'}!
            </p>

            {/* Buttons */}
            <div className="flex gap-4">
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => { if (currentWord && !isSpeaking) hearWord(currentWord.word); }} disabled={isSpeaking} className="px-5 py-4 rounded-2xl font-bold text-lg shadow-sm flex items-center gap-2 disabled:opacity-50" style={{ background: '#FFE66D', color: TEXT, minHeight: 64, fontFamily: 'var(--font-inter)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                Hear It
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={handleSaidIt} className="px-6 py-4 rounded-2xl text-white font-extrabold text-lg shadow-md flex items-center gap-2" style={{ background: PURPLE, minHeight: 64, fontFamily: 'var(--font-inter)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                I Said It!
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentWord && showStars && (
          <motion.div key="stars" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 3, duration: 0.5 }}>
              <svg width="72" height="72" viewBox="0 0 100 100"><polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={SUCCESS} /></svg>
            </motion.div>
            <h3 className="text-4xl" style={{ color: currentWord.color, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }}>{currentWord.word}!</h3>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}>
                  <svg width="32" height="32" viewBox="0 0 100 100"><polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="#FFE66D" /></svg>
                </motion.div>
              ))}
            </div>
            <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-lg">Getting next word...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
