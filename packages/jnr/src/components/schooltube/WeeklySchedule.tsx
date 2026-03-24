'use client';

import { useState } from 'react';
import { getWeekSchedule, getCurrentWeek, type DayActivity } from '@/lib/schooltube/reels-data';

type WeeklyScheduleProps = {
  onSelectActivity: (games: string[]) => void;
};

/** Simple SVG icons for activity types */
function ActivityIcon({ theme }: { theme: string }) {
  const t = theme.toLowerCase();
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (t.includes('language') || t.includes('speech'))
    return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  if (t.includes('emotion'))
    return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
  if (t.includes('phonics') || t.includes('letter'))
    return <svg {...props}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>;
  if (t.includes('nature'))
    return <svg {...props}><path d="M12 22V8" /><path d="M4 14c0-2 2.5-3 4-3h8c1.5 0 4 1 4 3" /></svg>;
  if (t.includes('music'))
    return <svg {...props}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
  if (t.includes('movement') || t.includes('coordination'))
    return <svg {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  if (t.includes('logic'))
    return <svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
  if (t.includes('sensory'))
    return <svg {...props}><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z" /></svg>;
  if (t.includes('sequenc'))
    return <svg {...props}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
  if (t.includes('story'))
    return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
  if (t.includes('free'))
    return <svg {...props}><polygon points="5 3 19 12 5 21 5 3" fill="white" /></svg>;
  // Default
  return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

export function WeeklySchedule({ onSelectActivity }: WeeklyScheduleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const schedule = getWeekSchedule();
  const currentWeek = getCurrentWeek();
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  const handleSelect = (activity: DayActivity) => {
    onSelectActivity(activity.games);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
                   border-2 border-[#E8E0D6] bg-[#FFF8F0] text-[#3D2E1F]
                   hover:border-[#E8610A] transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
        aria-label="Open weekly schedule"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-inter)' }}>
          Week {currentWeek}
        </span>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Week ${currentWeek} Schedule`}
        >
          <div
            className="bg-[#FFFDF9] rounded-3xl shadow-xl max-w-md w-[90%] max-h-[80vh]
                       overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-xl font-bold text-center mb-4 text-[#3D2E1F]"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Week {currentWeek} Schedule
            </h2>

            <div className="space-y-3">
              {schedule.map((activity, index) => {
                const isToday = index === todayIndex;
                return (
                  <button
                    key={activity.day}
                    onClick={() => handleSelect(activity)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left
                               transition-all hover:scale-[1.01]
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]
                               ${isToday ? 'ring-2 ring-offset-2 ring-offset-[#FFFDF9]' : ''}`}
                    style={{
                      backgroundColor: `${activity.color}18`,
                      borderLeft: `4px solid ${activity.color}`,
                      ...(isToday ? { ['--tw-ring-color' as string]: activity.color } : {}),
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: activity.color }}
                    >
                      <ActivityIcon theme={activity.theme} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: activity.color, fontFamily: 'var(--font-inter)' }}>
                          {activity.day}
                        </span>
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3D2E1F] text-[#FFFDF9] font-semibold">
                            TODAY
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-[#3D2E1F] truncate text-sm" style={{ fontFamily: 'var(--font-fraunces)' }}>
                        {activity.theme}
                      </p>
                      <p className="text-xs text-[#6B5B4F] truncate">{activity.activity}</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#6B5B4F] mt-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{activity.duration} min</span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8E0D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-[#E8E0D6] text-[#3D2E1F]
                         font-semibold text-sm hover:bg-[#D4C4B0] transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
