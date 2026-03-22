'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { SessionLogger } from '@/lib/session-logger';
import { getProfile, getRecommendations } from '@/lib/personalization';
import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SessionEvent, SessionSummary } from '@/lib/session-logger';
import type { JrProfile, Recommendations } from '@/lib/personalization';

// =============================================================================
// Types
// =============================================================================

type TimeRange = 'today' | 'week' | 'all';

interface TodayStats {
  total: number;
  uniqueWords: number;
  sentences: number;
  games: number;
}

// =============================================================================
// Helpers
// =============================================================================

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function eventDateISO(e: SessionEvent): string {
  return new Date(e.timestamp).toISOString().slice(0, 10);
}

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function calcTrend(current: number, previous: number): { value: number; isUp: boolean } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { value: 100, isUp: true };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  return { value: Math.abs(pct), isUp: pct > 0 };
}

const BAR_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
  '#EC4899', '#06B6D4', '#EF4444', '#6366F1',
  '#14B8A6', '#F97316',
];

// =============================================================================
// Data hooks
// =============================================================================

function useAnalyticsData() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [history, setHistory] = useState<SessionSummary[]>([]);
  const [profile, setProfile] = useState<JrProfile | null>(null);
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setEvents(SessionLogger.getAllEvents());
    setHistory(SessionLogger.getSessionHistory());
    setProfile(getProfile());
    setRecs(getRecommendations());
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { events, history, profile, recs, refresh };
}

function filterEventsByRange(events: SessionEvent[], range: TimeRange): SessionEvent[] {
  if (range === 'all') return events;
  const cutoff = range === 'today' ? todayISO() : daysAgoISO(7);
  return events.filter((e) => eventDateISO(e) >= cutoff);
}

function computeStats(events: SessionEvent[]): TodayStats {
  const words = new Set<string>();
  let sentences = 0;
  let games = 0;
  for (const e of events) {
    if (e.type === 'card_tap' && typeof e.data.word === 'string') words.add(e.data.word);
    if (e.type === 'sentence_speak') sentences++;
    if (e.type === 'game_complete') games++;
  }
  return { total: events.length, uniqueWords: words.size, sentences, games };
}

function computePreviousStats(events: SessionEvent[], range: TimeRange): TodayStats {
  if (range === 'all') return { total: 0, uniqueWords: 0, sentences: 0, games: 0 };
  const today = todayISO();
  if (range === 'today') {
    const yesterday = daysAgoISO(1);
    const prev = events.filter((e) => eventDateISO(e) === yesterday);
    return computeStats(prev);
  }
  // week: compare to previous week
  const weekStart = daysAgoISO(7);
  const prevWeekStart = daysAgoISO(14);
  const prev = events.filter((e) => {
    const d = eventDateISO(e);
    return d >= prevWeekStart && d < weekStart;
  });
  return computeStats(prev);
}

// =============================================================================
// Sub-components
// =============================================================================

function TimeRangeSelector({
  value,
  onChange,
  primaryColor,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
  primaryColor: string;
}) {
  const options: { key: TimeRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: '7 Days' },
    { key: 'all', label: 'All Time' },
  ];
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className="flex-1 text-[13px] font-medium py-1.5 px-3 rounded-md transition-all"
          style={
            value === opt.key
              ? { backgroundColor: primaryColor, color: '#fff' }
              : { color: '#6B7280' }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  trend,
  delay = 0,
}: {
  label: string;
  value: number;
  color: string;
  trend?: { value: number; isUp: boolean } | null;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white rounded-2xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
        {trend && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: trend.isUp ? '#ECFDF5' : '#FEF2F2',
              color: trend.isUp ? '#059669' : '#DC2626',
            }}
          >
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      <div className="text-[28px] font-bold text-gray-900 leading-tight">{value}</div>
      <div className="text-[13px] text-gray-500 mt-0.5">{label}</div>
    </motion.div>
  );
}

