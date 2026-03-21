'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';

/**
 * Toolshed Page - Visual App Launcher
 *
 * 2-column grid of all 8gent Jr tools with emoji icons,
 * gradient backgrounds, and star/progress tracking.
 */

const TOOLS = [
  { id: 'talk', emoji: '💬', label: 'Talk', href: '/app', gradient: 'from-blue-400 to-blue-600', stars: 3 },
  { id: 'core', emoji: '🗣️', label: 'Core Words', href: '/core', gradient: 'from-green-400 to-emerald-600', stars: 2 },
  { id: 'vsd', emoji: '🖼️', label: 'Visual Scenes', href: '/vsd', gradient: 'from-purple-400 to-violet-600', stars: 1 },
  { id: 'schooltube', emoji: '📺', label: 'SchoolTube', href: '/schooltube', gradient: 'from-red-400 to-rose-600', stars: 0 },
  { id: 'analytics', emoji: '📊', label: 'Analytics', href: '/analytics', gradient: 'from-amber-400 to-orange-600', stars: 0 },
  { id: 'settings', emoji: '⚙️', label: 'Settings', href: '/settings', gradient: 'from-gray-400 to-slate-600', stars: 0 },
] as const;

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
            <span className="text-lg">⭐</span>
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
              <span className="text-5xl">{tool.emoji}</span>
              <span className="text-[15px] font-bold text-white drop-shadow-sm text-center">
                {tool.label}
              </span>
              {tool.stars > 0 && (
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <span className="text-xs">⭐</span>
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
