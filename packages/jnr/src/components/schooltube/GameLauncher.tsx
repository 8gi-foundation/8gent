'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REELS_DATA, CATEGORIES, type Reel } from '@/lib/schooltube/data';

// Inline SVG icons (avoids lucide-react / React 19 type mismatch)
function IconSearch({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconX({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
function IconGamepad({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" /><line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </svg>
  );
}
function IconPlay({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

/**
 * GameLauncher - YouTube Kids-style game/video launcher for SchoolTube
 *
 * Design: Large visual cards, category pill filters, search bar,
 * bright category-specific colors, big touch targets (80px+).
 */

// Category colors — warm palette only (brand: banned hues 270-350)
const CATEGORY_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  all:      { bg: '#E8610A', text: '#FFFFFF', light: '#FFF3E8' },
  learning: { bg: '#2563EB', text: '#FFFFFF', light: '#EFF6FF' },
  numbers:  { bg: '#2D8A56', text: '#FFFFFF', light: '#ECFDF5' },
  letters:  { bg: '#E8610A', text: '#FFFFFF', light: '#FFF3E8' },
  colors:   { bg: '#C47F17', text: '#FFFFFF', light: '#FFFBEB' },
  shapes:   { bg: '#2563EB', text: '#FFFFFF', light: '#EFF6FF' },
  patterns: { bg: '#B45309', text: '#FFFFFF', light: '#FEF3C7' },
  sensory:  { bg: '#0D9488', text: '#FFFFFF', light: '#F0FDFA' },
};

// Category icons (SVG-based, no emojis per brand)
const CATEGORY_ICONS: Record<string, string> = {
  all: 'All',
  learning: 'Learn',
  numbers: '123',
  letters: 'ABC',
  colors: 'Mix',
  shapes: 'Fit',
  patterns: 'Loop',
  sensory: 'Feel',
};

type GameLauncherProps = {
  childName?: string;
  onSelectReel: (reel: Reel) => void;
};

export function GameLauncher({ childName, onSelectReel }: GameLauncherProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredReels = useMemo(() => {
    let reels = activeCategory === 'all'
      ? REELS_DATA
      : REELS_DATA.filter((r) => r.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      reels = reels.filter((r) => r.title.toLowerCase().includes(q));
    }

    return reels;
  }, [activeCategory, searchQuery]);

  const gamesCount = filteredReels.filter((r) => r.type === 'game').length;
  const videosCount = filteredReels.filter((r) => r.type === 'video').length;

  const getCategoryColor = (category: string) =>
    CATEGORY_COLORS[category] || CATEGORY_COLORS.all;

  return (
    <div className="flex flex-col h-full bg-[#FFFDF9]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9] border-b border-[#E8E0D6] safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <h1
            className="text-xl font-bold text-[#1A1612]"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {childName ? `${childName}'s Games` : 'SchoolTube'}
          </h1>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="h-11 w-11 rounded-xl bg-[#FFF8F0] border border-[#E8E0D6] flex items-center justify-center active:scale-95 transition-transform"
            aria-label={searchOpen ? 'Close search' : 'Search games'}
          >
            {searchOpen ? (
              <IconX size={20} className="text-[#5C544A]" />
            ) : (
              <IconSearch size={20} className="text-[#5C544A]" />
            )}
          </button>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3">
                <div className="relative">
                  <IconSearch
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9088]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search games..."
                    autoFocus
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#FFF8F0] border border-[#E8E0D6] text-[#1A1612] placeholder-[#9A9088] text-base outline-none focus:border-[#E8610A] transition-colors"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills — horizontal scroll */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const colors = getCategoryColor(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 min-h-[44px]"
                  style={{
                    backgroundColor: isActive ? colors.bg : '#FFF8F0',
                    color: isActive ? colors.text : '#5C544A',
                    border: `1.5px solid ${isActive ? colors.bg : '#E8E0D6'}`,
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {CATEGORY_ICONS[cat.id] || cat.label}
                  </span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Results count */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <span
          className="text-sm text-[#5C544A]"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {gamesCount > 0 && `${gamesCount} game${gamesCount !== 1 ? 's' : ''}`}
          {gamesCount > 0 && videosCount > 0 && ' · '}
          {videosCount > 0 && `${videosCount} video${videosCount !== 1 ? 's' : ''}`}
          {filteredReels.length === 0 && 'No results'}
        </span>
      </div>

      {/* Game grid */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredReels.map((reel, i) => (
              <GameCard
                key={reel.id}
                reel={reel}
                index={i}
                categoryColor={getCategoryColor(reel.category)}
                onSelect={() => onSelectReel(reel)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredReels.length === 0 && (
          <div className="text-center py-16">
            <IconSearch size={48} className="text-[#E8E0D6] mx-auto mb-4" />
            <p
              className="text-lg font-semibold text-[#5C544A]"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Nothing found
            </p>
            <p className="text-sm text-[#9A9088] mt-1">
              Try a different search or category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Game Card ─── */

type GameCardProps = {
  reel: Reel;
  index: number;
  categoryColor: { bg: string; text: string; light: string };
  onSelect: () => void;
};

function GameCard({ reel, index, categoryColor, onSelect }: GameCardProps) {
  const isGame = reel.type === 'game';

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      onClick={() => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(30);
        }
        onSelect();
      }}
      className="rounded-2xl overflow-hidden text-left active:scale-[0.96] transition-transform duration-150 shadow-sm hover:shadow-md group"
      style={{
        backgroundColor: '#FFF8F0',
        border: '1.5px solid #E8E0D6',
      }}
    >
      {/* Thumbnail area */}
      <div
        className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: categoryColor.light }}
      >
        {/* Large category-colored icon area */}
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200"
          style={{ backgroundColor: categoryColor.bg }}
        >
          {isGame ? (
            <IconGamepad size={32} className="text-white sm:w-10 sm:h-10" />
          ) : (
            <IconPlay size={32} className="text-white sm:w-10 sm:h-10" />
          )}
        </div>

        {/* Type badge */}
        <div
          className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: isGame ? '#E8610A' : '#2563EB',
            color: '#FFFFFF',
          }}
        >
          {isGame ? 'Game' : 'Video'}
        </div>

        {/* Duration badge for videos */}
        {reel.duration && (
          <div className="absolute bottom-2 right-2 bg-[#1A1612]/70 text-white text-xs font-medium px-2 py-0.5 rounded-md">
            {reel.duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className="text-[15px] font-semibold text-[#1A1612] line-clamp-2 leading-tight"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {reel.title}
        </p>
        <p
          className="text-[12px] mt-1 font-medium capitalize"
          style={{
            color: categoryColor.bg,
            fontFamily: 'var(--font-inter)',
          }}
        >
          {reel.category}
        </p>
      </div>
    </motion.button>
  );
}
