'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * DrumPads - 4x4 drum pad grid with Web Audio API synthesis
 *
 * Large colorful pads, visual feedback on tap, keyboard support on desktop.
 * No audio files needed -- all sounds synthesized.
 */

const KEYBOARD_MAP: Record<string, number> = {
  '1': 0, '2': 1, '3': 2, '4': 3,
  'q': 4, 'w': 5, 'e': 6, 'r': 7,
  'a': 8, 's': 9, 'd': 10, 'f': 11,
  'z': 12, 'x': 13, 'c': 14, 'v': 15,
};

const PADS = [
  { id: 0,  color: '#FF1744', sound: 'kick' as const },
  { id: 1,  color: '#FF5722', sound: 'kick2' as const },
  { id: 2,  color: '#FF9100', sound: 'lowTom' as const },
  { id: 3,  color: '#FFC400', sound: 'midTom' as const },
  { id: 4,  color: '#76FF03', sound: 'snare' as const },
  { id: 5,  color: '#00E676', sound: 'snare2' as const },
  { id: 6,  color: '#1DE9B6', sound: 'clap' as const },
  { id: 7,  color: '#00E5FF', sound: 'rimshot' as const },
  { id: 8,  color: '#2979FF', sound: 'closedHat' as const },
  { id: 9,  color: '#651FFF', sound: 'openHat' as const },
  { id: 10, color: '#D500F9', sound: 'crash' as const },
  { id: 11, color: '#FF4081', sound: 'ride' as const },
  { id: 12, color: '#F50057', sound: 'cowbell' as const },
  { id: 13, color: '#C51162', sound: 'shaker' as const },
  { id: 14, color: '#AA00FF', sound: 'conga' as const },
  { id: 15, color: '#6200EA', sound: 'bongo' as const },
];

type DrumSound = typeof PADS[number]['sound'];

function playDrumSound(ctx: AudioContext, sound: DrumSound) {
  const now = ctx.currentTime;
  switch (sound) {
    case 'kick': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.setValueAtTime(150, now);
      o.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      g.gain.setValueAtTime(0.8, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      o.start(now); o.stop(now + 0.3); break;
    }
    case 'kick2': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.setValueAtTime(200, now);
      o.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      g.gain.setValueAtTime(0.7, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      o.start(now); o.stop(now + 0.25); break;
    }
    case 'snare': {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.2));
      const n = ctx.createBufferSource(); n.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1000;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.6, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(now);
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.connect(og); og.connect(ctx.destination); o.type = 'triangle';
      o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.05);
      og.gain.setValueAtTime(0.5, now); og.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      o.start(now); o.stop(now + 0.1); break;
    }
    case 'snare2': {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.15));
      const n = ctx.createBufferSource(); n.buffer = buf;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      n.connect(g); g.connect(ctx.destination); n.start(now); break;
    }
    case 'clap': {
      for (let b = 0; b < 3; b++) {
        const off = b * 0.015;
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const n = ctx.createBufferSource(); n.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2000; f.Q.value = 2;
        const g = ctx.createGain(); g.gain.setValueAtTime(0.5, now + off); g.gain.exponentialRampToValueAtTime(0.01, now + off + 0.08);
        n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(now + off);
      } break;
    }
    case 'rimshot': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'square';
      o.frequency.setValueAtTime(800, now); g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      o.start(now); o.stop(now + 0.05); break;
    }
    case 'closedHat': {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.3));
      const n = ctx.createBufferSource(); n.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(now); break;
    }
    case 'openHat': {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.4));
      const n = ctx.createBufferSource(); n.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5000;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(now); break;
    }
    case 'crash': {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.35));
      const n = ctx.createBufferSource(); n.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.35, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(now); break;
    }
    case 'ride': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'triangle';
      o.frequency.setValueAtTime(800, now); g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.4); o.start(now); o.stop(now + 0.4); break;
    }
    case 'lowTom': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sine';
      o.frequency.setValueAtTime(120, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.2);
      g.gain.setValueAtTime(0.6, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      o.start(now); o.stop(now + 0.3); break;
    }
    case 'midTom': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sine';
      o.frequency.setValueAtTime(180, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      g.gain.setValueAtTime(0.6, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      o.start(now); o.stop(now + 0.25); break;
    }
    case 'cowbell': {
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o1.connect(g); o2.connect(g); g.connect(ctx.destination);
      o1.type = 'square'; o2.type = 'square'; o1.frequency.value = 560; o2.frequency.value = 845;
      g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      o1.start(now); o2.start(now); o1.stop(now + 0.15); o2.stop(now + 0.15); break;
    }
    case 'shaker': {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.5));
      const n = ctx.createBufferSource(); n.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 8000; f.Q.value = 3;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(now); break;
    }
    case 'conga': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sine';
      o.frequency.setValueAtTime(300, now); o.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      o.start(now); o.stop(now + 0.2); break;
    }
    case 'bongo': {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = 'sine';
      o.frequency.setValueAtTime(400, now); o.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      g.gain.setValueAtTime(0.5, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      o.start(now); o.stop(now + 0.15); break;
    }
  }
}

export function DrumPads({ className }: { className?: string }) {
  const [activePads, setActivePads] = useState<Set<number>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    return () => { audioCtxRef.current?.close(); };
  }, []);

  const hitPad = useCallback(async (pad: typeof PADS[number]) => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    playDrumSound(ctx, pad.sound);
    if (navigator.vibrate) navigator.vibrate(15);

    setActivePads(prev => new Set(prev).add(pad.id));
    setTimeout(() => {
      setActivePads(prev => { const n = new Set(prev); n.delete(pad.id); return n; });
    }, 150);
  }, [getAudioCtx]);

  // Keyboard support
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement) return;
      const idx = KEYBOARD_MAP[e.key.toLowerCase()];
      if (idx !== undefined) hitPad(PADS[idx]);
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [hitPad]);

  // Touch-slide support
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const attr = el.getAttribute('data-pad-id') ?? el.closest('[data-pad-id]')?.getAttribute('data-pad-id');
    if (attr != null) {
      const id = parseInt(attr, 10);
      if (!activePads.has(id)) hitPad(PADS[id]);
    }
  }, [activePads, hitPad]);

  return (
    <div className={className} onTouchMove={handleTouchMove} style={{ touchAction: 'none' }}>
      <div className="grid grid-cols-4 gap-2 p-2">
        {PADS.map(pad => {
          const active = activePads.has(pad.id);
          return (
            <button
              key={pad.id}
              data-pad-id={pad.id}
              onMouseDown={e => { e.preventDefault(); hitPad(pad); }}
              onTouchStart={e => { e.preventDefault(); hitPad(pad); }}
              className="aspect-square rounded-2xl select-none relative overflow-hidden"
              style={{
                backgroundColor: pad.color,
                transform: active ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.1s',
                boxShadow: active
                  ? `0 0 20px ${pad.color}, inset 0 0 20px rgba(255,255,255,0.3)`
                  : `0 4px 12px ${pad.color}40, inset 0 2px 4px rgba(255,255,255,0.25)`,
                minHeight: 80,
              }}
            >
              {/* Glossy highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }}
              />
              {active && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ backgroundColor: 'white', opacity: 0.4, transition: 'opacity 0.2s' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
