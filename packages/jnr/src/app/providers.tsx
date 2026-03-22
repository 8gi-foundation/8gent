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
          colorPrimary: '#E8610A',
          colorBackground: '#FDFCFA',
          colorText: '#1A1614',
          borderRadius: '0.75rem',
        },
        elements: {
          formButtonPrimary:
            'bg-[#E8610A] hover:bg-[#D15709] text-white font-medium py-3 px-4 rounded-xl',
          card: 'shadow-xl rounded-2xl border border-[#E8E0D6]',
          headerTitle: 'text-2xl font-bold text-[#1A1614]',
          headerSubtitle: 'text-[#5C544A]',
          socialButtonsBlockButton:
            'border-[#E8E0D6] hover:border-[#D6CEC4] rounded-xl py-3',
          formFieldInput: 'rounded-xl border-[#E8E0D6] py-3',
          footerActionLink: 'text-[#E8610A] hover:text-[#D15709] font-medium',
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
