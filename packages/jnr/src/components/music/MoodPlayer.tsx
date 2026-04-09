'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PLAYLISTS, type Playlist, type Track } from '@/lib/playlists';

/**
 * MoodPlayer - Emotional regulation playlist player for 8gent Jr
 *
 * 7 mood cards -> track list -> HTML5 Audio player.
 * No external deps beyond React. Uses HTML5 Audio API.
 */

export function MoodPlayer() {
  const [activeMood, setActiveMood] = useState<Playlist | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const loadTrack = useCallback((track: Track, autoPlay = true) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.pause();
    audio.src = track.url;
    setCurrentTrack(track);
    setProgress(0);
    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    audio.onerror = () => {
      setIsPlaying(false);
    };
  }, []);

  const handleMoodSelect = (playlist: Playlist) => {
    setActiveMood(playlist);
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const handleTrackSelect = (track: Track) => {
    loadTrack(track, true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !currentTrack) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * (audioRef.current.duration || 0);
  };

  // Mood grid view
  if (!activeMood) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <p className="text-center text-lg font-semibold mb-4" style={{ color: '#666', fontFamily: 'var(--font-fraunces)' }}>
          How are you feeling?
        </p>
        <div className="grid grid-cols-2 gap-3 pb-4">
          {PLAYLISTS.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleMoodSelect(playlist)}
              className="flex flex-col items-center justify-center gap-2 rounded-3xl py-6 px-4 transition-all active:scale-95"
              style={{
                backgroundColor: playlist.bg,
                border: `3px solid ${playlist.border}`,
                minHeight: 120,
              }}
              aria-label={`Play ${playlist.label} music`}
            >
              <span style={{ fontSize: 40 }}>{playlist.emoji}</span>
              <span
                className="text-lg font-bold"
                style={{ color: playlist.textColor, fontFamily: 'var(--font-fraunces)' }}
              >
                {playlist.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Playlist view with player
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mood header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ backgroundColor: activeMood.bg, borderBottom: `2px solid ${activeMood.border}` }}
      >
        <button
          onClick={() => handleMoodSelect(null as any)}
          className="flex items-center gap-1 rounded-xl px-3 py-2 active:scale-95"
          style={{ backgroundColor: activeMood.border, minHeight: 44 }}
          aria-label="Back to mood selector"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeMood.textColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span style={{ fontSize: 32 }}>{activeMood.emoji}</span>
        <span className="text-xl font-bold" style={{ color: activeMood.textColor, fontFamily: 'var(--font-fraunces)' }}>
          {activeMood.label}
        </span>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {activeMood.tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => handleTrackSelect(track)}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all active:scale-98 text-left"
            style={{
              backgroundColor: currentTrack?.id === track.id ? activeMood.border : activeMood.bg,
              border: `2px solid ${activeMood.border}`,
              minHeight: 64,
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: activeMood.border }}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill={activeMood.textColor}>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill={activeMood.textColor}>
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate" style={{ color: activeMood.textColor, fontFamily: 'var(--font-fraunces)' }}>
                {track.title}
              </div>
              <div className="text-sm truncate" style={{ color: activeMood.textColor, opacity: 0.7 }}>
                {track.artist}
              </div>
            </div>
            <span className="text-sm shrink-0" style={{ color: activeMood.textColor, opacity: 0.6 }}>
              {track.durationLabel}
            </span>
          </button>
        ))}
      </div>

      {/* Mini player - shows when a track is selected */}
      {currentTrack && (
        <div
          className="shrink-0 px-4 py-3 flex flex-col gap-2"
          style={{ backgroundColor: activeMood.bg, borderTop: `2px solid ${activeMood.border}` }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0"
              style={{ backgroundColor: activeMood.border }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill={activeMood.textColor}>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill={activeMood.textColor}>
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate" style={{ color: activeMood.textColor, fontFamily: 'var(--font-fraunces)' }}>
                {currentTrack.title}
              </div>
              <div className="text-sm" style={{ color: activeMood.textColor, opacity: 0.7 }}>
                {currentTrack.artist}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div
            className="w-full h-3 rounded-full cursor-pointer overflow-hidden"
            style={{ backgroundColor: `${activeMood.border}60` }}
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: activeMood.border }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
