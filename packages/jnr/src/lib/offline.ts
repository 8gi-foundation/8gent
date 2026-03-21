/**
 * 8gent Jr Offline Mode
 *
 * localStorage cache for vocabulary/settings + pending action queue.
 * Matches existing jnr storage pattern (storage/userCards.ts).
 */

const KEYS = {
  VOCAB: '8gent-jr-vocab-cache', VOCAB_VERSION: '8gent-jr-vocab-version',
  SETTINGS: '8gent-jr-settings', PENDING_QUEUE: '8gent-jr-pending-sync',
} as const;

const VOCAB_VERSION = 1; // Bump when seed vocabulary changes

function load<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null; }
  catch { return null; }
}

function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error('[8gent Jr Offline] Write failed:', e); }
}

// -- Vocabulary Cache --

export interface CachedVocabEntry {
  id: string; text: string; categoryId: string;
  imageUrl?: string; usageCount: number; lastUsed?: number;
}

export function getCachedVocab(): CachedVocabEntry[] {
  return load<CachedVocabEntry[]>(KEYS.VOCAB) ?? [];
}

export function cacheVocab(entries: CachedVocabEntry[]): void {
  save(KEYS.VOCAB, entries);
  save(KEYS.VOCAB_VERSION, VOCAB_VERSION);
}

export function vocabCacheStale(): boolean {
  return load<number>(KEYS.VOCAB_VERSION) !== VOCAB_VERSION;
}

export function trackUsage(entryId: string): void {
  const vocab = getCachedVocab();
  const entry = vocab.find(v => v.id === entryId);
  if (entry) { entry.usageCount++; entry.lastUsed = Date.now(); save(KEYS.VOCAB, vocab); }
}

// -- Settings --

export interface JnrSettings {
  childName: string; ttsRate: number; ttsVoice?: string;
  theme: 'calm' | 'bright' | 'high_contrast';
  gridColumns: number; lastSyncAt?: number;
}

const DEFAULT_SETTINGS: JnrSettings = {
  childName: '', ttsRate: 0.9, theme: 'bright', gridColumns: 3,
};

export function getSettings(): JnrSettings {
  return load<JnrSettings>(KEYS.SETTINGS) ?? DEFAULT_SETTINGS;
}

export function saveSettings(partial: Partial<JnrSettings>): void {
  save(KEYS.SETTINGS, { ...getSettings(), ...partial });
}

// -- Pending Sync Queue --

interface PendingAction {
  type: 'usage' | 'vocab_update' | 'settings'; data: unknown; timestamp: number;
}

export function queueAction(type: PendingAction['type'], data: unknown): void {
  const queue = load<PendingAction[]>(KEYS.PENDING_QUEUE) ?? [];
  queue.push({ type, data, timestamp: Date.now() });
  save(KEYS.PENDING_QUEUE, queue);
}

export function getPendingActions(): PendingAction[] {
  return load<PendingAction[]>(KEYS.PENDING_QUEUE) ?? [];
}

export function clearPendingActions(): void {
  save(KEYS.PENDING_QUEUE, []);
}

// -- Connectivity --

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function onConnectivityChange(cb: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const on = () => cb(true), off = () => cb(false);
  window.addEventListener('online', on);
  window.addEventListener('offline', off);
  return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
}
