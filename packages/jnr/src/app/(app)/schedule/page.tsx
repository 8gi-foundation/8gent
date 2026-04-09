'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';

/**
 * My Day - Visual Schedule
 *
 * Clinical-grade visual schedule for ABA and speech therapy.
 * Predictable daily sequence with checkmarks, "Now" indicator,
 * manual Next advance, and edit mode (add/remove/reorder).
 * Persisted to localStorage. Minimum 48px touch targets.
 */

interface Activity {
  id: string;
  emoji: string;
  label: string;
  time?: string;
  done: boolean;
}

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'wake',   emoji: '☀️', label: 'Wake Up',     time: '07:00', done: false },
  { id: 'bfast',  emoji: '🍳', label: 'Breakfast',   time: '07:30', done: false },
  { id: 'dress',  emoji: '👕', label: 'Get Dressed', time: '08:00', done: false },
  { id: 'teeth',  emoji: '🪥', label: 'Brush Teeth', time: '08:15', done: false },
  { id: 'school', emoji: '🎒', label: 'Learning',    time: '09:00', done: false },
  { id: 'lunch',  emoji: '🥪', label: 'Lunch',       time: '12:00', done: false },
  { id: 'play',   emoji: '🎮', label: 'Play Time',   time: '13:00', done: false },
  { id: 'snack',  emoji: '🍎', label: 'Snack',       time: '15:00', done: false },
  { id: 'bath',   emoji: '🛁', label: 'Bath',        time: '17:00', done: false },
  { id: 'story',  emoji: '📖', label: 'Story Time',  time: '19:00', done: false },
  { id: 'bed',    emoji: '🌙', label: 'Bedtime',     time: '20:00', done: false },
];

const STORAGE_KEY = '8gent-schedule-v1';

function loadSchedule(): Activity[] {
  if (typeof window === 'undefined') return DEFAULT_ACTIVITIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Activity[];
  } catch { /* use defaults */ }
  return DEFAULT_ACTIVITIES;
}

