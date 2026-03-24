'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray, vibrate, type GameProps } from '@/lib/schooltube/game-utils';
import { speakWithWebSpeech } from '@/lib/speech/tts';

type Move = {
  action: string;
  instruction: string;
  color: string;
  svgIcon: string; // SVG path
  animation: 'bounce' | 'spin' | 'shake' | 'wiggle';
};

const moves: Move[] = [
  { action: 'Clap', instruction: 'Clap your hands 3 times!', color: '#FF6B6B', svgIcon: 'M50 20 C35 20 20 35 20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 C80 35 65 20 50 20 M35 45 L50 60 L65 45', animation: 'shake' },
  { action: 'Wave', instruction: 'Wave hello to me!', color: '#FFD700', svgIcon: 'M30 80 L30 40 Q30 20 45 30 L55 45 Q60 50 65 40 L70 25 Q72 15 78 25 L80 45 Q82 55 75 55 L60 55 Q50 55 50 65 L50 80', animation: 'wiggle' },
  { action: 'Jump', instruction: 'Jump up high!', color: '#4ECDC4', svgIcon: 'M50 15 C55 15 60 20 60 25 C60 30 55 35 50 35 C45 35 40 30 40 25 C40 20 45 15 50 15 M40 38 L35 55 L25 50 M60 38 L65 55 L75 50 M45 55 L42 80 L38 90 M55 55 L58 80 L62 90', animation: 'bounce' },
  { action: 'Spin', instruction: 'Spin all the way around!', color: '#DDA0DD', svgIcon: 'M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10 M50 25 L60 45 L50 40 L40 45 Z', animation: 'spin' },
  { action: 'Touch Head', instruction: 'Touch the top of your head!', color: '#FF9F43', svgIcon: 'M50 15 C58 15 65 22 65 30 C65 38 58 45 50 45 C42 45 35 38 35 30 C35 22 42 15 50 15 M50 45 L50 70 M35 55 L25 45 M65 55 L75 45 M45 70 L42 90 M55 70 L58 90 M42 20 L50 12 L58 20', animation: 'wiggle' },
  { action: 'Touch Toes', instruction: 'Reach down and touch your toes!', color: '#95E1D3', svgIcon: 'M50 15 C55 15 60 20 60 25 C60 30 55 35 50 35 C45 35 40 30 40 25 C40 20 45 15 50 15 M50 35 Q50 55 35 70 M35 55 L25 50 M65 55 L75 50 M38 70 L35 90 M55 70 L58 90', animation: 'bounce' },
  { action: 'Stomp', instruction: 'Stomp your feet like an elephant!', color: '#A8E6CF', svgIcon: 'M35 85 L35 90 L25 90 L25 85 M65 85 L65 90 L75 90 L75 85 M30 40 Q50 20 70 40 L75 85 L25 85 Z', animation: 'shake' },
  { action: 'Stretch', instruction: 'Stretch both arms up high!', color: '#686DE0', svgIcon: 'M50 20 C55 20 60 25 60 30 C60 35 55 40 50 40 C45 40 40 35 40 30 C40 25 45 20 50 20 M50 40 L50 75 M35 45 L25 20 M65 45 L75 20 M45 75 L42 95 M55 75 L58 95', animation: 'bounce' },
  { action: 'Wiggle', instruction: 'Wiggle your whole body!', color: '#22A6B3', svgIcon: 'M50 15 C55 15 60 20 60 25 C60 30 55 35 50 35 C45 35 40 30 40 25 C40 20 45 15 50 15 M45 40 Q55 50 45 60 Q55 70 45 80 M55 40 Q65 50 55 60 Q65 70 55 80', animation: 'wiggle' },
  { action: 'March', instruction: 'March on the spot!', color: '#E056FD', svgIcon: 'M50 15 C55 15 60 20 60 25 C60 30 55 35 50 35 C45 35 40 30 40 25 C40 20 45 15 50 15 M50 35 L50 65 M35 50 L30 40 M65 50 L70 40 M45 65 L35 90 M55 65 L65 80', animation: 'bounce' },
];

const TOTAL_MOVES = 8;

function speak(text: string) {
  speakWithWebSpeech(text, 0.9, 1.1).catch(() => {});
}

