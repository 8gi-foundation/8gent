/**
 * @fileoverview Tenant Resolution for 8gent Jr Multi-tenancy
 *
 * Resolves tenant configuration from request hostname.
 * Handles subdomain routing for multi-tenant architecture.
 *
 * Each user gets their own subdomain:
 * - nick.8gentjr.com -> Nick's 8gent Jr
 * - nick.8gentos.com -> Nick's 8gent (senior, at 16+)
 *
 * @module lib/tenant/tenantResolver
 */

import type {
  TenantConfig,
  TenantResolution,
  TenantStatus,
  ProductTier,
  TenantPreferences,
} from '@/types/tenant';

/**
 * Configuration for tenant resolver
 */
interface TenantResolverConfig {
  /** Junior product domain */
  juniorDomain: string;

  /** Senior product domain */
  seniorDomain: string;

  /** Database adapter for tenant queries */
  db: TenantDatabase;
}

/**
 * Database adapter interface for tenant operations
 * Implement this with your actual database (Convex, Prisma, etc.)
 */
export interface TenantDatabase {
  /** Find tenant by subdomain and tier */
  findTenantBySubdomain(
    subdomain: string,
    tier: ProductTier
  ): Promise<TenantConfig | null>;

  /** Find tenant by ID */
  findTenantById(id: string): Promise<TenantConfig | null>;

  /** Check if subdomain is taken */
  isSubdomainTaken(subdomain: string, tier: ProductTier): Promise<boolean>;

  /** Create a new tenant reservation */
  createTenant(tenant: Omit<TenantConfig, 'id'>): Promise<TenantConfig>;

  /** Update tenant */
  updateTenant(
    id: string,
    updates: Partial<TenantConfig>
  ): Promise<TenantConfig>;

  /** Find tenants by parent user ID */
  findTenantsByParentId(parentUserId: string): Promise<TenantConfig[]>;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: TenantResolverConfig = {
  juniorDomain: '8gentjr.com',
  seniorDomain: '8gent.app',
  db: null as unknown as TenantDatabase, // Must be provided
};

/**
 * Singleton tenant resolver instance
 */
let resolverInstance: TenantResolver | null = null;

/**
 * Main Tenant Resolver class
 */
export class TenantResolver {
  private config: TenantResolverConfig;

  constructor(config: Partial<TenantResolverConfig> & { db: TenantDatabase }) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the tenant resolver singleton
   */
  static initialize(
    config: Partial<TenantResolverConfig> & { db: TenantDatabase }
  ): TenantResolver {
    resolverInstance = new TenantResolver(config);
    return resolverInstance;
  }

  /**
   * Get the tenant resolver instance
   */
  static getInstance(): TenantResolver {
    if (!resolverInstance) {
      throw new Error(
        'TenantResolver not initialized. Call TenantResolver.initialize() first.'
      );
    }
    return resolverInstance;
  }

  /**
   * Parse hostname to extract subdomain and determine product tier
   */
  parseHostname(hostname: string): {
    subdomain: string | null;
    tier: ProductTier | null;
    isRootDomain: boolean;
  } {
    // Remove port if present
    const cleanHost = hostname.split(':')[0].toLowerCase();

    // Check junior domain
    if (cleanHost.endsWith(this.config.juniorDomain)) {
      const subdomain = cleanHost.replace(`.${this.config.juniorDomain}`, '');

      // Root domain (no subdomain)
      if (subdomain === cleanHost || subdomain === '') {
        return { subdomain: null, tier: 'junior', isRootDomain: true };
      }

      return { subdomain, tier: 'junior', isRootDomain: false };
    }

    // Check senior domain
    if (cleanHost.endsWith(this.config.seniorDomain)) {
      const subdomain = cleanHost.replace(`.${this.config.seniorDomain}`, '');

      // Root domain (no subdomain)
      if (subdomain === cleanHost || subdomain === '') {
        return { subdomain: null, tier: 'senior', isRootDomain: true };
      }

      return { subdomain, tier: 'senior', isRootDomain: false };
    }

    // Development/localhost handling
    if (
      cleanHost.includes('localhost') ||
      cleanHost.includes('127.0.0.1') ||
      cleanHost.includes('.local')
    ) {
      // Check for subdomain in localhost (e.g., nick.localhost:3000)
      const parts = cleanHost.split('.');
      if (parts.length > 1 && parts[0] !== 'www') {
        // Default to junior for local development
        return { subdomain: parts[0], tier: 'junior', isRootDomain: false };
      }
      return { subdomain: null, tier: 'junior', isRootDomain: true };
    }

    // Unknown domain
    return { subdomain: null, tier: null, isRootDomain: true };
  }

