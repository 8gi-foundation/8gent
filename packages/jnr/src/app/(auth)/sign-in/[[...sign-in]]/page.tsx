'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Sign In page using Clerk
 *
 * After sign-in, redirects to /onboarding which handles:
 * - Existing users with tenants → redirect to their subdomain
 * - New users → product selector → tenant creation flow
 */
export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#E8610A]/10 border border-[#E8610A]/20 flex items-center justify-center">
          <span className="text-[#E8610A] text-xl font-bold" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>8</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>8gent</h1>
        <p className="text-gray-600 mt-2">Welcome back</p>
      </div>

      {/* Clerk SignIn Component */}
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'bg-white p-6 rounded-2xl shadow-lg border border-gray-100 w-full',
            headerTitle: 'text-2xl font-bold text-gray-900',
            headerSubtitle: 'text-gray-600',
            formButtonPrimary:
              'w-full py-3 bg-[#E8610A] text-white font-semibold rounded-xl hover:bg-[#D15709] transition-all',
            formFieldInput:
              'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E8610A] focus:ring-2 focus:ring-[#E8610A]/20 transition-all outline-none',
            formFieldLabel: 'text-sm font-medium text-gray-700 mb-1',
            socialButtonsBlockButton:
              'border border-gray-200 hover:border-gray-300 rounded-xl py-3 transition-all',
            footerActionLink: 'text-[#E8610A] hover:underline font-medium',
            dividerLine: 'bg-gray-200',
            dividerText: 'text-gray-500',
          },
        }}
        signUpUrl="/sign-up"
        forceRedirectUrl="/onboarding"
      />

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
