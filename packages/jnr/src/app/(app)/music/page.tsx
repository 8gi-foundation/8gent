'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { DrumPads } from '@/components/instruments/DrumPads';
import { XylophoneKeys } from '@/components/instruments/XylophoneKeys';

// Three tabs: Drums, Keys, Create Song.
// Create Song tab is hidden if SUNO_API_KEY is not configured (server returns 503).
// Generated songs stored in localStorage.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MusicTab = 'drums' | 'xylophone' | 'create';

type SongStatus = 'idle' | 'generating' | 'polling' | 'complete' | 'error';

interface SavedSong {
  id: string;
  title: string;
  prompt: string;
  audioUrl: string;
  imageUrl?: string;
  lyrics?: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'jr-generated-songs';
const POLL_INTERVAL = 5000;
const MAX_POLLS = 36; // 3 minutes max

const INSTRUMENT_TABS: Array<{ id: 'drums' | 'xylophone'; label: string; svgPath: string }> = [
  {
    id: 'drums',
    label: 'Drums',
    svgPath: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a2 2 0 110 4 2 2 0 010-4z',
  },
  {
    id: 'xylophone',
    label: 'Keys',
    svgPath: 'M3 5h2v14H3V5zm4 2h2v10H7V7zm4-1h2v12h-2V6zm4 3h2v6h-2V9zm4-2h2v10h-2V7z',
  },
];

const ORANGE = '#E8610A';
const BG = '#FFFDF9';
const SURFACE = '#F5F0EB';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadSongs(): SavedSong[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveSong(song: SavedSong) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([song, ...loadSongs()].slice(0, 20)));
}

function getLastAacSentence(): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem('jr-last-sentence') || ''; } catch { return ''; }
}

