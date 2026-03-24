'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const PASTEL = [
  '#F4A89A', '#A8D8C8', '#F0D6A8', '#B5C7E8',
  '#C8B8E0', '#E8C0C0', '#D0E8B8', '#A8E0D0',
];

interface Orb {
  x: number;
  y: number;
  radius: number;
  color: string;
  phase: 'idle' | 'exploding' | 'done';
  explodeTime: number;
  explodeProgress: number;
  pulseOffset: number;
}

const EXPLODE_DURATION = 600; // ms
const CHAIN_RADIUS_MULT = 3.5; // multiplier of orb radius for chain trigger
const CHAIN_DELAY = 180; // ms

function playChime(ctx: AudioContext, freq: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export default function ChainReaction({ onBack, primaryColor = '#E8610A' }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const animRef = useRef(0);
  const orbsRef = useRef<Orb[]>([]);
  const chainQueue = useRef<{ id: number; time: number }[]>([]);

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

    // Generate orbs in clusters
    const orbs: Orb[] = [];
    const clusterCount = 4;
    const orbsPerCluster = 6;
    const setup = () => {
      orbs.length = 0;
      const cw = w();
      const ch = h();
      for (let c = 0; c < clusterCount; c++) {
        const angle = (c / clusterCount) * Math.PI * 2;
        const cx = cw / 2 + Math.cos(angle) * Math.min(cw, ch) * 0.25;
        const cy = ch / 2 + Math.sin(angle) * Math.min(cw, ch) * 0.25;
        for (let s = 0; s < orbsPerCluster; s++) {
          const a = (s / orbsPerCluster) * Math.PI * 2;
          const dist = 20 + Math.random() * 40;
          orbs.push({
            x: cx + Math.cos(a) * dist,
            y: cy + Math.sin(a) * dist,
            radius: 18 + Math.random() * 10,
            color: PASTEL[Math.floor(Math.random() * PASTEL.length)],
            phase: 'idle',
            explodeTime: 0,
            explodeProgress: 0,
            pulseOffset: Math.random() * Math.PI * 2,
          });
        }
      }
      orbsRef.current = orbs;
    };
    setup();

    const triggerExplode = (idx: number, now: number) => {
      const orb = orbs[idx];
      if (!orb || orb.phase !== 'idle') return;
      orb.phase = 'exploding';
      orb.explodeTime = now;
      if (audioRef.current) {
        playChime(audioRef.current, 350 + idx * 30);
      }
      // Queue chain reactions
      for (let i = 0; i < orbs.length; i++) {
        if (i === idx || orbs[i].phase !== 'idle') continue;
        const dx = orbs[i].x - orb.x;
        const dy = orbs[i].y - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < orb.radius * CHAIN_RADIUS_MULT) {
          chainQueue.current.push({ id: i, time: now + CHAIN_DELAY });
        }
      }
    };

    const draw = (now: number) => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      // Background
      ctx.fillStyle = '#FFFDF9';
      ctx.fillRect(0, 0, cw, ch);

      // Process chain queue
      const queue = chainQueue.current;
      for (let i = queue.length - 1; i >= 0; i--) {
        if (now >= queue[i].time) {
          triggerExplode(queue[i].id, now);
          queue.splice(i, 1);
        }
      }

      // Draw orbs
      let allDone = true;
      let anyExploding = false;
      for (const orb of orbs) {
        if (orb.phase === 'done') continue;

        if (orb.phase === 'idle') {
          allDone = false;
          const pulse = 1 + Math.sin(now * 0.002 + orb.pulseOffset) * 0.06;
          const r = orb.radius * pulse;

          // Glow
          ctx.shadowColor = orb.color;
          ctx.shadowBlur = 12;
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = orb.color;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
          ctx.fill();

          // Inner highlight
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(orb.x - r * 0.25, orb.y - r * 0.25, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (orb.phase === 'exploding') {
          allDone = false;
          anyExploding = true;
          const elapsed = now - orb.explodeTime;
          const t = Math.min(elapsed / EXPLODE_DURATION, 1);
          orb.explodeProgress = t;

          const expandR = orb.radius * (1 + t * 2.5);
          const alpha = Math.max(0, 1 - t * 1.3);

          // Expanding ring
          ctx.globalAlpha = alpha * 0.3;
          ctx.strokeStyle = orb.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, expandR + 10, 0, Math.PI * 2);
          ctx.stroke();

          // Expanding orb
          ctx.globalAlpha = alpha;
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 20 * (1 - t);
          ctx.fillStyle = orb.color;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, expandR, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;

          if (t >= 1) orb.phase = 'done';
        }
      }

      // Count and show progress
      const total = orbs.length;
      const done = orbs.filter(o => o.phase === 'done').length;
      const exploding = orbs.filter(o => o.phase === 'exploding').length;

      if (done + exploding > 0) {
        ctx.fillStyle = 'rgba(139,115,85,0.7)';
        ctx.font = '600 16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${done + exploding} / ${total}`, cw / 2, 40);
      }

      // Hint if nothing started
      if (done === 0 && !anyExploding && queue.length === 0) {
        ctx.fillStyle = 'rgba(139,115,85,0.5)';
        ctx.font = '500 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Tap an orb to start the chain', cw / 2, ch - 30);
      }

      // Reset check
      if (allDone && orbs.every(o => o.phase === 'done')) {
        // All exploded - reset after delay
        setTimeout(() => {
          setup();
          chainQueue.current = [];
        }, 1500);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    // Touch handler
    const handleTap = (clientX: number, clientY: number) => {
      initAudio();
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let i = 0; i < orbs.length; i++) {
        const dx = orbs[i].x - x;
        const dy = orbs[i].y - y;
        if (Math.sqrt(dx * dx + dy * dy) < orbs[i].radius + 10 && orbs[i].phase === 'idle') {
          triggerExplode(i, performance.now());
          break;
        }
      }
    };

    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      handleTap(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onMouse = (e: MouseEvent) => handleTap(e.clientX, e.clientY);

    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('mousedown', onMouse);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('mousedown', onMouse);
    };
  }, [initAudio]);

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
