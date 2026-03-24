'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { DEFAULT_SCENES } from '@/lib/vsd/scenes';
import type { VisualScene, Hotspot } from '@/lib/vsd/types';

/**
 * Visual Scene Display (VSD) — Clinical AAC Tool
 *
 * Photo-based AAC where scenes have interactive hotspots that speak
 * whole gestalt phrases. For GLP Stage 1-2 learners.
 *
 * Key UX decisions:
 * - Hotspots are large (80px+ effective area) with high-contrast borders
 * - Speech triggered on tap via SpeechSynthesis API
 * - Spoken phrase shown prominently as visual confirmation
 * - Scene navigation via large pill buttons at bottom
 * - Gradient placeholders until real photos are uploaded
 */

const SCENE_GRADIENTS: Record<string, string> = {
  kitchen: 'linear-gradient(135deg, #F6D58A 0%, #F0A84D 100%)',
  playground: 'linear-gradient(135deg, #A8E6CF 0%, #55C89F 100%)',
  bedroom: 'linear-gradient(135deg, #C3B1E1 0%, #8B7EC8 100%)',
  school: 'linear-gradient(135deg, #FDCB82 0%, #F0A04B 100%)',
  park: 'linear-gradient(135deg, #B5E8A3 0%, #6DC85A 100%)',
};

const SCENE_LABELS: Record<string, string> = {
  kitchen: 'Kitchen',
  playground: 'Playground',
  bedroom: 'Bedroom',
  school: 'School',
  park: 'Park',
};

function speakPhrase(phrase: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.rate = 0.85;
  utterance.pitch = 1.05;
  // Prefer a natural-sounding voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('karen') ||
      v.name.toLowerCase().includes('moira')
  );
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

export default function VSDPage() {
  const router = useRouter();
  const { settings } = useApp();
  const primaryColor = settings.primaryColor || '#E8610A';

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [spokenPhrase, setSpokenPhrase] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scene = DEFAULT_SCENES[activeIndex];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Preload voices (needed on some browsers)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleHotspotTap = useCallback((hotspot: Hotspot) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setActiveHotspot(hotspot.id);
    setSpokenPhrase(hotspot.phrase);

    // Play pre-recorded audio if available, otherwise use TTS
    if (hotspot.audioUrl) {
      try {
        const audio = new Audio(hotspot.audioUrl);
        audio.onended = () => {
          timeoutRef.current = setTimeout(() => {
            setActiveHotspot(null);
            setSpokenPhrase(null);
          }, 600);
        };
        audio.play();
        return;
      } catch {
        // Fall through to TTS
      }
    }

    speakPhrase(hotspot.phrase);

    timeoutRef.current = setTimeout(() => {
      setActiveHotspot(null);
      setSpokenPhrase(null);
    }, 2200);
  }, []);

  const handleSceneChange = useCallback((index: number) => {
    setActiveHotspot(null);
    setSpokenPhrase(null);
    setActiveIndex(index);
  }, []);

  const gradient = SCENE_GRADIENTS[scene.id] || 'linear-gradient(135deg, #ccc 0%, #999 100%)';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFDF9' }}>
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b" style={{ borderColor: '#E8E0D6' }}>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center"
          style={{ width: 44, height: 44 }}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1
          className="flex-1 text-center text-xl font-semibold"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#1A1612' }}
        >
          Visual Scenes
        </h1>
        <span style={{ width: 44, textAlign: 'center', color: '#9A9088', fontSize: 13 }}>
          Stage {scene.glpStage}
        </span>
      </header>

      {/* Spoken phrase banner */}
      {spokenPhrase && (
        <div
          className="mx-4 mt-3 px-5 py-3 rounded-2xl text-center text-white font-semibold shadow-md"
          style={{ backgroundColor: primaryColor, fontSize: 20, fontFamily: 'var(--font-inter)' }}
        >
          {spokenPhrase}
        </div>
      )}

      {/* Scene display area */}
      <div className="flex-1 px-4 py-3 pb-0 min-h-0">
        <div
          className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg"
          style={{ background: gradient }}
        >
          {/* Scene title overlay */}
          <div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-xl z-10"
            style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
          >
            <span className="text-white font-medium" style={{ fontSize: 14 }}>
              {scene.title}
            </span>
          </div>

          {/* Hotspot buttons */}
          {scene.hotspots.map((hotspot) => {
            const isActive = activeHotspot === hotspot.id;
            return (
              <button
                key={hotspot.id}
                onClick={() => handleHotspotTap(hotspot)}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  width: `${hotspot.width}%`,
                  height: `${hotspot.height}%`,
                  borderRadius: 16,
                  border: isActive ? '4px solid white' : '3px solid rgba(255,255,255,0.6)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.15s ease',
                  // Enforce minimum 80px effective touch target via padding
                  minWidth: 80,
                  minHeight: 80,
                }}
                aria-label={hotspot.phrase}
              >
                <span
                  className="text-center leading-tight font-semibold select-none"
                  style={{
                    color: isActive ? '#1A1612' : 'white',
                    fontSize: 15,
                    textShadow: isActive ? 'none' : '0 1px 3px rgba(0,0,0,0.3)',
                    padding: '2px 4px',
                  }}
                >
                  {hotspot.phrase}
                </span>
              </button>
            );
          })}

          {/* Instruction hint */}
          {!activeHotspot && !spokenPhrase && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: 'white',
                fontSize: 14,
                fontFamily: 'var(--font-inter)',
                whiteSpace: 'nowrap',
              }}
            >
              Tap a spot to hear a phrase
            </div>
          )}
        </div>
      </div>

      {/* Scene picker */}
      <div className="flex gap-2 px-4 py-3 pb-28 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {DEFAULT_SCENES.map((s, i) => {
          const isActive = activeIndex === i;
          return (
            <button
              key={s.id}
              onClick={() => handleSceneChange(i)}
              className="flex-shrink-0 rounded-2xl font-semibold transition-colors"
              style={{
                padding: '10px 20px',
                fontSize: 15,
                minHeight: 48,
                fontFamily: 'var(--font-inter)',
                backgroundColor: isActive ? primaryColor : '#FFF3E8',
                color: isActive ? 'white' : '#5C544A',
                border: isActive ? 'none' : '1px solid #E8E0D6',
              }}
            >
              {SCENE_LABELS[s.id] || s.title}
            </button>
          );
        })}
      </div>

      <Dock primaryColor={primaryColor} />
    </div>
  );
}
