'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * XylophoneKeys - 8 colorful bars (C major scale), tap or slide to play
 *
 * Bars get shorter as pitch rises. Web Audio API synthesis, no files needed.
 * Keyboard: A S D F G H J K
 */

const KEYBOARD_MAP: Record<string, number> = {
  'a': 0, 's': 1, 'd': 2, 'f': 3, 'g': 4, 'h': 5, 'j': 6, 'k': 7,
};

const NOTES = [
  { freq: 261.63, note: 'C',  color: '#FF1744' },
  { freq: 293.66, note: 'D',  color: '#FF9100' },
  { freq: 329.63, note: 'E',  color: '#FFC400' },
  { freq: 349.23, note: 'F',  color: '#76FF03' },
  { freq: 392.00, note: 'G',  color: '#00E5FF' },
  { freq: 440.00, note: 'A',  color: '#2979FF' },
  { freq: 493.88, note: 'B',  color: '#651FFF' },
  { freq: 523.25, note: 'C2', color: '#FF4081' },
];

function playXylophoneNote(ctx: AudioContext, freq: number) {
  const now = ctx.currentTime;
  // Main tone
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
  osc.start(now); osc.stop(now + 0.8);
  // Harmonic overtone for metallic ring
  const o2 = ctx.createOscillator(), g2 = ctx.createGain();
  o2.connect(g2); g2.connect(ctx.destination);
  o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 3, now);
  g2.gain.setValueAtTime(0.08, now); g2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  o2.start(now); o2.stop(now + 0.3);
}

export function XylophoneKeys({ className }: { className?: string }) {
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef<number | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    return () => { audioCtxRef.current?.close(); };
  }, []);

  const playNote = useCallback(async (index: number) => {
    if (lastPlayedRef.current === index) return;
    lastPlayedRef.current = index;
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    playXylophoneNote(ctx, NOTES[index].freq);
    if (navigator.vibrate) navigator.vibrate(10);

    setActiveNote(index);
    setTimeout(() => setActiveNote(prev => prev === index ? null : prev), 200);
  }, [getAudioCtx]);

  // Keyboard support
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement) return;
      const idx = KEYBOARD_MAP[e.key.toLowerCase()];
      if (idx !== undefined) playNote(idx);
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [playNote]);

  // Touch-slide (glissando)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;
    const attr = el.getAttribute('data-note-index') ?? el.closest('[data-note-index]')?.getAttribute('data-note-index');
    if (attr != null) playNote(parseInt(attr, 10));
  }, [playNote]);

  const handleTouchEnd = useCallback(() => { lastPlayedRef.current = null; }, []);

  const maxH = 100;
  const minH = 55;

  return (
    <div
      className={className}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      <div className="flex items-end justify-center gap-1.5 px-2 py-4" style={{ height: 320 }}>
        {NOTES.map((note, i) => {
          const active = activeNote === i;
          const hPct = maxH - (i / (NOTES.length - 1)) * (maxH - minH);
          return (
            <div key={i} className="relative flex flex-col items-center flex-1" style={{ height: '100%' }}>
              <span className="text-xs font-bold mb-1 select-none" style={{ color: '#999', fontFamily: 'var(--font-inter)' }}>
                {note.note}
              </span>
              <div className="flex-1 flex items-end w-full relative">
                <button
                  data-note-index={i}
                  onMouseDown={e => { e.preventDefault(); playNote(i); }}
                  onTouchStart={e => { e.preventDefault(); playNote(i); }}
                  className="w-full rounded-xl relative overflow-hidden select-none"
                  style={{
                    height: `${hPct}%`,
                    backgroundColor: note.color,
                    transform: active ? 'scale(0.95)' : 'scale(1)',
                    transition: 'transform 0.08s',
                    boxShadow: active
                      ? `0 0 20px ${note.color}, 0 0 40px ${note.color}60`
                      : `0 4px 12px ${note.color}30, inset 0 2px 4px rgba(255,255,255,0.3)`,
                    minWidth: 36,
                  }}
                >
                  {/* Glossy highlight */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1/3 rounded-t-xl pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)' }}
                  />
                  {active && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundColor: 'white', opacity: 0.4, transition: 'opacity 0.2s' }}
                    />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
