'use client';

import AACAppPage from '../../app/page';

/**
 * Path-based tenant route: /jr/[tenant]
 *
 * TenantContext auto-detects the tenant from /jr/[tenant] URL path.
 */
export default function JrTenantPage() {
  return <AACAppPage />;
}
