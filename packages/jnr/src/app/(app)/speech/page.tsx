'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// -- Types -----------------------------------------------------------------

type Difficulty = 'early' | 'middle' | 'late';

interface Phoneme {
  id: string;
  sound: string;
  word: string;
  description: string;
  tips: string[];
  difficulty: Difficulty;
  practiceWords: string[];
}

// -- Phoneme data ----------------------------------------------------------
// difficulty: early (green) = mastered by age 3, middle (yellow) = age 4-5,
//             late (red) = age 6-8

const PHONEMES: Phoneme[] = [
  { id: 'b', sound: 'B', word: 'Ball', description: 'Press your lips together, then pop them open!', tips: ['Put your lips together tight', 'Feel the air build up', 'Pop your lips open like a bubble'], difficulty: 'early', practiceWords: ['Ball', 'Baby', 'Bus', 'Big', 'Bear'] },
  { id: 'm', sound: 'M', word: 'Mom', description: 'Close your lips and hum like a bee!', tips: ['Keep your lips together', 'Make a humming sound', 'Feel your lips tickle'], difficulty: 'early', practiceWords: ['Mom', 'Milk', 'Map', 'Moon', 'Mug'] },
  { id: 'p', sound: 'P', word: 'Pop', description: 'Push air out between your lips!', tips: ['Press lips together', 'Build up air pressure', 'Pop the air out quickly'], difficulty: 'early', practiceWords: ['Pop', 'Pig', 'Pan', 'Pea', 'Pin'] },
  { id: 'w', sound: 'W', word: 'Water', description: 'Round your lips like kissing!', tips: ['Lips round and small', 'Voice is on', 'Lips move to open'], difficulty: 'early', practiceWords: ['Water', 'Win', 'Wet', 'Web', 'Wig'] },
  { id: 'd', sound: 'D', word: 'Dog', description: 'Like T but with your voice on!', tips: ['Same tongue spot as T', 'Voice buzzes', 'Tap and release'], difficulty: 'early', practiceWords: ['Dog', 'Dig', 'Dip', 'Dot', 'Dew'] },
  { id: 'f', sound: 'F', word: 'Fish', description: 'Bite your bottom lip gently and blow!', tips: ['Top teeth touch bottom lip', 'Blow air out gently', 'Feel the air on your lip'], difficulty: 'middle', practiceWords: ['Fish', 'Fan', 'Fog', 'Fig', 'Fun'] },
  { id: 't', sound: 'T', word: 'Top', description: 'Tap the bumpy spot behind your teeth!', tips: ['Tongue tip taps behind teeth', 'Quick tap and release', 'No voice, just air'], difficulty: 'middle', practiceWords: ['Top', 'Ten', 'Tan', 'Tin', 'Tap'] },
  { id: 'k', sound: 'K', word: 'Cat', description: 'Push air from the back of your throat!', tips: ['Back of tongue touches soft part', 'Build up air', 'Release with a pop'], difficulty: 'middle', practiceWords: ['Cat', 'Kit', 'Cup', 'Cap', 'Key'] },
  { id: 'l', sound: 'L', word: 'Lemon', description: 'Touch the roof of your mouth with your tongue!', tips: ['Tongue tip touches the bumpy spot', 'Air goes around your tongue', 'Voice is on'], difficulty: 'middle', practiceWords: ['Lemon', 'Leg', 'Lid', 'Log', 'Lap'] },
  { id: 's', sound: 'S', word: 'Snake', description: 'Make a snake sound! Ssssss!', tips: ['Teeth close together', 'Tongue behind teeth', 'Blow air like a snake'], difficulty: 'middle', practiceWords: ['Snake', 'Sun', 'Sit', 'Sad', 'Sip'] },
  { id: 'sh', sound: 'SH', word: 'Shoe', description: 'Tell someone to be quiet! Shhhh!', tips: ['Lips pushed forward', 'Tongue flat in mouth', 'Blow soft air out'], difficulty: 'late', practiceWords: ['Shoe', 'Ship', 'Shop', 'Shed', 'Shell'] },
  { id: 'r', sound: 'R', word: 'Red', description: 'Curl your tongue back like a wave!', tips: ['Tongue tip curls back', 'Sides of tongue touch teeth', 'Make a growling sound'], difficulty: 'late', practiceWords: ['Red', 'Run', 'Rug', 'Rip', 'Rat'] },
  { id: 'th', sound: 'TH', word: 'Think', description: 'Stick your tongue out a little and blow!', tips: ['Tongue between your teeth', 'Blow air over your tongue', 'Feel your tongue tickle'], difficulty: 'late', practiceWords: ['Think', 'Thin', 'That', 'Then', 'This'] },
  { id: 'ch', sound: 'CH', word: 'Cheese', description: 'Start with T then slide to SH!', tips: ['T + SH together', 'Quick burst of air', 'Lips round forward'], difficulty: 'late', practiceWords: ['Cheese', 'Chin', 'Chop', 'Chat', 'Chip'] },
];

