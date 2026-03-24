'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';
import { speakWithWebSpeech } from '@/lib/speech/tts';

type Animal = {
  name: string;
  sound: string;
  color: string;
  hint: string;
  icon: string; // SVG path viewBox 0 0 100 100
};

const animals: Animal[] = [
  { name: 'Dog', sound: 'Woof woof!', color: '#E8A87C', hint: 'lives with families', icon: 'M50 20 C30 20 15 40 15 55 C15 75 35 85 50 85 C65 85 85 75 85 55 C85 40 70 20 50 20 M35 50 A4 4 0 1 1 35 58 A4 4 0 1 1 35 50 M65 50 A4 4 0 1 1 65 58 A4 4 0 1 1 65 50 M45 65 Q50 72 55 65' },
  { name: 'Cat', sound: 'Meow!', color: '#FFB347', hint: 'loves to purr', icon: 'M50 25 C30 25 18 45 18 58 C18 78 35 88 50 88 C65 88 82 78 82 58 C82 45 70 25 50 25 M25 22 L18 42 L32 38 M75 22 L82 42 L68 38 M38 55 A3 3 0 1 1 38 61 M62 55 A3 3 0 1 1 62 61 M46 68 Q50 73 54 68' },
  { name: 'Cow', sound: 'Moo!', color: '#C8A87A', hint: 'gives us milk', icon: 'M50 30 C30 30 15 48 15 60 C15 78 32 88 50 88 C68 88 85 78 85 60 C85 48 70 30 50 30 M20 28 Q12 22 18 35 M80 28 Q88 22 82 35 M38 58 A4 4 0 1 1 38 66 M62 58 A4 4 0 1 1 62 66 M42 74 Q50 80 58 74' },
  { name: 'Duck', sound: 'Quack quack!', color: '#FFD700', hint: 'splashes in water', icon: 'M50 25 C35 25 22 40 22 52 C22 68 35 80 50 80 C65 80 78 68 78 52 C78 40 65 25 50 25 M35 48 A3 3 0 1 1 35 54 M65 48 A3 3 0 1 1 65 54 M40 62 C45 68 55 68 60 62' },
  { name: 'Pig', sound: 'Oink oink!', color: '#FFB6C1', hint: 'loves rolling in mud', icon: 'M50 28 C30 28 15 45 15 58 C15 75 32 88 50 88 C68 88 85 75 85 58 C85 45 70 28 50 28 M38 52 A3 3 0 1 1 38 58 M62 52 A3 3 0 1 1 62 58 M40 68 A12 8 0 0 0 60 68 M44 72 A2 2 0 1 1 48 72 M52 72 A2 2 0 1 1 56 72' },
  { name: 'Sheep', sound: 'Baa baa!', color: '#E8E0D6', hint: 'gives us wool', icon: 'M50 30 C25 30 15 48 15 62 C15 80 30 90 50 90 C70 90 85 80 85 62 C85 48 75 30 50 30 M25 30 Q20 20 30 25 M40 28 Q38 18 45 24 M60 28 Q62 18 55 24 M75 30 Q80 20 70 25 M38 55 A3 3 0 1 1 38 61 M62 55 A3 3 0 1 1 62 61' },
  { name: 'Horse', sound: 'Neigh!', color: '#C19A6B', hint: 'loves to gallop', icon: 'M50 20 C35 20 20 38 20 55 C20 75 35 88 50 88 C65 88 80 75 80 55 C80 38 65 20 50 20 M30 18 Q25 10 28 20 M70 18 Q75 10 72 20 M38 50 A3 3 0 1 1 38 56 M62 50 A3 3 0 1 1 62 56 M42 68 Q50 76 58 68' },
  { name: 'Lion', sound: 'Roar!', color: '#DAA520', hint: 'king of the jungle', icon: 'M50 35 C35 35 22 48 22 60 C22 75 35 85 50 85 C65 85 78 75 78 60 C78 48 65 35 50 35 M50 15 C25 15 10 35 10 50 C10 50 15 38 22 35 M50 15 C75 15 90 35 90 50 C90 50 85 38 78 35 M38 55 A3 3 0 1 1 38 61 M62 55 A3 3 0 1 1 62 61 M42 70 Q50 78 58 70' },
];

