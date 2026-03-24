'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate, type GameProps } from '@/lib/schooltube/game-utils';
import { speakWithWebSpeech } from '@/lib/speech/tts';

type Action = {
  verb: string;
  color: string;
  svgIcon: string;
  animation: 'bounce' | 'spin' | 'shake' | 'clap';
};

const actions: Action[] = [
  { verb: 'Jump', color: '#FF6B6B', svgIcon: 'M50 15 C55 15 60 20 60 25 C60 30 55 35 50 35 C45 35 40 30 40 25 C40 20 45 15 50 15 M40 38 L35 55 L25 50 M60 38 L65 55 L75 50 M45 55 L42 80 L38 90 M55 55 L58 80 L62 90', animation: 'bounce' },
  { verb: 'Clap', color: '#FFE66D', svgIcon: 'M50 20 C35 20 20 35 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 35 65 20 50 20 M35 45 L50 60 L65 45', animation: 'clap' },
  { verb: 'Stomp', color: '#4ECDC4', svgIcon: 'M35 85 L35 90 L25 90 L25 85 M65 85 L65 90 L75 90 L75 85 M30 40 Q50 20 70 40 L75 85 L25 85 Z', animation: 'shake' },
  { verb: 'Spin', color: '#DDA0DD', svgIcon: 'M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10 M50 25 L60 45 L50 40 L40 45 Z', animation: 'spin' },
  { verb: 'Wave', color: '#FF9F43', svgIcon: 'M30 80 L30 40 Q30 20 45 30 L55 45 Q60 50 65 40 L70 25 Q72 15 78 25 L80 45 Q82 55 75 55 L60 55 Q50 55 50 65 L50 80', animation: 'shake' },
  { verb: 'Hop', color: '#95E1D3', svgIcon: 'M50 15 C55 15 60 20 60 25 C60 30 55 35 50 35 C45 35 40 30 40 25 C40 20 45 15 50 15 M50 35 L50 60 M35 50 L25 45 M65 50 L75 45 M45 60 L40 85 M55 60 L60 85', animation: 'bounce' },
];

const TOTAL_ROUNDS = 8;

function speak(text: string) {
  speakWithWebSpeech(text, 0.9, 1.1).catch(() => {});
}

function speakNumber(n: number) {
  speakWithWebSpeech(String(n), 1.0, 1.2).catch(() => {});
}

