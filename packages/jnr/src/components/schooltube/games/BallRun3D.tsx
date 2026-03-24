'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GameProps {
  onBack: () => void;
  primaryColor?: string;
}

const LANE_COLORS = [
  '#F4A89A', '#A8D8C8', '#B5C7E8', '#F0D6A8',
  '#C8B8E0', '#A8E0D0', '#E8C0C0', '#D0E8B8',
];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  lane: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Lane {
  x: number;
  width: number;
  color: string;
  bumpers: { y: number; side: 'left' | 'right' }[];
}

function playTone(ctx: AudioContext, freq: number, duration = 0.1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export default function BallRun3D({ onBack, primaryColor = '#E8610A' }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const animRef = useRef(0);
  const ballsRef = useRef<Ball[]>([]);
  const lanesRef = useRef<Lane[]>([]);
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new AudioContext();
    }
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

    // Create lanes
    const laneCount = 5;
    const setupLanes = () => {
      const laneW = w() / laneCount;
      lanesRef.current = Array.from({ length: laneCount }, (_, i) => {
        const bumpers: Lane['bumpers'] = [];
        for (let b = 0; b < 6; b++) {
          bumpers.push({
            y: (h() / 7) * (b + 1),
            side: (b + i) % 2 === 0 ? 'left' : 'right',
          });
        }
        return {
          x: i * laneW + laneW / 2,
          width: laneW,
          color: LANE_COLORS[i % LANE_COLORS.length],
          bumpers,
        };
      });
    };
    setupLanes();

    // Spawn a ball at a lane
    const spawnBall = (laneIdx: number) => {
      const lane = lanesRef.current[laneIdx];
      if (!lane) return;
      ballsRef.current.push({
        x: lane.x + (Math.random() - 0.5) * 10,
        y: -10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.5 + Math.random() * 0.5,
        radius: 8 + Math.random() * 6,
        color: LANE_COLORS[(laneIdx + Math.floor(Math.random() * 3)) % LANE_COLORS.length],
        lane: laneIdx,
        trail: [],
      });
    };

    // Auto-spawn balls periodically
    let spawnTimer = 0;

    const draw = () => {
      const cw = w();
      const ch = h();
      ctx.clearRect(0, 0, cw, ch);

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, ch);
      grad.addColorStop(0, '#FFFDF9');
      grad.addColorStop(1, '#FFF5EC');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);

      // Draw lanes
      const lanes = lanesRef.current;
      const laneW = cw / laneCount;
      for (const lane of lanes) {
        // Lane background
        ctx.fillStyle = lane.color + '30';
        ctx.fillRect(lane.x - laneW / 2, 0, laneW, ch);

        // Lane borders
        ctx.strokeStyle = lane.color + '50';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lane.x - laneW / 2, 0);
        ctx.lineTo(lane.x - laneW / 2, ch);
        ctx.stroke();

        // Bumpers
        for (const bumper of lane.bumpers) {
          const bx = bumper.side === 'left'
            ? lane.x - laneW / 2 + 8
            : lane.x + laneW / 2 - 8;
          ctx.fillStyle = lane.color + '80';
          ctx.beginPath();
          ctx.arc(bx, bumper.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and draw balls
      spawnTimer++;
      if (spawnTimer > 40) {
        spawnTimer = 0;
        spawnBall(Math.floor(Math.random() * laneCount));
      }

      const balls = ballsRef.current;
      for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        // Gravity
        ball.vy += 0.08;
        // Slight wobble
        ball.vx += (Math.random() - 0.5) * 0.1;

        // Bumper collision
        const lane = lanes[ball.lane];
        if (lane) {
          for (const bumper of lane.bumpers) {
            const dx = ball.x - (bumper.side === 'left'
              ? lane.x - laneW / 2 + 8
              : lane.x + laneW / 2 - 8);
            const dy = ball.y - bumper.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.radius + 6) {
              ball.vx = bumper.side === 'left' ? 1.5 : -1.5;
              ball.vy *= 0.7;
              if (audioRef.current) {
                playTone(audioRef.current, 300 + ball.lane * 80, 0.08);
              }
            }
          }

          // Lane walls
          const leftWall = lane.x - laneW / 2 + ball.radius;
          const rightWall = lane.x + laneW / 2 - ball.radius;
          if (ball.x < leftWall) { ball.x = leftWall; ball.vx = Math.abs(ball.vx) * 0.6; }
          if (ball.x > rightWall) { ball.x = rightWall; ball.vx = -Math.abs(ball.vx) * 0.6; }
        }

        // Damping
        ball.vx *= 0.98;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Trail
        ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.4 });
        if (ball.trail.length > 12) ball.trail.shift();

        // Draw trail
        for (const t of ball.trail) {
          ctx.globalAlpha = t.alpha;
          ctx.fillStyle = ball.color;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ball.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
          t.alpha *= 0.85;
        }
        ctx.globalAlpha = 1;
        // Draw ball
        ctx.shadowColor = ball.color + '40';
        ctx.shadowBlur = 8;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Remove if off screen
        if (ball.y > ch + 20) {
          balls.splice(i, 1);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    const handleTouch = (clientX: number, clientY: number) => {
      initAudio();
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const laneIdx = Math.floor(x / (w() / laneCount));
      if (laneIdx >= 0 && laneIdx < laneCount) {
        spawnBall(laneIdx);
        spawnBall(laneIdx);
        if (audioRef.current) {
          playTone(audioRef.current, 400 + laneIdx * 60, 0.15);
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => { e.preventDefault(); handleTouch(e.touches[0].clientX, e.touches[0].clientY); };
    const onMouseDown = (e: MouseEvent) => handleTouch(e.clientX, e.clientY);

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('mousedown', onMouseDown);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('mousedown', onMouseDown);
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
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255,253,249,0.85)', borderRadius: 16, padding: '8px 20px',
        fontSize: 14, color: '#8B7355', fontWeight: 500,
      }}>
        Tap a lane to drop balls
      </div>
    </div>
  );
}
