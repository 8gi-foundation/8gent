/**
 * @fileoverview Tenant Context Provider with Convex Integration
 *
 * Provides tenant information throughout the app. Integrates with Convex
 * for real-time tenant data and card management.
 *
 * Key design principles:
 * 1. Parent and child share the SAME subdomain/tenant
 * 2. Mode is a settings toggle, not a domain
 * 3. Real-time updates via Convex subscriptions
 *
 * @module context/TenantContext
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

/**
 * Card type from Convex
 */
interface Card {
  id: string;
  label: string;
  speechText: string;
  imageUrl: string;
  categoryId: string;
  arasaacId?: number;
  glpStage?: number;
  tags?: string[];
  isCustom?: boolean;
}

/**
 * Tenant configuration from Convex
 */
interface TenantConfig {
  _id: Id<'tenants'>;
  subdomain: string;
  ownerId: Id<'users'>;
  parentId?: Id<'users'>;
  displayName: string;
  mode: 'kid' | 'adult';
  status: 'active' | 'suspended' | 'reserved';
  preferences?: {
    themeColor?: string;
    voiceId?: string;
    ttsRate?: number;
    cardSize?: 'small' | 'medium' | 'large';
    showLabels?: boolean;
    enableAnimations?: boolean;
  };
  cardPackVersion: string;
}

/**
 * Tenant context value
 */
interface TenantContextValue {
  /** Current tenant config */
  tenant: TenantConfig | null;

  /** Whether tenant is loading */
  isLoading: boolean;

  /** Error if any */
  error: string | null;

  /** Current subdomain */
  subdomain: string;

  /** Default cards from card pack */
  defaultCards: Card[];

  /** Custom cards for this tenant */
  customCards: Card[];

  /** All cards merged (default + custom) */
  allCards: Card[];

  /** Favorite card IDs */
  favorites: string[];

  /** Recently used card IDs */
  recentlyUsed: string[];

  /** Card pack version */
  packVersion: string;

  /** Tenant ID for mutations */
  tenantId: Id<'tenants'> | null;

  /** Toggle favorite status */
  toggleFavorite: (cardId: string) => Promise<void>;

  /** Record card usage */
  recordUsage: (cardId: string) => Promise<void>;

  /** Save a spoken sentence */
  saveSentence: (sentence: string, cardIds: string[]) => Promise<void>;

  /** Update tenant preferences */
  updatePreferences: (prefs: Partial<NonNullable<TenantConfig['preferences']>>) => Promise<void>;

  /** Refresh tenant data */
  refresh: () => void;
}

/**
 * Context with default values
 */
const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
  error: null,
  subdomain: '',
  defaultCards: [],
  customCards: [],
  allCards: [],
  favorites: [],
  recentlyUsed: [],
  packVersion: '1.0.0',
  tenantId: null,
  toggleFavorite: async () => {},
  recordUsage: async () => {},
  saveSentence: async () => {},
  updatePreferences: async () => {},
  refresh: () => {},
});

/**
 * Extract subdomain from hostname
 */
function getSubdomainFromHost(): string {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;

  // Handle localhost with subdomain (e.g., nick.localhost)
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return '';
  }

  // Handle production (e.g., nick.8gent.app)
  if (hostname.endsWith('.8gent.app')) {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
  }

  // Handle jnr-sigma.vercel.app (demo)
  if (hostname.includes('vercel.app')) {
    return '';
  }

  return '';
}

/**
 * Props for TenantProvider
 */
interface TenantProviderProps {
  children: React.ReactNode;
  /** Override subdomain (useful for server-side rendering) */
  initialSubdomain?: string;
}

/**
 * Tenant Context Provider
 *
 * Wraps the app to provide tenant information via Convex.
 */
