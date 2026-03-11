'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { ReactNode, useMemo } from 'react';

// Create Convex client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(() => new ConvexReactClient(convexUrl), []);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#2563eb',
          colorBackground: '#ffffff',
          colorText: '#0a0a0a',
          borderRadius: '0.75rem',
        },
        elements: {
          formButtonPrimary:
            'bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl',
          card: 'shadow-xl rounded-2xl border border-gray-100',
          headerTitle: 'text-2xl font-bold',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton:
            'border-gray-200 hover:border-gray-300 rounded-xl py-3',
          formFieldInput: 'rounded-xl border-gray-200 py-3',
          footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
        },
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/app"
      afterSignUpUrl="/onboarding"
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
