'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const COLORS = [
  '#F4A89A', '#A8D8C8', '#F0D6A8', '#B5C7E8',
  '#C8B8E0', '#E8C0C0', '#D0E8B8', '#A8E0D0',
  '#F0C0D0', '#B0D8E8', '#E0D0A8', '#C0E0C0',
];

interface Domino {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  angle: number; // 0 = upright, PI/2 = fallen
  fallen: boolean;
  fallSpeed: number;
}

function playClick(ctx: AudioContext, pitch: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 200 + pitch * 15;
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export default function DominoCascade({ onBack, primaryColor = '#E8610A' }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const animRef = useRef(0);
  const dominosRef = useRef<Domino[]>([]);
  const cascadeIdx = useRef(-1);
  const scrollOffset = useRef(0);
  const knockedCount = useRef(0);

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

    // Generate domino path - gentle S-curve
    const setup = () => {
      const dominos: Domino[] = [];
      const count = 80;
      const cw = w();
      const ch = h();

      for (let i = 0; i < count; i++) {
        // S-curve path going right
        const t = i / count;
        const x = 60 + t * (count * 28);
        const y = ch * 0.6 + Math.sin(t * Math.PI * 3) * (ch * 0.15);

        dominos.push({
          x,
          y,
          width: 8 + Math.random() * 3,
          height: 35 + Math.random() * 15,
          color: COLORS[i % COLORS.length],
          angle: 0,
          fallen: false,
          fallSpeed: 4 + Math.random() * 2,
        });
      }
      dominosRef.current = dominos;
      cascadeIdx.current = -1;
      scrollOffset.current = 0;
      knockedCount.current = 0;
    };
    setup();

    const startCascade = () => {
      if (cascadeIdx.current >= 0) return;
      cascadeIdx.current = 0;
      const d = dominosRef.current[0];
      if (d) d.fallen = true;
    };

    const draw = () => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, ch);
      bg.addColorStop(0, '#FFFDF9');
      bg.addColorStop(1, '#FFF5EC');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);

      // Ground line
      ctx.strokeStyle = '#E8D5C4';
      ctx.lineWidth = 2;

      const dominos = dominosRef.current;
      const offset = scrollOffset.current;

      // Auto-scroll to follow cascade
      if (cascadeIdx.current >= 0 && cascadeIdx.current < dominos.length) {
        const target = dominos[cascadeIdx.current].x - cw * 0.35;
        scrollOffset.current += (target - scrollOffset.current) * 0.04;
      }

      // Draw ground beneath dominos
      ctx.beginPath();
      ctx.moveTo(0, ch * 0.82);
      ctx.lineTo(cw, ch * 0.82);
      ctx.stroke();

      // Draw dominos
      for (let i = 0; i < dominos.length; i++) {
        const d = dominos[i];
        const screenX = d.x - offset;

        // Skip off-screen
        if (screenX < -60 || screenX > cw + 60) continue;

        // Animate falling
        if (d.fallen && d.angle < Math.PI / 2) {
          d.angle = Math.min(d.angle + 0.06 * d.fallSpeed * 0.016 * 60, Math.PI / 2);

          // Trigger next domino
          if (d.angle > Math.PI / 4 && i === cascadeIdx.current) {
            cascadeIdx.current = i + 1;
            knockedCount.current = i + 1;
            if (i + 1 < dominos.length) {
              dominos[i + 1].fallen = true;
              if (audioRef.current) {
                playClick(audioRef.current, i % 20);
              }
            }
          }
        }

        ctx.save();
        ctx.translate(screenX, d.y);

        // Shadow
        if (d.angle > 0) {
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = '#000';
          const shadowW = d.height * Math.sin(d.angle);
          ctx.fillRect(-2, -2, shadowW, 6);
          ctx.globalAlpha = 1;
        }

        // Rotate from base
        ctx.rotate(-d.angle);

        // Domino body
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color + '40';
        ctx.shadowBlur = 6;

        const hw = d.width / 2;
        ctx.beginPath();
        ctx.roundRect(-hw, -d.height, d.width, d.height, 3);
        ctx.fill();

        // Face detail - line in middle
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-hw + 2, -d.height / 2);
        ctx.lineTo(hw - 2, -d.height / 2);
        ctx.stroke();

        // Dots
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        const dotR = 2;
        ctx.beginPath();
        ctx.arc(0, -d.height * 0.7, dotR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -d.height * 0.3, dotR, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // HUD
      if (cascadeIdx.current >= 0) {
        ctx.fillStyle = 'rgba(139,115,85,0.7)';
        ctx.font = '600 16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${knockedCount.current} knocked`, cw / 2, 36);
      }

      // Hint
      if (cascadeIdx.current < 0) {
        ctx.fillStyle = 'rgba(139,115,85,0.5)';
        ctx.font = '500 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Tap to push the first domino', cw / 2, ch - 30);
      }

      // Reset when all fallen
      if (cascadeIdx.current >= dominos.length) {
        ctx.fillStyle = 'rgba(139,115,85,0.6)';
        ctx.font = '600 18px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('All down! Tap to reset', cw / 2, ch / 2);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    // Touch
    const handleTap = () => {
      initAudio();
      if (cascadeIdx.current >= dominosRef.current.length) {
        setup();
      } else {
        startCascade();
      }
    };

    const onTouch = (e: TouchEvent) => { e.preventDefault(); handleTap(); };
    const onMouse = () => handleTap();

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
