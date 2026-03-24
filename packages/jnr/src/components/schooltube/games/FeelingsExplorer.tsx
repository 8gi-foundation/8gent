'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';
import { speakWithWebSpeech } from '@/lib/speech/tts';

type Feeling = {
  name: string;
  color: string;
  description: string;
  bodyClue: string;
  situations: string[];
  correct: string;
  face: { mouth: string; brows: string }; // SVG path fragments for face
};

const feelings: Feeling[] = [
  { name: 'Happy', color: '#FFD93D', description: 'Warm and sunny inside!', bodyClue: 'You smile and feel light!',
    situations: ['Opening a birthday present', 'Eating broccoli', 'Stuck in traffic'], correct: 'Opening a birthday present',
    face: { mouth: 'M30 65 Q50 85 70 65', brows: 'M25 30 Q35 20 45 30 M55 30 Q65 20 75 30' } },
  { name: 'Sad', color: '#74B9FF', description: 'Heavy feeling, like rain clouds', bodyClue: 'Your eyes feel watery',
    situations: ['Winning a game', 'Losing your favourite toy', 'Eating cake'], correct: 'Losing your favourite toy',
    face: { mouth: 'M30 72 Q50 60 70 72', brows: 'M25 28 Q35 35 45 28 M55 28 Q65 35 75 28' } },
  { name: 'Angry', color: '#FF6B6B', description: 'Hot and fiery inside!', bodyClue: 'Your face gets red and hot',
    situations: ['Watching a sunset', 'Someone breaks your toy', 'Getting a hug'], correct: 'Someone breaks your toy',
    face: { mouth: 'M32 68 L68 68', brows: 'M25 35 L45 25 M75 35 L55 25' } },
  { name: 'Scared', color: '#A29BFE', description: 'Wobbly and shaky feeling', bodyClue: 'Your heart beats fast!',
    situations: ['Hearing a big thunder crash', 'Playing with a puppy', 'Eating ice cream'], correct: 'Hearing a big thunder crash',
    face: { mouth: 'M40 68 A10 10 0 0 1 60 68 A10 10 0 0 1 40 68', brows: 'M25 25 Q35 32 45 25 M55 25 Q65 32 75 25' } },
  { name: 'Excited', color: '#FF9F43', description: 'Bouncy and zingy inside!', bodyClue: "You can't stop moving!",
    situations: ['Going to sleep early', 'Your birthday party starts NOW', 'Washing dishes'], correct: 'Your birthday party starts NOW',
    face: { mouth: 'M28 62 Q50 88 72 62', brows: 'M25 28 Q35 18 45 28 M55 28 Q65 18 75 28' } },
  { name: 'Surprised', color: '#00D2D3', description: 'Whoosh! Something unexpected!', bodyClue: 'Your eyes go wide!',
    situations: ['Finding a rainbow in your room', 'Eating the same lunch', 'Sitting quietly'], correct: 'Finding a rainbow in your room',
    face: { mouth: 'M40 68 A10 12 0 1 1 60 68 A10 12 0 1 1 40 68', brows: 'M25 22 Q35 15 45 22 M55 22 Q65 15 75 22' } },
  { name: 'Tired', color: '#B8B5FF', description: 'Heavy eyelids and slow brain', bodyClue: 'You keep yawning!',
    situations: ['Running around all day long', 'Having a big breakfast', 'Watching TV calmly'], correct: 'Running around all day long',
    face: { mouth: 'M35 68 Q50 72 65 68', brows: 'M25 32 L45 30 M55 30 L75 32' } },
  { name: 'Calm', color: '#95E1D3', description: 'Peaceful like a quiet lake', bodyClue: 'Your breathing is slow and soft',
    situations: ['Taking deep breaths outside', 'Spinning really fast', 'Shouting loud'], correct: 'Taking deep breaths outside',
    face: { mouth: 'M32 66 Q50 74 68 66', brows: 'M28 30 L42 30 M58 30 L72 30' } },
];