function BarChartRow({
  label,
  value,
  maxValue,
  color,
  delay = 0,
  rank,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay?: number;
  rank?: number;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay }}
      className="py-2.5 border-b border-gray-50 last:border-0"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span
              className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={
                rank === 0
                  ? { backgroundColor: '#FDE68A', color: '#92400E' }
                  : rank === 1
                    ? { backgroundColor: '#D1D5DB', color: '#374151' }
                    : rank === 2
                      ? { backgroundColor: '#FBBF24', color: '#fff' }
                      : { backgroundColor: '#F3F4F6', color: '#6B7280' }
              }
            >
              {rank + 1}
            </span>
          )}
          <span className="text-[15px] text-gray-900 font-medium capitalize">{label}</span>
        </div>
        <span className="text-[13px] text-gray-400 font-mono">{value}x</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, delay: delay + 0.1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

function VocabGrowthChart({
  events,
  primaryColor,
}: {
  events: SessionEvent[];
  primaryColor: string;
}) {
  // Build cumulative unique words per day (last 14 days)
  const chartData = useMemo(() => {
    const allWords = new Set<string>();
    const dailyMap: Record<string, Set<string>> = {};

    // Gather all card_tap words by date
    for (const e of events) {
      if (e.type === 'card_tap' && typeof e.data.word === 'string') {
        const date = eventDateISO(e);
        if (!dailyMap[date]) dailyMap[date] = new Set();
        dailyMap[date].add(e.data.word as string);
      }
    }

    const points: { date: string; label: string; cumulative: number; daily: number }[] = [];
    const sortedDates: string[] = [];
    for (let i = 13; i >= 0; i--) {
      sortedDates.push(daysAgoISO(i));
    }

    for (const date of sortedDates) {
      const dayWords = dailyMap[date] || new Set();
      for (const w of dayWords) allWords.add(w);
      const d = new Date(date);
      points.push({
        date,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        cumulative: allWords.size,
        daily: dayWords.size,
      });
    }
    return points;
  }, [events]);

  const maxCumulative = Math.max(...chartData.map((d) => d.cumulative), 1);
  const chartH = 120;
  const chartW = chartData.length > 1 ? chartData.length - 1 : 1;

  // SVG path for the area chart
  const linePath = useMemo(() => {
    if (chartData.length < 2) return '';
    const points = chartData.map((d, i) => {
      const x = (i / chartW) * 100;
      const y = chartH - (d.cumulative / maxCumulative) * (chartH - 10);
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [chartData, maxCumulative, chartH, chartW]);

  const areaPath = useMemo(() => {
    if (!linePath) return '';
    return `${linePath} L100,${chartH} L0,${chartH} Z`;
  }, [linePath, chartH]);

  if (chartData.every((d) => d.cumulative === 0)) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-gray-900">Vocabulary Growth</h3>
        <span className="text-[13px] font-medium" style={{ color: primaryColor }}>
          {chartData[chartData.length - 1]?.cumulative ?? 0} words
        </span>
      </div>
      <svg viewBox={`0 0 100 ${chartH}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vocabGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1="0"
            y1={chartH - frac * (chartH - 10)}
            x2="100"
            y2={chartH - frac * (chartH - 10)}
            stroke="#E5E7EB"
            strokeWidth="0.3"
          />
        ))}
        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="url(#vocabGrad)" />}
        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Dots for non-zero days */}
        {chartData.map((d, i) =>
          d.daily > 0 ? (
            <circle
              key={i}
              cx={(i / chartW) * 100}
              cy={chartH - (d.cumulative / maxCumulative) * (chartH - 10)}
              r="1.5"
              fill={primaryColor}
            />
          ) : null,
        )}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{chartData[0]?.label}</span>
        <span className="text-[10px] text-gray-400">
          {chartData[Math.floor(chartData.length / 2)]?.label}
        </span>
        <span className="text-[10px] text-gray-400">
          {chartData[chartData.length - 1]?.label}
        </span>
      </div>
    </div>
  );
}

function ActivityTimeline({
  events,
}: {
  events: SessionEvent[];
}) {
  // Show last 20 events, newest first
  const recent = useMemo(() => [...events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20), [events]);

  const getEventMeta = (type: string): { icon: ReactNode; bg: string; label: string } => {
    const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
    switch (type) {
      case 'card_tap':
        return { icon: <svg {...s} stroke="#3B82F6"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h5" /></svg>, bg: '#EFF6FF', label: 'Tapped card' };
      case 'sentence_speak':
        return { icon: <svg {...s} stroke="#10B981"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>, bg: '#ECFDF5', label: 'Spoke sentence' };
      case 'sentence_build':
        return { icon: <svg {...s} stroke="#22C55E"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>, bg: '#F0FDF4', label: 'Built sentence' };
      case 'game_start':
        return { icon: <svg {...s} stroke="#8B5CF6"><polygon points="5 3 19 12 5 21 5 3" /></svg>, bg: '#F5F3FF', label: 'Started game' };
      case 'game_complete':
        return { icon: <svg {...s} stroke="#A855F7"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" /><path d="M4 22h16" /><path d="M10 22V14a2 2 0 0 0-2-2H6" /><path d="M14 22V14a2 2 0 0 1 2-2h2" /><path d="M6 9h12v3a6 6 0 0 1-12 0V9z" /></svg>, bg: '#FDF4FF', label: 'Completed game' };
      case 'game_score':
        return { icon: <svg {...s} stroke="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>, bg: '#FFFBEB', label: 'Game score' };
      case 'category_tap':
        return { icon: <svg {...s} stroke="#F97316"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>, bg: '#FFF7ED', label: 'Opened category' };
      case 'session_start':
        return { icon: <svg {...s} stroke="#0EA5E9"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>, bg: '#F0F9FF', label: 'Session started' };
      case 'session_end':
        return { icon: <svg {...s} stroke="#94A3B8"><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" /></svg>, bg: '#F8FAFC', label: 'Session ended' };
      case 'voice_change':
        return { icon: <svg {...s} stroke="#06B6D4"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>, bg: '#ECFEFF', label: 'Changed voice' };
      default:
        return { icon: <svg {...s} stroke="#6B7280"><circle cx="12" cy="12" r="2" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="10" /></svg>, bg: '#F9FAFB', label: type.replace(/_/g, ' ') };
    }
  };

  if (recent.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="max-h-[320px] overflow-y-auto">
        {recent.map((event, i) => {
          const meta = getEventMeta(event.type);
          const detail =
            event.type === 'card_tap' && typeof event.data.word === 'string'
              ? `"${event.data.word}"`
              : event.type === 'sentence_speak' && typeof event.data.sentence === 'string'
                ? `"${(event.data.sentence as string).slice(0, 40)}"`
                : event.type === 'category_tap' && typeof event.data.categoryName === 'string'
                  ? (event.data.categoryName as string)
                  : event.type === 'game_score'
                    ? `${event.data.score}/${event.data.maxScore}`
                    : null;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: meta.bg }}
              >
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-gray-900 font-medium">{meta.label}</div>
                {detail && (
                  <div className="text-[12px] text-gray-500 truncate">{detail}</div>
                )}
              </div>
              <div className="text-[12px] text-gray-400 shrink-0">
                {formatTimeAgo(event.timestamp)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SessionHistoryList({ sessions }: { sessions: SessionSummary[] }) {
  if (sessions.length === 0) return null;
  const recent = [...sessions].reverse().slice(0, 10);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {recent.map((session, i) => (
        <motion.div
          key={session.sessionId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0"
        >
          <div className="flex-1 min-w-0">
            <div className="text-[15px] text-gray-900 font-medium">
              {formatDuration(session.duration)}
            </div>
            <div className="text-[12px] text-gray-400">
              {session.uniqueWords.length} words &middot; {session.sentencesSpoken} sentences &middot;{' '}
              {session.gamesPlayed} games
            </div>
          </div>
          <span className="text-[12px] text-gray-400 ml-3 capitalize bg-gray-50 px-2 py-0.5 rounded-full">
            {session.topContext}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ProfileCard({ profile }: { profile: JrProfile }) {
  const rows = [
    { label: 'Vocabulary Size', value: `${profile.vocabularySize} words` },
    { label: 'Avg Sentence', value: `${profile.averageSentenceLength} words` },
    { label: 'Streak', value: `${profile.streakDays} day${profile.streakDays !== 1 ? 's' : ''}` },
    { label: 'Total Interactions', value: `${profile.totalInteractions}` },
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm px-4 py-1">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <span className="text-[14px] text-gray-500">{r.label}</span>
          <span className="text-[15px] text-gray-900 font-semibold">{r.value}</span>
        </div>
      ))}
      {profile.favoriteCategories.length > 0 && (
        <div className="flex items-center justify-between py-3">
          <span className="text-[14px] text-gray-500">Top Categories</span>
          <span className="text-[14px] text-gray-900 font-medium capitalize">
            {profile.favoriteCategories.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}

function RecommendationsCard({
  recs,
  primaryColor,
}: {
  recs: Recommendations;
  primaryColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm px-4 py-4 space-y-3">
      <p className="text-[15px] text-gray-700 font-medium">{recs.sentenceSuggestion}</p>
      {recs.timeBasedHint && (
        <p className="text-[14px] text-gray-500 italic">{recs.timeBasedHint}</p>
      )}
      {recs.underusedWords.length > 0 && (
        <div>
          <p className="text-[12px] text-gray-400 mb-2">Try these words:</p>
          <div className="flex flex-wrap gap-2">
            {recs.underusedWords.map((w) => (
              <span
                key={w}
                className="px-3 py-1 rounded-full text-[13px] font-medium text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
      {recs.underusedCategories.length > 0 && (
        <div>
          <p className="text-[12px] text-gray-400 mb-2">Explore categories:</p>
          <div className="flex flex-wrap gap-2">
            {recs.underusedCategories.map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-full text-[13px] font-medium bg-gray-100 text-gray-700 capitalize"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Section header matching iOS grouped table style
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">{children}</p>
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function AnalyticsPage() {
  const { settings, isLoaded } = useApp();
  const primaryColor = settings.primaryColor || '#4CAF50';
  const [range, setRange] = useState<TimeRange>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { events, history, profile, recs, refresh } = useAnalyticsData();

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  }, [refresh]);

  // Filtered events for selected range
  const rangeEvents = useMemo(() => filterEventsByRange(events, range), [events, range]);
  const stats = useMemo(() => computeStats(rangeEvents), [rangeEvents]);
  const prevStats = useMemo(() => computePreviousStats(events, range), [events, range]);

  // Top words for range
  const topWords = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const e of rangeEvents) {
      if (e.type === 'card_tap' && typeof e.data.word === 'string') {
        const w = e.data.word as string;
        freq[w] = (freq[w] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [rangeEvents]);

  const maxWordCount = topWords.length > 0 ? topWords[0][1] : 1;

  // Category breakdown for range
  const categoryBreakdown = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const e of rangeEvents) {
      if (e.type === 'category_tap' && typeof e.data.categoryName === 'string') {
        const c = e.data.categoryName as string;
        freq[c] = (freq[c] || 0) + 1;
      }
      if (e.type === 'card_tap' && typeof e.data.category === 'string') {
        const c = e.data.category as string;
        freq[c] = (freq[c] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [rangeEvents]);

  const maxCategoryCount = categoryBreakdown.length > 0 ? categoryBreakdown[0][1] : 1;

  // Loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const hasData = events.length > 0 || history.length > 0;

  return (
    <div className="h-screen bg-[#f2f2f7] flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl safe-top"
        style={{ backgroundColor: `${primaryColor}F2` }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/app"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-white/90 active:text-white"
          >
            <span className="text-[17px] flex items-center">
              <span className="text-2xl">&lsaquo;</span>
              <span className="ml-1">Back</span>
            </span>
          </Link>
          <h1 className="text-[18px] font-semibold text-white">Analytics</h1>
          <button
            onClick={handleRefresh}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 text-white/80 active:text-white"
            disabled={isRefreshing}
          >
            <svg
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Time Range Selector */}
        <div className="px-4 pt-4 pb-2">
          <TimeRangeSelector value={range} onChange={setRange} primaryColor={primaryColor} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={range}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Stat Cards */}
            {hasData && (
              <div className="px-4 pt-3">
                <SectionLabel>
                  {range === 'today' ? "Today's Summary" : range === 'week' ? 'This Week' : 'All Time'}
                </SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Total Events"
                    value={stats.total}
                    color="#F59E0B"
                    trend={calcTrend(stats.total, prevStats.total)}
                    delay={0}
                  />
                  <StatCard
                    label="Unique Words"
                    value={stats.uniqueWords}
                    color="#3B82F6"
                    trend={calcTrend(stats.uniqueWords, prevStats.uniqueWords)}
                    delay={0.05}
                  />
                  <StatCard
                    label="Sentences Spoken"
                    value={stats.sentences}
                    color="#10B981"
                    trend={calcTrend(stats.sentences, prevStats.sentences)}
                    delay={0.1}
                  />
                  <StatCard
                    label="Games Completed"
                    value={stats.games}
                    color="#8B5CF6"
                    trend={calcTrend(stats.games, prevStats.games)}
                    delay={0.15}
                  />
                </div>
              </div>
            )}

            {/* Vocabulary Growth (always all-time) */}
            {hasData && (
              <div className="px-4 pt-6">
                <SectionLabel>Vocabulary Growth</SectionLabel>
                <VocabGrowthChart events={events} primaryColor={primaryColor} />
              </div>
            )}

            {/* Top Words */}
            {topWords.length > 0 && (
              <div className="px-4 pt-6">
                <SectionLabel>Most Used Words</SectionLabel>
                <div className="bg-white rounded-2xl overflow-hidden px-4 py-1 shadow-sm">
                  {topWords.map(([word, count], i) => (
                    <BarChartRow
                      key={word}
                      label={word}
                      value={count}
                      maxValue={maxWordCount}
                      color={BAR_COLORS[i % BAR_COLORS.length]}
                      delay={i * 0.03}
                      rank={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {categoryBreakdown.length > 0 && (
              <div className="px-4 pt-6">
                <SectionLabel>Category Breakdown</SectionLabel>
                <div className="bg-white rounded-2xl overflow-hidden px-4 py-1 shadow-sm">
                  {categoryBreakdown.map(([cat, count], i) => (
                    <BarChartRow
                      key={cat}
                      label={cat}
                      value={count}
                      maxValue={maxCategoryCount}
                      color={BAR_COLORS[i % BAR_COLORS.length]}
                      delay={i * 0.03}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            {rangeEvents.length > 0 && (
              <div className="px-4 pt-6">
                <SectionLabel>Activity Timeline</SectionLabel>
                <ActivityTimeline events={rangeEvents} />
              </div>
            )}

            {/* Session History */}
            {history.length > 0 && (
              <div className="px-4 pt-6">
                <SectionLabel>Recent Sessions</SectionLabel>
                <SessionHistoryList sessions={history} />
              </div>
            )}

            {/* Profile */}
            {profile && (
              <div className="px-4 pt-6">
                <SectionLabel>Profile</SectionLabel>
                <ProfileCard profile={profile} />
              </div>
            )}

            {/* Recommendations */}
            {recs && (
              <div className="px-4 pt-6 pb-4">
                <SectionLabel>Recommendations</SectionLabel>
                <RecommendationsCard recs={recs} primaryColor={primaryColor} />
              </div>
            )}

            {/* Empty state */}
            {!hasData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 px-4"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="text-[17px] font-medium text-gray-600 mb-2">No Activity Yet</h3>
                <p className="text-[15px] text-gray-400 max-w-xs mx-auto">
                  Start using the communication board to see analytics here.
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Dock primaryColor={primaryColor} />
    </div>
  );
}
