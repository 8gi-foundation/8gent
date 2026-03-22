'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IOSHome } from "@/components/ios";

const ONBOARDING_COMPLETE_KEY = 'openclaw_onboarding_complete';

export function HomeClient() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';

    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');

      const fallbackTimer = setTimeout(() => {
        if (window.location.pathname === '/') {
          window.location.href = '/onboarding';
        }
      }, 2000);
      return () => clearTimeout(fallbackTimer);
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return null;
  }

  return <IOSHome />;
}
