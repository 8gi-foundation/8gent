/**
 * @fileoverview Tenant Types for 8gent Jr Multi-tenancy
 *
 * Defines the type system for subdomain-based multi-tenancy.
 * Each child user gets their own subdomain (e.g., nick.8gentjr.app)
 * with a migration path to 8gent senior at age 16.
 *
 * @module types/tenant
 */

/**
 * Product tier determining which 8gent version the user is on
 */
export type ProductTier = 'junior' | 'senior';

/**
 * Graduation status for age-based tier transitions
 */
export type GraduationStatus =
  | 'not-eligible'
  | 'eligible'
  | 'in-progress'
  | 'completed';

/**
 * Tenant status for lifecycle management
 */
export type TenantStatus =
  | 'active'
  | 'suspended'
  | 'deactivated'
  | 'migrated'
  | 'reserved';

/**
 * Subdomain reservation status
 */
export type ReservationStatus = 'available' | 'reserved' | 'taken' | 'invalid';

/**
 * Core tenant configuration for a subdomain
 */
export interface TenantConfig {
  /** Unique tenant identifier */
  id: string;

  /** Subdomain slug (e.g., 'nick' for nick.8gentjr.app) */
  subdomain: string;

  /** User ID who owns this tenant */
  userId: string;

  /** Product tier (junior or senior) */
  productTier: ProductTier;

  /** Parent user ID (for parental controls) */
  parentUserId: string;

  /** Tenant display name (child's name) */
  displayName: string;

  /** Child's date of birth for graduation tracking */
  dateOfBirth: Date;

  /** Current tenant status */
  status: TenantStatus;

  /** When the tenant was created */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** When the user becomes eligible for graduation (16th birthday) */
  graduationDate?: Date;

  /** If migrated, the senior subdomain */
  seniorSubdomain?: string;

  /** Custom theme/preferences for this tenant */
  preferences?: TenantPreferences;
}

/**
 * Tenant-specific preferences
 */
export interface TenantPreferences {
  /** Custom theme color */
  themeColor?: string;

  /** Avatar URL */
  avatarUrl?: string;

  /** Preferred voice ID for TTS */
  voiceId?: string;

  /** Language preference */
  language?: string;

  /** Accessibility settings */
  accessibility?: {
    highContrast?: boolean;
    largeText?: boolean;
    reduceMotion?: boolean;
  };
}

/**
 * Configuration for the graduation process
 */
export interface GraduationConfig {
  /** User ID */
  userId: string;

  /** Tenant ID */
  tenantId: string;

  /** When the user becomes eligible */
  eligibleAt: Date;

  /** Current graduation status */
  status: GraduationStatus;

  /** Target senior subdomain (if chosen) */
  seniorSubdomain?: string;

  /** Data categories that have been migrated */
  migratedData?: MigratableData[];

  /** When graduation was initiated */
  initiatedAt?: Date;

  /** When graduation was completed */
  completedAt?: Date;
}

/**
 * Types of data that can be migrated during graduation
 */
export type MigratableData =
  | 'preferences'
  | 'voice'
  | 'memories'
  | 'aac-cards'
  | 'conversations'
  | 'achievements';

/**
 * Subdomain validation result
 */
export interface SubdomainValidationResult {
  /** Whether the subdomain is valid and available */
  isValid: boolean;

  /** Availability status */
  status: ReservationStatus;

  /** Validation errors if any */
  errors?: SubdomainError[];

  /** Suggested alternatives if taken */
  suggestions?: string[];

  /** Sanitized version of the input */
  sanitized?: string;
}

/**
 * Subdomain validation error types
 */
export type SubdomainErrorCode =
  | 'too_short'
  | 'too_long'
  | 'invalid_characters'
  | 'reserved_word'
  | 'already_taken'
  | 'contains_profanity'
  | 'starts_with_number'
  | 'consecutive_hyphens';

/**
 * Subdomain validation error
 */
export interface SubdomainError {
  code: SubdomainErrorCode;
  message: string;
}

/**
 * Reserved subdomains that cannot be used
 */
export const RESERVED_SUBDOMAINS = [
  // System routes
  'admin',
  'api',
  'app',
  'www',
  'mail',
  'ftp',
  'blog',
  'help',
  'support',
  'docs',
  'status',
  'cdn',
  'static',
  'assets',
  'media',
  'images',
  'files',

  // Auth routes
  'login',
  'logout',
  'signin',
  'signout',
  'signup',
  'register',
  'auth',
  'oauth',
  'sso',
  'callback',

  // Product routes
  'dashboard',
  'settings',
  'profile',
  'account',
  'billing',
  'pricing',
  'onboarding',
  'welcome',

  // Brand protection
  '8gent',
  'eightgent',
  'eight-gent',
  'aijames',
  'ai-james',
  'james',
  'spalding',
  'anthropic',
  'claude',
  'openai',
  'google',
  'apple',
  'microsoft',

  // Common abuse targets
  'test',
  'demo',
  'example',
  'sample',
  'null',
  'undefined',
  'root',
  'system',
  'localhost',
] as const;

/**
 * Type for reserved subdomain values
 */
export type ReservedSubdomain = (typeof RESERVED_SUBDOMAINS)[number];

/**
 * Multi-child support - parent can have multiple child tenants
 */
export interface ParentTenantRelationship {
  /** Parent user ID */
  parentUserId: string;

  /** List of child tenant IDs */
  childTenantIds: string[];

  /** Primary child (shown first in switcher) */
  primaryChildId?: string;

  /** Parent access permissions */
  permissions: ParentPermissions;
}

/**
 * Parent access permissions for child tenants
 */
export interface ParentPermissions {
  /** Can view child's activity */
  canViewActivity: boolean;

  /** Can modify preferences */
  canModifyPreferences: boolean;

  /** Can add/remove AAC cards */
  canManageCards: boolean;

  /** Can view conversation history */
  canViewConversations: boolean;

  /** Can export data */
  canExportData: boolean;

  /** Can initiate graduation (when eligible) */
  canInitiateGraduation: boolean;

  /** Can suspend/deactivate tenant */
  canManageTenant: boolean;
}

/**
 * Tenant context value for React context
 */
export interface TenantContextValue {
  /** Current tenant configuration */
  tenant: TenantConfig | null;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** Current subdomain */
  subdomain: string;

  /** Whether current user owns this tenant */
  isOwner: boolean;

  /** Whether current user is parent of tenant owner */
  isParent: boolean;

  /** Parent permissions if isParent is true */
  parentPermissions?: ParentPermissions;

  /** Refresh tenant data */
  refresh: () => Promise<void>;
}

/**
 * Tenant resolution result from middleware
 */
export interface TenantResolution {
  /** Whether this is a valid tenant subdomain */
  isTenant: boolean;

  /** Whether this is the root domain */
  isRootDomain: boolean;

  /** Subdomain if present */
  subdomain?: string;

  /** Resolved tenant config if found */
  tenant?: TenantConfig;

  /** Redirect URL if needed */
  redirectTo?: string;
}

/**
 * Subdomain picker suggestions based on child's name
 */
export interface SubdomainSuggestion {
  /** Suggested subdomain */
  subdomain: string;

  /** Whether it's available */
  isAvailable: boolean;

  /** Reason for suggestion */
  reason: string;
}