// -- Difficulty config -----------------------------------------------------

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; bg: string; text: string; border: string; activeBg: string }> = {
  early:  { label: 'Early',  bg: '#F0FDF4', text: '#15803D', border: '#86EFAC', activeBg: '#16A34A' },
  middle: { label: 'Middle', bg: '#FEFCE8', text: '#A16207', border: '#FDE047', activeBg: '#CA8A04' },
  late:   { label: 'Late',   bg: '#FFF1F2', text: '#BE123C', border: '#FCA5A5', activeBg: '#E11D48' },
};

// -- Browser TTS -----------------------------------------------------------

function speak(text: string, rate = 0.8, pitch = 1.1) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = pitch;
  window.speechSynthesis.speak(u);
}

// -- Modes -----------------------------------------------------------------

type Mode = 'explore' | 'practice';

// -- Main page -------------------------------------------------------------

export default function SpeechTherapyPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('explore');
  const [selected, setSelected] = useState<Phoneme>(PHONEMES[0]);
  const [tipIdx, setTipIdx] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);
  const [practiceWordIdx, setPracticeWordIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const handleSpeak = useCallback((text: string) => {
    setIsSpeaking(true);
    speak(text);
    setTimeout(() => setIsSpeaking(false), 800);
  }, []);

  const handlePracticeWord = useCallback(() => {
    const word = selected.practiceWords[practiceWordIdx];
    setPracticeCount((c) => c + 1);
    speak(word, 0.7, 1.15);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 900);
  }, [selected, practiceWordIdx]);

  const nextPracticeWord = useCallback(() => {
    setPracticeWordIdx((i) => (i + 1) % selected.practiceWords.length);
  }, [selected]);

  const selectPhoneme = (p: Phoneme) => {
    setSelected(p);
    setTipIdx(0);
    setPracticeWordIdx(0);
    setPracticeCount(0);
  };

  const nextTip = () => setTipIdx((i) => (i + 1) % selected.tips.length);
  const prevTip = () => setTipIdx((i) => (i - 1 + selected.tips.length) % selected.tips.length);

  const diff = DIFFICULTY_CONFIG[selected.difficulty];

  const visiblePhonemes = filter === 'all' ? PHONEMES : PHONEMES.filter((p) => p.difficulty === filter);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden" style={{ backgroundColor: '#FFFDF9' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0 text-white" style={{ backgroundColor: '#E8610A' }}>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-white"
          style={{ minWidth: 80, minHeight: 44 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-fraunces)' }}>Back</span>
        </button>
        <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-fraunces)' }}>
          Speech
        </span>
        <div style={{ width: 80 }} />
      </header>

      {/* Mode toggle */}
      <div className="flex gap-2 px-4 pt-3 pb-1 shrink-0">
        {(['explore', 'practice'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 py-2.5 rounded-2xl font-semibold text-base capitalize transition-all"
            style={{
              backgroundColor: mode === m ? '#E8610A' : '#F0EDE8',
              color: mode === m ? '#fff' : '#5C4D3C',
              fontFamily: 'var(--font-fraunces)',
            }}
          >
            {m === 'explore' ? 'Learn' : 'Practice'}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 px-4 py-2 shrink-0">
        {(['all', 'early', 'middle', 'late'] as const).map((d) => {
          const isActive = filter === d;
          const cfg = d !== 'all' ? DIFFICULTY_CONFIG[d] : null;
          return (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all border"
              style={{
                backgroundColor: isActive ? (cfg ? cfg.activeBg : '#E8610A') : (cfg ? cfg.bg : '#F0EDE8'),
                color: isActive ? '#fff' : (cfg ? cfg.text : '#5C4D3C'),
                borderColor: isActive ? 'transparent' : (cfg ? cfg.border : '#D9CFC4'),
              }}
            >
              {d === 'all' ? 'All' : `${cfg!.label}`}
            </button>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">

        {/* Active phoneme card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl p-5 shadow-md text-center"
            style={{ backgroundColor: diff.bg, borderWidth: 2, borderColor: diff.border }}
          >
            <div className="text-6xl font-black mb-1" style={{ color: diff.activeBg, fontFamily: 'var(--font-fraunces)' }}>
              {selected.sound}
            </div>
            <div
              className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2"
              style={{ backgroundColor: diff.activeBg, color: '#fff' }}
            >
              {diff.label} sound
            </div>
            <div className="text-xl font-bold mb-1" style={{ color: '#2D1F14', fontFamily: 'var(--font-fraunces)' }}>
              {selected.word}
            </div>
            <p className="text-base mb-4" style={{ color: '#5C4D3C' }}>{selected.description}</p>

            {mode === 'explore' ? (
              <div className="flex justify-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSpeak(selected.sound)}
                  disabled={isSpeaking}
                  className="px-6 py-3 rounded-2xl font-bold text-lg shadow disabled:opacity-60 text-white"
                  style={{ backgroundColor: diff.activeBg, minHeight: 44 }}
                >
                  Hear it
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleSpeak(selected.word)}
                  disabled={isSpeaking}
                  className="px-6 py-3 rounded-2xl font-bold text-lg shadow disabled:opacity-60 text-white"
                  style={{ backgroundColor: '#E8610A', minHeight: 44 }}
                >
                  Say word
                </motion.button>
              </div>
            ) : (
              /* Practice mode: big word tap to hear */
              <div className="space-y-3">
                <p className="text-sm font-medium" style={{ color: '#9A8878' }}>Tap the word to hear it, then you try!</p>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handlePracticeWord}
                  disabled={isSpeaking}
                  className="w-full py-5 rounded-2xl font-black text-3xl shadow-md disabled:opacity-60 text-white"
                  style={{ backgroundColor: diff.activeBg, fontFamily: 'var(--font-fraunces)', minHeight: 80 }}
                >
                  {selected.practiceWords[practiceWordIdx]}
                </motion.button>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={nextPracticeWord}
                    className="px-5 py-2.5 rounded-xl font-semibold text-base"
                    style={{ backgroundColor: '#F0EDE8', color: '#5C4D3C', minHeight: 44 }}
                  >
                    Next word
                  </button>
                </div>
                {practiceCount > 0 && (
                  <div className="text-sm font-medium" style={{ color: diff.text }}>
                    {practiceCount} {practiceCount === 1 ? 'try' : 'tries'} this session
                    {practiceCount % 5 === 0 ? ' - Amazing work!' : ''}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tips carousel (explore mode only) */}
        {mode === 'explore' && (
          <div className="rounded-2xl p-4" style={{ backgroundColor: '#F5F0EA' }}>
            <div className="flex items-center justify-between">
              <button
                onClick={prevTip}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center font-bold text-xl"
                style={{ color: '#5C4D3C', minHeight: 44, minWidth: 44 }}
              >
                &lsaquo;
              </button>
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex-1 text-center px-3 text-base font-medium"
                  style={{ color: '#2D1F14' }}
                >
                  Tip: {selected.tips[tipIdx]}
                </motion.p>
              </AnimatePresence>
              <button
                onClick={nextTip}
                className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center font-bold text-xl"
                style={{ color: '#5C4D3C', minHeight: 44, minWidth: 44 }}
              >
                &rsaquo;
              </button>
            </div>
            <div className="flex justify-center gap-1.5 mt-3">
              {selected.tips.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ backgroundColor: i === tipIdx ? diff.activeBg : '#D9CFC4' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phoneme selector strip */}
      <div className="shrink-0 border-t px-4 py-3" style={{ backgroundColor: 'rgba(255,253,249,0.95)', borderColor: '#E8E0D6' }}>
        <p className="text-xs text-center mb-2" style={{ color: '#9A8878' }}>Choose a sound:</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {visiblePhonemes.map((p) => {
            const cfg = DIFFICULTY_CONFIG[p.difficulty];
            const isActive = selected.id === p.id;
            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => selectPhoneme(p)}
                className="flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold transition-all"
                style={{
                  backgroundColor: isActive ? cfg.activeBg : cfg.bg,
                  color: isActive ? '#fff' : cfg.text,
                  borderWidth: 2,
                  borderColor: isActive ? 'transparent' : cfg.border,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <span className="text-xl" style={{ fontFamily: 'var(--font-fraunces)' }}>{p.sound}</span>
                <span className="text-[9px] opacity-80">{p.word}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
