'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import type { ReactNode } from 'react';

/**
 * Toolshed Page - Visual App Launcher
 *
 * 2-column grid of all 8gent Jr tools with SVG icons,
 * gradient backgrounds, and star/progress tracking.
 */

// -- Inline SVG icons (24x24, stroke-based) --

function IconStar({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <polygon points="10 8 16 12 10 16" fill="white" stroke="none" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

interface ToolDef {
  id: string;
  icon: () => ReactNode;
  label: string;
  href: string;
  gradient: string;
  stars: number;
}

const TOOLS: ToolDef[] = [
  { id: 'talk', icon: IconChat, label: 'Talk', href: '/app', gradient: 'from-blue-400 to-blue-600', stars: 3 },
  { id: 'core', icon: IconMic, label: 'Core Words', href: '/core', gradient: 'from-green-400 to-emerald-600', stars: 2 },
  { id: 'vsd', icon: IconImage, label: 'Visual Scenes', href: '/vsd', gradient: 'from-amber-400 to-orange-600', stars: 1 },
  { id: 'schooltube', icon: IconPlay, label: 'SchoolTube', href: '/schooltube', gradient: 'from-red-400 to-rose-600', stars: 0 },
  { id: 'analytics', icon: IconChart, label: 'Analytics', href: '/analytics', gradient: 'from-amber-400 to-orange-600', stars: 0 },
  { id: 'settings', icon: IconGear, label: 'Settings', href: '/settings', gradient: 'from-stone-400 to-stone-600', stars: 0 },
];

export default function ToolshedPage() {
  const { settings, isLoaded } = useApp();
  const primaryColor = settings.primaryColor || '#4CAF50';

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
          <span className="text-[18px] font-semibold text-white">
            {settings.childName ? `${settings.childName}'s Toolshed` : 'Toolshed'}
          </span>
          <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
            <IconStar className="text-yellow-200" />
            <span className="text-[15px] font-bold text-white">
              {TOOLS.reduce((sum, t) => sum + t.stars, 0)}
            </span>
          </div>
        </div>
      </header>

      {/* Tool Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className={`
                bg-gradient-to-br ${tool.gradient}
                rounded-2xl p-4 min-h-[120px]
                flex flex-col items-center justify-center gap-2
                shadow-lg active:scale-95 transition-transform
              `}
            >
              <tool.icon />
              <span className="text-[15px] font-bold text-white drop-shadow-sm text-center">
                {tool.label}
              </span>
              {tool.stars > 0 && (
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <IconStar className="text-yellow-200" />
                  <span className="text-xs font-bold text-white">{tool.stars}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
