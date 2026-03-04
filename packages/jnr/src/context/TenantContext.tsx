/**
 * @fileoverview Tenant Context Provider
 *
 * Provides tenant information throughout the app. Key design principle:
 * **Parent and child share the SAME subdomain/tenant.**
 * Parent authenticates with admin PIN to access settings and controls.
 *
 * Example: nick.8gentjr.app
 * - Nick (child) uses it normally
 * - James (parent) logs in to same subdomain with admin PIN
 *
 * This enables:
 * - Single URL per child (simple sharing)
 * - Parent oversight without separate dashboard
 * - Seamless child→parent handoff for help
 *
 * @module context/TenantContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type {
  TenantConfig,
  TenantContextValue,
  ParentPermissions,
} from '@/types/tenant';

/**
 * Storage key for admin session
 */
const ADMIN_SESSION_KEY = '8gent-jr-admin-session';

/**
 * Admin session timeout (30 minutes)
 */
const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Extended context value with admin controls
 */
interface TenantContextExtended extends TenantContextValue {
  /** Whether admin mode is active (parent logged in with PIN) */
  isAdminMode: boolean;

  /** Verify admin PIN and activate admin mode */
  verifyAdminPin: (pin: string) => Promise<boolean>;

  /** Exit admin mode */
  exitAdminMode: () => void;

  /** Time remaining in admin session (ms) */
  adminSessionRemaining: number | null;

  /** Switch between child tenants (for parents with multiple children) */
  switchTenant: (subdomain: string) => Promise<void>;

  /** List of child tenants for current parent */
  childTenants: TenantConfig[];
}

/**
 * Default parent permissions
 */
const DEFAULT_PARENT_PERMISSIONS: ParentPermissions = {
  canViewActivity: true,
  canModifyPreferences: true,
  canManageCards: true,
  canViewConversations: true,
  canExportData: true,
  canInitiateGraduation: true,
  canManageTenant: true,
};

/**
 * Context with default values
 */
const TenantContext = createContext<TenantContextExtended>({
  tenant: null,
  isLoading: true,
  error: null,
  subdomain: '',
  isOwner: false,
  isParent: false,
  parentPermissions: undefined,
  refresh: async () => {},
  isAdminMode: false,
  verifyAdminPin: async () => false,
  exitAdminMode: () => {},
  adminSessionRemaining: null,
  switchTenant: async () => {},
  childTenants: [],
});

/**
 * Props for TenantProvider
 */
interface TenantProviderProps {
  children: React.ReactNode;
  /** Current subdomain (extracted from hostname) */
  subdomain: string;
  /** Current user ID (from auth) */
  userId?: string;
  /** Function to resolve tenant from subdomain */
  resolveTenant: (subdomain: string) => Promise<TenantConfig | null>;
  /** Function to get child tenants for a parent */
  getChildTenants?: (parentUserId: string) => Promise<TenantConfig[]>;
  /** Function to verify admin PIN */
  verifyPin?: (tenantId: string, pin: string) => Promise<boolean>;
}

/**
 * Tenant Context Provider
 *
 * Wraps the app to provide tenant information. Handles:
 * - Tenant resolution from subdomain
 * - User ownership detection
 * - Parent authentication via PIN
 * - Admin session management
 *
 * @example
 * ```tsx
 * // In _app.tsx or layout.tsx
 * <TenantProvider
 *   subdomain={parsedSubdomain}
 *   userId={session?.userId}
 *   resolveTenant={async (sub) => db.getTenant(sub)}
 *   verifyPin={async (id, pin) => db.verifyTenantPin(id, pin)}
 * >
 *   <App />
 * </TenantProvider>
 * ```
 */