function MoveIcon({ path, color, size = 80 }: { path: string; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d={path} fill={color} stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CopyMoveGame({ onScore, onComplete }: GameProps) {
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [movesCompleted, setMovesCompleted] = useState(0);
  const [phase, setPhase] = useState<'start' | 'show' | 'countdown' | 'do' | 'done'>('start');
  const [countdown, setCountdown] = useState<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const movePoolRef = useRef(shuffleArray([...moves]));
  const moveIndexRef = useRef(0);
  const completedRef = useRef(0);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const runCountdown = useCallback((onDone: () => void) => {
    setPhase('countdown');
    setCountdown(3);
    vibrate(30);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) { setCountdown(count); vibrate(30); }
      else { clearInterval(countdownRef.current!); setCountdown(null); onDone(); }
    }, 900);
  }, []);

  const pickNextMove = useCallback(() => {
    if (completedRef.current >= TOTAL_MOVES) {
      setPhase('done');
      vibrate([100, 50, 100]);
      speak('You copied every move! You are super active!');
      addTimer(() => onComplete(), 2500);
      return;
    }
    if (moveIndexRef.current >= movePoolRef.current.length) {
      movePoolRef.current = shuffleArray([...moves]);
      moveIndexRef.current = 0;
    }
    const next = movePoolRef.current[moveIndexRef.current++];
    setCurrentMove(next);
    setPhase('show');
    addTimer(() => {
      speak(next.instruction);
      addTimer(() => runCountdown(() => setPhase('do')), 1500);
    }, 400);
  }, [runCountdown, onComplete]);

  const handleDidIt = () => {
    if (!currentMove) return;
    vibrate([50, 30, 50]);
    speak('Great job!');
    completedRef.current += 1;
    setMovesCompleted(completedRef.current);
    onScore();
    addTimer(() => pickNextMove(), 900);
  };

  const handleShowAgain = () => {
    if (!currentMove) return;
    setPhase('show');
    speak(currentMove.instruction);
    addTimer(() => runCountdown(() => setPhase('do')), 1500);
  };

  const emojiAnim = currentMove ? ({
    bounce: { y: [0, -25, 0] },
    spin: { rotate: [0, 360] },
    shake: { x: [-8, 8, -8, 8, 0] },
    wiggle: { rotate: [-12, 12, -12, 12, 0] },
  })[currentMove.animation] : {};

  const progress = movesCompleted / TOTAL_MOVES;

  if (phase === 'start') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 h-full" style={{ background: '#FFFDF9' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <MoveIcon path={moves[2].svgIcon} color="#E8610A" size={100} />
        </motion.div>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#1A1612', fontSize: '2rem' }}>
          Copy The Move
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560', textAlign: 'center', maxWidth: 280 }}>
          Watch the instruction, then copy the move!
        </p>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => { vibrate(30); pickNextMove(); }}
          style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.4rem', padding: '20px 48px', borderRadius: 24, border: 'none', cursor: 'pointer', minHeight: 80 }}>
          Let&apos;s Move!
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
          Move Champion!
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', color: '#6B6560' }}>You completed {TOTAL_MOVES} moves!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-full overflow-y-auto" style={{ background: '#FFFDF9' }}>
      {/* Progress */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs mb-1" style={{ fontFamily: 'var(--font-inter)', color: '#6B6560' }}>
          <span>{movesCompleted} done</span><span>{TOTAL_MOVES - movesCompleted} left</span>
        </div>
        <div style={{ height: 10, background: '#E8E0D6', borderRadius: 8, overflow: 'hidden' }}>
          <motion.div style={{ height: '100%', background: '#E8610A', borderRadius: 8 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentMove && (
          <motion.div key={`${currentMove.action}-${movesCompleted}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="flex flex-col items-center gap-5 w-full">
            <motion.div animate={phase === 'show' ? emojiAnim : {}} transition={{ duration: 0.8, repeat: phase === 'show' ? Infinity : 0, repeatType: 'loop' }}
              style={{ width: 160, height: 160, borderRadius: 28, background: `${currentMove.color}20`, border: `3px solid ${currentMove.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoveIcon path={currentMove.svgIcon} color={currentMove.color} size={110} />
            </motion.div>

            <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: currentMove.color, fontSize: '1.4rem', textAlign: 'center', padding: '0 16px' }}>
              {currentMove.instruction}
            </h2>

            <AnimatePresence>
              {countdown !== null && (
                <motion.div key={countdown} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.3 }}
                  style={{ width: 80, height: 80, borderRadius: 40, background: currentMove.color, color: '#FFFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '2.5rem' }}>
                  {countdown}
                </motion.div>
              )}
            </AnimatePresence>

            {phase === 'do' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4 w-full">
                <p style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: '#6B6560', fontSize: '1.3rem' }}>Now YOU do it!</p>
                <div className="flex gap-4">
                  <motion.button whileTap={{ scale: 0.92 }} onClick={handleShowAgain}
                    style={{ background: '#E8E0D6', color: '#1A1612', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1rem', padding: '16px 24px', borderRadius: 16, border: 'none', cursor: 'pointer', minHeight: 56 }}>
                    Show Again
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.92 }} onClick={handleDidIt}
                    style={{ background: '#E8610A', color: '#FFFDF9', fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '1.2rem', padding: '16px 32px', borderRadius: 16, border: 'none', cursor: 'pointer', minHeight: 56 }}>
                    I Did It!
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
