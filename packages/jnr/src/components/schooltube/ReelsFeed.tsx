'use client';

import { useState, useMemo } from 'react';
import { ReelCard } from './ReelCard';
import { DailyActivityBanner } from './DailyActivityBanner';
import { WeeklySchedule } from './WeeklySchedule';
import { ALL_FEED_REELS, type FeedReel } from '@/lib/schooltube/reels-data';
import { CATEGORIES } from '@/lib/schooltube/data';

export function ReelsFeed() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activityGames, setActivityGames] = useState<string[] | null>(null);

  const handleStartActivity = (games: string[]) => {
    if (games.length === 0) {
      setActivityGames(null);
      setSelectedCategory('all');
    } else {
      setActivityGames(games);
    }
  };

  const filteredReels = useMemo(() => {
    let reels: FeedReel[] = ALL_FEED_REELS;

    // Filter by daily activity games if active
    if (activityGames && activityGames.length > 0) {
      reels = reels.filter(
        (r) => r.type === 'game' && activityGames.includes(r.gameType || '')
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      reels = reels.filter((r) => r.category === selectedCategory);
    }

    return reels;
  }, [selectedCategory, activityGames]);

  return (
    <div className="h-full flex flex-col bg-[#FFFDF9]">
      {/* Daily activity banner */}
      <DailyActivityBanner onStartActivity={handleStartActivity} />

      {/* Category filters + Weekly schedule */}
      <div className="flex items-center gap-2 px-4 mb-2">
        <div className="flex-1 overflow-x-auto flex gap-2 scrollbar-none pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActivityGames(null);
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold
                         border-2 transition-all whitespace-nowrap
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]
                         ${
                           selectedCategory === cat.id
                             ? 'bg-[#E8610A] text-white border-[#E8610A]'
                             : 'bg-[#FFF8F0] text-[#6B5B4F] border-[#E8E0D6] hover:border-[#E8610A]'
                         }`}
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <WeeklySchedule onSelectActivity={handleStartActivity} />
      </div>

      {/* Active filter indicator */}
      {activityGames && (
        <div className="mx-4 mb-2 flex items-center gap-2">
          <span
            className="text-sm"
            style={{ color: '#6B5B4F', fontFamily: 'var(--font-inter)' }}
          >
            Showing today&apos;s activity games
          </span>
          <button
            onClick={() => setActivityGames(null)}
            className="text-xs px-3 py-1 rounded-full bg-[#E8E0D6] text-[#3D2E1F]
                       hover:bg-[#D4C4B0] transition-colors"
          >
            Show all
          </button>
        </div>
      )}

      {/* Feed grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredReels.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>

        {filteredReels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E8E0D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p
              className="text-[#6B5B4F] text-sm"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              No content for this filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
