'use client';

import { useState } from 'react';
import type { FeedReel } from '@/lib/schooltube/reels-data';
import { VideoPlayer } from './VideoPlayer';
import { GamePlayer } from './GamePlayer';

type ReelCardProps = {
  reel: FeedReel;
  primaryColor?: string;
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  sensory: { bg: 'bg-[#D4A574]', text: 'text-white', label: 'SENSORY' },
  numbers: { bg: 'bg-[#E8610A]', text: 'text-white', label: 'NUMBERS' },
  letters: { bg: 'bg-[#8B6914]', text: 'text-white', label: 'LETTERS' },
  colors: { bg: 'bg-[#CD853F]', text: 'text-white', label: 'COLORS' },
  shapes: { bg: 'bg-[#6B8E23]', text: 'text-white', label: 'SHAPES' },
  patterns: { bg: 'bg-[#B87333]', text: 'text-white', label: 'PATTERNS' },
  learning: { bg: 'bg-[#E8610A]', text: 'text-white', label: 'VIDEO' },
};

export function ReelCard({ reel, primaryColor = '#E8610A' }: ReelCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const style = CATEGORY_STYLES[reel.category] ?? CATEGORY_STYLES.learning;

  const handleClick = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative w-full overflow-hidden rounded-2xl shadow-md
                   border-2 border-[#E8E0D6] bg-[#FFF8F0]
                   transition-transform active:scale-[0.97] focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-[#E8610A]"
        style={{ minHeight: 180 }}
        aria-label={`Play ${reel.title}`}
      >
        {/* Card body */}
        <div className="flex flex-col items-center justify-center p-4 gap-3 h-full min-h-[180px]">
          {/* Icon area */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${primaryColor}18` }}
          >
            {reel.type === 'video' ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" fill={primaryColor} />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M12 12h.01" />
                <path d="M17 12h.01" />
                <path d="M7 12h.01" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-sm font-semibold text-center leading-snug line-clamp-2"
            style={{ fontFamily: 'var(--font-fraunces)', color: '#3D2E1F' }}
          >
            {reel.title}
          </h3>

          {/* Duration badge for videos */}
          {reel.duration && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#E8E0D6', color: '#6B5B4F' }}
            >
              {reel.duration}
            </span>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2">
          <span className={`${style.bg} ${style.text} text-[10px] font-bold px-2 py-1 rounded-full shadow-sm`}>
            {style.label}
          </span>
        </div>
      </button>

      {/* Players */}
      {isPlaying && reel.type === 'video' && (
        <VideoPlayer reel={reel} open={isPlaying} onClose={handleClose} />
      )}
      {isPlaying && reel.type === 'game' && (
        <GamePlayer reel={reel} primaryColor={primaryColor} onClose={handleClose} />
      )}
    </>
  );
}
