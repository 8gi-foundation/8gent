'use client';

import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { ELEVENLABS_VOICES } from '@/lib/voice/types';

/**
 * Settings Page - iOS Style with Dock
 */

const GRID_OPTIONS = [2, 3, 4, 5];

export default function SettingsPage() {
  const { signOut } = useClerk();
  const { settings, updateSettings, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: settings.primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const primaryColor = settings.primaryColor || '#4CAF50';
  const selectedVoice = ELEVENLABS_VOICES.find((v) => v.id === settings.selectedVoiceId);

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
              <span className="text-2xl">‹</span>
              <span className="ml-1">Back</span>
            </span>
          </Link>
          <h1 className="text-[18px] font-semibold text-white">Settings</h1>
          <div className="w-[44px]" /> {/* Spacer for centering */}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Personalization */}
        <div className="px-4 pt-6">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Personalization
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Name */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[17px] text-black">Name</span>
                <input
                  type="text"
                  value={settings.childName}
                  onChange={(e) => updateSettings({ childName: e.target.value })}
                  placeholder="Enter name"
                  className="text-[17px] text-right text-gray-500 bg-transparent focus:outline-none"
                />
              </div>
            </div>
            {/* Restart onboarding */}
            <Link
              href="/onboarding?restart=1"
              onClick={() => updateSettings({ hasCompletedOnboarding: false })}
              className="flex items-center justify-between px-4 py-3 active:bg-gray-50"
            >
              <span className="text-[17px] text-black">Restart Setup</span>
              <span className="text-gray-300">›</span>
            </Link>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="px-4 pt-6">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Voice
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Selected Voice */}
            <Link
              href="/voice"
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100 active:bg-gray-50"
            >
              <span className="text-[17px] text-black">Voice</span>
              <div className="flex items-center gap-2">
                <span className="text-[17px] text-gray-500">
                  {selectedVoice?.name || 'System Default'}
                </span>
                <span className="text-gray-300">›</span>
              </div>
            </Link>

            {/* Speech Rate */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[17px] text-black">Speech Rate</span>
                <span className="text-[15px] text-gray-500">{settings.ttsRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.ttsRate}
                onChange={(e) => updateSettings({ ttsRate: parseFloat(e.target.value) })}
                className="w-full h-1 bg-gray-200 rounded-full appearance-none
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border
                         [&::-webkit-slider-thumb]:border-gray-200"
                style={{ accentColor: primaryColor }}
              />
            </div>

            {/* Volume */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[17px] text-black">Volume</span>
                <span className="text-[15px] text-gray-500">{Math.round(settings.ttsVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.ttsVolume}
                onChange={(e) => updateSettings({ ttsVolume: parseFloat(e.target.value) })}
                className="w-full h-1 bg-gray-200 rounded-full appearance-none
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border
                         [&::-webkit-slider-thumb]:border-gray-200"
                style={{ accentColor: primaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Communication Board */}
        <div className="px-4 pt-6">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Communication Board
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Grid Columns */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[17px] text-black">Grid Size</span>
                <span className="text-[15px] text-gray-500">{settings.gridColumns} columns</span>
              </div>
              <div className="flex gap-2">
                {GRID_OPTIONS.map((cols) => (
                  <button
                    key={cols}
                    onClick={() => updateSettings({ gridColumns: cols })}
                    className="flex-1 py-2.5 rounded-xl font-medium text-[15px] transition-colors"
                    style={{
                      backgroundColor: settings.gridColumns === cols ? primaryColor : '#f2f2f7',
                      color: settings.gridColumns === cols ? 'white' : '#374151',
                    }}
                  >
                    {cols}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="px-4 pt-6">
          <div className="bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full px-4 py-3 text-[17px] text-red-500 font-medium text-center active:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="px-4 pt-6">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            Privacy
          </p>
          <div className="bg-white rounded-xl overflow-hidden">
            <Link
              href="/jr/privacy"
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100 active:bg-gray-50"
            >
              <span className="text-[17px] text-black">Privacy Policy</span>
              <span className="text-gray-300">&rsaquo;</span>
            </Link>
            <Link
              href="/jr/privacy/kids"
              className="flex items-center justify-between px-4 py-3 active:bg-gray-50"
            >
              <span className="text-[17px] text-black">Children&apos;s Privacy Policy</span>
              <span className="text-gray-300">&rsaquo;</span>
            </Link>
          </div>
        </div>

        {/* About */}
        <div className="px-4 pt-6 pb-8">
          <p className="text-[13px] text-gray-500 uppercase tracking-wide px-4 mb-2">
            About
          </p>
          <div className="bg-white rounded-xl overflow-hidden px-4 py-3">
            <p className="text-gray-600 text-[15px] mb-2">
              <strong>8gent Jr</strong> - No more gatekeeping. A voice for every kid.
            </p>
            <p className="text-gray-400 text-[13px]">
              Version 1.0.0 · Symbols © ARASAAC
            </p>
          </div>
        </div>
      </div>

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