function ActionIcon({ path, color, size = 80 }: { path: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d={path} fill={color} stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function JumpCountGame({ onScore, onComplete }: GameProps) {
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [targetCount, setTargetCount] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState<'start' | 'play' | 'roundDone' | 'done'>('start');
  const [totalTaps, setTotalTaps] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const roundsRef = useRef(0);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const pickNextRound = useCallback(() => {
    if (roundsRef.current >= TOTAL_ROUNDS) {
      setPhase('done');
      vibrate([100, 50, 100]);
      speak('Incredible! You counted and moved like a champion!');
      addTimer(() => onComplete(), 2500);
      return;
    }
    const action = actions[Math.floor(Math.random() * actions.length)];
    const round = roundsRef.current;
    const minCount = round < 3 ? 2 : round < 5 ? 3 : 4;
    const maxCount = round < 3 ? 4 : round < 5 ? 6 : 7;
    const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

    setCurrentAction(action);
    setTargetCount(count);
    setCurrentCount(0);
    setPhase('play');
    setIsAnimating(false);
    addTimer(() => { speak(`${action.verb} ${count} times!`); vibrate(30); }, 400);
  }, [onComplete]);

  const handleTap = () => {
    if (!currentAction || currentCount >= targetCount) return;
    const newCount = currentCount + 1;
    setCurrentCount(newCount);
    setIsAnimating(true);
    setTotalTaps((p) => p + 1);
    vibrate(30);
    speakNumber(newCount);
    addTimer(() => setIsAnimating(false), 350);

    if (newCount >= targetCount) {
      addTimer(() => {
        setPhase('roundDone');
        vibrate([50, 30, 50]);
        speak(`${newCount}! You did it! Amazing!`);
        onScore();
      }, 500);
    }
  };

  const handleNextRound = () => {
    roundsRef.current += 1;
    setRoundsCompleted(roundsRef.current);
    vibrate(30);
    pickNextRound();
  };

  const emojiAnim = currentAction ? ({
    bounce: { y: [0, -30, 0], scale: [1, 1.1, 1] },
    spin: { rotate: [0, 360], scale: [1, 1.1, 1] },
    shake: { x: [-10, 10, -10, 10, 0] },
    clap: { scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] },
  })[currentAction.animation] : {};

  const progress = roundsCompleted / TOTAL_ROUNDS;

  if (phase === 'start') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 h-full" style={{ background: '#FFFDF9' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <svg width={100} height={100} viewBox="0 0 100 100">
            <rect x={10} y={10} width={80} height={80} rx={16} fill="#E8610A" />
            <text x={50} y={62} textAnchor="middle" fill="#FFFDF9" fontWeight={700} fontSize={40} fontFamily="var(--font-fraunces)">123</text>
          </svg>
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '2rem' }}>
          Jump and Count
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', textAlign: 'center', maxWidth: 280 }}>
          Move your body and count! Tap the button each time you do the action.
        </p>
        <div className="flex gap-3">
          {actions.slice(0, 4).map((a) => (
            <motion.div key={a.verb} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <ActionIcon path={a.svgIcon} color={a.color} size={48} />
            </motion.div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => { vibrate(30); pickNextRound(); }}
          style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.4rem', padding: '20px 48px', borderRadius: 24, border: 'none', cursor: 'pointer', minHeight: 80 }}>
          Let&apos;s Count!
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
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '2rem' }}>Count Champion!</h2>
        <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', fontSize: '1.1rem' }}>
          You did <strong>{totalTaps}</strong> moves total!
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: Math.min(totalTaps, 12) }).map((_, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }}>
              <svg width={32} height={32} viewBox="0 0 100 100"><polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="#E8610A" /></svg>
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
          <span>Round {roundsCompleted + 1} of {TOTAL_ROUNDS}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div style={{ height: 10, background: '#E8E0D6', borderRadius: 8, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: '#E8610A', borderRadius: 8 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentAction && phase === 'play' && (
          <motion.div key={`round-${roundsCompleted}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="flex flex-col items-center gap-5 w-full">
            {/* Instruction */}
            <div style={{ background: currentAction.color, color: '#1A1612', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.2rem', padding: '12px 24px', borderRadius: 16, textAlign: 'center' }}>
              {currentAction.verb} <span style={{ fontSize: '1.8rem' }}>{targetCount}</span> times!
            </div>

            {/* Big tap button */}
            <motion.button onClick={handleTap} disabled={currentCount >= targetCount} whileTap={{ scale: 0.88 }}
              animate={isAnimating ? emojiAnim : currentCount < targetCount ? { scale: [1, 1.03, 1] } : {}}
              transition={isAnimating ? { duration: 0.35 } : { repeat: currentCount < targetCount ? Infinity : 0, duration: 1.5 }}
              style={{ width: 160, height: 160, borderRadius: 28, background: `${currentAction.color}20`, border: `3px solid ${currentAction.color}60`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentCount >= targetCount ? 0.5 : 1 }}>
              <ActionIcon path={currentAction.svgIcon} color={currentAction.color} size={90} />
              <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, color: currentAction.color, fontSize: '1rem', marginTop: 4 }}>Tap!</span>
            </motion.button>

            {/* Count display */}
            <div className="flex flex-col items-center gap-2">
              <motion.div key={currentCount} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '3.5rem', color: currentAction.color }}>
                {currentCount}
              </motion.div>
              {/* Dot counter */}
              <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                {Array.from({ length: targetCount }).map((_, i) => (
                  <motion.div key={i} animate={i < currentCount ? { scale: [0, 1.2, 1] } : {}} transition={{ duration: 0.3 }}
                    style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '0.85rem', background: i < currentCount ? currentAction.color : '#E8E0D6', color: i < currentCount ? '#FFFDF9' : '#6B6560' }}>
                    {i + 1}
                  </motion.div>
                ))}
              </div>
              {currentCount < targetCount && (
                <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', fontSize: '0.95rem' }}>
                  {targetCount - currentCount} more to go!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {currentAction && phase === 'roundDone' && (
          <motion.div key="round-complete" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} className="flex flex-col items-center gap-5">
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 12, -12, 0] }} transition={{ repeat: 3, duration: 0.5 }}>
              <ActionIcon path={currentAction.svgIcon} color={currentAction.color} size={90} />
            </motion.div>
            <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: currentAction.color, fontSize: '2rem' }}>
              {targetCount} {currentAction.verb}s!
            </h3>
            <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', fontSize: '1.1rem' }}>Amazing!</p>
            <motion.button whileTap={{ scale: 0.92 }} onClick={handleNextRound}
              style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.3rem', padding: '20px 40px', borderRadius: 24, border: 'none', cursor: 'pointer', minHeight: 80 }}>
              {roundsRef.current + 1 >= TOTAL_ROUNDS ? 'Finish!' : 'Next Challenge'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
