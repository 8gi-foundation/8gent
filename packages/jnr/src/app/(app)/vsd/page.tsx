'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { DEFAULT_SCENES } from '@/lib/vsd/scenes';
import type { VisualScene, Hotspot } from '@/lib/vsd/types';

/**
 * Visual Scene Display Page
 *
 * Photo-based AAC where scenes have interactive hotspots that speak
 * whole gestalt phrases. For GLP Stage 1-2 learners.
 */

const SCENE_GRADIENTS: Record<string, string> = {
  kitchen: 'from-amber-200 to-orange-300',
  playground: 'from-green-200 to-emerald-300',
  bedroom: 'from-indigo-200 to-purple-300',
  school: 'from-blue-200 to-cyan-300',
  park: 'from-lime-200 to-green-300',
};

export default function VSDPage() {
  const { settings } = useApp();
  const primaryColor = settings.primaryColor || '#4CAF50';

  const [activeScene, setActiveScene] = useState<VisualScene>(DEFAULT_SCENES[0]);
  const [spokenPhrase, setSpokenPhrase] = useState<string | null>(null);

  const handleHotspotTap = (hotspot: Hotspot) => {
    setSpokenPhrase(hotspot.phrase);

    // Speak the phrase using Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(hotspot.phrase);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }

    // Clear after 2 seconds
    setTimeout(() => setSpokenPhrase(null), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f2f2f7] overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl safe-top"
        style={{ backgroundColor: `${primaryColor}F2` }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[18px] font-semibold text-white">
            Visual Scenes
          </span>
          <span className="text-[14px] text-white/70">
            Stage {activeScene.glpStage}
          </span>
        </div>
      </header>

      {/* Scene Selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {DEFAULT_SCENES.map((scene) => (
          <button
            key={scene.id}
            onClick={() => setActiveScene(scene)}
            className={`px-4 py-2 rounded-full text-[14px] font-medium flex-shrink-0 transition-all ${
              activeScene.id === scene.id
                ? 'text-white shadow-md'
                : 'bg-white text-gray-600 shadow-sm'
            }`}
            style={
              activeScene.id === scene.id
                ? { backgroundColor: primaryColor }
                : undefined
            }
          >
            {scene.title}
          </button>
        ))}
      </div>

      {/* Spoken Phrase Banner */}
      {spokenPhrase && (
        <div
          className="mx-4 mb-2 px-4 py-3 rounded-2xl text-white text-center text-[20px] font-semibold animate-pulse"
          style={{ backgroundColor: primaryColor }}
        >
          {spokenPhrase}
        </div>
      )}

      {/* Scene Display */}
      <div className="flex-1 px-4 pb-32">
        <div
          className={`relative w-full h-full rounded-3xl bg-gradient-to-br ${
            SCENE_GRADIENTS[activeScene.id] || 'from-gray-200 to-gray-300'
          } shadow-lg overflow-hidden`}
        >
          {/* Scene Title Overlay */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/20 rounded-full">
            <span className="text-white text-[13px] font-medium">
              {activeScene.title}
            </span>
          </div>

          {/* Hotspots */}
          {activeScene.hotspots.map((hotspot) => (
            <button
              key={hotspot.id}
              onClick={() => handleHotspotTap(hotspot)}
              className="absolute rounded-2xl bg-white/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center p-2 active:scale-95 active:bg-white/50 transition-all hover:bg-white/40"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
              }}
            >
              <span className="text-[15px] font-semibold text-gray-800 text-center leading-tight drop-shadow-sm">
                {hotspot.phrase}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
