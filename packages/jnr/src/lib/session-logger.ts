/**
 * 8gent Jr Session Logger
 *
 * Buffers events in memory, flushes to localStorage every 30s.
 * Provides session summaries with rule-based recommendations.
 *
 * CONSENT GATE: No data is persisted to localStorage unless
 * the parent has granted analytics consent. In-memory buffering
 * still works (for the current session UX) but flush() and end()
 * skip all writes when consent is absent.
 */

export type EventType =
  | 'session_start' | 'session_end'
  | 'card_tap' | 'sentence_build' | 'sentence_speak'
  | 'game_start' | 'game_complete' | 'game_score'
  | 'category_tap' | 'settings_change' | 'voice_change'
  | 'error';

export interface SessionEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  type: EventType;
  data: Record<string, unknown>;
  context: string;
}

export interface SessionSummary {
  sessionId: string;
  duration: number;
  totalEvents: number;
  uniqueWords: string[];
  sentencesSpoken: number;
  gamesPlayed: number;
  topContext: string;
}

const EVENTS_KEY = '8gent-jr-session-events';
const HISTORY_KEY = '8gent-jr-session-history';
const CONSENTS_KEY = '8gent-jr-consents';

/**
 * Check if the parent has granted analytics consent.
 * Returns false if no consent record exists (safe default).
 */
function hasAnalyticsConsent(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENTS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

export class SessionLogger {
  private sessionId: string;
  private events: SessionEvent[] = [];
  private startTime: number;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.sessionId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.startTime = Date.now();
    this.log('session_start', {}, 'system');
    this.flushTimer = setInterval(() => this.flush(), 30_000);
  }

  log(type: EventType, data: Record<string, unknown>, context = 'talk'): void {
    this.events.push({
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type, data, context,
    });
  }

  logCardTap(word: string, category: string): void { this.log('card_tap', { word, category }); }
  logSentenceBuild(words: string[]): void { this.log('sentence_build', { words, length: words.length }); }
  logSentenceSpeak(sentence: string): void { this.log('sentence_speak', { sentence, wordCount: sentence.split(' ').length }); }
  logCategoryTap(categoryId: string, categoryName: string): void { this.log('category_tap', { categoryId, categoryName }); }
  logGameScore(gameId: string, score: number, maxScore: number): void { this.log('game_score', { gameId, score, maxScore }, 'game'); }

  getSessionSummary(): SessionSummary {
    const words = new Set<string>();
    let sentencesSpoken = 0, gamesPlayed = 0;
    const ctxCounts: Record<string, number> = {};

    for (const e of this.events) {
      ctxCounts[e.context] = (ctxCounts[e.context] || 0) + 1;
      if (e.type === 'card_tap' && typeof e.data.word === 'string') words.add(e.data.word);
      if (e.type === 'sentence_speak') sentencesSpoken++;
      if (e.type === 'game_start') gamesPlayed++;
    }

    const topContext = Object.entries(ctxCounts)
      .filter(([c]) => c !== 'system')
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'talk';

    return { sessionId: this.sessionId, duration: Date.now() - this.startTime, totalEvents: this.events.length, uniqueWords: Array.from(words), sentencesSpoken, gamesPlayed, topContext };
  }

  getRecommendations(): string[] {
    const recs: string[] = [];
    const summary = this.getSessionSummary();
    const wordFreq: Record<string, number> = {};
    for (const e of this.events) {
      if (e.type === 'card_tap' && typeof e.data.word === 'string')
        wordFreq[e.data.word] = (wordFreq[e.data.word] || 0) + 1;
    }
    const sorted = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0 && sorted[0][1] > 10)
      recs.push(`"${sorted[0][0]}" used ${sorted[0][1]} times - consider modeling synonyms`);
    if (summary.sentencesSpoken === 0 && summary.totalEvents > 5)
      recs.push('No sentences spoken this session - check if sentence builder is accessible');
    if (summary.duration < 60_000 && summary.totalEvents > 2)
      recs.push('Session under 1 minute - engagement may need support');
    return recs;
  }

  flush(): void {
    if (typeof localStorage === 'undefined' || this.events.length === 0) return;
    // CONSENT GATE: Do not persist session events without analytics consent
    if (!hasAnalyticsConsent()) {
      this.events = [];
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]') as SessionEvent[];
      localStorage.setItem(EVENTS_KEY, JSON.stringify([...existing, ...this.events]));
      this.events = [];
    } catch { /* storage full - keep in memory */ }
  }

  end(): SessionSummary {
    this.log('session_end', { duration: Date.now() - this.startTime }, 'system');
    const summary = this.getSessionSummary();
    this.flush();
    // CONSENT GATE: Do not persist session history without analytics consent
    if (typeof localStorage !== 'undefined' && hasAnalyticsConsent()) {
      try {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as SessionSummary[];
        history.push(summary);
        if (history.length > 50) history.splice(0, history.length - 50);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch { /* ignore */ }
    }
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = null;
    return summary;
  }

  static getAllEvents(): SessionEvent[] {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]') as SessionEvent[]; }
    catch { return []; }
  }

  static getSessionHistory(): SessionSummary[] {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as SessionSummary[]; }
    catch { return []; }
  }

  get id(): string { return this.sessionId; }
}

// Singleton
let _instance: SessionLogger | null = null;
export function getSessionLogger(): SessionLogger {
  if (!_instance) _instance = new SessionLogger();
  return _instance;
}
export function resetSessionLogger(): void {
  if (_instance) _instance.end();
  _instance = null;
}