function speak(text: string) {
  speakWithWebSpeech(text, 0.85, 1.1).catch(() => {});
}

function FaceIcon({ face, color, size = 90 }: { face: Feeling['face']; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx={50} cy={50} r={45} fill={color} stroke="#1A1612" strokeWidth="2" />
      {/* Eyes */}
      <circle cx={36} cy={42} r={5} fill="#1A1612" />
      <circle cx={64} cy={42} r={5} fill="#1A1612" />
      <circle cx={37} cy={41} r={2} fill="#FFFDF9" />
      <circle cx={65} cy={41} r={2} fill="#FFFDF9" />
      {/* Brows */}
      <path d={face.brows} stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Mouth */}
      <path d={face.mouth} stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function FeelingsExplorerGame({ onScore, onComplete }: GameProps) {
  const [currentFeeling, setCurrentFeeling] = useState<Feeling | null>(null);
  const [learned, setLearned] = useState<string[]>([]);
  const [phase, setPhase] = useState<'start' | 'learn' | 'quiz' | 'result' | 'done'>('start');
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const learnedRef = useRef<string[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const pickNext = useCallback((done: string[]) => {
    const remaining = feelings.filter((f) => !done.includes(f.name));
    if (remaining.length === 0) {
      setPhase('done');
      vibrate([100, 50, 100]);
      speak('You know all the feelings! You are so smart and kind!');
      addTimer(() => onComplete(), 2500);
      return;
    }
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentFeeling(next);
    setPhase('learn');
    setSelectedSituation(null);
    addTimer(() => speak(`This feeling is called ${next.name}. ${next.description}`), 400);
  }, [onComplete]);

  const handleGoToQuiz = () => {
    if (!currentFeeling) return;
    vibrate(30);
    setPhase('quiz');
    addTimer(() => speak(`When do you feel ${currentFeeling.name}? Pick the right one!`), 300);
  };

  const handleSituationSelect = (situation: string) => {
    if (selectedSituation || !currentFeeling) return;
    setSelectedSituation(situation);
    if (situation === currentFeeling.correct) {
      vibrate([50, 30, 50]);
      speak(`Yes! You feel ${currentFeeling.name} when: ${situation}.`);
      onScore();
      addTimer(() => setPhase('result'), 1400);
    } else {
      vibrate(50);
      speak('Hmm, try again!');
      addTimer(() => setSelectedSituation(null), 900);
    }
  };

  const handleNext = () => {
    if (!currentFeeling) return;
    vibrate(30);
    const next = [...learnedRef.current, currentFeeling.name];
    learnedRef.current = next;
    setLearned(next);
    pickNext(next);
  };

  const progress = learned.length / feelings.length;

  if (phase === 'start') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 h-full" style={{ background: '#FFFDF9' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="flex gap-2">
          {feelings.slice(0, 4).map((f) => (
            <FaceIcon key={f.name} face={f.face} color={f.color} size={52} />
          ))}
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '2rem' }}>
          Feelings Explorer
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', textAlign: 'center', maxWidth: 280 }}>
          Learn about feelings and when we have them!
        </p>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => { vibrate(30); pickNext([]); }}
          style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.4rem', padding: '20px 48px', borderRadius: 24, border: 'none', cursor: 'pointer', minHeight: 80 }}>
          Explore!
        </motion.button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 h-full" style={{ background: '#FFFDF9' }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
          <svg width={100} height={100} viewBox="0 0 100 100"><circle cx={50} cy={50} r={45} fill="#E8610A" /><path d="M30 50 L45 65 L70 35" stroke="#FFFDF9" strokeWidth={6} fill="none" strokeLinecap="round" /></svg>
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '2rem' }}>Feelings Expert!</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {feelings.map((f) => (
            <motion.div key={f.name} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: Math.random() * 0.5 }}>
              <FaceIcon face={f.face} color={f.color} size={48} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-full overflow-y-auto" style={{ background: '#FFFDF9' }}>
      {/* Progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs mb-1" style={{ fontFamily: 'var(--font-inter)', color: '#6B6560' }}>
          <span>{learned.length} learned</span><span>{feelings.length - learned.length} to go</span>
        </div>
        <div style={{ height: 10, background: '#E8E0D6', borderRadius: 8, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: '#E8610A', borderRadius: 8 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentFeeling && phase === 'learn' && (
          <motion.div key={`learn-${currentFeeling.name}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="flex flex-col items-center gap-4 w-full">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
              <FaceIcon face={currentFeeling.face} color={currentFeeling.color} size={120} />
            </motion.div>
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: currentFeeling.color, fontSize: '2rem' }}>{currentFeeling.name}</h3>
            <div style={{ background: '#FFF8F0', borderRadius: 16, padding: '12px 20px', border: `2px solid ${currentFeeling.color}`, maxWidth: 280, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, color: '#1A1612', fontSize: '1.1rem' }}>{currentFeeling.description}</p>
              <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', fontSize: '0.85rem', marginTop: 4 }}>{currentFeeling.bodyClue}</p>
            </div>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => { speak(`${currentFeeling.name} feels like: ${currentFeeling.description}. ${currentFeeling.bodyClue}`); vibrate(30); }}
              style={{ background: currentFeeling.color, color: '#1A1612', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1.1rem', padding: '16px 24px', borderRadius: 16, border: 'none', cursor: 'pointer', minHeight: 56 }}>
              Hear About It
            </motion.button>
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleGoToQuiz}
              style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1.1rem', padding: '16px 32px', borderRadius: 16, border: 'none', cursor: 'pointer', minHeight: 56 }}>
              Quiz Me
            </motion.button>
          </motion.div>
        )}

        {currentFeeling && phase === 'quiz' && (
          <motion.div key={`quiz-${currentFeeling.name}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="flex items-center gap-3">
              <FaceIcon face={currentFeeling.face} color={currentFeeling.color} size={56} />
              <div style={{ background: '#FFF8F0', borderRadius: 16, padding: '8px 16px', border: `2px solid ${currentFeeling.color}` }}>
                <p style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: currentFeeling.color, fontSize: '1rem' }}>
                  When do you feel {currentFeeling.name}?
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              {currentFeeling.situations.map((situation, i) => {
                const isSel = selectedSituation === situation;
                const isRight = isSel && situation === currentFeeling.correct;
                const isWrong = isSel && situation !== currentFeeling.correct;
                return (
                  <motion.button key={situation} initial={{ opacity: 0, x: -20 }} animate={isRight ? { scale: [1, 1.04, 1] } : isWrong ? { x: [-4, 4, -4, 0] } : { opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }} whileTap={{ scale: 0.95 }} onClick={() => handleSituationSelect(situation)} disabled={!!selectedSituation}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 14, textAlign: 'left', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', border: isRight ? '3px solid #4CAF50' : isWrong ? '3px solid #EF5350' : '2px solid #E8E0D6', background: isRight ? '#E8F5E9' : isWrong ? '#FFEBEE' : '#FFF8F0', color: '#1A1612', minHeight: 56 }}>
                    {situation}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentFeeling && phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ repeat: 2, duration: 0.6 }}>
              <FaceIcon face={currentFeeling.face} color={currentFeeling.color} size={100} />
            </motion.div>
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#4CAF50', fontSize: '1.8rem' }}>Perfect!</h3>
            <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', textAlign: 'center', fontSize: '1rem', maxWidth: 280 }}>
              We feel <strong>{currentFeeling.name}</strong> when &ldquo;{currentFeeling.correct}&rdquo;
            </p>
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleNext}
              style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.3rem', padding: '20px 40px', borderRadius: 24, border: 'none', cursor: 'pointer', minHeight: 80 }}>
              Next Feeling
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {learned.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-auto">
          {learned.map((name) => {
            const f = feelings.find((x) => x.name === name);
            return f ? (
              <motion.div key={name} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <FaceIcon face={f.face} color={f.color} size={32} />
              </motion.div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
