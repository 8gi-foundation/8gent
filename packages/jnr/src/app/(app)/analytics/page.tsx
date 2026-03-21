'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { SessionLogger } from '@/lib/session-logger';
import { getProfile, getRecommendations } from '@/lib/personalization';
import { useState, useEffect, useMemo } from 'react';
import type { SessionEvent, SessionSummary } from '@/lib/session-logger';
import type { JrProfile, Recommendations } from '@/lib/personalization';

/**
 * Analytics Page - 8gent Jr
 *
 * Dashboard showing usage stats, word frequency, category breakdown,
 * session history, and personalization recommendations.
 * Data sourced from localStorage via session-logger + personalization.
 */

export default function AnalyticsPage() {
  const { settings, isLoaded } = useApp();
  const primaryColor = settings.primaryColor || '#4CAF50';

  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [history, setHistory] = useState<SessionSummary[]>([]);
  const [profile, setProfile] = useState<JrProfile | null>(null);
  const [recs, setRecs] = useState<Recommendations | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    setEvents(SessionLogger.getAllEvents());
    setHistory(SessionLogger.getSessionHistory());
    setProfile(getProfile());
    setRecs(getRecommendations());
  }, []);

  // Today's events
  const todayEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((e) => new Date(e.timestamp).toISOString().slice(0, 10) === today);
  }, [events]);

  // Today's stats
  const todayStats = useMemo(() => {
    const words = new Set<string>();
    let sentences = 0;
    let games = 0;
    for (const e of todayEvents) {
      if (e.type === 'card_tap' && typeof e.data.word === 'string') words.add(e.data.word);
      if (e.type === 'sentence_speak') sentences++;
      if (e.type === 'game_complete') games++;
    }
    return { total: todayEvents.length, uniqueWords: words.size, sentences, games };
  }, [todayEvents]);

  // Word frequency (all time)
  const topWords = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const e of events) {
      if (e.type === 'card_tap' && typeof e.data.word === 'string') {
        const w = e.data.word as string;
        freq[w] = (freq[w] || 0) + 1;
      }
    }
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [events]);

  const maxWordCount = topWords.length > 0 ? topWords[0][1] : 1;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const e of events) {
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
  }, [events]);

  const maxCategoryCount = categoryBreakdown.length > 0 ? categoryBreakdown[0][1] : 1;

  // Recent sessions (newest first)
  const recentSessions = useMemo(() => [...history].reverse().slice(0, 10), [history]);

  const BAR_COLORS = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
    '#EC4899', '#06B6D4', '#EF4444', '#6366F1',
    '#14B8A6', '#F97316',
  ];

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
          <div className="w-[44px]" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Today's Summary */}
        <div className="px-4 pt-6">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Today&apos;s Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Events" value={todayStats.total} color="#F59E0B" />
            <StatCard label="Unique Words" value={todayStats.uniqueWords} color="#3B82F6" />
            <StatCard label="Sentences Spoken" value={todayStats.sentences} color="#10B981" />
            <StatCard label="Games Completed" value={todayStats.games} color="#8B5CF6" />
          </div>
        </div>

        {/* Most Used Words */}
        {topWords.length > 0 && (
          <div className="px-4 pt-6">
            <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
              Most Used Words
            </p>
            <div className="bg-white rounded-xl overflow-hidden px-4 py-2">
              {topWords.map(([word, count], i) => (
                <div key={word} className="py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[15px] text-gray-900 font-medium capitalize">{word}</span>
                    <span className="text-[13px] text-gray-400 font-mono">{count}x</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxWordCount) * 100}%`,
                        backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="px-4 pt-6">
            <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
              Category Breakdown
            </p>
            <div className="bg-white rounded-xl overflow-hidden px-4 py-2">
              {categoryBreakdown.map(([cat, count], i) => (
                <div key={cat} className="py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[15px] text-gray-900 font-medium capitalize">{cat}</span>
                    <span className="text-[13px] text-gray-400 font-mono">{count}x</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxCategoryCount) * 100}%`,
                        backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session History */}
        {recentSessions.length > 0 && (
          <div className="px-4 pt-6">
            <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
              Recent Sessions
            </p>
            <div className="bg-white rounded-xl overflow-hidden">
              {recentSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] text-gray-900 font-medium">
                      {formatDuration(session.duration)}
                    </div>
                    <div className="text-[13px] text-gray-400">
                      {session.uniqueWords.length} words &middot; {session.sentencesSpoken} sentences &middot; {session.gamesPlayed} games
                    </div>
                  </div>
                  <div className="text-[13px] text-gray-400 ml-3 capitalize">
                    {session.topContext}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile & Recommendations */}
        {profile && (
          <div className="px-4 pt-6">
            <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
              Profile
            </p>
            <div className="bg-white rounded-xl overflow-hidden px-4 py-3 space-y-2">
              <ProfileRow label="Vocabulary Size" value={`${profile.vocabularySize} words`} />
              <ProfileRow label="Avg Sentence Length" value={`${profile.averageSentenceLength} words`} />
              <ProfileRow label="Streak" value={`${profile.streakDays} day${profile.streakDays !== 1 ? 's' : ''}`} />
              <ProfileRow label="Total Interactions" value={`${profile.totalInteractions}`} />
              {profile.favoriteCategories.length > 0 && (
                <ProfileRow label="Top Categories" value={profile.favoriteCategories.join(', ')} />
              )}
            </div>
          </div>
        )}

        {recs && (
          <div className="px-4 pt-6 pb-8">
            <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
              Recommendations
            </p>
            <div className="bg-white rounded-xl overflow-hidden px-4 py-3 space-y-3">
              <p className="text-[15px] text-gray-700">{recs.sentenceSuggestion}</p>
              {recs.timeBasedHint && (
                <p className="text-[15px] text-gray-500 italic">{recs.timeBasedHint}</p>
              )}
              {recs.underusedWords.length > 0 && (
                <div>
                  <p className="text-[13px] text-gray-400 mb-1.5">Try these words:</p>
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
                  <p className="text-[13px] text-gray-400 mb-1.5">Explore these categories:</p>
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
          </div>
        )}

        {/* Empty state */}
        {events.length === 0 && history.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-[17px] font-medium text-gray-600 mb-2">No Activity Yet</h3>
            <p className="text-[15px] text-gray-400 max-w-xs mx-auto">
              Start using the communication board to see analytics here.
            </p>
          </div>
        )}
      </div>

      <Dock primaryColor={primaryColor} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <div className="text-[28px] font-bold text-gray-900 leading-tight">{value}</div>
      <div className="text-[13px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[15px] text-gray-500">{label}</span>
      <span className="text-[15px] text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
