'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';

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
type RhymeChallenge = {
  targetWord: string;
  color: string;
  rhymeEnding: string;
  rhymingWords: { word: string }[];
  nonRhymingWords: { word: string }[];
};

const challenges: RhymeChallenge[] = [
  { targetWord: 'Cat', color: '#FF6B6B', rhymeEnding: '-at', rhymingWords: [{ word: 'Hat' }, { word: 'Bat' }, { word: 'Mat' }], nonRhymingWords: [{ word: 'Dog' }, { word: 'Car' }, { word: 'Bird' }] },
  { targetWord: 'Star', color: '#FFE66D', rhymeEnding: '-ar', rhymingWords: [{ word: 'Car' }, { word: 'Jar' }, { word: 'Bar' }], nonRhymingWords: [{ word: 'Sun' }, { word: 'Ball' }, { word: 'Moon' }] },
  { targetWord: 'Bee', color: '#4ECDC4', rhymeEnding: '-ee', rhymingWords: [{ word: 'Tree' }, { word: 'Key' }, { word: 'Sea' }], nonRhymingWords: [{ word: 'Bug' }, { word: 'Bird' }, { word: 'Rock' }] },
  { targetWord: 'Moon', color: '#686DE0', rhymeEnding: '-oon', rhymingWords: [{ word: 'Spoon' }, { word: 'Balloon' }, { word: 'Tune' }], nonRhymingWords: [{ word: 'Star' }, { word: 'Night' }, { word: 'Dark' }] },
  { targetWord: 'Fish', color: '#74B9FF', rhymeEnding: '-ish', rhymingWords: [{ word: 'Dish' }, { word: 'Wish' }, { word: 'Swish' }], nonRhymingWords: [{ word: 'Sea' }, { word: 'Boat' }, { word: 'Wave' }] },
  { targetWord: 'Dog', color: '#E8A87C', rhymeEnding: '-og', rhymingWords: [{ word: 'Log' }, { word: 'Fog' }, { word: 'Frog' }], nonRhymingWords: [{ word: 'Cat' }, { word: 'Run' }, { word: 'Bone' }] },
];

const TOTAL = challenges.length;

