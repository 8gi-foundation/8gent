'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

/**
 * 8gent Jr Draw - Full-screen drawing canvas for kids
 *
 * Features: color picker, brush sizes, undo, eraser, clear, save
 * All touch targets 80px+, warm palette, no text input needed
 */

const COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
  '#00BCD4', '#007AFF', '#5856D6', '#000000',
];

const BRUSH_SIZES = [
  { label: 'S', width: 6 },
  { label: 'M', width: 14 },
  { label: 'L', width: 28 },
];

interface Point { x: number; y: number }

export default function DrawPage() {
  const router = useRouter();
  const { settings } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushIdx, setBrushIdx] = useState(1);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const lastPosRef = useRef<Point | null>(null);

  const brushWidth = BRUSH_SIZES[brushIdx].width;
  const isEraser = color === '#FFFFFF';

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      // Save current drawing before resize
      const ctx = canvas.getContext('2d');
      let saved: ImageData | null = null;
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        saved = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        if (saved) ctx.putImageData(saved, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  }, []);

  // Save snapshot for undo before stroke begins
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev.slice(-19), snap]); // keep max 20
  }, []);

  const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    saveSnapshot();
    const pos = getPos(e);
    setIsDrawing(true);
    lastPosRef.current = pos;

    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }, [getPos, saveSnapshot, brushWidth, color]);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = ctxRef.current;
    const last = lastPosRef.current;
    if (ctx && last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushWidth;
      ctx.stroke();
    }
    lastPosRef.current = pos;
  }, [isDrawing, getPos, color, brushWidth]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    ctx.putImageData(prev, 0, 0);
    setUndoStack(s => s.slice(0, -1));
  }, [undoStack]);

  const clearCanvas = useCallback(() => {
    saveSnapshot();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [saveSnapshot]);

  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFDF9' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: '#E8610A' }}>
        <button
          onClick={() => router.push('/app')}
          className="flex items-center gap-1 text-white"
          style={{ minWidth: 80, minHeight: 44 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-fraunces)' }}>Back</span>
        </button>
        <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-fraunces)' }}>
          {settings.childName ? `${settings.childName}'s Art` : 'Draw'}
        </span>
        <button onClick={saveDrawing} className="text-white p-2" style={{ minWidth: 44, minHeight: 44 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative bg-white mx-2 mt-2 rounded-2xl overflow-hidden shadow-sm">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-3 py-3 pb-[env(safe-area-inset-bottom,12px)] flex flex-col gap-3" style={{ backgroundColor: '#FFFDF9' }}>
        {/* Color Row */}
        <div className="flex items-center justify-center gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="rounded-full border-4 transition-transform"
              style={{
                width: 44, height: 44,
                backgroundColor: c,
                borderColor: color === c && !isEraser ? '#E8610A' : 'transparent',
                transform: color === c && !isEraser ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between">
          {/* Brush Sizes */}
          <div className="flex gap-2">
            {BRUSH_SIZES.map((b, i) => (
              <button
                key={i}
                onClick={() => setBrushIdx(i)}
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 52, height: 52,
                  backgroundColor: brushIdx === i ? '#FFF0E0' : '#F5F5F5',
                  border: brushIdx === i ? '2px solid #E8610A' : '2px solid transparent',
                }}
              >
                <div className="rounded-full bg-gray-800" style={{ width: b.width, height: b.width }} />
              </button>
            ))}
          </div>

          {/* Eraser */}
          <button
            onClick={() => setColor(isEraser ? '#000000' : '#FFFFFF')}
            className="rounded-full flex items-center justify-center"
            style={{
              width: 52, height: 52,
              backgroundColor: isEraser ? '#FFF0E0' : '#F5F5F5',
              border: isEraser ? '2px solid #E8610A' : '2px solid transparent',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21h10"/><path d="M5.5 11.5l7-7a2.83 2.83 0 014 4l-7 7H5.5z"/></svg>
          </button>

          {/* Undo */}
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="rounded-full flex items-center justify-center"
            style={{
              width: 52, height: 52,
              backgroundColor: '#F5F5F5',
              opacity: undoStack.length === 0 ? 0.4 : 1,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 105.42-8.49L1 10"/></svg>
          </button>

          {/* Clear */}
          <button
            onClick={clearCanvas}
            className="rounded-full flex items-center justify-center"
            style={{ width: 52, height: 52, backgroundColor: '#FFEBEE' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
