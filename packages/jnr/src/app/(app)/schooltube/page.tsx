'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { GameLauncher } from '@/components/schooltube/GameLauncher';
import { GamePlayer } from '@/components/schooltube/GamePlayer';
import type { Reel } from '@/lib/schooltube/data';

/**
 * SchoolTube - YouTube Kids-style educational game launcher
 *
 * Uses GameLauncher for browsing/filtering and GamePlayer for gameplay.
 */
export default function SchoolTubePage() {
  const { settings } = useApp();
  const [playingReel, setPlayingReel] = useState<Reel | null>(null);

  const primaryColor = settings.primaryColor || '#E8610A';

  return (
    <div className="h-screen flex flex-col bg-[#FFFDF9] overflow-hidden">
      <GameLauncher
        childName={settings.childName}
        onSelectReel={setPlayingReel}
      />

      {/* Game Player overlay */}
      {playingReel && playingReel.type === 'game' && (
        <GamePlayer
          reel={playingReel}
          primaryColor={primaryColor}
          onClose={() => setPlayingReel(null)}
        />
      )}

      {/* Video Player placeholder */}
      {playingReel && playingReel.type === 'video' && (
        <div className="fixed inset-0 z-50 bg-[#1A1612] flex flex-col items-center justify-center">
          <div className="text-center p-8">
            <div
              className="w-24 h-24 rounded-2xl bg-[#2563EB] flex items-center justify-center mx-auto mb-6"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p
              className="text-white text-xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {playingReel.title}
            </p>
            <p className="text-[#9A9088] mb-6">Video coming soon</p>
            <button
              onClick={() => setPlayingReel(null)}
              className="px-8 py-3 bg-[#FFF8F0] text-[#1A1612] rounded-2xl font-semibold active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
