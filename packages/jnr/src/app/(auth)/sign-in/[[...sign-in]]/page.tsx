'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Sign In page using Clerk
 */
export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <div className="text-4xl mb-2">🗣️</div>
        <h1 className="text-2xl font-bold text-gray-900">8gent</h1>
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
              'w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all',
            formFieldInput:
              'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none',
            formFieldLabel: 'text-sm font-medium text-gray-700 mb-1',
            socialButtonsBlockButton:
              'border border-gray-200 hover:border-gray-300 rounded-xl py-3 transition-all',
            footerActionLink: 'text-blue-600 hover:underline font-medium',
            dividerLine: 'bg-gray-200',
            dividerText: 'text-gray-500',
          },
        }}
        signUpUrl="/sign-up"
        forceRedirectUrl="/app"
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
