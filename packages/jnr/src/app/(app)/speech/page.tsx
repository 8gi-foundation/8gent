'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// -- Phoneme data ----------------------------------------------------------

interface Phoneme {
  id: string;
  sound: string;
  word: string;
  description: string;
  tips: string[];
}

const PHONEMES: Phoneme[] = [
  { id: 'b', sound: 'B', word: 'Ball', description: 'Press your lips together, then pop them open!', tips: ['Put your lips together tight', 'Feel the air build up', 'Pop your lips open like a bubble'] },
  { id: 'm', sound: 'M', word: 'Mom', description: 'Close your lips and hum like a bee!', tips: ['Keep your lips together', 'Make a humming sound', 'Feel your lips tickle'] },
  { id: 'p', sound: 'P', word: 'Pop', description: 'Push air out between your lips!', tips: ['Press lips together', 'Build up air pressure', 'Pop the air out quickly'] },
  { id: 'f', sound: 'F', word: 'Fish', description: 'Bite your bottom lip gently and blow!', tips: ['Top teeth touch bottom lip', 'Blow air out gently', 'Feel the air on your lip'] },
  { id: 'th', sound: 'TH', word: 'Thank', description: 'Stick your tongue out a little and blow!', tips: ['Tongue between your teeth', 'Blow air over your tongue', 'Feel your tongue tickle'] },
  { id: 's', sound: 'S', word: 'Snake', description: 'Make a snake sound! Ssssss!', tips: ['Teeth close together', 'Tongue behind teeth', 'Blow air like a snake'] },
  { id: 'sh', sound: 'SH', word: 'Shoe', description: 'Tell someone to be quiet! Shhhh!', tips: ['Lips pushed forward', 'Tongue flat in mouth', 'Blow soft air out'] },
  { id: 'r', sound: 'R', word: 'Red', description: 'Curl your tongue back like a wave!', tips: ['Tongue tip curls back', 'Sides of tongue touch teeth', 'Make a growling sound'] },
  { id: 'l', sound: 'L', word: 'Lemon', description: 'Touch the roof of your mouth with your tongue!', tips: ['Tongue tip touches the bumpy spot', 'Air goes around your tongue', 'Voice is on'] },
  { id: 'k', sound: 'K', word: 'Cat', description: 'Push air from the back of your throat!', tips: ['Back of tongue touches soft part', 'Build up air', 'Release with a pop'] },
  { id: 't', sound: 'T', word: 'Top', description: 'Tap the bumpy spot behind your teeth!', tips: ['Tongue tip taps behind teeth', 'Quick tap and release', 'No voice, just air'] },
  { id: 'd', sound: 'D', word: 'Dog', description: 'Like T but with your voice on!', tips: ['Same tongue spot as T', 'Voice buzzes', 'Tap and release'] },
  { id: 'w', sound: 'W', word: 'Water', description: 'Round your lips like kissing!', tips: ['Lips round and small', 'Voice is on', 'Lips move to open'] },
  { id: 'ch', sound: 'CH', word: 'Cheese', description: 'Start with T then slide to SH!', tips: ['T + SH together', 'Quick burst of air', 'Lips round forward'] },
];

// -- Browser TTS helper ----------------------------------------------------

function speak(text: string, rate = 0.75, pitch = 1.2) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = pitch;
  window.speechSynthesis.speak(u);
}

// -- Main page -------------------------------------------------------------

export default function SpeechTherapyPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Phoneme>(PHONEMES[0]);
  const [tipIdx, setTipIdx] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Speak via API (ElevenLabs) with browser TTS fallback
  const handleSpeak = useCallback(async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/jr/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, stability: 0.7, similarityBoost: 0.8 }),
      });
      if (res.ok && res.status !== 204) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
        audio.onerror = () => { setIsSpeaking(false); speak(text); };
        await audio.play();
        return;
      }
    } catch { /* fall through */ }
    speak(text);
    setIsSpeaking(false);
  }, []);

  const handlePractice = useCallback(() => {
    setPracticeCount((c) => c + 1);
    handleSpeak(`${selected.sound}. ${selected.word}. ${selected.description}`);
  }, [selected, handleSpeak]);

  const nextTip = () => setTipIdx((i) => (i + 1) % selected.tips.length);
  const prevTip = () => setTipIdx((i) => (i - 1 + selected.tips.length) % selected.tips.length);

  const selectPhoneme = (p: Phoneme) => {
    setSelected(p);
    setTipIdx(0);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-100 to-indigo-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-sky-500 text-white">
        <button onClick={() => router.back()} className="font-semibold text-sm">
          &larr; Back
        </button>
        <h1 className="text-lg font-bold">Speech Helper</h1>
        <div className="text-sm font-medium opacity-80">
          {practiceCount > 0 ? `${practiceCount} tries` : ''}
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Active phoneme display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white rounded-3xl p-6 shadow-lg text-center"
          >
            {/* Big sound + word */}
            <div className="text-6xl font-black text-sky-600 mb-1">{selected.sound}</div>
            <div className="text-2xl font-bold text-gray-700 mb-3">{selected.word}</div>
            <p className="text-lg text-gray-600 mb-5">{selected.description}</p>

            {/* Listen + Practice buttons */}
            <div className="flex justify-center gap-3 mb-4">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleSpeak(selected.word)}
                disabled={isSpeaking}
                className="px-6 py-3 rounded-2xl bg-green-500 text-white font-bold text-lg shadow-md disabled:opacity-60"
              >
                Listen
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handlePractice}
                disabled={isSpeaking}
                className="px-6 py-3 rounded-2xl bg-sky-500 text-white font-bold text-lg shadow-md disabled:opacity-60"
              >
                Practice
              </motion.button>
            </div>

            {/* Celebration after multiple practices */}
            {practiceCount > 0 && practiceCount % 5 === 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl mb-2"
              >
                Great job! Keep going!
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Tips carousel */}
        <div className="bg-sky-50 rounded-2xl p-4 shadow">
          <div className="flex items-center justify-between">
            <button
              onClick={prevTip}
              className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-600 font-bold"
            >
              &lsaquo;
            </button>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex-1 text-center px-3 text-lg font-medium text-sky-800"
              >
                Tip: {selected.tips[tipIdx]}
              </motion.p>
            </AnimatePresence>
            <button
              onClick={nextTip}
              className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-600 font-bold"
            >
              &rsaquo;
            </button>
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {selected.tips.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === tipIdx ? 'bg-sky-500' : 'bg-sky-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {practiceCount > 0 && (
          <div className="bg-white rounded-xl p-3 shadow">
            <div className="text-sm text-gray-500 mb-1">Session progress</div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <motion.div
                className="bg-green-400 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, practiceCount * 10)}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">{practiceCount}/10 practices</div>
          </div>
        )}
      </div>

      {/* Phoneme selector strip */}
      <div className="bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-400 text-center mb-2">Choose a sound to practice:</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PHONEMES.map((p) => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => selectPhoneme(p)}
              className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold transition-all ${
                selected.id === p.id
                  ? 'bg-sky-500 text-white scale-110 shadow-lg'
                  : 'bg-gray-100 text-gray-700 shadow hover:shadow-md'
              }`}
            >
              <span className="text-xl">{p.sound}</span>
              <span className="text-[10px] opacity-70">{p.word}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