function CreateSongPanel({ childName }: { childName: string }) {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<SongStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [currentSong, setCurrentSong] = useState<SavedSong | null>(null);
  const [history, setHistory] = useState<SavedSong[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  useEffect(() => {
    setHistory(loadSongs());
    const lastSentence = getLastAacSentence();
    if (lastSentence) setPrompt(lastSentence);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (taskId: string, title: string, originalPrompt: string, lyrics: string) => {
      pollCount.current = 0;
      setStatus('polling');
      setStatusMsg('Suno is composing your song...');

      pollRef.current = setInterval(async () => {
        pollCount.current += 1;

        if (pollCount.current > MAX_POLLS) {
          stopPolling();
          setStatus('error');
          setStatusMsg('Song generation timed out. Try again.');
          return;
        }

        try {
          const res = await fetch(`/api/music/status?taskId=${encodeURIComponent(taskId)}`);
          const data = await res.json();

          if (data.status === 'complete' && data.audioUrl) {
            stopPolling();
            const song: SavedSong = {
              id: taskId,
              title: data.title || title,
              prompt: originalPrompt,
              audioUrl: data.audioUrl,
              imageUrl: data.imageUrl,
              lyrics,
              timestamp: Date.now(),
            };
            saveSong(song);
            setCurrentSong(song);
            setHistory(loadSongs());
            setStatus('complete');
            setStatusMsg('');
          } else if (data.status === 'failed') {
            stopPolling();
            setStatus('error');
            setStatusMsg(`Generation failed: ${data.error || 'unknown error'}`);
          }
          // else still processing - keep polling
        } catch (err) {
          console.error('[poll] error:', err);
        }
      }, POLL_INTERVAL);
    },
    [stopPolling]
  );

  const handleGenerate = async () => {
    if (!prompt.trim() || status === 'generating' || status === 'polling') return;

    stopPolling();
    setStatus('generating');
    setStatusMsg('Writing lyrics...');
    setCurrentSong(null);

    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), childName: childName || undefined }),
      });

      if (res.status === 503) {
        setStatus('error');
        setStatusMsg('Song creation is not available right now.');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setStatusMsg(data.error || 'Something went wrong. Try again.');
        return;
      }

      const data = await res.json();

      if (!data.taskId) {
        setStatus('error');
        setStatusMsg('No task ID returned. Try again.');
        return;
      }

      startPolling(data.taskId, data.title, prompt.trim(), data.lyrics || '');
    } catch (err) {
      console.error('[generate] error:', err);
      setStatus('error');
      setStatusMsg('Network error. Check your connection.');
    }
  };

  const handlePlay = (song: SavedSong) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (playingId === song.id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(song.audioUrl);
    audio.onended = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
    audioRef.current = audio;
    setPlayingId(song.id);
  };

  const isWorking = status === 'generating' || status === 'polling';

  return (
    <div className="flex flex-col gap-4 px-4 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 160px)' }}>
      {/* Prompt input */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ backgroundColor: SURFACE }}
      >
        <label
          className="text-base font-semibold"
          style={{ fontFamily: 'var(--font-fraunces)', color: '#333' }}
        >
          What should the song be about?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Dogs, playing outside, bubbles..."
          disabled={isWorking}
          rows={3}
          className="w-full rounded-xl px-3 py-3 text-base resize-none border outline-none focus:ring-2"
          style={{
            fontFamily: 'var(--font-inter, sans-serif)',
            borderColor: '#ddd',
            backgroundColor: '#fff',
            // @ts-expect-error -- CSS custom property
            '--tw-ring-color': ORANGE,
            color: '#333',
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isWorking}
          className="w-full py-4 rounded-xl text-white text-lg font-bold transition-all"
          style={{
            fontFamily: 'var(--font-fraunces)',
            backgroundColor: !prompt.trim() || isWorking ? '#ccc' : ORANGE,
            minHeight: 56,
            boxShadow: !prompt.trim() || isWorking ? 'none' : '0 4px 12px rgba(232,97,10,0.35)',
          }}
        >
          {isWorking ? 'Creating...' : 'Create Song'}
        </button>
      </div>

      {/* Status message */}
      {isWorking && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ backgroundColor: '#FFF3E0' }}
        >
          <span className="text-2xl">🎵</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: ORANGE }}>
              {statusMsg}
            </p>
            <p className="text-xs" style={{ color: '#888' }}>
              This takes about 1-2 minutes. Don't close the page.
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {status === 'error' && (
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#FEF2F2' }}>
          <p className="text-sm font-semibold" style={{ color: '#DC2626' }}>
            {statusMsg}
          </p>
        </div>
      )}

      {/* Latest song */}
      {currentSong && status === 'complete' && (
        <div
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: '#F0FDF4', border: '2px solid #86EFAC' }}
        >
          <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-fraunces)', color: '#15803D' }}>
            {currentSong.title}
          </p>
          <p className="text-sm" style={{ color: '#555' }}>"{currentSong.prompt}"</p>
          <button
            onClick={() => handlePlay(currentSong)}
            className="w-full py-3 rounded-xl text-white font-bold text-base flex items-center justify-center gap-2"
            style={{ backgroundColor: '#16A34A', minHeight: 52 }}
          >
            {playingId === currentSong.id ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Play Song
              </>
            )}
          </button>
        </div>
      )}

      {/* Song history */}
      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <p
            className="text-sm font-semibold px-1"
            style={{ color: '#888', fontFamily: 'var(--font-fraunces)' }}
          >
            Previous Songs
          </p>
          {history.map((song) => (
            <div
              key={song.id}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ backgroundColor: SURFACE }}
            >
              <button
                onClick={() => handlePlay(song)}
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: playingId === song.id ? '#555' : ORANGE }}
                aria-label={playingId === song.id ? 'Pause' : 'Play'}
              >
                {playingId === song.id ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ fontFamily: 'var(--font-fraunces)', color: '#333' }}
                >
                  {song.title}
                </p>
                <p className="text-xs truncate" style={{ color: '#888' }}>
                  {song.prompt}
                </p>
              </div>
              <p className="text-xs shrink-0" style={{ color: '#aaa' }}>
                {new Date(song.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MusicPage() {
  const router = useRouter();
  const { settings } = useApp();
  const [activeTab, setActiveTab] = useState<MusicTab>('drums');
  const [sunoEnabled, setSunoEnabled] = useState<boolean | null>(null); // null = loading

  // Probe the generate endpoint on mount - if 503, hide Create tab
  useEffect(() => {
    fetch('/api/music/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '__probe__' }),
    })
      .then((res) => {
        // 503 = not configured; 400 = configured but bad input (expected)
        setSunoEnabled(res.status !== 503);
      })
      .catch(() => setSunoEnabled(false));
  }, []);

  const tabs: { id: MusicTab; label: string; svgPath: string }[] = [
    ...INSTRUMENT_TABS,
    ...(sunoEnabled
      ? [
          {
            id: 'create' as const,
            label: 'Create',
            svgPath:
              'M12 3a9 9 0 100 18A9 9 0 0012 3zm0 4v5l4 2-1.5 2.6L10 14V7h2z',
          },
        ]
      : []),
  ];

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ backgroundColor: BG }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ backgroundColor: ORANGE }}
      >
        <button
          onClick={() => router.push('/app')}
          className="flex items-center gap-1 text-white"
          style={{ minWidth: 80, minHeight: 44 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-fraunces)' }}>
            Back
          </span>
        </button>
        <span
          className="text-white text-xl font-bold"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Music
        </span>
        <div style={{ width: 80 }} />
      </header>

      {/* Tab Selector */}
      <div className="flex gap-2 px-4 py-3 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-lg font-semibold transition-all"
            style={{
              fontFamily: 'var(--font-fraunces)',
              backgroundColor: activeTab === tab.id ? ORANGE : SURFACE,
              color: activeTab === tab.id ? '#FFFFFF' : '#666',
              minHeight: 56,
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(232,97,10,0.3)' : 'none',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d={tab.svgPath} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'drums' && <DrumPads className="h-full" />}
        {activeTab === 'xylophone' && <XylophoneKeys className="h-full" />}
        {activeTab === 'create' && sunoEnabled && (
          <CreateSongPanel childName={settings.childName} />
        )}
      </div>
    </div>
  );
}
