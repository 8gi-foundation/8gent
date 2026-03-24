'use client';

import { useState, useEffect, useCallback } from 'react';

type PinDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const CORRECT_PIN = '1234'; // In production: stored securely per-tenant

export function PinDialog({ open, onOpenChange, onSuccess }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setPin('');
      setError(false);
      setSuccess(false);
    }
  }, [open]);

  // ESC to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
      // Allow number keys on keyboard
      if (/^[0-9]$/.test(e.key) && pin.length < 4 && !success) {
        handleNumberClick(e.key);
      }
      if (e.key === 'Backspace') {
        setPin('');
        setError(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pin, success]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const handleNumberClick = (num: string) => {
    if (pin.length >= 4 || success) return;

    const newPin = pin + num;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === CORRECT_PIN) {
        setSuccess(true);
        // Vibrate on success (if available)
        if (navigator.vibrate) navigator.vibrate(100);
        setTimeout(() => {
          onSuccess?.();
          onOpenChange(false);
        }, 800);
      } else {
        setError(true);
        // Vibrate pattern on wrong PIN
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Parent PIN required"
    >
      <div
        className="bg-[#FFFDF9] rounded-3xl shadow-xl max-w-sm w-[90%] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2
            className="text-2xl font-bold text-[#3D2E1F]"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Parent PIN
          </h2>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-[56px] h-[56px] rounded-2xl border-2 flex items-center justify-center
                         transition-all duration-200
                         ${
                           error
                             ? 'border-red-500 bg-red-50 animate-[shake_0.3s_ease-in-out]'
                             : success
                               ? 'border-green-500 bg-green-50'
                               : pin[i]
                                 ? 'border-[#E8610A] bg-[#E8610A]/10'
                                 : 'border-[#E8E0D6] bg-[#FFF8F0]'
                         }`}
            >
              {pin[i] && (
                <div
                  className={`w-4 h-4 rounded-full transition-colors
                    ${error ? 'bg-red-500' : success ? 'bg-green-500' : 'bg-[#E8610A]'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Success message */}
        {success && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-green-600 font-semibold text-sm" style={{ fontFamily: 'var(--font-inter)' }}>
              Access Granted
            </span>
          </div>
        )}

        {/* Number pad - 80px square buttons */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              disabled={success}
              className="h-20 w-full rounded-xl border-2 border-[#E8E0D6] bg-[#FFF8F0]
                         text-2xl font-bold text-[#3D2E1F]
                         hover:bg-[#E8610A] hover:text-white hover:border-[#E8610A]
                         active:scale-95 transition-all
                         disabled:opacity-50 disabled:pointer-events-none
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {num}
            </button>
          ))}

          {/* Clear button */}
          <button
            onClick={handleClear}
            disabled={success}
            className="h-20 w-full rounded-xl border-2 border-[#E8E0D6] bg-[#FFF8F0]
                       flex items-center justify-center
                       hover:bg-[#E8E0D6] active:scale-95 transition-all
                       disabled:opacity-50 disabled:pointer-events-none
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
            aria-label="Clear PIN"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B5B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>

          {/* Zero */}
          <button
            onClick={() => handleNumberClick('0')}
            disabled={success}
            className="h-20 w-full rounded-xl border-2 border-[#E8E0D6] bg-[#FFF8F0]
                       text-2xl font-bold text-[#3D2E1F]
                       hover:bg-[#E8610A] hover:text-white hover:border-[#E8610A]
                       active:scale-95 transition-all
                       disabled:opacity-50 disabled:pointer-events-none
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8610A]"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            0
          </button>

          {/* Empty spacer */}
          <div />
        </div>

        <p className="text-xs text-center text-[#6B5B4F]" style={{ fontFamily: 'var(--font-inter)' }}>
          Demo PIN: 1234
        </p>
      </div>

      {/* Shake animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
