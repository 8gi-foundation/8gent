'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameProps } from '@/lib/schooltube/game-utils';

// New ported games from Nick prototype
import { BubblePopNumbersGame } from '@/components/schooltube/games/BubblePopNumbers';
import { ColorMixGame } from '@/components/schooltube/games/ColorMix';
import { ColorSortGame } from '@/components/schooltube/games/ColorSort';
import { LetterTraceGame } from '@/components/schooltube/games/LetterTrace';
import { MemoryMatchGame } from '@/components/schooltube/games/MemoryMatch';
import { NumberBondsGame } from '@/components/schooltube/games/NumberBonds';
import { NumberOrderGame } from '@/components/schooltube/games/NumberOrder';
import { PatternCompleteGame } from '@/components/schooltube/games/PatternComplete';
import { ShapeMatchAdvancedGame } from '@/components/schooltube/games/ShapeMatchAdvanced';
import { SizeSortGame } from '@/components/schooltube/games/SizeSort';
import { CountingBallsAdvancedGame } from '@/components/schooltube/games/CountingBallsAdvanced';
import { RainbowPaintGame } from '@/components/schooltube/games/RainbowPaint';
import { ParticleFireworksGame } from '@/components/schooltube/games/ParticleFireworks';
import { MusicalBallsGame } from '@/components/schooltube/games/MusicalBalls';
import { SpinFidgetGame } from '@/components/schooltube/games/SpinFidget';
import { WaterPourGame } from '@/components/schooltube/games/WaterPour';
import { IceCreamBuilderGame } from '@/components/schooltube/games/IceCreamBuilder';
import { BottleFillGame } from '@/components/schooltube/games/BottleFill';

// Utility functions (kept for existing inline games)
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const GAME_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

/**
 * Counting Balls Game (original simple version)
 */
