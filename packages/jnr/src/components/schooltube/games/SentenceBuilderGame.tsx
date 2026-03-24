'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';

/* ── TTS helper ── */
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
type WordOption = { word: string; isCorrect: boolean };
type Challenge = {
  prefix: string;
  suffix: string;
  hint: string;
  options: WordOption[];
  fullSentence: string;
};

const challenges: Challenge[] = [
  { prefix: 'The', suffix: 'is sleeping.', hint: 'It purrs and meows', options: [{ word: 'cat', isCorrect: true }, { word: 'bus', isCorrect: false }, { word: 'tree', isCorrect: false }], fullSentence: 'The cat is sleeping.' },
  { prefix: 'I see a big', suffix: 'in the sky.', hint: 'It floats and is fluffy', options: [{ word: 'cloud', isCorrect: true }, { word: 'fish', isCorrect: false }, { word: 'chair', isCorrect: false }], fullSentence: 'I see a big cloud in the sky.' },
  { prefix: 'The', suffix: 'is very cold.', hint: 'You make snowballs with it', options: [{ word: 'fire', isCorrect: false }, { word: 'snow', isCorrect: true }, { word: 'cake', isCorrect: false }], fullSentence: 'The snow is very cold.' },
  { prefix: 'I love to eat', suffix: 'for breakfast.', hint: 'Yellow and sweet fruit', options: [{ word: 'banana', isCorrect: true }, { word: 'car', isCorrect: false }, { word: 'rock', isCorrect: false }], fullSentence: 'I love to eat banana for breakfast.' },
  { prefix: 'The', suffix: 'roars very loudly.', hint: 'King of the jungle', options: [{ word: 'duck', isCorrect: false }, { word: 'butterfly', isCorrect: false }, { word: 'lion', isCorrect: true }], fullSentence: 'The lion roars very loudly.' },
  { prefix: 'We play in the', suffix: 'after school.', hint: 'Swings and slides are there', options: [{ word: 'park', isCorrect: true }, { word: 'moon', isCorrect: false }, { word: 'ocean', isCorrect: false }], fullSentence: 'We play in the park after school.' },
  { prefix: 'It rains and I use my', suffix: 'to stay dry.', hint: 'You hold it above your head', options: [{ word: 'sandwich', isCorrect: false }, { word: 'umbrella', isCorrect: true }, { word: 'window', isCorrect: false }], fullSentence: 'It rains and I use my umbrella to stay dry.' },
  { prefix: 'My favourite colour is', suffix: 'like the sky.', hint: 'Clear sky or ocean colour', options: [{ word: 'blue', isCorrect: true }, { word: 'loud', isCorrect: false }, { word: 'fast', isCorrect: false }], fullSentence: 'My favourite colour is blue like the sky.' },
];

const TOTAL = challenges.length;

