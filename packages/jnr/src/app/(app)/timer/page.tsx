'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';

/**
 * Timer Page — Visual Regulation Timer for Autistic Children
 *
 * Calm, predictable countdown with:
 * - Large progress circle (green -> yellow -> red)
 * - Preset durations with 80px+ touch targets
 * - Gentle chime via Web Audio API on completion
 * - Pause/resume/reset controls
 * - No surprises, no animations that could overstimulate
 */

const PRESETS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
];

// Color transitions: calm green -> warning yellow -> alert red
function getTimerColor(progress: number): string {
  if (progress < 0.6) return '#2D8A56'; // brand green — calm
  if (progress < 0.85) return '#D4A017'; // warm yellow — getting close
  return '#C0392B'; // soft red — almost done
}

// Gentle chime using Web Audio API (no jarring sounds)
function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 523.25; // C5 — gentle high note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
    // Second tone for a soothing two-note chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.value = 659.25; // E5
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    osc2.start(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 1.5);
  } catch {
    // Web Audio not available — silent fallback
  }
}

export default function TimerPage() {
  const router = useRouter();
  const { settings } = useApp();
  const [selectedPreset, setSelectedPreset] = useState(2); // default 5 min
  const [remaining, setRemaining] = useState(PRESETS[2].seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const total = PRESETS[selectedPreset].seconds;
  const progress = total > 0 ? (total - remaining) / total : 0;
  const timerColor = isComplete ? '#2D8A56' : getTimerColor(progress);

  // SVG circle math
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);

  // Timer countdown
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            playChime();
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePreset = useCallback((index: number) => {
    setSelectedPreset(index);
    setRemaining(PRESETS[index].seconds);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  const handleStart = useCallback(() => {
    if (isComplete) {
      setRemaining(total);
      setIsComplete(false);
    }
    setIsRunning(true);
  }, [isComplete, total]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setRemaining(total);
  }, [total]);

  const primaryColor = settings.primaryColor || '#E8610A';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFDF9' }}>
      {/* Header with back button */}
      <header className="flex items-center px-4 py-3 border-b" style={{ borderColor: '#E8E0D6' }}>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center"
          style={{ width: 44, height: 44 }}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1
          className="flex-1 text-center text-xl font-semibold"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#1A1612' }}
        >
          {settings.childName ? `${settings.childName}'s Timer` : 'Timer'}
        </h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-28">
        {/* Progress circle */}
        <div className="relative" style={{ width: 280, height: 280 }}>
          <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
            {/* Background track */}
            <circle
              cx="140" cy="140" r={radius}
              fill="none" stroke="#E8E0D6" strokeWidth="14"
            />
            {/* Progress arc */}
            <circle
              cx="140" cy="140" r={radius}
              fill="none"
              stroke={timerColor}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-light tabular-nums"
              style={{
                fontSize: isComplete ? 40 : 56,
                color: timerColor,
                fontFamily: 'var(--font-inter)',
              }}
            >
              {isComplete ? 'All done' : formatTime(remaining)}
            </span>
            {!isComplete && (
              <span style={{ color: '#9A9088', fontSize: 14, marginTop: 4 }}>
                {isRunning ? 'Running' : remaining === total ? 'Ready' : 'Paused'}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5 mt-8">
          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center justify-center rounded-full border-2"
            style={{
              width: 64, height: 64,
              borderColor: '#E8E0D6',
              backgroundColor: '#FFFDF9',
            }}
            aria-label="Reset timer"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5C544A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={isRunning ? handlePause : handleStart}
            className="flex items-center justify-center rounded-full text-white shadow-lg"
            style={{
              width: 88, height: 88,
              backgroundColor: timerColor,
              minWidth: 88, minHeight: 88,
            }}
            aria-label={isRunning ? 'Pause' : 'Start'}
          >
            {isRunning ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>

          {/* Spacer for symmetry */}
          <div style={{ width: 64, height: 64 }} />
        </div>

        {/* Preset buttons */}
        <div className="flex gap-3 mt-8">
          {PRESETS.map((preset, i) => {
            const isActive = selectedPreset === i;
            return (
              <button
                key={preset.seconds}
                onClick={() => handlePreset(i)}
                disabled={isRunning}
                className="rounded-2xl font-semibold transition-colors disabled:opacity-50"
                style={{
                  minWidth: 80, minHeight: 52,
                  padding: '12px 16px',
                  fontSize: 16,
                  fontFamily: 'var(--font-inter)',
                  backgroundColor: isActive ? primaryColor : '#FFF3E8',
                  color: isActive ? 'white' : '#5C544A',
                  border: isActive ? 'none' : '1px solid #E8E0D6',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <Dock primaryColor={primaryColor} />
    </div>
  );
}
