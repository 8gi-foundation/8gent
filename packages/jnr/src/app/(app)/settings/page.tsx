'use client';

import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useApp } from '@/context/AppContext';
import { Dock } from '@/components/dock/Dock';
import { EcosystemFooter } from '@/components/ui/EcosystemFooter';
import { ELEVENLABS_VOICES } from '@/lib/voice/types';

/**
 * Settings Page - iOS Style with Dock
 */

const GRID_OPTIONS = [2, 3, 4, 5];

const GLP_STAGES = [
  { stage: 1, label: 'Stage 1', desc: 'Sounds and single words. Tap to play immediately.' },
  { stage: 2, label: 'Stage 2', desc: 'Simple single words.' },
  { stage: 3, label: 'Stage 3', desc: 'Short phrases.' },
  { stage: 4, label: 'Stage 4', desc: 'Sentences.' },
  { stage: 5, label: 'Stage 5', desc: 'Stories.' },
  { stage: 6, label: 'Stage 6', desc: 'Full grammar.' },
];

export default function SettingsPage() {
  const { signOut } = useClerk();
  const { settings, updateSettings, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--warm-bg-page, #F5F0EB)' }}>
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: settings.primaryColor, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const primaryColor = settings.primaryColor || '#4CAF50';
  const selectedVoice = ELEVENLABS_VOICES.find((v) => v.id === settings.selectedVoiceId);
  const currentStage = settings.glpStage ?? 3;
  const currentStageInfo = GLP_STAGES.find((s) => s.stage === currentStage);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--warm-bg-page, #F5F0EB)' }}>
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
              <span className="text-2xl">&lsaquo;</span>
              <span className="ml-1">Back</span>
            </span>
          </Link>
          <h1 className="text-[18px] font-semibold text-white">Settings</h1>
          <div className="w-[44px]" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Personalization */}
        <div className="px-4 pt-6">
          <p className="text-[13px] uppercase tracking-wide px-4 mb-2" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
            Personalization
          </p>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)' }}>
            {/* Name */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--warm-border-light, #F0EAE3)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Name</span>
                <input
                  type="text"
                  value={settings.childName}
                  onChange={(e) => updateSettings({ childName: e.target.value })}
                  placeholder="Enter name"
                  className="text-[17px] text-right bg-transparent focus:outline-none"
                  style={{ color: 'var(--warm-text-secondary, #5C544A)' }}
                />
              </div>
            </div>
            {/* Restart onboarding */}
            <Link
              href="/onboarding?restart=1"
              onClick={() => updateSettings({ hasCompletedOnboarding: false })}
              className="flex items-center justify-between px-4 py-3 active:opacity-80"
            >
              <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Restart Setup</span>
              <span style={{ color: 'var(--warm-text-placeholder, #B5ADA4)' }}>&rsaquo;</span>
            </Link>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="px-4 pt-6">
          <p className="text-[13px] uppercase tracking-wide px-4 mb-2" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
            Voice
          </p>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)' }}>
            {/* Selected Voice */}
            <Link
              href="/voice"
              className="flex items-center justify-between px-4 py-3 border-b active:opacity-80"
              style={{ borderColor: 'var(--warm-border-light, #F0EAE3)' }}
            >
              <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Voice</span>
              <div className="flex items-center gap-2">
                <span className="text-[17px]" style={{ color: 'var(--warm-text-secondary, #5C544A)' }}>
                  {selectedVoice?.name || 'System Default'}
                </span>
                <span style={{ color: 'var(--warm-text-placeholder, #B5ADA4)' }}>&rsaquo;</span>
              </div>
            </Link>

            {/* Speech Rate */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--warm-border-light, #F0EAE3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Speech Rate</span>
                <span className="text-[15px]" style={{ color: 'var(--warm-text-secondary, #5C544A)' }}>{settings.ttsRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.ttsRate}
                onChange={(e) => updateSettings({ ttsRate: parseFloat(e.target.value) })}
                className="w-full h-1 rounded-full appearance-none
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border"
                style={{ accentColor: primaryColor, backgroundColor: 'var(--warm-border, #E8E0D6)' }}
              />
            </div>

            {/* Volume */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Volume</span>
                <span className="text-[15px]" style={{ color: 'var(--warm-text-secondary, #5C544A)' }}>{Math.round(settings.ttsVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.ttsVolume}
                onChange={(e) => updateSettings({ ttsVolume: parseFloat(e.target.value) })}
                className="w-full h-1 rounded-full appearance-none
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border"
                style={{ accentColor: primaryColor, backgroundColor: 'var(--warm-border, #E8E0D6)' }}
              />
            </div>
          </div>
        </div>

        {/* Communication Board */}
        <div className="px-4 pt-6">
          <p className="text-[13px] uppercase tracking-wide px-4 mb-2" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
            Communication Board
          </p>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)' }}>
            {/* GLP Stage Selector */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--warm-border-light, #F0EAE3)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>GLP Stage</span>
                <span className="text-[15px]" style={{ color: 'var(--warm-text-secondary, #5C544A)' }}>
                  {currentStageInfo?.label ?? 'Stage 3'}
                </span>
              </div>
              <p className="text-[13px] mb-3" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
                {currentStageInfo?.desc ?? ''}
              </p>
              <div className="flex gap-1.5">
                {GLP_STAGES.map(({ stage, label }) => (
                  <button
                    key={stage}
                    onClick={() => updateSettings({ glpStage: stage })}
                    className="flex-1 py-2 rounded-xl font-medium text-[13px] transition-colors"
                    style={{
                      backgroundColor: currentStage === stage ? primaryColor : 'var(--warm-bg-page, #F5F0EB)',
                      color: currentStage === stage ? 'white' : 'var(--warm-text-secondary, #5C544A)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Columns */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Grid Size</span>
                <span className="text-[15px]" style={{ color: 'var(--warm-text-secondary, #5C544A)' }}>{settings.gridColumns} columns</span>
              </div>
              <div className="flex gap-2">
                {GRID_OPTIONS.map((cols) => (
                  <button
                    key={cols}
                    onClick={() => updateSettings({ gridColumns: cols })}
                    className="flex-1 py-2.5 rounded-xl font-medium text-[15px] transition-colors"
                    style={{
                      backgroundColor: settings.gridColumns === cols ? primaryColor : 'var(--warm-bg-page, #F5F0EB)',
                      color: settings.gridColumns === cols ? 'white' : 'var(--warm-text-secondary, #5C544A)',
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
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)' }}>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="w-full px-4 py-3 text-[17px] text-red-500 font-medium text-center active:opacity-80"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="px-4 pt-6">
          <p className="text-[13px] uppercase tracking-wide px-4 mb-2" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
            Privacy
          </p>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)' }}>
            <Link
              href="/privacy"
              className="flex items-center justify-between px-4 py-3 border-b active:opacity-80"
              style={{ borderColor: 'var(--warm-border-light, #F0EAE3)' }}
            >
              <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Privacy Policy</span>
              <span style={{ color: 'var(--warm-text-placeholder, #B5ADA4)' }}>&rsaquo;</span>
            </Link>
            <Link
              href="/privacy/kids"
              className="flex items-center justify-between px-4 py-3 active:opacity-80"
            >
              <span className="text-[17px]" style={{ color: 'var(--warm-text, #1A1614)' }}>Children&apos;s Privacy Policy</span>
              <span style={{ color: 'var(--warm-text-placeholder, #B5ADA4)' }}>&rsaquo;</span>
            </Link>
          </div>
        </div>

        {/* About */}
        <div className="px-4 pt-6 pb-4">
          <p className="text-[13px] uppercase tracking-wide px-4 mb-2" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
            About
          </p>
          <div className="rounded-xl overflow-hidden px-4 py-3" style={{ backgroundColor: 'var(--warm-bg-card, #FDFCFA)' }}>
            <p className="text-[15px] mb-2" style={{ color: 'var(--warm-text-secondary, #5C544A)' }}>
              <strong style={{ color: 'var(--warm-text, #1A1614)' }}>8gent Jr</strong> - No more gatekeeping. A voice for every kid.
            </p>
            <p className="text-[13px]" style={{ color: 'var(--warm-text-muted, #9A9088)' }}>
              Version 1.0.0 &middot; Symbols &copy; ARASAAC
            </p>
          </div>
        </div>

        {/* Ecosystem Footer */}
        <div className="px-4 pb-8">
          <EcosystemFooter />
        </div>
      </div>

      {/* Dock */}
      <Dock primaryColor={primaryColor} />
    </div>
  );
}
