'use client';

import { useEffect, useRef, useState } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const BG_COLOR = '#0d0a08';
const STAR_COUNT = 400;
const DURATION = 50;

type Star = {
  x: number;
  y: number;
  z: number;
  speed: number;
  hue: number;
  size: number;
};

type ShootingStar = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  trail: { x: number; y: number }[];
};

function playShimmer() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 800 + Math.random() * 300;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 500);
  } catch {}
}

export function Starfield({ onBack, primaryColor }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar>({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    trail: [],
  });
  const nextShootRef = useRef(3);
  const steerRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [showComplete, setShowComplete] = useState(false);

  const accent = primaryColor || '#E8610A';

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
    };
    resize();
    window.addEventListener('resize', resize);

    // Init stars
    const w = canvas.width;
    const h = canvas.height;
    const starHues = [0, 40, 55, 210, 340]; // warm whites, gold, blue, pink
    starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * w * 3,
      y: (Math.random() - 0.5) * h * 3,
      z: Math.random() * 1000,
      speed: 0.5 + Math.random() * 1.5,
      hue: starHues[Math.floor(Math.random() * starHues.length)],
      size: 0.5 + Math.random() * 1.5,
    }));

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Fade background (creates trail effect)
      ctx.fillStyle = `${BG_COLOR}cc`;
      ctx.fillRect(0, 0, w, h);

      const steerX = steerRef.current.x;
      const steerY = steerRef.current.y;

      // Stars
      for (const s of starsRef.current) {
        s.z -= s.speed * 2;

        // Steering offset
        s.x += steerX * 0.5;
        s.y += steerY * 0.5;

        if (s.z <= 0) {
          s.z = 1000;
          s.x = (Math.random() - 0.5) * w * 3;
          s.y = (Math.random() - 0.5) * h * 3;
        }

        // Project to 2D
        const scale = 300 / s.z;
        const sx = cx + s.x * scale;
        const sy = cy + s.y * scale;
        const r = Math.max(0.3, s.size * scale * 0.5);
        const alpha = Math.min(1, (1000 - s.z) / 600);

        if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

        // Warm star color
        const lightness = 85 + (s.hue === 0 ? 10 : 0);
        const saturation = s.hue === 0 ? 0 : 60;

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        ctx.fill();

        // Subtle glow for bigger stars
        if (r > 1.2) {
          ctx.beginPath();
          ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, ${saturation}%, ${lightness}%, ${alpha * 0.1})`;
          ctx.fill();
        }
      }

      // Shooting star
      const ss = shootingRef.current;
      nextShootRef.current -= 0.016;

      if (!ss.active && nextShootRef.current <= 0) {
        ss.active = true;
        ss.x = Math.random() * w * 0.8 + w * 0.1;
        ss.y = Math.random() * h * 0.3;
        const angle = Math.PI * 0.25 + Math.random() * Math.PI * 0.15;
        ss.vx = Math.cos(angle) * 4;
        ss.vy = Math.sin(angle) * 4;
        ss.life = 1;
        ss.trail = [];
        nextShootRef.current = 4 + Math.random() * 6;
        playShimmer();
      }

      if (ss.active) {
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.015;
        ss.trail.push({ x: ss.x, y: ss.y });
        if (ss.trail.length > 20) ss.trail.shift();

        // Draw trail
        for (let i = 0; i < ss.trail.length; i++) {
          const t = ss.trail[i];
          const trailAlpha = (i / ss.trail.length) * ss.life * 0.5;
          const trailR = 1.5 * (i / ss.trail.length);
          ctx.beginPath();
          ctx.arc(t.x, t.y, trailR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 248, 220, ${trailAlpha})`;
          ctx.fill();
        }

        // Head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 253, 240, ${ss.life})`;
        ctx.fill();

        if (ss.life <= 0 || ss.x > w + 20 || ss.y > h + 20) {
          ss.active = false;
        }
      }

      // Dampen steering
      steerRef.current.x *= 0.95;
      steerRef.current.y *= 0.95;

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [started]);

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

  // Steering handlers
  const handleMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;
    steerRef.current = { x: nx * 0.8, y: ny * 0.8 };
  };

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
              background: 'rgba(255,253,249,0.08)',
              borderRadius: 20,
              padding: '8px 16px',
              border: '1px solid rgba(255,253,249,0.12)',
              color: '#FFFDF9',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {timeLeft}s
          </div>
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
            background: 'rgba(255,253,249,0.06)',
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

      {/* Instruction */}
      {started && !showComplete && timeLeft > DURATION - 5 && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(255,253,249,0.08)',
            borderRadius: 16,
            padding: '10px 24px',
            border: '1px solid rgba(255,253,249,0.1)',
            transition: 'opacity 1s ease',
          }}
        >
          <p
            style={{
              fontSize: 15,
              color: 'rgba(255,253,249,0.6)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Move your finger to steer through space
          </p>
        </div>
      )}

      {/* Canvas */}
      {started && !showComplete && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (t) handleMove(t.clientX, t.clientY);
          }}
          onClick={() => playShimmer()}
          onTouchStart={() => playShimmer()}
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
            background: `${BG_COLOR}`,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              padding: '40px 48px',
              borderRadius: 24,
              background: 'rgba(255,253,249,0.04)',
              border: '1px solid rgba(255,253,249,0.1)',
            }}
          >
            <div
              style={{
                fontSize: 64,
                marginBottom: 20,
                animation: 'starTwinkle 3s ease-in-out infinite',
              }}
            >
              <span role="img" aria-label="star">
                {'\u2B50'}
              </span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#FFFDF9', margin: '0 0 8px' }}>
              Starfield
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,253,249,0.6)', margin: 0 }}>
              Drift through the galaxy
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,253,249,0.35)', margin: '4px 0 0' }}>
              Move to steer your path
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
              <span role="img" aria-label="glowing star">
                {'\uD83C\uDF1F'}
              </span>
            </div>
            <h3 style={{ fontSize: 36, fontWeight: 700, color: '#FFFDF9', margin: 0 }}>
              Beautiful
            </h3>
            <p style={{ fontSize: 18, color: 'rgba(255,253,249,0.6)', marginTop: 12 }}>
              What a peaceful journey
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
        @keyframes starTwinkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(15deg); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