function buildQuizOptions(correct: Animal, all: Animal[]): Animal[] {
  const distractors = all.filter((a) => a.name !== correct.name);
  return shuffleArray([...shuffleArray(distractors).slice(0, 3), correct]);
}

function speak(text: string) {
  speakWithWebSpeech(text, 0.9, 1.1).catch(() => {});
}

function AnimalIcon({ path, color, size = 80 }: { path: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d={path} fill={color} stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AnimalSoundsGame({ onScore, onComplete }: GameProps) {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [quizOptions, setQuizOptions] = useState<Animal[]>([]);
  const [learned, setLearned] = useState<string[]>([]);
  const [phase, setPhase] = useState<'start' | 'learn' | 'quiz' | 'result' | 'done'>('start');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const learnedRef = useRef<string[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const pickNext = useCallback((done: string[]) => {
    const remaining = animals.filter((a) => !done.includes(a.name));
    if (remaining.length === 0) {
      setPhase('done');
      vibrate([100, 50, 100]);
      speak('You learned every animal sound! Amazing!');
      addTimer(() => onComplete(), 2500);
      return;
    }
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentAnimal(next);
    setPhase('learn');
    setSelectedAnswer(null);
    setIsCorrect(null);
    addTimer(() => speak(`This is a ${next.name}. The ${next.name} says ${next.sound}`), 400);
  }, [onComplete]);

  const handleHearSound = () => {
    if (!currentAnimal) return;
    vibrate(30);
    speak(`The ${currentAnimal.name} says ${currentAnimal.sound}`);
  };

  const handleGoToQuiz = () => {
    if (!currentAnimal) return;
    vibrate(30);
    setQuizOptions(buildQuizOptions(currentAnimal, animals));
    setPhase('quiz');
    addTimer(() => speak(`Which animal says ${currentAnimal.sound}?`), 300);
  };

  const handleAnswer = (animal: Animal) => {
    if (selectedAnswer || !currentAnimal) return;
    setSelectedAnswer(animal.name);
    if (animal.name === currentAnimal.name) {
      setIsCorrect(true);
      vibrate([50, 30, 50]);
      speak(`Yes! The ${animal.name} says ${currentAnimal.sound}!`);
      onScore();
      addTimer(() => setPhase('result'), 1200);
    } else {
      setIsCorrect(false);
      vibrate(50);
      speak('Not quite! Try again!');
      addTimer(() => setSelectedAnswer(null), 1000);
    }
  };

  const handleNext = () => {
    if (!currentAnimal) return;
    vibrate(30);
    const next = [...learnedRef.current, currentAnimal.name];
    learnedRef.current = next;
    setLearned(next);
    pickNext(next);
  };

  const progress = learned.length / animals.length;

  if (phase === 'start') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 h-full" style={{ background: '#FFFDF9' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <AnimalIcon path={animals[0].icon} color="#E8610A" size={100} />
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '2rem' }}>
          Animal Sounds
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', textAlign: 'center', maxWidth: 280 }}>
          Learn what animals say, then guess the right one!
        </p>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => { vibrate(30); pickNext([]); }}
          style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.4rem', padding: '20px 48px', borderRadius: 24, border: 'none', cursor: 'pointer', minHeight: 80 }}
        >
          Let&apos;s Go!
        </motion.button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 h-full" style={{ background: '#FFFDF9' }}>
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <svg width={100} height={100} viewBox="0 0 100 100"><circle cx={50} cy={50} r={45} fill="#E8610A" /><path d="M30 50 L45 65 L70 35" stroke="#FFFDF9" strokeWidth={6} fill="none" strokeLinecap="round" /></svg>
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '2rem' }}>
          You know all the sounds!
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {animals.map((a) => (
            <motion.div key={a.name} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: Math.random() * 0.5 }}>
              <AnimalIcon path={a.icon} color={a.color} size={48} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-full overflow-y-auto" style={{ background: '#FFFDF9' }}>
      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs mb-1" style={{ fontFamily: 'var(--font-inter)', color: '#6B6560' }}>
          <span>{learned.length} learned</span>
          <span>{animals.length - learned.length} to go</span>
        </div>
        <div style={{ height: 10, background: '#E8E0D6', borderRadius: 8, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: '#E8610A', borderRadius: 8 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentAnimal && phase === 'learn' && (
          <motion.div key={`learn-${currentAnimal.name}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="flex flex-col items-center gap-4 w-full">
            <motion.button onClick={handleHearSound} whileTap={{ scale: 0.9 }} style={{ width: 160, height: 160, borderRadius: 28, background: `${currentAnimal.color}30`, border: `3px solid ${currentAnimal.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <AnimalIcon path={currentAnimal.icon} color={currentAnimal.color} size={110} />
            </motion.button>
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: currentAnimal.color, fontSize: '2rem' }}>{currentAnimal.name}</h3>
            <div style={{ background: '#FFF8F0', borderRadius: 16, padding: '12px 24px', border: `2px solid ${currentAnimal.color}` }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, color: '#1A1612', fontSize: '1.2rem' }}>
                &ldquo;{currentAnimal.sound}&rdquo;
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', fontSize: '0.875rem' }}>It {currentAnimal.hint}</p>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.92 }} onClick={handleHearSound} style={{ background: currentAnimal.color, color: '#FFFDF9', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1.1rem', padding: '16px 24px', borderRadius: 16, border: 'none', cursor: 'pointer', minHeight: 56 }}>
                Hear It
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={handleGoToQuiz} style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1.1rem', padding: '16px 24px', borderRadius: 16, border: 'none', cursor: 'pointer', minHeight: 56 }}>
                Quiz Me
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentAnimal && phase === 'quiz' && (
          <motion.div key={`quiz-${currentAnimal.name}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-5 w-full">
            <div style={{ background: '#FFF8F0', border: '2px solid #E8E0D6', borderRadius: 16, padding: '12px 24px' }}>
              <p style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '1.1rem', textAlign: 'center' }}>
                Which animal says &ldquo;{currentAnimal.sound}&rdquo;?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {quizOptions.map((animal) => {
                const isSel = selectedAnswer === animal.name;
                const isRight = isSel && animal.name === currentAnimal.name;
                const isWrong = isSel && animal.name !== currentAnimal.name;
                return (
                  <motion.button key={animal.name} whileTap={{ scale: 0.92 }} onClick={() => handleAnswer(animal)} disabled={!!selectedAnswer}
                    animate={isRight ? { scale: [1, 1.1, 1] } : isWrong ? { x: [-4, 4, -4, 0] } : {}}
                    style={{ height: 100, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', border: isRight ? '3px solid #4CAF50' : isWrong ? '3px solid #EF5350' : `2px solid ${animal.color}60`, background: isRight ? '#E8F5E9' : isWrong ? '#FFEBEE' : '#FFF8F0', opacity: selectedAnswer && !isSel ? 0.5 : 1 }}>
                    <AnimalIcon path={animal.icon} color={animal.color} size={48} />
                    <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, color: '#1A1612', fontSize: '0.85rem' }}>{animal.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentAnimal && phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 3, duration: 0.6 }}>
              <AnimalIcon path={currentAnimal.icon} color={currentAnimal.color} size={90} />
            </motion.div>
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#4CAF50', fontSize: '1.8rem' }}>{currentAnimal.name}!</h3>
            <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', fontSize: '1.1rem' }}>says &ldquo;{currentAnimal.sound}&rdquo;</p>
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleNext} style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.3rem', padding: '20px 40px', borderRadius: 24, border: 'none', cursor: 'pointer', minHeight: 80 }}>
              Next Animal
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {learned.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-auto">
          {learned.map((name) => {
            const a = animals.find((x) => x.name === name);
            return a ? (
              <motion.div key={name} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <AnimalIcon path={a.icon} color={a.color} size={32} />
              </motion.div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
