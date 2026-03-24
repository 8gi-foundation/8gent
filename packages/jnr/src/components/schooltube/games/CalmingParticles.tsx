'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const PARTICLE_COUNT = 50;
const BG_COLOR = '#1A1612';
const DURATION = 60;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  alpha: number;
  pulseOffset: number;
  popped: number; // >0 means popping animation
};

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: 12 + Math.random() * 18,
    hue: 20 + Math.random() * 30, // warm orange-amber tones
    alpha: 0.5 + Math.random() * 0.35,
    pulseOffset: Math.random() * Math.PI * 2,
    popped: 0,
  };
}

function playPop() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600 + Math.random() * 200;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => ctx.close(), 300);
  } catch {}
}

export function CalmingParticles({ onBack, primaryColor }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const animRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [popCount, setPopCount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const accent = primaryColor || '#E8610A';

  // Initialize particles
  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(w, h)
    );
  }, []);

  // Handle tap/click on canvas
  const handleCanvasInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      touchRef.current = { x, y };

      // Check if we tapped a particle
      for (const p of particlesRef.current) {
        if (p.popped > 0) continue;
        const dx = p.x - x;
        const dy = p.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < p.radius + 10) {
          p.popped = 1.0;
          playPop();
          setPopCount((c) => c + 1);
          break;
        }
      }
    },
    []
  );

  // Animation loop
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
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const loop = () => {
      time += 0.016;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        // Popping animation
        if (p.popped > 0) {
          p.popped -= 0.025;
          const scale = 1 + (1 - p.popped) * 2;
          const alpha = p.popped * 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * scale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${alpha})`;
          ctx.fill();
          if (p.popped <= 0) {
            // Respawn
            Object.assign(p, createParticle(w, h));
          }
          continue;
        }

        // Drift with gentle noise
        const noiseX = Math.sin(time * 0.3 + p.pulseOffset) * 0.15;
        const noiseY = Math.cos(time * 0.4 + p.pulseOffset * 1.3) * 0.15;
        p.x += p.vx + noiseX;
        p.y += p.vy + noiseY;

        // Touch attraction (soft)
        if (touchRef.current) {
          const dx = touchRef.current.x - p.x;
          const dy = touchRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 1) {
            p.vx += (dx / dist) * 0.02;
            p.vy += (dy / dist) * 0.02;
          }
        }

        // Damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Soft wrap
        if (p.x < -p.radius) p.x = w + p.radius;
        if (p.x > w + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = h + p.radius;
        if (p.y > h + p.radius) p.y = -p.radius;

        // Gentle pulse
        const pulse = 1 + Math.sin(time * 1.2 + p.pulseOffset) * 0.1;
        const r = p.radius * pulse;

        // Draw glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.5);
        grad.addColorStop(0, `hsla(${p.hue}, 70%, 65%, ${p.alpha * 0.6})`);
        grad.addColorStop(0.6, `hsla(${p.hue}, 60%, 55%, ${p.alpha * 0.2})`);
        grad.addColorStop(1, `hsla(${p.hue}, 50%, 45%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 68%, ${p.alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [started, initParticles]);

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
            {popCount}
          </div>
        </div>
      )}

      {/* Canvas */}
      {started && !showComplete && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onClick={(e) => handleCanvasInteraction(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (t) handleCanvasInteraction(t.clientX, t.clientY);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (t) {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect)
                touchRef.current = {
                  x: t.clientX - rect.left,
                  y: t.clientY - rect.top,
                };
            }
          }}
          onTouchEnd={() => {
            touchRef.current = null;
          }}
          onMouseMove={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect)
              touchRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              };
          }}
          onMouseLeave={() => {
            touchRef.current = null;
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
            <div style={{ fontSize: 64, marginBottom: 20 }}>
              <span role="img" aria-label="sparkles">
                {'\u2728'}
              </span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: accent, margin: '0 0 8px' }}>
              Calming Particles
            </p>
            <p style={{ fontSize: 16, color: 'rgba(255,253,249,0.6)', margin: 0 }}>
              Tap the glowing orbs
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,253,249,0.35)', margin: '4px 0 0' }}>
              Move your finger to attract them
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
              <span role="img" aria-label="calm face">
                {'\uD83D\uDE0C'}
              </span>
            </div>
            <h3 style={{ fontSize: 36, fontWeight: 700, color: accent, margin: 0 }}>
              So Calm
            </h3>
            <p style={{ fontSize: 18, color: 'rgba(255,253,249,0.6)', marginTop: 12 }}>
              You popped {popCount} particles
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
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