export function TenantProvider({
  children,
  subdomain,
  userId,
  resolveTenant,
  getChildTenants,
  verifyPin,
}: TenantProviderProps): React.ReactElement {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [childTenants, setChildTenants] = useState<TenantConfig[]>([]);

  // Admin session state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSessionEnd, setAdminSessionEnd] = useState<number | null>(null);

  // Check for existing admin session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.tenantId === tenant?.id && session.expiresAt > Date.now()) {
          setIsAdminMode(true);
          setAdminSessionEnd(session.expiresAt);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, [tenant?.id]);

  // Resolve tenant on subdomain change
  useEffect(() => {
    let cancelled = false;

    async function loadTenant() {
      if (!subdomain) {
        setTenant(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const resolved = await resolveTenant(subdomain);

        if (cancelled) return;

        setTenant(resolved);

        // If user is a parent, load their child tenants
        if (userId && getChildTenants) {
          try {
            const children = await getChildTenants(userId);
            setChildTenants(children);
          } catch {
            setChildTenants([]);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Failed to resolve tenant'));
        setTenant(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTenant();

    return () => {
      cancelled = true;
    };
  }, [subdomain, userId, resolveTenant, getChildTenants]);

  // Determine ownership
  const isOwner = useMemo(() => {
    if (!tenant || !userId) return false;
    return tenant.userId === userId;
  }, [tenant, userId]);

  // Determine if current user is parent of this tenant
  const isParent = useMemo(() => {
    if (!tenant || !userId) return false;
    return tenant.parentUserId === userId;
  }, [tenant, userId]);

  // Parent permissions (only available when parent is verified)
  const parentPermissions = useMemo(() => {
    if (isParent && isAdminMode) {
      return DEFAULT_PARENT_PERMISSIONS;
    }
    return undefined;
  }, [isParent, isAdminMode]);

  // Admin session remaining time
  const adminSessionRemaining = useMemo(() => {
    if (!adminSessionEnd) return null;
    const remaining = adminSessionEnd - Date.now();
    return remaining > 0 ? remaining : null;
  }, [adminSessionEnd]);

  // Refresh tenant data
  const refresh = useCallback(async () => {
    if (!subdomain) return;

    setIsLoading(true);
    try {
      const resolved = await resolveTenant(subdomain);
      setTenant(resolved);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh tenant'));
    } finally {
      setIsLoading(false);
    }
  }, [subdomain, resolveTenant]);

  // Verify admin PIN
  const verifyAdminPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!tenant || !verifyPin) return false;

      try {
        const isValid = await verifyPin(tenant.id, pin);

        if (isValid) {
          const expiresAt = Date.now() + ADMIN_SESSION_TIMEOUT;

          setIsAdminMode(true);
          setAdminSessionEnd(expiresAt);

          // Persist admin session
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              ADMIN_SESSION_KEY,
              JSON.stringify({
                tenantId: tenant.id,
                expiresAt,
              })
            );
          }

          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    [tenant, verifyPin]
  );

  // Exit admin mode
  const exitAdminMode = useCallback(() => {
    setIsAdminMode(false);
    setAdminSessionEnd(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }, []);

  // Switch tenant (for parents with multiple children)
  const switchTenant = useCallback(
    async (newSubdomain: string) => {
      // This would typically navigate to the new subdomain
      // For SPA, we might update state; for multi-tenant, we'd redirect
      if (typeof window !== 'undefined') {
        // Build new URL with same host pattern
        const currentHost = window.location.hostname;
        const parts = currentHost.split('.');
        parts[0] = newSubdomain;
        const newHost = parts.join('.');

        window.location.href = `${window.location.protocol}//${newHost}${window.location.port ? ':' + window.location.port : ''}`;
      }
    },
    []
  );

  // Auto-expire admin session
  useEffect(() => {
    if (!adminSessionEnd) return;

    const checkExpiry = () => {
      if (Date.now() >= adminSessionEnd) {
        exitAdminMode();
      }
    };

    const interval = setInterval(checkExpiry, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [adminSessionEnd, exitAdminMode]);

  const value = useMemo<TenantContextExtended>(
    () => ({
      tenant,
      isLoading,
      error,
      subdomain,
      isOwner,
      isParent,
      parentPermissions,
      refresh,
      isAdminMode,
      verifyAdminPin,
      exitAdminMode,
      adminSessionRemaining,
      switchTenant,
      childTenants,
    }),
    [
      tenant,
      isLoading,
      error,
      subdomain,
      isOwner,
      isParent,
      parentPermissions,
      refresh,
      isAdminMode,
      verifyAdminPin,
      exitAdminMode,
      adminSessionRemaining,
      switchTenant,
      childTenants,
    ]
  );

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 *
 * @returns Tenant context value
 *
 * @example
 * ```tsx
 * function SettingsButton() {
 *   const { isParent, isAdminMode, verifyAdminPin } = useTenant();
 *
 *   if (!isParent) return null;
 *
 *   if (!isAdminMode) {
 *     return <PinDialog onVerify={verifyAdminPin} />;
 *   }
 *
 *   return <SettingsPanel />;
 * }
 * ```
 */
export function useTenant(): TenantContextExtended {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}

/**
 * Hook to require admin mode for protected actions
 *
 * @returns Object with requireAdmin function and admin state
 *
 * @example
 * ```tsx
 * function DeleteCardButton({ cardId }) {
 *   const { requireAdmin, isAdminMode } = useRequireAdmin();
 *
 *   const handleDelete = () => {
 *     requireAdmin(() => {
 *       // This only runs if admin mode is active
 *       deleteCard(cardId);
 *     });
 *   };
 *
 *   return <button onClick={handleDelete}>Delete</button>;
 * }
 * ```
 */
export function useRequireAdmin() {
  const { isAdminMode, isParent, verifyAdminPin } = useTenant();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAdmin = useCallback(
    (action: () => void) => {
      if (isAdminMode) {
        action();
        return;
      }

      if (isParent) {
        setPendingAction(() => action);
        setShowPinDialog(true);
      }
    },
    [isAdminMode, isParent]
  );

  const handlePinVerified = useCallback(
    async (pin: string): Promise<boolean> => {
      const success = await verifyAdminPin(pin);

      if (success && pendingAction) {
        pendingAction();
        setPendingAction(null);
      }

      setShowPinDialog(false);
      return success;
    },
    [verifyAdminPin, pendingAction]
  );

  const closePinDialog = useCallback(() => {
    setShowPinDialog(false);
    setPendingAction(null);
  }, []);

  return {
    requireAdmin,
    isAdminMode,
    showPinDialog,
    handlePinVerified,
    closePinDialog,
  };
}

export default TenantContext;