function timeToMins(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function findCurrentIndex(acts: Activity[]): number {
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  let best = -1;
  for (let i = 0; i < acts.length; i++) {
    if (acts[i].done) continue;
    if (acts[i].time && timeToMins(acts[i].time!) <= now) best = i;
    else if (!acts[i].time && best === -1) best = i;
  }
  if (best !== -1) return best;
  const first = acts.findIndex((a) => !a.done);
  return first === -1 ? acts.length - 1 : first;
}

// ---- Inline SVG icons ----

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ---- Page ----

export default function SchedulePage() {
  const { settings } = useApp();
  const primary = settings.primaryColor || '#4CAF50';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newEmoji, setNewEmoji] = useState('🎨');
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const loaded = loadSchedule();
    setActivities(loaded);
    setCurrentIndex(findCurrentIndex(loaded));
  }, []);

  const persist = useCallback((updated: Activity[]) => {
    setActivities(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, []);

  const toggleDone = (id: string) => {
    const updated = activities.map((a) => a.id === id ? { ...a, done: !a.done } : a);
    persist(updated);
    setCurrentIndex(findCurrentIndex(updated));
  };

  const advanceNext = () => {
    const next = activities.findIndex((a, i) => i > currentIndex && !a.done);
    if (next !== -1) setCurrentIndex(next);
  };

  const removeActivity = (id: string) => {
    const updated = activities.filter((a) => a.id !== id);
    persist(updated);
    setCurrentIndex(findCurrentIndex(updated));
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const u = [...activities];
    [u[i - 1], u[i]] = [u[i], u[i - 1]];
    persist(u);
  };

  const moveDown = (i: number) => {
    if (i === activities.length - 1) return;
    const u = [...activities];
    [u[i], u[i + 1]] = [u[i + 1], u[i]];
    persist(u);
  };

  const addActivity = () => {
    if (!newLabel.trim()) return;
    const act: Activity = { id: `c-${Date.now()}`, emoji: newEmoji, label: newLabel.trim(), time: newTime || undefined, done: false };
    persist([...activities, act]);
    setNewLabel('');
    setNewTime('');
  };

  const resetDay = () => {
    const updated = activities.map((a) => ({ ...a, done: false }));
    persist(updated);
    setCurrentIndex(findCurrentIndex(updated));
  };

  const doneCount = activities.filter((a) => a.done).length;
  const allDone = doneCount === activities.length && activities.length > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0EB' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ backgroundColor: `${primary}F2` }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-[20px] font-bold text-white leading-tight">My Day</h1>
            <p className="text-[13px] text-white/80">{doneCount} of {activities.length} done</p>
          </div>
          <div className="flex items-center gap-2">
            {allDone && (
              <button onClick={resetDay} className="bg-white/20 text-white text-[13px] font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                Reset
              </button>
            )}
            <button onClick={() => setEditMode((e) => !e)} className="bg-white/20 text-white text-[13px] font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform">
              {editMode ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/20 mx-4 mb-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: activities.length > 0 ? `${(doneCount / activities.length) * 100}%` : '0%', backgroundColor: 'white' }}
          />
        </div>
      </header>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-40">
        <div className="max-w-lg mx-auto relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[35px] top-6 bottom-6 w-[3px] rounded-full" style={{ backgroundColor: `${primary}30` }} />

          {activities.map((activity, index) => {
            const isNow = index === currentIndex && !activity.done;
            const isFuture = !activity.done && index > currentIndex;

            return (
              <div key={activity.id} className="relative flex items-start gap-3 mb-3">
                {/* Node */}
                <div
                  className={`relative z-10 w-[44px] h-[44px] rounded-full flex-shrink-0 flex items-center justify-center text-[22px] transition-all duration-300 ${activity.done ? 'bg-green-500' : 'bg-white shadow-md'}`}
                  style={isNow ? { backgroundColor: primary, boxShadow: `0 0 0 4px ${primary}40` } : undefined}
                >
                  {activity.done ? <CheckIcon /> : <span>{activity.emoji}</span>}
                </div>

                {/* Card */}
                <div className={`flex-1 rounded-2xl overflow-hidden transition-all duration-300 ${activity.done ? 'opacity-60' : ''}`}>
                  <button
                    disabled={editMode}
                    onClick={() => !editMode && toggleDone(activity.id)}
                    className={`w-full text-left px-4 py-3 min-h-[64px] flex items-center justify-between transition-all active:scale-[0.98] ${editMode ? 'cursor-default' : 'cursor-pointer'}`}
                    style={isNow
                      ? { backgroundColor: `${primary}15`, border: `2px solid ${primary}`, borderRadius: editMode ? '16px 16px 0 0' : '16px' }
                      : { backgroundColor: 'white', border: '2px solid transparent', borderRadius: editMode ? '16px 16px 0 0' : '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                    }
                  >
                    <div className="flex-1">
                      <span
                        className={`text-[18px] font-bold block leading-tight ${activity.done ? 'line-through text-gray-400' : isFuture ? 'text-gray-700' : 'text-gray-900'}`}
                        style={isNow && !activity.done ? { color: primary } : undefined}
                      >
                        {activity.label}
                      </span>
                      {activity.time && (
                        <span className="text-[14px] font-medium mt-0.5 block" style={{ color: activity.done ? '#aaa' : isNow ? primary : '#9A9088' }}>
                          {activity.time}
                        </span>
                      )}
                    </div>
                    {isNow && (
                      <span className="text-[12px] font-bold px-2.5 py-1 rounded-full text-white ml-2 flex-shrink-0" style={{ backgroundColor: primary }}>
                        NOW
                      </span>
                    )}
                    {isFuture && !editMode && (
                      <span className="text-[12px] font-semibold text-gray-400 ml-2 flex-shrink-0">Next</span>
                    )}
                  </button>

                  {editMode && (
                    <div className="flex items-center gap-1 px-3 pb-3 bg-white -mt-1 rounded-b-2xl border-t border-gray-100">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="p-2 rounded-lg disabled:opacity-30 active:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center">
                        <ArrowUpIcon />
                      </button>
                      <button onClick={() => moveDown(index)} disabled={index === activities.length - 1} className="p-2 rounded-lg disabled:opacity-30 active:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center">
                        <ArrowDownIcon />
                      </button>
                      <div className="flex-1" />
                      <button onClick={() => removeActivity(activity.id)} className="p-2 rounded-lg active:bg-red-50 text-red-500 min-w-[40px] min-h-[40px] flex items-center justify-center">
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* All done */}
          {allDone && (
            <div className="text-center py-8">
              <p className="text-[48px]">🎉</p>
              <p className="text-[20px] font-bold mt-2" style={{ color: primary }}>Amazing job today!</p>
              <p className="text-[15px] text-gray-500 mt-1">All done. You did it!</p>
            </div>
          )}

          {/* Add activity (edit mode) */}
          {editMode && (
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-[15px] font-bold text-gray-800 mb-3">Add Activity</p>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  maxLength={2}
                  className="w-[52px] h-[52px] text-[28px] text-center rounded-xl border-2 border-gray-200 focus:outline-none"
                  style={{ borderColor: newEmoji ? primary : undefined }}
                  placeholder="😊"
                />
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Activity name"
                  className="flex-1 h-[52px] px-3 rounded-xl border-2 border-gray-200 text-[16px] font-medium focus:outline-none"
                  style={{ borderColor: newLabel ? primary : undefined }}
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-[90px] h-[52px] px-2 rounded-xl border-2 border-gray-200 text-[14px] focus:outline-none"
                />
              </div>
              <button
                onClick={addActivity}
                disabled={!newLabel.trim()}
                className="w-full h-[52px] rounded-xl text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
                style={{ backgroundColor: primary }}
              >
                <PlusIcon />
                Add to My Day
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Next button */}
      {!editMode && !allDone && (
        <div className="fixed bottom-[72px] left-0 right-0 px-4 z-30">
          <div className="max-w-lg mx-auto">
            <button
              onClick={advanceNext}
              disabled={activities.findIndex((a, i) => i > currentIndex && !a.done) === -1}
              className="w-full h-[56px] rounded-2xl text-white font-bold text-[17px] shadow-lg active:scale-95 transition-transform disabled:opacity-40"
              style={{ backgroundColor: primary }}
            >
              Next Activity
            </button>
          </div>
        </div>
      )}

      <Dock primaryColor={primary} />
    </div>
  );
}
