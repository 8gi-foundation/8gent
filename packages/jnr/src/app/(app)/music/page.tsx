'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';

// =============================================================================
// Types
// =============================================================================

type MusicTab = 'player' | 'drums' | 'xylophone' | 'create';
type CreateStep = 'words' | 'mood' | 'speed' | 'go';

// =============================================================================
// Constants
// =============================================================================

const ARASAAC_URL = (id: number) =>
  `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;

const TABS: { id: MusicTab; label: string; emoji: string }[] = [
  { id: 'player', label: 'Player', emoji: '🎵' },
  { id: 'drums', label: 'Drums', emoji: '🥁' },
  { id: 'xylophone', label: 'Keys', emoji: '🎹' },
  { id: 'create', label: 'Create', emoji: '✨' },
];

const MOOD_OPTIONS = [
  {
    id: 'happy',
    label: 'Happy',
    arasaacId: 35533,
    bg: '#FFF3C4',
    border: '#FFD700',
    style: "children's pop, happy, playful, upbeat, bright, simple melody, acoustic guitar, clapping",
  },
  {
    id: 'calm',
    label: 'Calm',
    arasaacId: 31310,
    bg: '#D6EAF8',
    border: '#87CEEB',
    style: 'lullaby, calm, gentle, soothing, soft piano, warm strings, whispered',
  },
  {
    id: 'dance',
    label: 'Dance!',
    arasaacId: 32364,
    bg: '#FADBD8',
    border: '#FF69B4',
    style: 'kids dance party, synth pop, energetic, fun, bouncy bass, electronic beat',
  },
  {
    id: 'silly',
    label: 'Silly',
    arasaacId: 13354,
    bg: '#D5F5E3',
    border: '#98FB98',
    style: 'silly, funny, goofy, cartoon music, kazoo, wobble bass, sound effects',
  },
  {
    id: 'adventure',
    label: 'Epic!',
    arasaacId: 7186,
    bg: '#E8DAEF',
    border: '#AF7AC5',
    style: "cinematic children's, epic, heroic, orchestral, building drums, adventure theme, choir",
  },
  {
    id: 'funky',
    label: 'Groovy',
    arasaacId: 6557,
    bg: '#FAE5D3',
    border: '#F5B041',
    style: 'kids funk, groovy, tight pocket, bass-led, clean guitar, fun beat, head-nodding',
  },
];

const DEMO_TRACKS = [
  { id: '1', title: 'Happy Song', artist: 'Kids Music', emoji: '😊', duration: '2:30' },
  { id: '2', title: 'Dance Time', artist: 'Kids Music', emoji: '💃', duration: '3:15' },
  { id: '3', title: 'Calm Waves', artist: 'Relaxing', emoji: '🌊', duration: '4:00' },
  { id: '4', title: 'Animal Friends', artist: 'Kids Music', emoji: '🐶', duration: '2:45' },
  { id: '5', title: 'Rainbow Colors', artist: 'Learning', emoji: '🌈', duration: '3:00' },
];

const DRUM_PADS = [
  { id: 'kick', label: 'Boom', emoji: '💥', freq: 80, color: '#FF6B6B' },
  { id: 'snare', label: 'Snap', emoji: '👏', freq: 200, color: '#4ECDC4' },
  { id: 'hihat', label: 'Tss', emoji: '✨', freq: 800, color: '#FFE66D' },
  { id: 'tom1', label: 'Bop', emoji: '🔵', freq: 120, color: '#A8E6CF' },
  { id: 'tom2', label: 'Tap', emoji: '🟣', freq: 160, color: '#DDA0DD' },
  { id: 'crash', label: 'Crash', emoji: '💫', freq: 600, color: '#FFB347' },
  { id: 'cowbell', label: 'Ding', emoji: '🔔', freq: 540, color: '#F0E68C' },
  { id: 'shaker', label: 'Shh', emoji: '🌀', freq: 1200, color: '#87CEEB' },
  { id: 'clap', label: 'Clap', emoji: '🙌', freq: 300, color: '#FF85A2' },
  { id: 'bass', label: 'Wub', emoji: '🫀', freq: 50, color: '#7B68EE' },
  { id: 'rim', label: 'Tick', emoji: '🪵', freq: 400, color: '#D2B48C' },
  { id: 'splash', label: 'Psh', emoji: '💦', freq: 900, color: '#00CED1' },
];

const XYLOPHONE_KEYS = [
  { note: 'C', freq: 261.63, color: '#FF6B6B' },
  { note: 'D', freq: 293.66, color: '#FF8E53' },
  { note: 'E', freq: 329.63, color: '#FFD93D' },
  { note: 'F', freq: 349.23, color: '#6BCB77' },
  { note: 'G', freq: 392.0, color: '#4D96FF' },
  { note: 'A', freq: 440.0, color: '#9B72AA' },
  { note: 'B', freq: 493.88, color: '#FF6B9D' },
  { note: 'C2', freq: 523.25, color: '#FF6B6B' },
];

const DEFAULT_WORDS = [
  'happy', 'play', 'love', 'dance', 'jump',
  'friend', 'sun', 'moon', 'star', 'rainbow',
];

const RECENT_SENTENCES_KEY = 'nickos-recent-sentences';

// BPM to style descriptor
function bpmToDescriptor(bpm: number): string {
  if (bpm <= 100) return 'very slow tempo, gentle';
  if (bpm <= 120) return 'medium tempo';
  if (bpm <= 140) return 'upbeat tempo, energetic';
  return 'very fast tempo, high energy';
}

// =============================================================================
// Web Audio helpers
// =============================================================================

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number = 0.3, type: OscillatorType = 'sine') {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playDrum(frequency: number) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.8, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

// =============================================================================
// Main Component
// =============================================================================

export default function MusicPage() {
  const { settings } = useApp();
  const primaryColor = settings.primaryColor || '#4CAF50';

  // Tab state
  const [activeTab, setActiveTab] = useState<MusicTab>('player');

  // Player state
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create tab state
  const [createStep, setCreateStep] = useState<CreateStep>('words');
  const [selectedWords, setSelectedWords] = useState<Map<string, boolean>>(
    () => new Map(DEFAULT_WORDS.map((w) => [w, true]))
  );
  const [selectedMood, setSelectedMood] = useState<string>('happy');
  const [bpmValue, setBpmValue] = useState(120);
  const [extraWords, setExtraWords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [generatedTrack, setGeneratedTrack] = useState<{
    title: string;
    lyrics: string;
  } | null>(null);

  // Swipe handling for create slides
  const touchStartX = useRef(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  // Load recent sentences from localStorage
  const [recentSentences, setRecentSentences] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(RECENT_SENTENCES_KEY);
      if (stored) {
        try {
          setRecentSentences(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Player handlers
  const handlePlay = (trackId: string) => {
    if (currentTrack === trackId && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
    }
  };

  const current = DEMO_TRACKS.find((t) => t.id === currentTrack);

  // Create tab handlers
  const toggleWord = useCallback((word: string) => {
    setSelectedWords((prev) => {
      const next = new Map(prev);
      if (next.has(word)) {
        next.set(word, !next.get(word));
      } else {
        next.set(word, true);
      }
      return next;
    });
  }, []);

  const activeWords = useMemo(
    () => Array.from(selectedWords.entries()).filter(([, v]) => v).map(([k]) => k),
    [selectedWords]
  );

  const selectedMoodOption = MOOD_OPTIONS.find((m) => m.id === selectedMood);

  const CREATE_STEPS: CreateStep[] = ['words', 'mood', 'speed', 'go'];
  const currentStepIndex = CREATE_STEPS.indexOf(createStep);

  const goNextStep = useCallback(() => {
    const idx = CREATE_STEPS.indexOf(createStep);
    if (idx < CREATE_STEPS.length - 1) {
      setCreateStep(CREATE_STEPS[idx + 1]);
    }
  }, [createStep]);

  const goPrevStep = useCallback(() => {
    const idx = CREATE_STEPS.indexOf(createStep);
    if (idx > 0) {
      setCreateStep(CREATE_STEPS[idx - 1]);
    }
  }, [createStep]);

  // Swipe gestures for create slides
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNextStep();
      else goPrevStep();
    }
  };

  // Make song handler
  const handleMakeSong = useCallback(async () => {
    setIsGenerating(true);
    setGenerateProgress(0);

    const mood = MOOD_OPTIONS.find((m) => m.id === selectedMood);
    const allWords = [...activeWords];
    if (extraWords.trim()) {
      allWords.push(...extraWords.split(/[,\s]+/).filter(Boolean));
    }

    // Progress simulation
    const interval = setInterval(() => {
      setGenerateProgress((p) => {
        if (p >= 90) return p;
        return p + Math.random() * 15;
      });
    }, 800);

    try {
      const res = await fetch('/api/nick/generate-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentences: allWords,
          childName: settings.childName || undefined,
          style: mood?.style,
          tempo: bpmToDescriptor(bpmValue),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGenerateProgress(100);
        setGeneratedTrack({
          title: data.title || `${settings.childName || 'My'}'s Song`,
          lyrics: data.lyrics || allWords.join(', '),
        });
        // Switch to player tab after a short delay
        setTimeout(() => {
          setActiveTab('player');
          setIsGenerating(false);
          setGenerateProgress(0);
          setCreateStep('words');
        }, 2000);
      } else {
        // Fallback: pretend we generated something
        setGenerateProgress(100);
        setGeneratedTrack({
          title: `${settings.childName || 'My'}'s ${mood?.label || 'Fun'} Song`,
          lyrics: `A ${mood?.label?.toLowerCase() || 'fun'} song about ${allWords.slice(0, 5).join(', ')}!`,
        });
        setTimeout(() => {
          setActiveTab('player');
          setIsGenerating(false);
          setGenerateProgress(0);
          setCreateStep('words');
        }, 2000);
      }
    } catch {
      setGenerateProgress(100);
      setGeneratedTrack({
        title: `${settings.childName || 'My'}'s Song`,
        lyrics: `A song about ${allWords.slice(0, 5).join(', ')}!`,
      });
      setTimeout(() => {
        setActiveTab('player');
        setIsGenerating(false);
        setGenerateProgress(0);
        setCreateStep('words');
      }, 2000);
    } finally {
      clearInterval(interval);
    }
  }, [activeWords, bpmValue, extraWords, selectedMood, settings.childName]);

  // Reset create tab when entering
  useEffect(() => {
    if (activeTab === 'create') {
      setCreateStep('words');
      setGeneratedTrack(null);
      setIsGenerating(false);
      setGenerateProgress(0);
    }
  }, [activeTab]);

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="h-screen flex flex-col bg-[#f2f2f7] overflow-hidden">
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl safe-top"
        style={{ backgroundColor: `${primaryColor}F2` }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[18px] font-semibold text-white">
            {settings.childName ? `${settings.childName}'s Music` : 'Music'}
          </span>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="flex bg-white border-b border-gray-200 px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center py-2 min-h-[52px] transition-all"
            style={{
              borderBottom:
                activeTab === tab.id ? `3px solid ${primaryColor}` : '3px solid transparent',
            }}
          >
            <span className="text-xl">{tab.emoji}</span>
            <span
              className="text-[11px] font-medium mt-0.5"
              style={{ color: activeTab === tab.id ? primaryColor : '#8E8E93' }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* ============================================================= */}
        {/* PLAYER TAB */}
        {/* ============================================================= */}
        {activeTab === 'player' && (
          <div className="h-full flex flex-col overflow-y-auto pb-24">
            {/* Now Playing */}
            {current && (
              <div className="px-4 py-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                      isPlaying ? 'animate-bounce' : ''
                    }`}
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    {current.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-black">{current.title}</p>
                    <p className="text-gray-500 text-sm">{current.artist}</p>
                  </div>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                </div>
              </div>
            )}

            {/* Track List */}
            <div className="px-4 py-2">
              <p className="text-[13px] text-gray-500 uppercase tracking-wide mb-2">
                All Songs
              </p>
            </div>
            <div className="bg-white mx-4 rounded-2xl overflow-hidden">
              {DEMO_TRACKS.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => handlePlay(track.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 ${
                    index !== DEMO_TRACKS.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor:
                        currentTrack === track.id ? `${primaryColor}20` : '#f2f2f7',
                    }}
                  >
                    {track.emoji}
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-medium"
                      style={{
                        color: currentTrack === track.id ? primaryColor : 'black',
                      }}
                    >
                      {track.title}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {track.artist} · {track.duration}
                    </p>
                  </div>
                  {currentTrack === track.id && isPlaying && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full animate-pulse"
                          style={{
                            backgroundColor: primaryColor,
                            height: `${12 + i * 4}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Prompt to create */}
            <div className="px-4 py-6">
              <button
                onClick={() => setActiveTab('create')}
                className="w-full py-5 rounded-3xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, #9333EA)`,
                  minHeight: 64,
                }}
              >
                ✨ Make a New Song! ✨
              </button>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* DRUMS TAB */}
        {/* ============================================================= */}
        {activeTab === 'drums' && (
          <div className="h-full flex flex-col items-center px-4 pb-24 pt-4 overflow-y-auto">
            <p className="text-[17px] font-bold text-gray-700 mb-4">
              Tap to play!
            </p>
            <div className="grid grid-cols-3 gap-3 w-full max-w-[360px]">
              {DRUM_PADS.map((pad) => (
                <button
                  key={pad.id}
                  onPointerDown={() => playDrum(pad.freq)}
                  className="aspect-square rounded-3xl flex flex-col items-center justify-center text-white font-bold shadow-lg active:scale-90 transition-transform select-none"
                  style={{ backgroundColor: pad.color, minHeight: 80 }}
                >
                  <span className="text-3xl mb-1">{pad.emoji}</span>
                  <span className="text-[14px]">{pad.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* XYLOPHONE / KEYS TAB */}
        {/* ============================================================= */}
        {activeTab === 'xylophone' && (
          <div className="h-full flex flex-col items-center justify-center px-4 pb-24">
            <p className="text-[15px] font-semibold text-gray-700 mb-6">
              Tap the keys!
            </p>
            <div className="flex gap-2 items-end w-full max-w-[360px] justify-center">
              {XYLOPHONE_KEYS.map((key, i) => {
                const height = 140 + (XYLOPHONE_KEYS.length - i) * 16;
                return (
                  <button
                    key={key.note}
                    onPointerDown={() => playTone(key.freq, 0.6, 'sine')}
                    className="rounded-xl flex items-end justify-center pb-3 font-bold text-white shadow-md active:scale-95 transition-transform select-none"
                    style={{
                      backgroundColor: key.color,
                      width: 40,
                      height,
                      minHeight: 80,
                    }}
                  >
                    <span className="text-[11px] opacity-80">{key.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* CREATE TAB - Full multi-slide experience */}
        {/* ============================================================= */}
        {activeTab === 'create' && (
          <div
            ref={slideContainerRef}
            className="h-full flex flex-col pb-24 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Generating overlay */}
            {isGenerating && (
              <div className="h-full flex flex-col items-center justify-center px-8">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-spin"
                  style={{
                    background: `conic-gradient(${primaryColor}, transparent)`,
                  }}
                >
                  <div className="w-20 h-20 rounded-full bg-[#f2f2f7] flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                  Making your song...
                </p>
                <div className="w-full max-w-[240px] h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(generateProgress, 100)}%`,
                      backgroundColor: primaryColor,
                    }}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {Math.round(generateProgress)}%
                </p>
                {generatedTrack && (
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold" style={{ color: primaryColor }}>
                      {generatedTrack.title}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {generatedTrack.lyrics}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 1: WORDS */}
            {!isGenerating && createStep === 'words' && (
              <div className="flex-1 flex flex-col px-4 py-6 overflow-y-auto">
                <div className="text-center mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ARASAAC_URL(6572)}
                    alt="Pick words"
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Pick your words!
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Tap to choose which words go in your song
                  </p>
                </div>

                {/* Word chips */}
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  {Array.from(selectedWords.entries()).map(([word, selected]) => (
                    <button
                      key={word}
                      onClick={() => toggleWord(word)}
                      className="flex items-center gap-2 px-5 py-3 rounded-full text-[16px] font-semibold transition-all active:scale-95 select-none"
                      style={{
                        minHeight: 52,
                        backgroundColor: selected ? `${primaryColor}20` : '#fff',
                        border: selected
                          ? `3px solid ${primaryColor}`
                          : '3px solid #E5E7EB',
                        color: selected ? primaryColor : '#6B7280',
                        opacity: selected ? 1 : 0.6,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ARASAAC_URL(6572)}
                        alt=""
                        className="w-6 h-6"
                        style={{ opacity: selected ? 1 : 0.4 }}
                      />
                      {word}
                    </button>
                  ))}
                </div>

                {/* Extra words input */}
                <div className="mx-auto w-full max-w-[300px]">
                  <input
                    type="text"
                    value={extraWords}
                    onChange={(e) => setExtraWords(e.target.value)}
                    placeholder="Type more words..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-[15px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300"
                    style={{ minHeight: 48 }}
                  />
                </div>
              </div>
            )}

            {/* SLIDE 2: MOOD */}
            {!isGenerating && createStep === 'mood' && (
              <div className="flex-1 flex flex-col px-4 py-6">
                <div className="text-center mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ARASAAC_URL(37190)}
                    alt="Mood"
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <h2 className="text-2xl font-bold text-gray-800">
                    How should it sound?
                  </h2>
                </div>

                {/* 2x2 mood grid */}
                <div className="grid grid-cols-2 gap-4 flex-1 max-h-[400px] mx-auto w-full max-w-[340px]">
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className="rounded-3xl flex flex-col items-center justify-center transition-all active:scale-95 select-none"
                        style={{
                          backgroundColor: isSelected ? mood.bg : '#fff',
                          border: isSelected
                            ? `4px solid ${mood.border}`
                            : '4px solid #E5E7EB',
                          minHeight: 140,
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: isSelected
                            ? `0 8px 24px ${mood.border}40`
                            : 'none',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ARASAAC_URL(mood.arasaacId)}
                          alt={mood.label}
                          className="w-20 h-20 mb-2"
                        />
                        <span className="text-lg font-bold text-gray-800">
                          {mood.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SLIDE 3: SPEED */}
            {!isGenerating && createStep === 'speed' && (
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    How fast?
                  </h2>
                </div>

                {/* Speed visual */}
                <div className="flex items-center gap-6 mb-8 w-full max-w-[320px]">
                  <span className="text-5xl">🐢</span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min={80}
                      max={160}
                      value={bpmValue}
                      onChange={(e) => setBpmValue(Number(e.target.value))}
                      className="w-full h-4 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #87CEEB ${
                          ((bpmValue - 80) / 80) * 100
                        }%, #E5E7EB ${((bpmValue - 80) / 80) * 100}%)`,
                        minHeight: 48,
                      }}
                    />
                  </div>
                  <span className="text-5xl">🐇</span>
                </div>

                {/* BPM indicator */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                  style={{
                    backgroundColor:
                      bpmValue <= 100
                        ? '#87CEEB'
                        : bpmValue <= 120
                          ? '#98FB98'
                          : bpmValue <= 140
                            ? '#FFD700'
                            : '#FF6B6B',
                    transition: 'background-color 0.3s',
                  }}
                >
                  <span className="text-2xl font-bold text-white">{bpmValue}</span>
                </div>

                <p className="text-gray-500 text-sm">{bpmToDescriptor(bpmValue)}</p>

                {/* Surprise me */}
                <button
                  onClick={() => {
                    setBpmValue(80 + Math.floor(Math.random() * 80));
                    goNextStep();
                  }}
                  className="mt-6 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-600 font-semibold text-[15px] active:scale-95 transition-transform"
                  style={{ minHeight: 48 }}
                >
                  🎲 Surprise me!
                </button>
              </div>
            )}

            {/* SLIDE 4: GO! */}
            {!isGenerating && createStep === 'go' && (
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Ready to make your song?
                  </h2>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 w-full max-w-[300px] mb-8">
                  {/* Mood */}
                  {selectedMoodOption && (
                    <div className="flex items-center gap-3 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ARASAAC_URL(selectedMoodOption.arasaacId)}
                        alt={selectedMoodOption.label}
                        className="w-14 h-14"
                      />
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          {selectedMoodOption.label}
                        </p>
                        <p className="text-gray-500 text-sm">mood</p>
                      </div>
                    </div>
                  )}

                  {/* Speed */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        backgroundColor:
                          bpmValue <= 100
                            ? '#87CEEB'
                            : bpmValue <= 120
                              ? '#98FB98'
                              : bpmValue <= 140
                                ? '#FFD700'
                                : '#FF6B6B',
                      }}
                    >
                      {bpmValue <= 100 ? '🐢' : bpmValue <= 140 ? '🐾' : '🐇'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{bpmValue} BPM</p>
                      <p className="text-gray-500 text-sm">speed</p>
                    </div>
                  </div>

                  {/* Words count */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      📝
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        {activeWords.length} words
                      </p>
                      <p className="text-gray-500 text-sm">
                        {activeWords.slice(0, 3).join(', ')}
                        {activeWords.length > 3 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Big Make My Song button */}
                <button
                  onClick={handleMakeSong}
                  className="w-full max-w-[300px] py-5 rounded-3xl text-white text-xl font-bold shadow-lg active:scale-95 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #9333EA)`,
                    minHeight: 64,
                  }}
                >
                  ✨ Make My Song! ✨
                </button>
              </div>
            )}

            {/* Navigation (not shown during generation) */}
            {!isGenerating && (
              <div className="px-4 pb-4">
                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mb-4">
                  {CREATE_STEPS.map((step, i) => (
                    <button
                      key={step}
                      onClick={() => setCreateStep(step)}
                      className="w-3 h-3 rounded-full transition-all"
                      style={{
                        backgroundColor:
                          i === currentStepIndex ? primaryColor : '#D1D5DB',
                        transform: i === currentStepIndex ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>

                {/* Arrow buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={goPrevStep}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-1 px-5 py-3 rounded-2xl font-semibold text-[15px] transition-all active:scale-95 disabled:opacity-30"
                    style={{
                      backgroundColor: '#fff',
                      border: '2px solid #E5E7EB',
                      color: '#6B7280',
                      minHeight: 48,
                    }}
                  >
                    ← Back
                  </button>

                  {currentStepIndex < CREATE_STEPS.length - 1 && (
                    <button
                      onClick={goNextStep}
                      className="flex items-center gap-1 px-5 py-3 rounded-2xl font-semibold text-[15px] text-white transition-all active:scale-95"
                      style={{
                        backgroundColor: primaryColor,
                        minHeight: 48,
                      }}
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
