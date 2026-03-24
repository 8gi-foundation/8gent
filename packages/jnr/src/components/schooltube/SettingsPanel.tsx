'use client';

import { useState } from 'react';
import { PinDialog } from './PinDialog';

type SettingsPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const [showPin, setShowPin] = useState(false);
  const [calmMode, setCalmMode] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={() => onOpenChange(false)}
        role="dialog"
        aria-modal="true"
        aria-label="SchoolTube Settings"
      >
        <div
          className="bg-[#FFFDF9] rounded-3xl shadow-xl max-w-md w-[90%] p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <h2
              className="text-2xl font-bold text-[#3D2E1F]"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Settings
            </h2>
          </div>

          <div className="space-y-5">
            {/* Calm Mode toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-[#3D2E1F]" style={{ fontFamily: 'var(--font-inter)' }}>
                    Calm Mode
                  </p>
                  <p className="text-xs text-[#6B5B4F]">Softer colors and slower animations</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={calmMode}
                onClick={() => setCalmMode(!calmMode)}
                className={`w-12 h-7 rounded-full transition-colors relative
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]
                           ${calmMode ? 'bg-[#E8610A]' : 'bg-[#E8E0D6]'}`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform
                             ${calmMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            {/* Sound Effects toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-[#3D2E1F]" style={{ fontFamily: 'var(--font-inter)' }}>
                    Sound Effects
                  </p>
                  <p className="text-xs text-[#6B5B4F]">Play sounds during activities</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={soundEffects}
                onClick={() => setSoundEffects(!soundEffects)}
                className={`w-12 h-7 rounded-full transition-colors relative
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]
                           ${soundEffects ? 'bg-[#E8610A]' : 'bg-[#E8E0D6]'}`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform
                             ${soundEffects ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            {/* Parent Controls button */}
            <button
              onClick={() => setShowPin(true)}
              className="w-full p-4 rounded-2xl border-2 border-[#E8E0D6] bg-[#FFF8F0]
                         flex items-center gap-3 text-left
                         hover:border-[#E8610A] transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-[#3D2E1F]" style={{ fontFamily: 'var(--font-inter)' }}>
                  Parent Controls
                </p>
                <p className="text-xs text-[#6B5B4F]">Manage content and time limits</p>
              </div>
            </button>

            {/* Version info */}
            <div className="pt-4 border-t border-[#E8E0D6]">
              <div className="flex items-center gap-2 text-[#6B5B4F]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span className="text-xs" style={{ fontFamily: 'var(--font-inter)' }}>
                  SchoolTube v1.0 - 8gent Jr
                </span>
              </div>
              <p className="text-[10px] text-[#6B5B4F] mt-1">
                Educational games and videos designed for children with autism and intellectual disabilities.
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="w-full mt-5 py-3 rounded-2xl bg-[#E8E0D6] text-[#3D2E1F]
                       font-semibold text-sm hover:bg-[#D4C4B0] transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Close
          </button>
        </div>
      </div>

      <PinDialog open={showPin} onOpenChange={setShowPin} />
    </>
  );
}