export function SentenceBuilderGame({ onScore, onComplete }: GameProps) {
  const [ci, setCi] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [done, setDone] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const delay = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.current.push(t); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const ch = challenges[ci] ?? null;

  const speakChallenge = useCallback((c: Challenge) => {
    speak(`${c.prefix} blank ${c.suffix}. Hint: ${c.hint}`);
  }, []);

  useEffect(() => { if (ch) delay(() => speakChallenge(ch), 500); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWordSelect = (opt: WordOption) => {
    if (selectedWord) return;
    setSelectedWord(opt.word);
    speak(opt.word);
    vibrate(20);

    if (opt.isCorrect) {
      setIsCorrect(true);
      onScore();
      setWrongAttempts(0);
      delay(() => {
        setShowCelebration(true);
        if (ch) speak(ch.fullSentence);
        vibrate([30, 30, 30]);
      }, 600);
    } else {
      setIsCorrect(false);
      if (ch) speak(`Not quite! ${ch.hint}. Try again!`);
      setWrongAttempts((p) => p + 1);
      delay(() => { setSelectedWord(null); setIsCorrect(null); }, 900);
    }
  };

  const handleNext = () => {
    if (ci + 1 >= TOTAL) {
      setDone(true);
      vibrate([50, 50, 50]);
      speak('You built every sentence! Amazing language skills!');
      delay(() => onComplete(), 2500);
      return;
    }
    const next = ci + 1;
    setCi(next);
    setSelectedWord(null);
    setIsCorrect(null);
    setShowCelebration(false);
    setWrongAttempts(0);
    vibrate(20);
    delay(() => speakChallenge(challenges[next]), 400);
  };

  if (done) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-6" style={{ background: BG }}>
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <svg width="80" height="80" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="16" fill={ACCENT} /><text x="50" y="60" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="bold">A+</text></svg>
        </motion.div>
        <h2 style={{ color: TEXT, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl text-center">Sentence Superstar!</h2>
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }}>You built {TOTAL} perfect sentences!</p>
      </div>
    );
  }

  const progress = ci / TOTAL;

  return (
    <div className="h-full flex flex-col items-center gap-4 p-4 overflow-y-auto" style={{ background: BG }}>
      {/* Progress */}
      <div className="w-full max-w-sm">
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-xs mb-1 flex justify-between">
          <span>Sentence {ci + 1} of {TOTAL}</span>
          <span>{Math.round(progress * 100)}%</span>
        </p>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: BORDER }}>
          <motion.div className="h-full rounded-full" style={{ background: ACCENT }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {ch && !showCelebration && (
          <motion.div key={`ch-${ci}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-5 w-full max-w-sm">
            {/* Sentence with blank */}
            <div className="rounded-2xl p-4 w-full shadow-sm" style={{ background: CARD, border: `2px solid ${ACCENT}40` }}>
              <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-xs mb-2 text-center uppercase tracking-wide opacity-60">Complete the sentence:</p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold leading-relaxed text-center" style={{ fontFamily: 'var(--font-inter)' }}>
                <span style={{ color: TEXT }}>{ch.prefix}</span>
                <AnimatePresence mode="wait">
                  {selectedWord && isCorrect ? (
                    <motion.span key="filled" initial={{ scale: 0 }} animate={{ scale: 1 }} className="px-3 py-1 rounded-lg text-white" style={{ background: SUCCESS }}>{selectedWord}</motion.span>
                  ) : (
                    <motion.span key="blank" animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="px-4 py-1 rounded-lg border-2 border-dashed min-w-[80px] text-center" style={{ background: `${ACCENT}15`, borderColor: ACCENT, color: ACCENT }}>
                      {selectedWord && !isCorrect ? (
                        <motion.span animate={{ x: [-4, 4, -4, 0] }} transition={{ duration: 0.3 }} style={{ color: '#cc4444' }}>{selectedWord}</motion.span>
                      ) : '___?'}
                    </motion.span>
                  )}
                </AnimatePresence>
                <span style={{ color: TEXT }}>{ch.suffix}</span>
              </div>
            </div>

            {/* Hint */}
            <div className="rounded-xl px-4 py-2" style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30` }}>
              <p style={{ color: ACCENT, fontFamily: 'var(--font-inter)' }} className="text-sm font-medium text-center">Hint: {ch.hint}</p>
            </div>

            {wrongAttempts >= 2 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-center font-medium" style={{ color: ACCENT }}>Keep trying! Look at the hint!</motion.p>
            )}

            {/* Word options */}
            <div className="flex gap-4 justify-center flex-wrap">
              {ch.options.map((opt, i) => (
                <motion.button key={opt.word} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleWordSelect(opt)} disabled={!!(selectedWord && isCorrect)} className="flex flex-col items-center gap-1 w-24 py-5 rounded-2xl font-bold text-lg shadow-sm" style={{ minHeight: 80, background: selectedWord === opt.word && isCorrect ? SUCCESS : CARD, color: selectedWord === opt.word && isCorrect ? '#fff' : TEXT, border: `2px solid ${BORDER}`, fontFamily: 'var(--font-inter)' }}>
                  <span>{opt.word}</span>
                </motion.button>
              ))}
            </div>

            <motion.button whileTap={{ scale: 0.92 }} onClick={() => { if (ch) speakChallenge(ch); vibrate(20); }} className="px-5 py-3 rounded-2xl font-bold text-sm shadow-sm" style={{ background: BORDER, color: TEXT, minHeight: 48, fontFamily: 'var(--font-inter)' }}>
              Read It Again
            </motion.button>
          </motion.div>
        )}

        {ch && showCelebration && (
          <motion.div key="celebrate" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 w-full max-w-sm">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: 3, duration: 0.6 }}>
              <svg width="72" height="72" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill={SUCCESS} /><text x="50" y="60" textAnchor="middle" fill="#fff" fontSize="40" fontWeight="bold">!</text></svg>
            </motion.div>
            <div className="rounded-2xl p-4 w-full text-center shadow-sm" style={{ background: `${SUCCESS}15`, border: `2px solid ${SUCCESS}40` }}>
              <p style={{ color: SUCCESS, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-xl">&quot;{ch.fullSentence}&quot;</p>
            </div>
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleNext} className="px-10 py-5 rounded-3xl text-white font-extrabold text-xl shadow-md" style={{ background: ACCENT, minHeight: 64 }}>
              {ci + 1 >= TOTAL ? 'Finish' : 'Next Sentence'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
