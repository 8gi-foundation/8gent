'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

type BreathPhase = 'in' | 'hold-in' | 'out' | 'hold-out';

// Box breathing: 4-4-4-4 (clinically validated for anxiety regulation)
const PHASE_DURATIONS: Record<BreathPhase, number> = {
  in: 4000,
  'hold-in': 4000,
  out: 4000,
  'hold-out': 4000,
};

const PHASE_LABELS: Record<BreathPhase, string> = {
  in: 'Breathe in...',
  'hold-in': 'Hold...',
  out: 'Breathe out...',
  'hold-out': 'Rest...',
};

const NEXT_PHASE: Record<BreathPhase, BreathPhase> = {
  in: 'hold-in',
  'hold-in': 'out',
  out: 'hold-out',
  'hold-out': 'in',
};

const TARGET_BREATHS = 5;

// Warm Jr palette
const COLOR_INHALE = '#E8610A';
const COLOR_EXHALE = '#D4A574';
const BG_COLOR = '#1A1612';

function playTone(freq: number, duration: number, vol: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch {}
}

export function BreathingSphere({ onBack, primaryColor }: GameProps) {
  const accent = primaryColor || COLOR_INHALE;
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('in');
  const [breathCount, setBreathCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCompleteRef = useRef(false);

  // Sphere animation via CSS -- scale driven by phase
  const isExpanding = phase === 'in' || phase === 'hold-in';
  const sphereScale = isExpanding ? 1.6 : 0.85;
  const sphereOpacity = isExpanding ? 0.95 : 0.65;

  const scheduleNextPhase = useCallback(
    (currentPhase: BreathPhase) => {
      if (isCompleteRef.current) return;
      phaseTimerRef.current = setTimeout(() => {
        if (isCompleteRef.current) return;
        const next = NEXT_PHASE[currentPhase];
        setPhase(next);

        if (next === 'in') {
          setBreathCount((c) => {
            const newCount = c + 1;
            if (newCount >= TARGET_BREATHS) {
              isCompleteRef.current = true;
              setShowComplete(true);
              playTone(523, 0.8, 0.1);
              return newCount;
            }
            playTone(440, 0.3, 0.08);
            return newCount;
          });
        }

        scheduleNextPhase(next);
      }, PHASE_DURATIONS[currentPhase]);
    },
    []
  );

  useEffect(() => {
    if (!started) return;
    scheduleNextPhase('in');
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [started, scheduleNextPhase]);

  // Gentle audio cue on phase change
  useEffect(() => {
    if (!started) return;
    if (phase === 'in') playTone(392, 0.4, 0.06);
    if (phase === 'out') playTone(293, 0.4, 0.05);
  }, [phase, started]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: BG_COLOR, borderRadius: 16 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 30,
          width: 48,
          height: 48,
          borderRadius: 24,
          background: 'rgba(255,253,249,0.12)',
          border: '1px solid rgba(255,253,249,0.2)',
          color: '#FFFDF9',
          fontSize: 22,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Go back"
      >
        &larr;
      </button>

      {/* Breath progress dots */}
      {started && !showComplete && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: 10,
          }}
        >
          {Array.from({ length: TARGET_BREATHS }, (_, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: i < breathCount ? accent : 'rgba(255,253,249,0.25)',
                transition: 'all 0.4s ease',
                transform: i < breathCount ? 'scale(1)' : 'scale(0.7)',
              }}
            />
          ))}
        </div>
      )}

      {/* Breathing sphere */}
      {started && !showComplete && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer glow */}
          <div
            style={{
              position: 'absolute',
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
              transform: `scale(${sphereScale * 1.3})`,
              transition: `transform ${PHASE_DURATIONS[phase]}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
          {/* Core sphere */}
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${COLOR_EXHALE}, ${accent})`,
              opacity: sphereOpacity,
              transform: `scale(${sphereScale})`,
              transition: `transform ${PHASE_DURATIONS[phase]}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${PHASE_DURATIONS[phase]}ms ease`,
              boxShadow: `0 0 60px ${accent}44, 0 0 120px ${accent}22`,
            }}
          />
        </div>
      )}

      {/* Phase label */}
      {started && !showComplete && (
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(255,253,249,0.08)',
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              padding: '20px 40px',
              border: '1px solid rgba(255,253,249,0.15)',
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#FFFDF9',
                margin: 0,
              }}
            >
              {PHASE_LABELS[phase]}
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,253,249,0.5)',
                margin: '6px 0 0',
              }}
            >
              Breath {Math.min(breathCount + 1, TARGET_BREATHS)} of{' '}
              {TARGET_BREATHS}
            </p>
          </div>
        </div>
      )}

      {/* Start overlay */}
      {!started && (
        <div
          onClick={() => setStarted(true)}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: `${BG_COLOR}ee`,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '40px 48px',
              borderRadius: 24,
              background: 'rgba(255,253,249,0.05)',
              border: '1px solid rgba(255,253,249,0.12)',
            }}
          >
            <div
              style={{
                fontSize: 64,
                marginBottom: 20,
                animation: 'breathPulse 4s ease-in-out infinite',
              }}
            >
              <span role="img" aria-label="lungs">
                {'\uD83E\uDEC1'}
              </span>
            </div>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: accent,
                margin: '0 0 8px',
              }}
            >
              Breathing Sphere
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,253,249,0.6)', margin: 0 }}>
              Breathe with the glowing circle
            </p>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,253,249,0.35)',
                margin: '4px 0 0',
              }}
            >
              5 peaceful breaths
            </p>
            <p
              style={{
                marginTop: 24,
                fontSize: 18,
                fontWeight: 600,
                color: accent,
                animation: 'fadeInOut 1.5s ease-in-out infinite',
              }}
            >
              Tap to begin
            </p>
          </div>
        </div>
      )}

      {/* Complete overlay */}
      {showComplete && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: `${BG_COLOR}ee`,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>
              <span role="img" aria-label="calm wave">
                {'\uD83C\uDF0A'}
              </span>
            </div>
            <h3
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: accent,
                margin: 0,
              }}
            >
              So Calm
            </h3>
            <p
              style={{
                fontSize: 18,
                color: 'rgba(255,253,249,0.6)',
                marginTop: 12,
              }}
            >
              {TARGET_BREATHS} peaceful breaths done
            </p>
            <button
              onClick={onBack}
              style={{
                marginTop: 28,
                padding: '14px 36px',
                borderRadius: 20,
                background: accent,
                color: '#FFFDF9',
                border: 'none',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes breathPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
