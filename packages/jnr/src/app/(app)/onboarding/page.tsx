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
 * 2. Pick subdomain (e.g., emma.8gentjr.com)
 * 3. Pick a color theme
 * 4. Select voice
 * 5. Create tenant → redirect to subdomain
 */

const COLORS = [
  { name: 'Green', color: '#4CAF50' },
  { name: 'Blue', color: '#2196F3' },
  { name: 'Orange', color: '#E8610A' },
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Teal', color: '#14B8A6' },
  { name: 'Red', color: '#F44336' },
];

const VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Cheerful child voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Warm, friendly' },
  { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', description: 'Soft and gentle' },
  { id: 'browser', name: 'System', description: 'Device default' },
];

type Step = 'product' | 'consent' | 'name' | 'subdomain' | 'color' | 'voice' | 'creating' | 'done';
type Product = 'os' | 'jr';

type ConsentState = {
  data_processing: boolean;
  health_data: boolean;
  personalization: boolean;
  analytics: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  // Check if product was pre-selected (e.g. ?product=jr from 8gentjr.com sign-up)
  const preselectedProduct = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('product') as Product | null
    : null;

  const [step, setStep] = useState<Step>(preselectedProduct === 'jr' ? 'consent' : 'product');
  const [product, setProduct] = useState<Product | null>(preselectedProduct);
  const [childName, setChildName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [voiceId, setVoiceId] = useState('browser');
  const [error, setError] = useState('');
  const [consents, setConsents] = useState<ConsentState>({
    data_processing: false,
    health_data: false,
    personalization: false,
    analytics: false,
  });

  // Convex mutations and queries
  const createTenant = useMutation(api.tenants.create);
  const grantConsents = useMutation(api.consent.grantConsents);
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
    // If user already has tenants, redirect — unless they're restarting setup
    const isRestart = new URLSearchParams(window.location.search).has('restart');
    if (existingTenants && existingTenants.length > 0 && !isRestart) {
      const firstTenant = existingTenants[0];
      window.location.href = `https://${firstTenant.subdomain}.8gentjr.com`;
    }
  }, [existingTenants, router]);

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
        displayName: `${childName}'s 8gent`,
        mode: 'kid',
        preferences: {
          themeColor: color,
          voiceId: voiceId === 'browser' ? undefined : voiceId,
        },
      });

      // Store consent records with audit metadata
      const grantedTypes: Array<"data_processing" | "health_data" | "personalization" | "analytics"> = [];
      if (consents.data_processing) grantedTypes.push('data_processing');
      if (consents.health_data) grantedTypes.push('health_data');
      if (consents.personalization) grantedTypes.push('personalization');
      if (consents.analytics) grantedTypes.push('analytics');

      if (grantedTypes.length > 0) {
        await grantConsents({
          tenantId: result.tenantId,
          consentTypes: grantedTypes,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        });
      }

      // Mirror consent state to localStorage so client-side code
      // (session-logger, personalization) can check without a network call.
      // This is the ONLY place consent should be written to localStorage.
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('8gent-jr-consents', JSON.stringify({
          data_processing: consents.data_processing,
          health_data: consents.health_data,
          personalization: consents.personalization,
          analytics: consents.analytics,
        }));
      }

      setStep('done');

      // Redirect to the new subdomain (cross-domain, so use window.location)
      setTimeout(() => {
        window.location.href = `https://${result.subdomain}.8gentjr.com`;
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
        <div className="w-12 h-12 border-4 border-[#E8610A] border-t-transparent rounded-full animate-spin" />
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
              step === 'product' ? '8%' :
              step === 'consent' ? '20%' :
              step === 'name' ? '35%' :
              step === 'subdomain' ? '50%' :
              step === 'color' ? '65%' :
              step === 'voice' ? '80%' :
              '100%',
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Step: Product Selection */}
        {step === 'product' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E8610A]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome to 8gent Jr
            </h1>
            <p className="text-[17px] text-gray-500 mb-8">
              What are you looking for?
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setProduct('os');
                  // Adult OS — redirect to waitlist/app for now
                  router.push('/app');
                }}
                className="w-full p-5 bg-white rounded-2xl border-2 border-gray-200 text-left
                         hover:border-[#E8610A] transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8610A]/10 flex items-center justify-center">
                    <span className="text-2xl">~</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-black">8gent OS</h3>
                    <p className="text-[14px] text-gray-500">Personal AI operating system for adults</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setProduct('jr');
                  setStep('consent');
                }}
                className="w-full p-5 bg-white rounded-2xl border-2 border-gray-200 text-left
                         hover:border-[#E8610A] transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8610A]/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-black">8gent Jr</h3>
                    <p className="text-[14px] text-gray-500">Personal AI OS for children</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Consent */}
        {step === 'consent' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E8610A]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Your child&apos;s privacy
            </h1>
            <p className="text-[15px] text-gray-500 mb-6 leading-relaxed">
              8gent Jr helps children communicate using picture cards and speech.
              We take data protection seriously, especially for children.
              Please review what data we process and why.
            </p>

            <div className="space-y-3 mb-6 text-left">
              {/* Required: Data Processing */}
              <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border-2 border-gray-200 cursor-pointer transition-all hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={consents.data_processing}
                  onChange={(e) => setConsents(prev => ({ ...prev, data_processing: e.target.checked }))}
                  className="mt-0.5 w-5 h-5 rounded accent-[#E8610A] flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-black text-[15px]">
                    Communication data
                    <span className="ml-2 text-[12px] font-normal text-red-500">Required</span>
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    We store the picture cards your child selects and sentences they build.
                    This is needed for the app to work — showing recent phrases, favorites, and the sentence bar.
                  </p>
                </div>
              </label>

              {/* Required: Health Data (Article 9) */}
              <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border-2 border-gray-200 cursor-pointer transition-all hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={consents.health_data}
                  onChange={(e) => setConsents(prev => ({ ...prev, health_data: e.target.checked }))}
                  className="mt-0.5 w-5 h-5 rounded accent-[#E8610A] flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-black text-[15px]">
                    Health and disability data
                    <span className="ml-2 text-[12px] font-normal text-red-500">Required</span>
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    Using an AAC app tells us your child may have communication support needs.
                    Under EU law (GDPR Article 9), this counts as health-related data and needs your explicit consent.
                    We only use this to provide the communication tool itself.
                  </p>
                </div>
              </label>

              {/* Optional: Personalization */}
              <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border-2 border-gray-200 cursor-pointer transition-all hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={consents.personalization}
                  onChange={(e) => setConsents(prev => ({ ...prev, personalization: e.target.checked }))}
                  className="mt-0.5 w-5 h-5 rounded accent-[#E8610A] flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-black text-[15px]">
                    Personalization
                    <span className="ml-2 text-[12px] font-normal text-gray-400">Optional</span>
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    Learn from how your child uses cards to suggest better layouts and show frequently-used phrases first.
                    You can turn this off at any time in Settings.
                  </p>
                </div>
              </label>

              {/* Optional: Analytics */}
              <label className="flex items-start gap-3 p-4 bg-white rounded-2xl border-2 border-gray-200 cursor-pointer transition-all hover:border-gray-300">
                <input
                  type="checkbox"
                  checked={consents.analytics}
                  onChange={(e) => setConsents(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="mt-0.5 w-5 h-5 rounded accent-[#E8610A] flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-black text-[15px]">
                    Usage analytics
                    <span className="ml-2 text-[12px] font-normal text-gray-400">Optional</span>
                  </p>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    Anonymous usage data (e.g. which screens are visited) helps us improve the app for all families.
                    No personal or health data is included. You can turn this off at any time.
                  </p>
                </div>
              </label>
            </div>

            <p className="text-[13px] text-gray-400 mb-6">
              Read our full{' '}
              <a href="/privacy" className="underline text-[#E8610A]" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              . You can withdraw consent at any time from Settings. Data is stored in the EU.
            </p>

            <button
              onClick={() => setStep('name')}
              disabled={!consents.data_processing || !consents.health_data}
              className="w-full py-4 text-white text-[17px] font-semibold rounded-2xl
                       disabled:opacity-40 active:opacity-80 transition-opacity"
              style={{ backgroundColor: color }}
            >
              {!consents.data_processing || !consents.health_data
                ? 'Please accept required consents to continue'
                : 'Continue'}
            </button>
          </div>
        )}

        {/* Step: Name */}
        {step === 'name' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E8610A]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Who will use 8gent Jr?
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
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E8610A]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Choose {childName}&apos;s address
            </h1>
            <p className="text-[17px] text-gray-500 mb-6">
              This will be their personal 8gent Jr address
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
              <span className="text-[18px] text-gray-400">.8gentjr.com</span>
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
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E8610A]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="2.5" />
                <circle cx="19" cy="11.5" r="2.5" />
                <circle cx="6.5" cy="12.5" r="2.5" />
                <circle cx="17" cy="18.5" r="2.5" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H17c3.3 0 6-2.7 6-6 0-5.2-4.9-9.4-11-8.4" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>Pick a color</h1>
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
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E8610A]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>Choose a voice</h1>
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
                  <div className="w-10 h-10 rounded-xl bg-[#E8610A]/10 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                  </div>
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
              Create {childName}&apos;s 8gent
            </button>
          </div>
        )}

        {/* Step: Creating */}
        {step === 'creating' && (
          <div className="w-full max-w-sm text-center animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#E8610A]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E8610A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animationDuration: '3s' }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Creating {childName}&apos;s 8gent Jr
            </h1>
            <p className="text-[17px] text-gray-500 mb-8">
              Setting up {subdomain}.8gentjr.com...
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
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#2D8A56]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D8A56" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              All set!
            </h1>
            <p className="text-[17px] text-gray-500 mb-4">
              {childName}&apos;s 8gent is ready at
            </p>
            <p className="text-[20px] font-bold" style={{ color }}>
              {subdomain}.8gentjr.com
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
