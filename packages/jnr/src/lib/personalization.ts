/**
 * 8gent Jr Personalization
 *
 * Ported from NickOS. Tracks word frequency, category preferences.
 * Recommends underused words. All persistence via localStorage.
 */

export interface JrProfile {
  totalInteractions: number;
  favoriteCategories: string[];
  averageSentenceLength: number;
  vocabularySize: number;
  streakDays: number;
  lastActive: number | null;
}

export interface Recommendations {
  underusedWords: string[];
  underusedCategories: string[];
  sentenceSuggestion: string;
  timeBasedHint: string | null;
}

interface PersonalizationData {
  wordFrequency: Record<string, number>;
  categoryFrequency: Record<string, number>;
  sentenceLengths: number[];
  activeDates: string[];
  totalInteractions: number;
}

const STORAGE_KEY = '8gent-jr-personalization';
const CORE_WORDS = ['want', 'need', 'more', 'stop', 'help', 'go', 'like', 'yes', 'no', 'please'];

function empty(): PersonalizationData {
  return { wordFrequency: {}, categoryFrequency: {}, sentenceLengths: [], activeDates: [], totalInteractions: 0 };
}

function load(): PersonalizationData {
  if (typeof localStorage === 'undefined') return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as PersonalizationData : empty();
  } catch { return empty(); }
}

function save(data: PersonalizationData): void {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* full */ }
}

function todayISO(): string { return new Date().toISOString().slice(0, 10); }

// Tracking
export function trackCardTap(word: string, category: string): void {
  const d = load();
  d.wordFrequency[word] = (d.wordFrequency[word] || 0) + 1;
  d.categoryFrequency[category] = (d.categoryFrequency[category] || 0) + 1;
  d.totalInteractions++;
  const today = todayISO();
  if (!d.activeDates.includes(today)) d.activeDates.push(today);
  save(d);
}

export function trackSentenceSpeak(words: string[]): void {
  const d = load();
  d.sentenceLengths.push(words.length);
  if (d.sentenceLengths.length > 200) d.sentenceLengths.splice(0, d.sentenceLengths.length - 200);
  d.totalInteractions++;
  save(d);
}

// Profile
export function getProfile(): JrProfile {
  const d = load();
  const catEntries = Object.entries(d.categoryFrequency).sort((a, b) => b[1] - a[1]);
  const avgLen = d.sentenceLengths.length > 0
    ? d.sentenceLengths.reduce((a, b) => a + b, 0) / d.sentenceLengths.length : 0;

  // Streak calculation
  let streak = 0;
  const dates = [...d.activeDates].sort().reverse();
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (dates[i] === expected.toISOString().slice(0, 10)) streak++;
    else break;
  }

  return {
    totalInteractions: d.totalInteractions,
    favoriteCategories: catEntries.slice(0, 3).map(([c]) => c),
    averageSentenceLength: Math.round(avgLen * 10) / 10,
    vocabularySize: Object.keys(d.wordFrequency).length,
    streakDays: streak,
    lastActive: dates.length > 0 ? new Date(dates[0]).getTime() : null,
  };
}

// Recommendations
export function getRecommendedWords(count = 5): string[] {
  const d = load();
  const used = new Set(Object.keys(d.wordFrequency).map(w => w.toLowerCase()));
  const underused = CORE_WORDS.filter(w => !used.has(w));
  if (underused.length > 0) return underused.slice(0, count);
  return Object.entries(d.wordFrequency).sort((a, b) => a[1] - b[1]).slice(0, count).map(([w]) => w);
}

export function getRecommendations(count = 5): Recommendations {
  const d = load();
  const underusedWords = getRecommendedWords(count);
  const underusedCategories = Object.keys(d.categoryFrequency)
    .filter(c => (d.categoryFrequency[c] || 0) < 3).slice(0, 3);

  const avgLen = d.sentenceLengths.length > 0
    ? d.sentenceLengths.reduce((a, b) => a + b, 0) / d.sentenceLengths.length : 0;
  const sentenceSuggestion = avgLen < 2
    ? 'Try building longer sentences with 2-3 words'
    : avgLen < 4 ? 'Great progress! Try adding describing words' : 'Excellent sentence building!';

  const hour = new Date().getHours();
  let timeBasedHint: string | null = null;
  if (hour >= 7 && hour < 9) timeBasedHint = 'Morning routine: try "breakfast", "ready", "school"';
  else if (hour >= 11 && hour < 13) timeBasedHint = 'Lunchtime: try "hungry", "eat", "drink"';
  else if (hour >= 17 && hour < 19) timeBasedHint = 'Evening: try "play", "tired", "bath"';
  else if (hour >= 19 && hour < 21) timeBasedHint = 'Bedtime: try "sleep", "story", "goodnight"';

  return { underusedWords, underusedCategories, sentenceSuggestion, timeBasedHint };
}