export function RhymeTimeGame({ onScore, onComplete }: GameProps) {
  const [ci, setCi] = useState(0);
  const [options, setOptions] = useState<{ word: string; isRhyme: boolean }[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const delay = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.current.push(t); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const challenge = challenges[ci] ?? null;

  const setupRound = useCallback((idx: number) => {
    const c = challenges[idx];
    if (!c) return;
    const opts = shuffleArray([
      ...c.rhymingWords.map((w) => ({ ...w, isRhyme: true })),
      ...c.nonRhymingWords.map((w) => ({ ...w, isRhyme: false })),
    ]);
    setOptions(opts);
    setFound([]);
    setWrong([]);
    setShowResult(false);
    delay(() => speak(`Find the words that rhyme with ${c.targetWord}! They end in ${c.rhymeEnding}!`), 400);
  }, []);

  useEffect(() => { setupRound(0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = (opt: { word: string; isRhyme: boolean }) => {
    if (found.includes(opt.word) || wrong.includes(opt.word)) return;
    vibrate(20);

    if (opt.isRhyme) {
      const next = [...found, opt.word];
      setFound(next);
      speak(`Yes! ${opt.word} rhymes!`);
      onScore();
      if (next.length >= (challenge?.rhymingWords.length ?? 0)) {
        delay(() => {
          setShowResult(true);
          vibrate([30, 30, 30]);
          speak(`Amazing! You found all the ${challenge?.rhymeEnding} words!`);
        }, 600);
      }
    } else {
      setWrong((p) => [...p, opt.word]);
      speak(`${opt.word} doesn't rhyme. Keep looking!`);
      delay(() => setWrong((p) => p.filter((w) => w !== opt.word)), 1000);
    }
  };

  const handleNext = () => {
    if (ci + 1 >= TOTAL) {
      setDone(true);
      vibrate([50, 50, 50]);
      speak('You are a rhyming superstar!');
      delay(() => onComplete(), 2500);
      return;
    }
    const next = ci + 1;
    setCi(next);
    vibrate(20);
    setupRound(next);
  };

  if (done) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-6" style={{ background: BG }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <svg width="80" height="80" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill={ACCENT} /><text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="36" fontWeight="bold">R</text></svg>
        </motion.div>
        <h2 style={{ color: TEXT, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl text-center">Rhyme Champion!</h2>
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }}>You found all the rhymes!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center gap-4 p-4 overflow-y-auto" style={{ background: BG }}>
      {/* Progress */}
      <div className="w-full max-w-xs">
        <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-xs mb-1 flex justify-between">
          <span>Round {ci + 1} of {TOTAL}</span>
          <span>Found: {found.length}/{challenge?.rhymingWords.length ?? 0}</span>
        </p>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: BORDER }}>
          <motion.div className="h-full rounded-full" style={{ background: ACCENT }} animate={{ width: `${(ci / TOTAL) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      {challenge && (
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key={`ch-${ci}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 w-full max-w-xs">
              {/* Target word */}
              <div className="text-center">
                <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-sm mb-2">Find words that rhyme with:</p>
                <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-28 h-28 rounded-3xl flex flex-col items-center justify-center shadow-md mx-auto" style={{ background: `${challenge.color}25`, border: `2px solid ${challenge.color}40` }}>
                  <span style={{ color: challenge.color, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl">{challenge.targetWord}</span>
                </motion.div>
                <div className="mt-2 px-3 py-1 rounded-full text-sm font-bold text-white inline-block" style={{ background: challenge.color }}>
                  ends in {challenge.rhymeEnding}
                </div>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {options.map((opt) => {
                  const isFound = found.includes(opt.word);
                  const isWrong = wrong.includes(opt.word);
                  return (
                    <motion.button key={opt.word} whileTap={{ scale: 0.88 }} animate={isFound ? { scale: [1, 1.1, 1] } : isWrong ? { x: [-4, 4, -4, 0] } : {}} onClick={() => handleTap(opt)} disabled={isFound} className="py-5 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm font-bold text-base" style={{ minHeight: 80, background: isFound ? SUCCESS : isWrong ? '#FFE0D0' : CARD, color: isFound ? '#fff' : isWrong ? '#999' : TEXT, border: !isFound && !isWrong ? `2px solid ${BORDER}` : 'none', fontFamily: 'var(--font-inter)' }}>
                      <span>{opt.word}</span>
                      {isFound && <span className="text-xs">rhymes!</span>}
                    </motion.button>
                  );
                })}
              </div>

              {/* Progress chips */}
              <div className="flex gap-2 justify-center">
                {challenge.rhymingWords.map((w) => (
                  <div key={w.word} className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: found.includes(w.word) ? SUCCESS : BORDER, color: found.includes(w.word) ? '#fff' : '#999' }}>
                    {found.includes(w.word) ? w.word : `?${challenge.rhymeEnding}`}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5 w-full max-w-xs">
              <svg width="72" height="72" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill={challenge.color} /><text x="50" y="60" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="bold">OK</text></svg>
              <h3 style={{ color: challenge.color, fontFamily: 'var(--font-fraunces)', fontWeight: 700 }} className="text-3xl">All Found!</h3>
              <div className="rounded-2xl p-4 w-full" style={{ background: CARD, border: `2px solid ${BORDER}` }}>
                <p style={{ color: TEXT, fontFamily: 'var(--font-inter)' }} className="text-center text-sm mb-2">Words that rhyme with {challenge.targetWord}:</p>
                <div className="flex justify-center gap-4 flex-wrap">
                  {challenge.rhymingWords.map((w) => (
                    <motion.span key={w.word} initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-bold text-lg" style={{ color: challenge.color, fontFamily: 'var(--font-fraunces)' }}>{w.word}</motion.span>
                  ))}
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.92 }} onClick={handleNext} className="px-10 py-5 rounded-3xl text-white font-extrabold text-xl shadow-md" style={{ background: ACCENT, minHeight: 64 }}>
                {ci + 1 >= TOTAL ? 'Finish' : 'Next Rhymes'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