  /**
   * Resolve tenant from request hostname
   */
  async resolveTenant(hostname: string): Promise<TenantResolution> {
    const { subdomain, tier, isRootDomain } = this.parseHostname(hostname);

    // Root domain - marketing/login page
    if (isRootDomain || !subdomain) {
      return {
        isTenant: false,
        isRootDomain: true,
      };
    }

    // Invalid tier
    if (!tier) {
      return {
        isTenant: false,
        isRootDomain: false,
        subdomain,
        redirectTo: `https://${this.config.juniorDomain}`,
      };
    }

    // Look up tenant
    const tenant = await this.config.db.findTenantBySubdomain(subdomain, tier);

    // Tenant not found
    if (!tenant) {
      return {
        isTenant: false,
        isRootDomain: false,
        subdomain,
        redirectTo: `https://${this.config.juniorDomain}`,
      };
    }

    // Check tenant status
    if (tenant.status === 'suspended' || tenant.status === 'deactivated') {
      return {
        isTenant: false,
        isRootDomain: false,
        subdomain,
        tenant,
        redirectTo: `https://${this.config.juniorDomain}/suspended`,
      };
    }

    // Handle migrated tenant - redirect to senior
    if (tenant.status === 'migrated' && tenant.seniorSubdomain) {
      return {
        isTenant: false,
        isRootDomain: false,
        subdomain,
        tenant,
        redirectTo: `https://${tenant.seniorSubdomain}.${this.config.seniorDomain}`,
      };
    }

    // Valid tenant
    return {
      isTenant: true,
      isRootDomain: false,
      subdomain,
      tenant,
    };
  }

  /**
   * Check if a subdomain is available
   */
  async checkSubdomainAvailability(
    subdomain: string,
    tier: ProductTier = 'junior'
  ): Promise<boolean> {
    // Normalize subdomain
    const normalized = subdomain.toLowerCase().trim();

    // Check database
    const isTaken = await this.config.db.isSubdomainTaken(normalized, tier);

    return !isTaken;
  }

  /**
   * Reserve a subdomain during onboarding
   */
  async reserveSubdomain(
    subdomain: string,
    userId: string,
    parentUserId: string,
    displayName: string,
    dateOfBirth: Date,
    preferences?: TenantPreferences
  ): Promise<TenantConfig> {
    const normalized = subdomain.toLowerCase().trim();

    // Calculate graduation date (16th birthday)
    const graduationDate = new Date(dateOfBirth);
    graduationDate.setFullYear(graduationDate.getFullYear() + 16);

    const tenant: Omit<TenantConfig, 'id'> = {
      subdomain: normalized,
      userId,
      parentUserId,
      displayName,
      dateOfBirth,
      mode: 'kid',
      productTier: 'junior',
      status: 'reserved',
      createdAt: new Date(),
      updatedAt: new Date(),
      graduationDate,
      preferences,
    };

    const created = await this.config.db.createTenant(tenant);

    return created;
  }

  /**
   * Activate a reserved tenant
   */
  async activateTenant(tenantId: string): Promise<TenantConfig> {
    return this.config.db.updateTenant(tenantId, {
      status: 'active',
      updatedAt: new Date(),
    });
  }

  /**
   * Suspend a tenant
   */
  async suspendTenant(
    tenantId: string,
    reason?: string
  ): Promise<TenantConfig> {
    return this.config.db.updateTenant(tenantId, {
      status: 'suspended',
      updatedAt: new Date(),
    });
  }

  /**
   * Deactivate a tenant (soft delete)
   */
  async deactivateTenant(tenantId: string): Promise<TenantConfig> {
    return this.config.db.updateTenant(tenantId, {
      status: 'deactivated',
      updatedAt: new Date(),
    });
  }

  /**
   * Get all child tenants for a parent
   */
  async getChildTenants(parentUserId: string): Promise<TenantConfig[]> {
    return this.config.db.findTenantsByParentId(parentUserId);
  }

  /**
   * Build the full URL for a tenant
   */
  buildTenantUrl(subdomain: string, tier: ProductTier = 'junior'): string {
    const domain =
      tier === 'junior' ? this.config.juniorDomain : this.config.seniorDomain;
    return `https://${subdomain}.${domain}`;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string): Promise<TenantConfig | null> {
    return this.config.db.findTenantById(id);
  }

  /**
   * Update tenant preferences
   */
  async updateTenantPreferences(
    tenantId: string,
    preferences: Partial<TenantPreferences>
  ): Promise<TenantConfig> {
    const tenant = await this.config.db.findTenantById(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return this.config.db.updateTenant(tenantId, {
      preferences: { ...tenant.preferences, ...preferences },
      updatedAt: new Date(),
    });
  }
}

/**
 * Convenience function to resolve tenant from hostname
 */
export async function resolveTenant(
  hostname: string
): Promise<TenantConfig | null> {
  const resolver = TenantResolver.getInstance();
  const resolution = await resolver.resolveTenant(hostname);
  return resolution.tenant || null;
}

/**
 * Convenience function to check subdomain availability
 */
export async function checkSubdomainAvailability(
  subdomain: string
): Promise<boolean> {
  const resolver = TenantResolver.getInstance();
  return resolver.checkSubdomainAvailability(subdomain);
}

/**
 * Convenience function to reserve subdomain
 */
export async function reserveSubdomain(
  subdomain: string,
  userId: string,
  parentUserId: string,
  displayName: string,
  dateOfBirth: Date,
  preferences?: TenantPreferences
): Promise<TenantConfig> {
  const resolver = TenantResolver.getInstance();
  return resolver.reserveSubdomain(
    subdomain,
    userId,
    parentUserId,
    displayName,
    dateOfBirth,
    preferences
  );
}

export default TenantResolver;
