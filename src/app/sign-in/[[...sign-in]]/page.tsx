'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Sign In page for 8gent.app / 8gentos.com
 *
 * After sign-in, users are redirected to /chat (main app).
 * Uses Clerk's <SignIn /> component with brand-consistent styling.
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0908] p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-[#FAF7F4]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            8gent<span className="text-[#E8610A]">.</span>
          </h1>
          <p className="text-[#C8C2BA] mt-2">Welcome back</p>
        </div>

        {/* Clerk SignIn Component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-[#12100E] p-6 rounded-2xl shadow-lg border border-[#2E2A26] w-full',
              headerTitle: 'text-2xl font-bold text-[#FAF7F4]',
              headerSubtitle: 'text-[#C8C2BA]',
              formButtonPrimary:
                'w-full py-3 bg-[#E8610A] text-white font-semibold rounded-xl hover:bg-[#F07A28] transition-all',
              formFieldInput:
                'w-full px-4 py-3 rounded-xl border border-[#2E2A26] bg-[#1C1A17] text-[#FAF7F4] focus:border-[#E8610A] focus:ring-2 focus:ring-[#E8610A]/20 transition-all outline-none',
              formFieldLabel: 'text-sm font-medium text-[#C8C2BA] mb-1',
              socialButtonsBlockButton:
                'border border-[#2E2A26] hover:border-[#E8610A]/50 rounded-xl py-3 transition-all text-[#FAF7F4]',
              footerActionLink: 'text-[#E8610A] hover:underline font-medium',
              dividerLine: 'bg-[#2E2A26]',
              dividerText: 'text-[#8A8078]',
            },
          }}
          signUpUrl="/sign-up"
          forceRedirectUrl="/chat"
        />

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#8A8078] hover:text-[#C8C2BA]">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
