'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const BG_TOP = '#1A1612';
const BG_BOT = '#0f0a08';
const DURATION = 60;

type Blob = {
  x: number;
  y: number;
  baseY: number;
  radius: number;
  speed: number;
  offset: number;
  warmH: number;
  coolH: number;
  alive: boolean;
};

function createBlob(w: number, h: number, x?: number, y?: number, r?: number): Blob {
  return {
    x: x ?? w * 0.2 + Math.random() * w * 0.6,
    y: y ?? Math.random() * h,
    baseY: y ?? Math.random() * h,
    radius: r ?? 20 + Math.random() * 25,
    speed: 0.3 + Math.random() * 0.4,
    offset: Math.random() * Math.PI * 2,
    warmH: 15 + Math.random() * 20, // orange-red
    coolH: 260 + Math.random() * 40, // blue-purple
    alive: true,
  };
}

function playNote(freq: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    setTimeout(() => ctx.close(), 400);
  } catch {}
}

export function LavaLamp({ onBack, primaryColor }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const animRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [blobCount, setBlobCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const accent = primaryColor || '#E8610A';

  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      for (let i = 0; i < blobsRef.current.length; i++) {
        const b = blobsRef.current[i];
        if (!b.alive) continue;
        const dx = b.x - x;
        const dy = b.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < b.radius + 8) {
          if (b.radius < 14 || blobsRef.current.filter((bl) => bl.alive).length >= 20)
            return;

          playNote(300 + Math.random() * 200);
          b.alive = false;

          const newR = b.radius * 0.7;
          const angle = Math.random() * Math.PI * 2;
          const off = b.radius * 0.4;
          blobsRef.current.push(
            createBlob(
              canvas.width,
              canvas.height,
              b.x + Math.cos(angle) * off,
              b.y + Math.sin(angle) * off,
              newR
            ),
            createBlob(
              canvas.width,
              canvas.height,
              b.x - Math.cos(angle) * off,
              b.y - Math.sin(angle) * off,
              newR
            )
          );
          setBlobCount(blobsRef.current.filter((bl) => bl.alive).length);
          return;
        }
      }
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
    };
    resize();
    window.addEventListener('resize', resize);

    // Init blobs
    blobsRef.current = Array.from({ length: 8 }, () =>
      createBlob(canvas.width, canvas.height)
    );
    setBlobCount(8);

    let time = 0;
    const loop = () => {
      time += 0.016;
      const w = canvas.width;
      const h = canvas.height;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, BG_TOP);
      bgGrad.addColorStop(1, BG_BOT);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Lamp glass walls (subtle)
      ctx.strokeStyle = 'rgba(255,253,249,0.06)';
      ctx.lineWidth = 2;
      const glassL = w * 0.15;
      const glassR = w * 0.85;
      ctx.beginPath();
      ctx.moveTo(glassL, 0);
      ctx.lineTo(glassL, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(glassR, 0);
      ctx.lineTo(glassR, h);
      ctx.stroke();

      // Bottom glow
      const botGlow = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.4);
      botGlow.addColorStop(0, 'rgba(232,97,10,0.12)');
      botGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = botGlow;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);

      // Remove dead blobs
      blobsRef.current = blobsRef.current.filter((b) => b.alive);

      for (const b of blobsRef.current) {
        // Sine-wave vertical motion
        const yOff = Math.sin(time * b.speed + b.offset) * h * 0.15;
        b.y = b.baseY + yOff;

        // Gentle horizontal drift
        b.x += Math.sin(time * 0.2 + b.offset) * 0.3;

        // Keep in glass
        b.x = Math.max(w * 0.15 + b.radius, Math.min(w * 0.85 - b.radius, b.x));

        // Color: warm at bottom, cool at top
        const normalY = Math.max(0, Math.min(1, b.y / h));
        const hue = b.warmH + (b.coolH - b.warmH) * (1 - normalY);
        const lightness = 55 + normalY * 10;

        // Glow
        const glow = ctx.createRadialGradient(
          b.x,
          b.y,
          0,
          b.x,
          b.y,
          b.radius * 2
        );
        glow.addColorStop(0, `hsla(${hue}, 65%, ${lightness}%, 0.35)`);
        glow.addColorStop(0.5, `hsla(${hue}, 55%, ${lightness - 10}%, 0.1)`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core with pulse
        const pulse = 1 + Math.sin(time * 1.5 + b.offset) * 0.06;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 65%, ${lightness}%, 0.8)`;
        ctx.fill();
      }

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

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: BG_TOP, borderRadius: 16 }}
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
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: 12,
          }}
        >
          <div
            style={{
              background: 'rgba(255,253,249,0.1)',
              borderRadius: 20,
              padding: '8px 18px',
              border: '1px solid rgba(255,253,249,0.15)',
              color: '#FFFDF9',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {timeLeft}s
          </div>
          <div
            style={{
              background: 'rgba(255,253,249,0.1)',
              borderRadius: 20,
              padding: '8px 18px',
              border: '1px solid rgba(255,253,249,0.15)',
              color: accent,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {blobCount}
          </div>
        </div>
      )}

      {/* Hint */}
      {started && !showComplete && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(255,253,249,0.08)',
            borderRadius: 16,
            padding: '10px 24px',
            border: '1px solid rgba(255,253,249,0.1)',
          }}
        >
          <p
            style={{
              fontSize: 15,
              color: 'rgba(255,253,249,0.7)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Tap blobs to split them
          </p>
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
            background: `${BG_TOP}ee`,
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
                animation: 'lavaFloat 3s ease-in-out infinite',
              }}
            >
              <span role="img" aria-label="crystal ball">
                {'\uD83D\uDD2E'}
              </span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: accent, margin: '0 0 8px' }}>
              Lava Lamp
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,253,249,0.6)', margin: 0 }}>
              Watch the glowing blobs float
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,253,249,0.35)', margin: '4px 0 0' }}>
              Tap to split them apart
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
            background: `${BG_TOP}ee`,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>
              <span role="img" aria-label="rainbow">
                {'\uD83C\uDF08'}
              </span>
            </div>
            <h3 style={{ fontSize: 36, fontWeight: 700, color: accent, margin: 0 }}>
              So Relaxing
            </h3>
            <p style={{ fontSize: 18, color: 'rgba(255,253,249,0.6)', marginTop: 12 }}>
              Beautiful lava lamp
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
        @keyframes lavaFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
