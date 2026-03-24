'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const PARTICLE_COUNT = 300;
const ATTRACTION = 0.4;
const MAX_FORCE = 1.8;
const HOME_FORCE = 0.008;
const DAMPING = 0.96;
const DRIFT = 0.15;

const WARM_COLORS = [
  [244, 168, 154], // soft coral
  [168, 216, 200], // mint
  [240, 214, 168], // warm gold
  [181, 199, 232], // soft blue
  [200, 184, 224], // lavender
  [232, 192, 192], // blush
  [208, 232, 184], // sage
  [168, 224, 208], // teal
];

function playHum(ctx: AudioContext, freq: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

export default function MagneticParticles({ onBack, primaryColor = '#E8610A' }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const animRef = useRef(0);
  const touchPos = useRef<{ x: number; y: number } | null>(null);
  const isTouching = useRef(false);
  const lastHum = useRef(0);

  // Particle arrays (flat for performance)
  const posX = useRef(new Float32Array(PARTICLE_COUNT));
  const posY = useRef(new Float32Array(PARTICLE_COUNT));
  const velX = useRef(new Float32Array(PARTICLE_COUNT));
  const velY = useRef(new Float32Array(PARTICLE_COUNT));
  const homeX = useRef(new Float32Array(PARTICLE_COUNT));
  const homeY = useRef(new Float32Array(PARTICLE_COUNT));
  const colorIdx = useRef(new Uint8Array(PARTICLE_COUNT));
  const sizes = useRef(new Float32Array(PARTICLE_COUNT));

  const initAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.clientWidth;
    const h = () => canvas.clientHeight;

    // Initialize particles in a circular cloud
    const setup = () => {
      const cw = w();
      const ch = h();
      const cx = cw / 2;
      const cy = ch / 2;
      const radius = Math.min(cw, ch) * 0.35;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        posX.current[i] = x;
        posY.current[i] = y;
        homeX.current[i] = x;
        homeY.current[i] = y;
        velX.current[i] = 0;
        velY.current[i] = 0;
        colorIdx.current[i] = Math.floor(Math.random() * WARM_COLORS.length);
        sizes.current[i] = 2 + Math.random() * 3;
      }
    };
    setup();

    const draw = (now: number) => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      // Background
      ctx.fillStyle = '#FFFDF9';
      ctx.fillRect(0, 0, cw, ch);

      const touching = isTouching.current;
      const tp = touchPos.current;

      // Gentle audio feedback
      if (touching && audioRef.current && now - lastHum.current > 400) {
        lastHum.current = now;
        playHum(audioRef.current, 180 + Math.random() * 80);
      }

      // Update particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let vx = velX.current[i];
        let vy = velY.current[i];
        const x = posX.current[i];
        const y = posY.current[i];

        if (touching && tp) {
          // Attract to touch
          const dx = tp.x - x;
          const dy = tp.y - y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist > 1) {
            let force = ATTRACTION / Math.max(distSq * 0.01, 1);
            force = Math.min(force, MAX_FORCE);
            vx += (dx / dist) * force;
            vy += (dy / dist) * force;
          }
        } else {
          // Return home
          vx += (homeX.current[i] - x) * HOME_FORCE;
          vy += (homeY.current[i] - y) * HOME_FORCE;
        }

        // Random drift
        vx += (Math.random() - 0.5) * DRIFT;
        vy += (Math.random() - 0.5) * DRIFT;

        // Damping
        vx *= DAMPING;
        vy *= DAMPING;

        velX.current[i] = vx;
        velY.current[i] = vy;
        posX.current[i] = x + vx;
        posY.current[i] = y + vy;
      }

      // Draw particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ci = colorIdx.current[i];
        const [r, g, b] = WARM_COLORS[ci];
        const s = sizes.current[i];

        // Speed-based alpha
        const speed = Math.sqrt(velX.current[i] ** 2 + velY.current[i] ** 2);
        const alpha = Math.min(0.5 + speed * 0.3, 0.9);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(posX.current[i], posY.current[i], s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Touch indicator
      if (touching && tp) {
        ctx.strokeStyle = primaryColor + '30';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Hint
      if (!touching) {
        ctx.fillStyle = 'rgba(139,115,85,0.4)';
        ctx.font = '500 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Touch and drag to attract particles', cw / 2, ch - 30);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    // Touch events
    const getPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      initAudio();
      isTouching.current = true;
      touchPos.current = getPos(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      touchPos.current = getPos(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => { isTouching.current = false; };

    const onMouseDown = (e: MouseEvent) => {
      initAudio();
      isTouching.current = true;
      touchPos.current = getPos(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isTouching.current) {
        touchPos.current = getPos(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => { isTouching.current = false; };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
    };
  }, [initAudio, primaryColor]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#FFFDF9' }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          width: 48, height: 48, borderRadius: 24,
          background: 'rgba(255,255,255,0.9)', border: '2px solid #E8D5C4',
          fontSize: 22, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Go back"
      >
        &#8592;
      </button>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      />
    </div>
  );
}