export function CountingBallsGame({ onScore, onComplete }: GameProps) {
  const [targetCount, setTargetCount] = useState(0);
  const [balls, setBalls] = useState<{ id: number; color: string; x: number; y: number }[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [tappedBalls, setTappedBalls] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [round, setRound] = useState(1);
  const maxRounds = 5;

  const generateRound = useCallback(() => {
    const count = getRandomInt(2, 7);
    setTargetCount(count);
    setTappedBalls([]);
    const newBalls = Array.from({ length: count }, (_, i) => ({
      id: i,
      color: GAME_COLORS[getRandomInt(0, GAME_COLORS.length - 1)],
      x: getRandomInt(10, 70),
      y: getRandomInt(10, 60),
    }));
    setBalls(newBalls);
    const wrongAnswers = [count - 2, count - 1, count + 1, count + 2].filter((n) => n > 0 && n <= 10 && n !== count);
    const selectedWrong = shuffleArray(wrongAnswers).slice(0, 3);
    setOptions(shuffleArray([count, ...selectedWrong]));
  }, []);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handleBallTap = (ballId: number) => {
    if (tappedBalls.includes(ballId)) return;
    setTappedBalls([...tappedBalls, ballId]);
    vibrate(30);
  };

  const handleAnswer = (answer: number) => {
    vibrate(20);
    if (answer === targetCount) {
      setShowFeedback('correct');
      vibrate([50, 30, 50]);
      onScore();
      setTimeout(() => {
        setShowFeedback(null);
        if (round >= maxRounds) { vibrate([100, 50, 100, 50, 100]); onComplete(); }
        else { setRound(round + 1); generateRound(); }
      }, 1000);
    } else {
      setShowFeedback('wrong');
      vibrate(200);
      setTimeout(() => setShowFeedback(null), 800);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: maxRounds }, (_, i) => (
          <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-cyan-500' : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="relative flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl min-h-[200px] overflow-hidden">
        {balls.map((ball) => (
          <button key={ball.id} onClick={() => handleBallTap(ball.id)}
            className="absolute w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            style={{ backgroundColor: ball.color, left: `${ball.x}%`, top: `${ball.y}%`, border: tappedBalls.includes(ball.id) ? '4px solid white' : 'none', transform: tappedBalls.includes(ball.id) ? 'scale(1.1)' : 'scale(1)' }}
          >
            {tappedBalls.includes(ball.id) && <span className="text-white font-bold text-lg drop-shadow-md">{tappedBalls.indexOf(ball.id) + 1}</span>}
          </button>
        ))}
        {showFeedback && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${showFeedback === 'correct' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
            <div className="text-8xl">{showFeedback === 'correct' ? '✓' : '✗'}</div>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-cyan-600 mb-3">How many balls? Tap to count!</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {options.map((num) => (
            <button key={num} onClick={() => handleAnswer(num)} className="h-16 w-16 text-2xl font-bold rounded-2xl bg-pink-500 hover:bg-pink-400 text-white shadow-lg active:scale-95 transition-transform">{num}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Ball Rain Game
 */
export function BallRainGame({ onScore, onComplete }: GameProps) {
  const [balls, setBalls] = useState<{ id: number; x: number; color: string; size: number }[]>([]);
  const [landedBalls, setLandedBalls] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);
  const [count, setCount] = useState(0);
  const targetCount = 20;
  const [isRaining, setIsRaining] = useState(false);
  const ballIdRef = useRef(0);

  const spawnBall = useCallback(() => {
    const newBall = { id: ballIdRef.current++, x: getRandomInt(5, 95), color: GAME_COLORS[getRandomInt(0, GAME_COLORS.length - 1)], size: getRandomInt(24, 40) };
    setBalls((prev) => [...prev, newBall]);
  }, []);

  useEffect(() => {
    if (!isRaining) return;
    const interval = setInterval(() => spawnBall(), 200);
    return () => clearInterval(interval);
  }, [isRaining, spawnBall]);

  useEffect(() => {
    if (balls.length === 0) return;
    const timeout = setTimeout(() => {
      const ball = balls[0];
      if (ball) {
        setBalls((prev) => prev.slice(1));
        setLandedBalls((prev) => [...prev.slice(-30), { ...ball, y: 75 + Math.random() * 15 }]);
        setCount((c) => {
          const newCount = c + 1;
          if (newCount >= targetCount) { setIsRaining(false); vibrate([100, 50, 100, 50, 200]); setTimeout(onComplete, 500); }
          return newCount;
        });
        vibrate(20);
        onScore();
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [balls, onScore, onComplete]);

  const handleTap = () => {
    if (!isRaining && count === 0) { setIsRaining(true); vibrate(50); }
    else if (isRaining) { for (let i = 0; i < 3; i++) setTimeout(() => spawnBall(), i * 50); vibrate(30); }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 rounded-2xl cursor-pointer select-none" onClick={handleTap}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white/90 backdrop-blur rounded-full px-6 py-3 shadow-xl">
          <span className="text-3xl font-bold text-sky-600">{count}</span>
          <span className="text-lg text-sky-400">/{targetCount}</span>
        </div>
      </div>
      {balls.map((ball) => (
        <div key={ball.id} className="absolute rounded-full shadow-lg animate-[fall_1.5s_ease-in_forwards]" style={{ width: ball.size, height: ball.size, left: `${ball.x}%`, top: -50, backgroundColor: ball.color }} />
      ))}
      {landedBalls.map((ball) => (
        <div key={ball.id} className="absolute rounded-full" style={{ width: ball.size, height: ball.size, left: `${ball.x}%`, top: `${ball.y}%`, backgroundColor: ball.color }} />
      ))}
      {!isRaining && count === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4 animate-bounce">🌧️</div>
            <p className="text-2xl font-bold text-sky-600">Tap to make it rain!</p>
            <p className="text-sky-400 mt-2">Collect {targetCount} balls</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-green-600 to-green-500 rounded-b-2xl" />
      <style jsx>{`@keyframes fall { from { transform: translateY(0) rotate(0deg); } to { transform: translateY(85vh) rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Bubble Wrap Pop Game
 */
export function BubbleWrapGame({ onScore, onComplete }: GameProps) {
  const gridSize = 6;
  const totalBubbles = gridSize * gridSize;
  const [popped, setPopped] = useState<Set<number>>(new Set());

  const handlePop = (index: number) => {
    if (popped.has(index)) return;
    vibrate(30);
    const newPopped = new Set(popped);
    newPopped.add(index);
    setPopped(newPopped);
    onScore();
    if (newPopped.size >= totalBubbles) { vibrate([100, 50, 100, 50, 200]); setTimeout(onComplete, 500); }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-4 flex flex-col">
      <div className="text-center mb-4">
        <span className="text-2xl font-bold text-purple-600">{popped.size}</span>
        <span className="text-lg text-purple-400">/{totalBubbles} popped</span>
      </div>
      <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {Array.from({ length: totalBubbles }, (_, i) => (
          <button key={i} onClick={() => handlePop(i)} disabled={popped.has(i)}
            className={`aspect-square rounded-full transition-all duration-200 ${popped.has(i) ? 'bg-purple-200 scale-90 opacity-50' : 'bg-gradient-to-br from-white to-purple-200 shadow-lg active:scale-90 hover:shadow-xl'}`}
            style={{ boxShadow: popped.has(i) ? 'none' : 'inset 0 -4px 8px rgba(0,0,0,0.1), inset 0 4px 8px rgba(255,255,255,0.8)' }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Color Match Game
 */
export function ColorMatchGame({ onScore, onComplete }: GameProps) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const colorNames: Record<string, string> = { '#FF6B6B': 'Red', '#4ECDC4': 'Teal', '#45B7D1': 'Blue', '#FFEAA7': 'Yellow', '#DDA0DD': 'Purple', '#98D8C8': 'Green' };

  const [targetColor, setTargetColor] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const maxRounds = 5;

  const generateRound = useCallback(() => {
    const target = colors[getRandomInt(0, colors.length - 1)];
    setTargetColor(target);
    const others = shuffleArray(colors.filter((c) => c !== target)).slice(0, 3);
    setOptions(shuffleArray([target, ...others]));
  }, []);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handleAnswer = (color: string) => {
    vibrate(20);
    if (color === targetColor) {
      setShowFeedback('correct'); vibrate([50, 30, 50]); onScore();
      setTimeout(() => {
        setShowFeedback(null);
        if (round >= maxRounds) { vibrate([100, 50, 100, 50, 100]); onComplete(); }
        else { setRound(round + 1); generateRound(); }
      }, 1000);
    } else { setShowFeedback('wrong'); vibrate(200); setTimeout(() => setShowFeedback(null), 800); }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-4 items-center justify-center">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: maxRounds }, (_, i) => (<div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < round ? 'bg-cyan-500' : 'bg-gray-200'}`} />))}
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-gray-700 mb-4">Find the</p>
        <div className="w-32 h-32 rounded-3xl shadow-xl mx-auto mb-2" style={{ backgroundColor: targetColor }} />
        <p className="text-2xl font-bold" style={{ color: targetColor }}>{colorNames[targetColor]}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {options.map((color, i) => (<button key={i} onClick={() => handleAnswer(color)} className="aspect-square rounded-2xl shadow-lg active:scale-95 transition-transform" style={{ backgroundColor: color }} />))}
      </div>
      {showFeedback && (<div className={`fixed inset-0 flex items-center justify-center transition-opacity z-50 ${showFeedback === 'correct' ? 'bg-green-500/30' : 'bg-red-500/30'}`}><div className="text-8xl">{showFeedback === 'correct' ? '✓' : '✗'}</div></div>)}
    </div>
  );
}

/**
 * Shape Match Game (original simple version)
 */
export function ShapeMatchGame({ onScore, onComplete }: GameProps) {
  const shapes = ['🔴', '🟡', '🟢', '🔵', '🟣', '🟠'];
  const [cards, setCards] = useState<{ id: number; shape: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [canFlip, setCanFlip] = useState(true);

  useEffect(() => {
    const pairs = shapes.slice(0, 6);
    const allCards = [...pairs, ...pairs].map((shape, i) => ({ id: i, shape, flipped: false, matched: false }));
    setCards(shuffleArray(allCards));
  }, []);

  const handleCardTap = (cardId: number) => {
    if (!canFlip) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    vibrate(20);
    const newCards = cards.map((c) => (c.id === cardId ? { ...c, flipped: true } : c));
    setCards(newCards);
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      const [first, second] = newFlipped;
      const firstCard = newCards.find((c) => c.id === first);
      const secondCard = newCards.find((c) => c.id === second);
      if (firstCard?.shape === secondCard?.shape) {
        vibrate([50, 30, 50]); onScore();
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === first || c.id === second ? { ...c, matched: true } : c));
          setFlippedCards([]); setCanFlip(true);
          const matchedCount = newCards.filter((c) => c.matched).length + 2;
          if (matchedCount >= newCards.length) { vibrate([100, 50, 100, 50, 200]); setTimeout(onComplete, 500); }
        }, 500);
      } else {
        vibrate(100);
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === first || c.id === second ? { ...c, flipped: false } : c));
          setFlippedCards([]); setCanFlip(true);
        }, 1000);
      }
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4">
      <p className="text-xl font-bold text-center text-purple-600 mb-4">Find the Matching Pairs!</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button key={card.id} onClick={() => handleCardTap(card.id)} disabled={card.matched}
            className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-300 ${card.matched ? 'bg-green-200 opacity-50' : card.flipped ? 'bg-white shadow-lg' : 'bg-purple-400 shadow-md'}`}
          >
            {(card.flipped || card.matched) ? card.shape : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

// Export all games - complete registry
export const GAME_COMPONENTS: Record<string, React.ComponentType<GameProps>> = {
  // Original games
  counting: CountingBallsGame,
  ballRain: BallRainGame,
  bubbleWrap: BubbleWrapGame,
  colorMatch: ColorMatchGame,
  matching: ShapeMatchGame,

  // Ported from Nick prototype - Educational
  bubblePop: BubblePopNumbersGame,
  colorMix: ColorMixGame,
  colorSort: ColorSortGame,
  letterTrace: LetterTraceGame,
  memoryMatch: MemoryMatchGame,
  numberBonds: NumberBondsGame,
  numberOrder: NumberOrderGame,
  patternComplete: PatternCompleteGame,
  shapeMatchAdvanced: ShapeMatchAdvancedGame,
  sizeSort: SizeSortGame,
  countingAdvanced: CountingBallsAdvancedGame,

  // Ported from Nick prototype - Sensory
  rainbowPaint: RainbowPaintGame,
  fireworks: ParticleFireworksGame,
  musicalBalls: MusicalBallsGame,
  spinFidget: SpinFidgetGame,
  waterPour: WaterPourGame,
  iceCreamBuilder: IceCreamBuilderGame,
  bottleFill: BottleFillGame,
};
