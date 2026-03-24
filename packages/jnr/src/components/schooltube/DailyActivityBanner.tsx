'use client';

import { getTodayActivity } from '@/lib/schooltube/reels-data';

type DailyActivityBannerProps = {
  onStartActivity: (games: string[]) => void;
};

/** SVG icon map keyed by activity theme keyword */
function ThemeIcon({ theme, color }: { theme: string; color: string }) {
  const t = theme.toLowerCase();
  if (t.includes('language') || t.includes('speech'))
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  if (t.includes('emotion') || t.includes('feeling'))
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    );
  if (t.includes('music') || t.includes('rhym'))
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    );
  if (t.includes('nature'))
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8c.7-1 1-2.2 1-3.5C18 2.5 16 1 16 1s-2 1.5-2 3.5c0 1.3.3 2.5 1 3.5" />
        <path d="M12 22V8" />
        <path d="M7 8c-.7-1-1-2.2-1-3.5C6 2.5 8 1 8 1s2 1.5 2 3.5c0 1.3-.3 2.5-1 3.5" />
        <path d="M4 14c0-2 2.5-3 4-3h8c1.5 0 4 1 4 3" />
      </svg>
    );
  if (t.includes('sensory') || t.includes('calm'))
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z" />
      </svg>
    );
  // Default: play icon
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" fill={color} />
    </svg>
  );
}

export function DailyActivityBanner({ onStartActivity }: DailyActivityBannerProps) {
  const activity = getTodayActivity();

  const handleStart = () => {
    onStartActivity(activity.games);
  };

  return (
    <div
      className="mx-4 mb-4 mt-2 rounded-3xl p-4 shadow-md overflow-hidden relative"
      style={{ backgroundColor: activity.color }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
        style={{ backgroundColor: '#FFFDF9' }}
      />
      <div
        className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full opacity-15"
        style={{ backgroundColor: '#FFFDF9' }}
      />

      <div className="relative z-10 flex items-center gap-4">
        {/* Theme icon */}
        <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
          <ThemeIcon theme={activity.theme} color="#FFFDF9" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-xs font-medium" style={{ fontFamily: 'var(--font-inter)' }}>
            {activity.day}&apos;s Activity
          </p>
          <h3
            className="text-white font-bold text-base truncate"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {activity.theme}
          </h3>
          <p className="text-white/90 text-sm truncate" style={{ fontFamily: 'var(--font-inter)' }}>
            {activity.activity}
          </p>
          <div className="flex items-center gap-1 mt-1 text-white/70 text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{activity.duration} min</span>
          </div>
        </div>

        {/* Play button - 80px+ touch target */}
        <button
          onClick={handleStart}
          className="w-14 h-14 rounded-2xl bg-white hover:bg-white/90 shadow-lg
                     flex items-center justify-center shrink-0 transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={`Start ${activity.activity}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3D2E1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" fill="#3D2E1F" />
          </svg>
        </button>
      </div>
    </div>
  );
}
