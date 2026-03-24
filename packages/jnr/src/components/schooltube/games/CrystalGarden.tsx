'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

interface Crystal {
  x: number;
  y: number;
  baseHeight: number;
  currentHeight: number;
  targetHeight: number;
  width: number;
  color: string;
  glowColor: string;
  name: string;
  touched: boolean;
  growSpeed: number;
  angle: number;
  sparkles: { x: number; y: number; alpha: number; vy: number }[];
}

const CRYSTAL_DEFS = [
  { name: 'Amethyst', color: '#C8A8E8', glowColor: '#9B6DC8' },
  { name: 'Rose', color: '#F4A8B8', glowColor: '#E07890' },
  { name: 'Sapphire', color: '#A8C8E8', glowColor: '#6898C8' },
  { name: 'Topaz', color: '#F0D6A8', glowColor: '#D4A84C' },
  { name: 'Emerald', color: '#A8D8B8', glowColor: '#58A870' },
  { name: 'Citrine', color: '#F0E0A0', glowColor: '#D8C040' },
  { name: 'Peridot', color: '#C0E8A0', glowColor: '#88C040' },
];

function playChime(ctx: AudioContext, idx: number) {
  const scale = [261, 293, 329, 349, 392, 440, 493]; // C major
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = scale[idx % scale.length];
  gain.gain.setValueAtTime(0.07, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
}

export default function CrystalGarden({ onBack, primaryColor = '#E8610A' }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const animRef = useRef(0);
  const crystalsRef = useRef<Crystal[]>([]);
  const dustRef = useRef<{ x: number; y: number; vx: number; vy: number; alpha: number }[]>([]);

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

    // Setup crystals
    const setup = () => {
      const cw = w();
      const ch = h();
      const count = CRYSTAL_DEFS.length;
      const spacing = cw / (count + 1);
      crystalsRef.current = CRYSTAL_DEFS.map((def, i) => ({
        x: spacing * (i + 1),
        y: ch * 0.75,
        baseHeight: 30 + Math.random() * 20,
        currentHeight: 30 + Math.random() * 20,
        targetHeight: 30 + Math.random() * 20,
        width: 18 + Math.random() * 10,
        color: def.color,
        glowColor: def.glowColor,
        name: def.name,
        touched: false,
        growSpeed: 0.02 + Math.random() * 0.01,
        angle: (Math.random() - 0.5) * 0.15,
        sparkles: [],
      }));

      dustRef.current = Array.from({ length: 30 }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.3, vy: -0.1 - Math.random() * 0.2,
        alpha: 0.2 + Math.random() * 0.3,
      }));
    };
    setup();

    const drawCrystal = (c: Crystal, time: number) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);

      const h = c.currentHeight;
      const hw = c.width / 2;

      // Glow under crystal
      if (c.touched) {
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.8);
        grd.addColorStop(0, c.glowColor + '40');
        grd.addColorStop(1, c.glowColor + '00');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, h * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Crystal body (hexagonal prism simplified as pointed shape)
      ctx.fillStyle = c.color;
      ctx.shadowColor = c.glowColor;
      ctx.shadowBlur = c.touched ? 15 : 5;
      ctx.beginPath();
      ctx.moveTo(0, -h); // tip
      ctx.lineTo(hw * 0.6, -h * 0.7);
      ctx.lineTo(hw, -h * 0.2);
      ctx.lineTo(hw * 0.8, 0);
      ctx.lineTo(-hw * 0.8, 0);
      ctx.lineTo(-hw, -h * 0.2);
      ctx.lineTo(-hw * 0.6, -h * 0.7);
      ctx.closePath();
      ctx.fill();

      // Light face
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(hw * 0.6, -h * 0.7);
      ctx.lineTo(hw * 0.3, -h * 0.1);
      ctx.lineTo(-hw * 0.2, -h * 0.3);
      ctx.closePath();
      ctx.fill();

      // Sparkles when touched
      if (c.touched) {
        for (const sp of c.sparkles) {
          ctx.globalAlpha = sp.alpha;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 2, 0, Math.PI * 2);
          ctx.fill();
          sp.y += sp.vy;
          sp.alpha -= 0.008;
        }
        ctx.globalAlpha = 1;
        c.sparkles = c.sparkles.filter(s => s.alpha > 0);

        // Add new sparkles
        if (Math.random() < 0.3) {
          c.sparkles.push({
            x: (Math.random() - 0.5) * c.width,
            y: -Math.random() * h,
            alpha: 0.6 + Math.random() * 0.4,
            vy: -0.3 - Math.random() * 0.5,
          });
        }
      }

      ctx.restore();

      // Name label
      if (c.touched) {
        ctx.fillStyle = 'rgba(139,115,85,0.7)';
        ctx.font = '500 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(c.name, c.x, c.y + 18);
      }
    };

    const draw = (time: number) => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      // Background gradient (deep garden feel)
      const bg = ctx.createLinearGradient(0, 0, 0, ch);
      bg.addColorStop(0, '#F8F0F5');
      bg.addColorStop(0.6, '#FFFDF9');
      bg.addColorStop(1, '#F0E8D8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);

      ctx.fillStyle = '#E8D8C4';
      ctx.beginPath();
      ctx.ellipse(cw / 2, ch * 0.78, cw * 0.45, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      for (const d of dustRef.current) {
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = '#D8C8B0';
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        d.x += d.vx; d.y += d.vy;
        if (d.y < -5) { d.y = ch + 5; d.x = Math.random() * cw; }
      }
      ctx.globalAlpha = 1;

      // Update and draw crystals
      const crystals = crystalsRef.current;
      for (const c of crystals) {
        // Grow toward target
        c.currentHeight += (c.targetHeight - c.currentHeight) * c.growSpeed;
        drawCrystal(c, time);
      }

      // Progress
      const touched = crystals.filter(c => c.touched).length;
      ctx.fillStyle = 'rgba(139,115,85,0.6)';
      ctx.font = '600 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${touched} / ${crystals.length} crystals`, cw / 2, 36);

      if (touched === 0) {
        ctx.fillStyle = 'rgba(139,115,85,0.4)';
        ctx.font = '500 14px system-ui';
        ctx.fillText('Tap each crystal to grow it', cw / 2, ch - 24);
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

      for (let i = 0; i < crystalsRef.current.length; i++) {
        const c = crystalsRef.current[i];
        const dx = x - c.x;
        const dy = y - (c.y - c.currentHeight / 2);
        if (Math.abs(dx) < c.width + 15 && Math.abs(dy) < c.currentHeight / 2 + 20) {
          // Grow this crystal
          c.targetHeight = Math.min(c.targetHeight + 30, 200);
          if (!c.touched) c.touched = true;
          else c.targetHeight = Math.min(c.targetHeight + 15, 200);
          if (audioRef.current) playChime(audioRef.current, i);
          break;
        }
      }
    };

    const onTouch = (e: TouchEvent) => { e.preventDefault(); handleTap(e.touches[0].clientX, e.touches[0].clientY); };
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
