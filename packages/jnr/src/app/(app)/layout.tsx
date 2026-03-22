'use client';

import type { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';
import { TenantProvider } from '@/context/TenantContext';

/**
 * App layout for 8gent users
 *
 * Provides AppContext for personalization settings and TenantProvider
 * for multi-tenant data from Convex.
 */
export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TenantProvider>
      <AppProvider>
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #E0F7FA 0%, #E8F5E9 50%, #F1F8E9 100%)' }}>
          {children}
        </div>
      </AppProvider>
    </TenantProvider>
  );
}
