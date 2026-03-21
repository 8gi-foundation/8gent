'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { speakWithKitten } from '@/lib/speech/tts';

/**
 * Onboarding Page - Create child's tenant
 *
 * Flow:
 * 1. Enter child's name → generates subdomain suggestions
 * 2. Pick subdomain (e.g., emma.8gent.app)
 * 3. Pick a color theme
 * 4. Select voice
 * 5. Create tenant → redirect to subdomain
 */

const COLORS = [
  { name: 'Green', color: '#4CAF50' },
  { name: 'Blue', color: '#2196F3' },
  { name: 'Purple', color: '#9C27B0' },
  { name: 'Pink', color: '#E91E63' },
  { name: 'Orange', color: '#FF9800' },
  { name: 'Red', color: '#F44336' },
];

const VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', emoji: '👧', description: 'Cheerful child voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', emoji: '👨', description: 'Warm, friendly' },
  { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', emoji: '👩', description: 'Soft and gentle' },
  { id: 'browser', name: 'System', emoji: '🔊', description: 'Device default' },
];

type Step = 'name' | 'subdomain' | 'color' | 'voice' | 'creating' | 'done';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<Step>('name');
  const [childName, setChildName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [voiceId, setVoiceId] = useState('browser');
  const [error, setError] = useState('');

  // Convex mutations and queries
  const createTenant = useMutation(api.tenants.create);
  const suggestSubdomains = useQuery(
    api.tenants.suggestSubdomains,
    childName.length >= 2 ? { name: childName } : 'skip'
  );
  const checkSubdomain = useQuery(
    api.tenants.checkSubdomain,
    subdomain.length >= 2 ? { subdomain } : 'skip'
  );

  // Check if user already has tenants
  const existingTenants = useQuery(api.tenants.listForUser);

  useEffect(() => {
    // If user already has tenants, redirect to their first one
    if (existingTenants && existingTenants.length > 0) {
      const firstTenant = existingTenants[0];
      window.location.href = `https://${firstTenant.subdomain}.8gent.app/app`;
    }
  }, [existingTenants]);

  const handleNameSubmit = () => {
    if (childName.trim().length >= 2) {
      // Generate initial subdomain suggestion
      const suggested = childName.toLowerCase().replace(/[^a-z0-9]/g, '');
      setSubdomain(suggested);
      setStep('subdomain');
    }
  };

  const handleSubdomainSubmit = () => {
    if (checkSubdomain?.available) {
      setStep('color');
    } else {
      setError(checkSubdomain?.reason === 'taken' ? 'This name is already taken' : 'This name is reserved');
    }
  };

  const handleColorSubmit = () => {
    setStep('voice');
  };

  const handleVoiceSubmit = async () => {
    setStep('creating');
    setError('');

    try {
      const result = await createTenant({
        subdomain,
        displayName: `${childName}'s Board`,
        mode: 'kid',
        preferences: {
          themeColor: color,
          voiceId: voiceId === 'browser' ? undefined : voiceId,
        },
      });

      setStep('done');

      // Redirect to the new subdomain
      setTimeout(() => {
        const baseUrl = process.env.NODE_ENV === 'production'
          ? `https://${result.subdomain}.8gent.app`
          : `http://${result.subdomain}.localhost:3001`;
        window.location.href = `${baseUrl}/app`;
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('voice');
    }
  };

  const testVoice = async (vid: string) => {
    const text = `Hello ${childName || 'there'}! Nice to meet you.`;

    if (vid !== 'browser') {
      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId: vid }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
          return;
        }
      } catch {
        // Fallback
      }
    }

    const kittenOk = await speakWithKitten(text);
    if (!kittenOk && 'speechSynthesis' in window) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f7]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-[#f2f2f7] safe-area-inset"
      style={{ '--accent': color } as React.CSSProperties}
    >
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full transition-all duration-500"
          style={{
            backgroundColor: color,
            width:
              step === 'name' ? '20%' :
              step === 'subdomain' ? '40%' :
              step === 'color' ? '60%' :
              step === 'voice' ? '80%' :
              '100%',
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Step: Name */}
        {step === 'name' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="text-6xl mb-6">👋</div>
            <h1 className="text-[28px] font-bold text-black mb-2">
              Who will use 8gent?
            </h1>
            <p className="text-[17px] text-gray-500 mb-8">
              Enter your child&apos;s first name
            </p>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Emma"
              autoFocus
              className="w-full px-4 py-4 text-[20px] text-center bg-white rounded-2xl border-2 border-gray-200
                       focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              onClick={handleNameSubmit}
              disabled={childName.trim().length < 2}
              className="w-full mt-6 py-4 text-white text-[17px] font-semibold rounded-2xl
                       disabled:opacity-40 active:opacity-80 transition-opacity"
              style={{ backgroundColor: color }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Subdomain */}
        {step === 'subdomain' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="text-6xl mb-6">🌐</div>
            <h1 className="text-[28px] font-bold text-black mb-2">
              Choose {childName}&apos;s address
            </h1>
            <p className="text-[17px] text-gray-500 mb-6">
              This will be their personal AAC board URL
            </p>

            <div className="flex items-center gap-2 bg-white rounded-2xl border-2 border-gray-200 p-2 mb-4">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => {
                  setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  setError('');
                }}
                className="flex-1 px-3 py-2 text-[18px] text-right bg-transparent outline-none"
                placeholder="emma"
              />
              <span className="text-[18px] text-gray-400">.8gent.app</span>
            </div>

            {checkSubdomain && (
              <p className={`text-[14px] mb-4 ${checkSubdomain.available ? 'text-green-600' : 'text-red-500'}`}>
                {checkSubdomain.available ? '✓ Available!' : `✗ ${checkSubdomain.reason === 'taken' ? 'Already taken' : 'Reserved'}`}
              </p>
            )}

            {error && <p className="text-red-500 text-[14px] mb-4">{error}</p>}

            {suggestSubdomains && (
              <div className="mb-6">
                <p className="text-[13px] text-gray-400 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestSubdomains.filter(s => s.available).slice(0, 4).map((s) => (
                    <button
                      key={s.subdomain}
                      onClick={() => setSubdomain(s.subdomain)}
                      className="px-3 py-1 text-[13px] bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    >
                      {s.subdomain}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubdomainSubmit}
              disabled={!checkSubdomain?.available}
              className="w-full py-4 text-white text-[17px] font-semibold rounded-2xl
                       disabled:opacity-40 active:opacity-80 transition-opacity"
              style={{ backgroundColor: color }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Color */}
        {step === 'color' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="text-6xl mb-6">🎨</div>
            <h1 className="text-[28px] font-bold text-black mb-2">Pick a color</h1>
            <p className="text-[17px] text-gray-500 mb-8">
              Choose {childName}&apos;s favorite color
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setColor(c.color)}
                  className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                    color === c.color ? 'scale-110 ring-4 ring-offset-2 ring-gray-300' : ''
                  }`}
                  style={{ backgroundColor: c.color }}
                >
                  {color === c.color && (
                    <span className="text-white text-2xl">✓</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={handleColorSubmit}
              className="w-full py-4 text-white text-[17px] font-semibold rounded-2xl active:opacity-80"
              style={{ backgroundColor: color }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Voice */}
        {step === 'voice' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="text-6xl mb-6">🎤</div>
            <h1 className="text-[28px] font-bold text-black mb-2">Choose a voice</h1>
            <p className="text-[17px] text-gray-500 mb-6">
              This is how {childName} will sound
            </p>
            <div className="space-y-3 mb-6">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={`w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 transition-all ${
                    voiceId === v.id ? 'border-[var(--accent)]' : 'border-gray-200'
                  }`}
                  style={{ borderColor: voiceId === v.id ? color : undefined }}
                >
                  <span className="text-3xl">{v.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-black">{v.name}</p>
                    <p className="text-[13px] text-gray-500">{v.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testVoice(v.id);
                    }}
                    className="px-3 py-1.5 text-[13px] rounded-full"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    Test
                  </button>
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 text-[14px] mb-4">{error}</p>}

            <button
              onClick={handleVoiceSubmit}
              className="w-full py-4 text-white text-[17px] font-semibold rounded-2xl active:opacity-80"
              style={{ backgroundColor: color }}
            >
              Create {childName}&apos;s Board
            </button>
          </div>
        )}

        {/* Step: Creating */}
        {step === 'creating' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="text-6xl mb-6">⚙️</div>
            <h1 className="text-[28px] font-bold text-black mb-2">
              Creating {childName}&apos;s Board
            </h1>
            <p className="text-[17px] text-gray-500 mb-8">
              Setting up {subdomain}.8gent.app...
            </p>
            <div
              className="w-12 h-12 mx-auto border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: color, borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-[28px] font-bold text-black mb-2">
              All set!
            </h1>
            <p className="text-[17px] text-gray-500 mb-4">
              {childName}&apos;s board is ready at
            </p>
            <p className="text-[20px] font-bold" style={{ color }}>
              {subdomain}.8gent.app
            </p>
            <p className="text-[14px] text-gray-400 mt-6">
              Redirecting...
            </p>
          </div>
        )}
      </div>

      {/* Skip button */}
      {step !== 'done' && step !== 'creating' && (
        <div className="p-6 text-center safe-bottom">
          <button
            onClick={() => router.push('/app')}
            className="text-[15px] text-gray-400"
          >
            Skip for now
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