export function TenantProvider({
  children,
  initialSubdomain,
}: TenantProviderProps): React.ReactElement {
  const [subdomain, setSubdomain] = useState(initialSubdomain || '');
  const [refreshKey, setRefreshKey] = useState(0);

  // Get subdomain from URL on client
  useEffect(() => {
    if (!initialSubdomain) {
      setSubdomain(getSubdomainFromHost());
    }
  }, [initialSubdomain]);

  // Convex queries
  const tenant = useQuery(
    api.tenants.getBySubdomain,
    subdomain ? { subdomain } : 'skip'
  );

  const cardsData = useQuery(
    api.cardPacks.getCardsForTenant,
    subdomain ? { subdomain } : 'skip'
  );

  // Convex mutations
  const toggleFavoriteMutation = useMutation(api.cardPacks.toggleFavorite);
  const recordUsageMutation = useMutation(api.cardPacks.recordCardUsage);
  const saveSentenceMutation = useMutation(api.cardPacks.saveSentence);
  const updatePreferencesMutation = useMutation(api.tenants.updatePreferences);

  // Determine loading state
  const isLoading = subdomain
    ? tenant === undefined || cardsData === undefined
    : false;

  // Determine error state
  const error =
    subdomain && tenant === null ? 'Tenant not found' : null;

  // Merge cards
  const allCards = useMemo(() => {
    if (!cardsData) return [];
    return [...(cardsData.defaultCards || []), ...(cardsData.customCards || [])];
  }, [cardsData]);

  // Actions
  const toggleFavorite = useCallback(
    async (cardId: string) => {
      if (!cardsData?.tenantId) return;
      await toggleFavoriteMutation({
        tenantId: cardsData.tenantId,
        cardId,
      });
    },
    [cardsData?.tenantId, toggleFavoriteMutation]
  );

  const recordUsage = useCallback(
    async (cardId: string) => {
      if (!cardsData?.tenantId) return;
      await recordUsageMutation({
        tenantId: cardsData.tenantId,
        cardId,
      });
    },
    [cardsData?.tenantId, recordUsageMutation]
  );

  const saveSentence = useCallback(
    async (sentence: string, cardIds: string[]) => {
      if (!cardsData?.tenantId) return;
      await saveSentenceMutation({
        tenantId: cardsData.tenantId,
        sentence,
        cardIds,
      });
    },
    [cardsData?.tenantId, saveSentenceMutation]
  );

  const updatePreferences = useCallback(
    async (prefs: Partial<NonNullable<TenantConfig['preferences']>>) => {
      if (!tenant?._id || !prefs) return;
      await updatePreferencesMutation({
        tenantId: tenant._id,
        preferences: prefs,
      });
    },
    [tenant?._id, updatePreferencesMutation]
  );

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo<TenantContextValue>(
    () => ({
      tenant: tenant || null,
      isLoading,
      error,
      subdomain,
      defaultCards: cardsData?.defaultCards || [],
      customCards: cardsData?.customCards || [],
      allCards,
      favorites: cardsData?.favorites || [],
      recentlyUsed: cardsData?.recentlyUsed || [],
      packVersion: cardsData?.packVersion || '1.0.0',
      tenantId: cardsData?.tenantId || null,
      toggleFavorite,
      recordUsage,
      saveSentence,
      updatePreferences,
      refresh,
    }),
    [
      tenant,
      isLoading,
      error,
      subdomain,
      cardsData,
      allCards,
      toggleFavorite,
      recordUsage,
      saveSentence,
      updatePreferences,
      refresh,
    ]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}

/**
 * Hook to get cards by category
 */
export function useCardsByCategory(categoryId: string): Card[] {
  const { allCards } = useTenant();
  return useMemo(
    () => allCards.filter((card) => card.categoryId === categoryId),
    [allCards, categoryId]
  );
}

/**
 * Hook to get favorite cards
 */
export function useFavoriteCards(): Card[] {
  const { allCards, favorites } = useTenant();
  return useMemo(
    () => allCards.filter((card) => favorites.includes(card.id)),
    [allCards, favorites]
  );
}

/**
 * Hook to get recently used cards
 */
export function useRecentCards(): Card[] {
  const { allCards, recentlyUsed } = useTenant();
  return useMemo(() => {
    const recentMap = new Map(recentlyUsed.map((id, i) => [id, i]));
    return allCards
      .filter((card) => recentMap.has(card.id))
      .sort((a, b) => (recentMap.get(a.id) || 0) - (recentMap.get(b.id) || 0));
  }, [allCards, recentlyUsed]);
}

/**
 * Hook to search cards
 */
export function useSearchCards(query: string): Card[] {
  const { allCards } = useTenant();
  return useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return allCards.filter(
      (card) =>
        card.label.toLowerCase().includes(lowerQuery) ||
        card.speechText.toLowerCase().includes(lowerQuery) ||
        card.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }, [allCards, query]);
}

export default TenantContext;
