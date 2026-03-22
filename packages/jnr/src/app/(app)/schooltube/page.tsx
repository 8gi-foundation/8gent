'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { REELS_DATA, CATEGORIES, getReelsByCategory, type Reel } from '@/lib/schooltube/data';
import { GamePlayer } from '@/components/schooltube/GamePlayer';

/**
 * SchoolTube - Safe, curated educational videos AND games for kids
 *
 * Features both playable educational games and video content.
 */

export default function SchoolTubePage() {
  const { settings } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [playingReel, setPlayingReel] = useState<Reel | null>(null);

  const primaryColor = settings.primaryColor || '#4CAF50';

  const filteredReels = getReelsByCategory(activeCategory);

  const handleReelTap = (reel: Reel) => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    setPlayingReel(reel);
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
            {settings.childName ? `${settings.childName}'s SchoolTube` : 'SchoolTube'}
          </span>
        </div>
      </header>

      {/* Categories */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat.id ? 'text-white' : 'bg-gray-100 text-gray-700'
              }`}
              style={{
                backgroundColor: activeCategory === cat.id ? primaryColor : undefined,
              }}
            >
              <span>{cat.emoji}</span>
              <span className="text-[15px] font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredReels.map((reel) => (
            <button
              key={reel.id}
              onClick={() => handleReelTap(reel)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform text-left"
            >
              {/* Thumbnail */}
              <div
                className="aspect-video flex items-center justify-center text-5xl relative"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                {reel.emoji}
                {/* Game badge */}
                {reel.type === 'game' && (
                  <div className="absolute top-2 right-2 bg-[#E8610A] text-white text-xs font-bold px-2 py-1 rounded-full">
                    GAME
                  </div>
                )}
                {/* Video badge */}
                {reel.type === 'video' && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    VIDEO
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-[15px] font-medium text-black line-clamp-2">{reel.title}</p>
                {reel.duration && (
                  <p className="text-[13px] text-gray-500 mt-1">{reel.duration}</p>
                )}
                {reel.type === 'game' && (
                  <p className="text-[13px] text-[#E8610A] mt-1 font-medium">Tap to play!</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredReels.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📭</span>
            <p className="text-gray-500">No content in this category yet</p>
          </div>
        )}
      </div>

      {/* Game/Video Player */}
      {playingReel && playingReel.type === 'game' && (
        <GamePlayer
          reel={playingReel}
          primaryColor={primaryColor}
          onClose={() => setPlayingReel(null)}
        />
      )}

      {/* Video Player (placeholder for now) */}
      {playingReel && playingReel.type === 'video' && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div className="text-center p-8">
            <span className="text-8xl mb-4 block">{playingReel.emoji}</span>
            <p className="text-white text-xl font-bold mb-2">{playingReel.title}</p>
            <p className="text-gray-400 mb-6">Video coming soon!</p>
            <button
              onClick={() => setPlayingReel(null)}
              className="px-8 py-3 bg-white text-black rounded-2xl font-semibold active:scale-95 transition-transform"
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
