'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { DrumPads } from '@/components/instruments/DrumPads';
import { XylophoneKeys } from '@/components/instruments/XylophoneKeys';
import { MoodPlayer } from '@/components/music/MoodPlayer';

/**
 * 8gent Jr Music - Instruments + Emotional Regulation Playlists
 *
 * Three tabs: Drums (4x4 pad grid), Keys (xylophone bars), Feel (mood playlists).
 * All Web Audio / HTML5 Audio. No API keys or external players.
 */

type MusicTab = 'drums' | 'xylophone' | 'feel';

const TABS: { id: MusicTab; label: string; svgPath: string }[] = [
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
  {
    id: 'feel',
    label: 'Feel',
    svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  },
];

export default function MusicPage() {
  const router = useRouter();
  const { settings } = useApp();
  const [activeTab, setActiveTab] = useState<MusicTab>('drums');

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFDF9' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: '#E8610A' }}>
        <button
          onClick={() => router.push('/app')}
          className="flex items-center gap-1 text-white"
          style={{ minWidth: 80, minHeight: 44 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-fraunces)' }}>Back</span>
        </button>
        <span className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-fraunces)' }}>
          Music
        </span>
        <div style={{ width: 80 }} />
      </header>

      {/* Tab Selector */}
      <div className="flex gap-2 px-4 py-3 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-lg font-semibold transition-all"
            style={{
              fontFamily: 'var(--font-fraunces)',
              backgroundColor: activeTab === tab.id ? '#E8610A' : '#F5F0EB',
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
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'drums' && <DrumPads className="h-full" />}
        {activeTab === 'xylophone' && <XylophoneKeys className="h-full" />}
        {activeTab === 'feel' && <MoodPlayer />}
      </div>
    </div>
  );
}
