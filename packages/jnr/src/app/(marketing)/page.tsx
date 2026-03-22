'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import JrHomePage from './jr-home/page';
import { EcosystemFooter } from './components/ecosystem-footer';

/**
 * Domain-aware root page:
 * - 8gent.app / www.8gent.app / localhost → App gateway (sign in or redirect)
 * - 8gentjr.com / www.8gentjr.com → Jr landing (handled elsewhere, fallback here)
 * - Everything else → App gateway
 */

const APP_DOMAINS = ['8gent.app', 'www.8gent.app', 'localhost'];
const JR_DOMAINS = ['8gentjr.com', 'www.8gentjr.com'];

function isAppDomain(hostname: string): boolean {
  const bare = hostname.split(':')[0]; // strip port for localhost:3000
  return APP_DOMAINS.includes(bare);
}

function isJrDomain(hostname: string): boolean {
  const bare = hostname.split(':')[0];
  return JR_DOMAINS.includes(bare) || bare.endsWith('.8gentjr.com');
}

/* ── App Gateway (sign-in page for 8gent.app) ─────────────────────── */

function AppGateway() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Redirect signed-in users to their app
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/app');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while checking auth (prevents flash)
  if (!isLoaded || isSignedIn) {
    return (
      <main className="min-h-screen bg-[#F5F0EB] dark:bg-[#1A1612] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#E8610A] border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F0EB] dark:bg-[#1A1612] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#E8610A]/10 border border-[#E8610A]/20 flex items-center justify-center mb-5">
          <span
            className="text-2xl text-[#1A1614] dark:text-[#F5F0EB]"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 800 }}
          >
            8<span className="text-[#E8610A]">.</span>
          </span>
        </div>
      </div>

      {/* Heading */}
      <h1
        className="text-2xl sm:text-3xl text-center text-[#1A1614] dark:text-[#F5F0EB] tracking-tight mb-3"
        style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 800 }}
      >
        Sign in to your 8gent
      </h1>
      <p
        className="text-sm text-[#6B6560] dark:text-[#A09890] text-center max-w-xs mb-10"
        style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
      >
        Your personal AI operating system.
      </p>

      {/* Auth buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/sign-in"
          className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-[#E8610A] text-white text-sm font-medium
                     hover:bg-[#CC5508] active:scale-[0.97] transition-all"
          style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl
                     border border-[#1A1614]/12 dark:border-[#F5F0EB]/12
                     text-[#1A1614] dark:text-[#F5F0EB] text-sm font-medium
                     hover:border-[#1A1614]/24 dark:hover:border-[#F5F0EB]/24
                     active:scale-[0.97] transition-all"
          style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
        >
          Create Account
        </Link>
      </div>

      {/* Helper text */}
      <p
        className="text-xs text-[#6B6560] dark:text-[#A09890] text-center mt-6"
        style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
      >
        New here?{' '}
        <Link href="/sign-up" className="text-[#E8610A] hover:underline">
          Sign up
        </Link>{' '}
        to create your account.
      </p>

      {/* Ecosystem Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <EcosystemFooter />
      </div>
    </main>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────── */

export default function HomePage() {
  const [domain, setDomain] = useState<'app' | 'jr' | 'loading'>('loading');

  useEffect(() => {
    const hostname = window.location.hostname;
    if (isJrDomain(hostname)) {
      setDomain('jr');
    } else {
      setDomain('app');
    }
  }, []);

  if (domain === 'loading') {
    return (
      <main className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#E8610A] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (domain === 'jr') {
    return <JrHomePage />;
  }

  return <AppGateway />;
}
