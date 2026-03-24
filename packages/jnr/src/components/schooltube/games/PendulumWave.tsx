'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const PENDULUM_COUNT = 15;
const BG_COLOR = '#1A1612';
const DURATION = 60;

type PendulumData = {
  length: number;
  frequency: number;
  pivotX: number;
  hue: number;
  boost: number;
};

function playXylophone(index: number) {
  try {
    const notes = [262, 294, 330, 370, 415, 466, 523, 587];
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = notes[index % notes.length];
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 500);
  } catch {}
}

export function PendulumWave({ onBack, primaryColor }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pendulums = useRef<PendulumData[]>([]);
  const animRef = useRef(0);
  const startTimeRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [touchCount, setTouchCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const accent = primaryColor || '#E8610A';

  // Build pendulum data once
  const initPendulums = useCallback((w: number) => {
    const margin = w * 0.1;
    const spacing = (w - margin * 2) / (PENDULUM_COUNT - 1);
    pendulums.current = Array.from({ length: PENDULUM_COUNT }, (_, i) => ({
      length: 0.3 + (i / (PENDULUM_COUNT - 1)) * 0.35, // proportion of canvas height
      frequency: 0.9 + ((PENDULUM_COUNT - 1 - i) / (PENDULUM_COUNT - 1)) * 0.5,
      pivotX: margin + i * spacing,
      hue: (i / PENDULUM_COUNT) * 360,
      boost: 0,
    }));
  }, []);

  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;

      // Find closest pendulum
      let closest = 0;
      let closestDist = Infinity;
      for (let i = 0; i < pendulums.current.length; i++) {
        const d = Math.abs(x - pendulums.current[i].pivotX);
        if (d < closestDist) {
          closestDist = d;
          closest = i;
        }
      }

      pendulums.current[closest].boost = Math.min(
        pendulums.current[closest].boost + 0.3,
        0.6
      );
      playXylophone(closest);
      setTouchCount((c) => c + 1);
    },
    []
  );

  // Animation
  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      if (pendulums.current.length === 0) initPendulums(canvas.width);
    };
    resize();
    window.addEventListener('resize', resize);

    startTimeRef.current = performance.now() / 1000;

    const loop = () => {
      const now = performance.now() / 1000;
      const elapsed = now - startTimeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const pivotY = h * 0.08;
      const ballRadius = Math.max(8, w * 0.018);

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, w, h);

      // Pivot bar
      ctx.fillStyle = 'rgba(255,253,249,0.12)';
      ctx.fillRect(w * 0.08, pivotY - 2, w * 0.84, 4);

      for (const p of pendulums.current) {
        // Decay boost
        p.boost = Math.max(0, p.boost - 0.003);

        const stringLen = p.length * h;
        const maxAngle = 0.5 + p.boost;
        const theta = maxAngle * Math.sin(2 * Math.PI * p.frequency * elapsed);

        const ballX = p.pivotX + Math.sin(theta) * stringLen;
        const ballY = pivotY + Math.cos(theta) * stringLen;

        // String
        ctx.beginPath();
        ctx.moveTo(p.pivotX, pivotY);
        ctx.lineTo(ballX, ballY);
        ctx.strokeStyle = 'rgba(255,253,249,0.18)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ball glow
        const glow = ctx.createRadialGradient(
          ballX,
          ballY,
          0,
          ballX,
          ballY,
          ballRadius * 3
        );
        glow.addColorStop(0, `hsla(${p.hue}, 70%, 65%, 0.25)`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Ball
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 75%, 65%, 0.9)`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [started, initPendulums]);

  // Timer
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  const progressPct = ((DURATION - timeLeft) / DURATION) * 100;

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

      {/* HUD */}
      {started && !showComplete && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 16,
            zIndex: 20,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(255,253,249,0.1)',
              borderRadius: 20,
              padding: '8px 16px',
              border: '1px solid rgba(255,253,249,0.15)',
              color: '#FFFDF9',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {timeLeft}s
          </div>
          {touchCount > 0 && (
            <div
              style={{
                background: 'rgba(255,253,249,0.1)',
                borderRadius: 20,
                padding: '8px 16px',
                border: '1px solid rgba(255,253,249,0.15)',
                color: accent,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              {touchCount}
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {started && !showComplete && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            zIndex: 20,
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,253,249,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 2,
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${accent}, #D4A574)`,
              transition: 'width 1s linear',
            }}
          />
        </div>
      )}

      {/* Canvas */}
      {started && !showComplete && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onClick={(e) => handleTap(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (t) handleTap(t.clientX, t.clientY);
          }}
        />
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
                animation: 'pendulumSwing 2s ease-in-out infinite',
                transformOrigin: 'top center',
              }}
            >
              <span role="img" aria-label="balance">
                {'\u2696\uFE0F'}
              </span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#FFFDF9', margin: '0 0 8px' }}>
              Pendulum Wave
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,253,249,0.6)', margin: 0 }}>
              15 swinging pendulums
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,253,249,0.35)', margin: '4px 0 0' }}>
              Touch to push and watch the wave
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
              <span role="img" aria-label="wave">
                {'\uD83C\uDF0A'}
              </span>
            </div>
            <h3 style={{ fontSize: 36, fontWeight: 700, color: '#FFFDF9', margin: 0 }}>
              Hypnotic
            </h3>
            <p style={{ fontSize: 18, color: 'rgba(255,253,249,0.6)', marginTop: 12 }}>
              {touchCount > 0
                ? `You touched ${touchCount} pendulums`
                : 'Beautiful wave patterns'}
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

      <style>{`
        @keyframes pendulumSwing {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
