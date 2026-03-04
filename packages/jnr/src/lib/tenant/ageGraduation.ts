/**
 * @fileoverview Age Graduation System for 8gent Jr
 *
 * Manages the transition from 8gent Jr (junior) to 8gent (senior)
 * when users turn 16. Handles:
 * - Age tracking and eligibility checking
 * - Data migration (preferences, voice, memories)
 * - Nostalgia mode (keeping junior tenant accessible)
 *
 * @module lib/tenant/ageGraduation
 */

import type {
  TenantConfig,
  GraduationConfig,
  GraduationStatus,
  MigratableData,
  TenantPreferences,
} from '@/types/tenant';
import { TenantResolver, type TenantDatabase } from './tenantResolver';

/**
 * Configuration for the graduation service
 */
interface GraduationServiceConfig {
  /** Minimum age for graduation (default: 16) */
  graduationAge: number;

  /** Days before birthday to show graduation prompt */
  advanceNotificationDays: number;

  /** Database adapter */
  db: GraduationDatabase;

  /** Tenant database for cross-tier operations */
  tenantDb: TenantDatabase;
}

/**
 * Database adapter for graduation operations
 */
export interface GraduationDatabase {
  /** Find graduation config by user ID */
  findGraduationByUserId(userId: string): Promise<GraduationConfig | null>;

  /** Create graduation config */
  createGraduation(
    config: Omit<GraduationConfig, 'status'>
  ): Promise<GraduationConfig>;

  /** Update graduation config */
  updateGraduation(
    userId: string,
    updates: Partial<GraduationConfig>
  ): Promise<GraduationConfig>;

  /** Get user data for migration */
  getUserData(
    userId: string,
    dataType: MigratableData
  ): Promise<Record<string, unknown> | null>;

  /** Migrate data to senior tenant */
  migrateData(
    sourceUserId: string,
    targetUserId: string,
    dataType: MigratableData,
    data: Record<string, unknown>
  ): Promise<boolean>;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: GraduationServiceConfig = {
  graduationAge: 16,
  advanceNotificationDays: 30,
  db: null as unknown as GraduationDatabase,
  tenantDb: null as unknown as TenantDatabase,
};

/**
 * Graduation service singleton
 */
let graduationService: AgeGraduationService | null = null;

/**
 * Age Graduation Service
 *
 * Handles the complete graduation workflow from 8gent Jr to 8gent
 */
export class AgeGraduationService {
  private config: GraduationServiceConfig;

  constructor(
    config: Partial<GraduationServiceConfig> & {
      db: GraduationDatabase;
      tenantDb: TenantDatabase;
    }
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the graduation service singleton
   */
  static initialize(
    config: Partial<GraduationServiceConfig> & {
      db: GraduationDatabase;
      tenantDb: TenantDatabase;
    }
  ): AgeGraduationService {
    graduationService = new AgeGraduationService(config);
    return graduationService;
  }

  /**
   * Get the graduation service instance
   */
  static getInstance(): AgeGraduationService {
    if (!graduationService) {
      throw new Error(
        'AgeGraduationService not initialized. Call AgeGraduationService.initialize() first.'
      );
    }
    return graduationService;
  }

  /**
   * Calculate user's current age from date of birth
   */
  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Calculate days until user's next birthday
   */
  daysUntilBirthday(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    // Set birthday to this year
    const nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    // If birthday has passed this year, use next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if user is eligible for graduation
   */
  async checkGraduationEligibility(userId: string): Promise<GraduationConfig> {
    // Get existing graduation config
    let config = await this.config.db.findGraduationByUserId(userId);

    // Get tenant to find DOB
    const tenants = await this.config.tenantDb.findTenantsByParentId(userId);
    const tenant = tenants.find(
      (t) => t.userId === userId && t.productTier === 'junior'
    );

    if (!tenant) {
      // Try finding tenant where user is the child
      const childTenant = await this.config.tenantDb.findTenantBySubdomain(
        '',
        'junior'
      );
      if (!childTenant || childTenant.userId !== userId) {
        throw new Error('Tenant not found for user');
      }
    }

    const dateOfBirth = tenant?.dateOfBirth || new Date();
    const age = this.calculateAge(dateOfBirth);
    const daysUntil = this.daysUntilBirthday(dateOfBirth);

    // Calculate eligibility
    const eligibleAt = new Date(dateOfBirth);
    eligibleAt.setFullYear(
      eligibleAt.getFullYear() + this.config.graduationAge
    );

    let status: GraduationStatus = 'not-eligible';

    if (age >= this.config.graduationAge) {
      status = config?.status === 'completed' ? 'completed' : 'eligible';
    } else if (
      age === this.config.graduationAge - 1 &&
      daysUntil <= this.config.advanceNotificationDays
    ) {
      // Upcoming birthday - show advance notification
      status = config?.status === 'completed' ? 'completed' : 'not-eligible';
    }

    // If in-progress, maintain that status
    if (config?.status === 'in-progress') {
      status = 'in-progress';
    }

    // Create or update config
    if (!config) {
      config = await this.config.db.createGraduation({
        userId,
        tenantId: tenant?.id || '',
        eligibleAt,
        seniorSubdomain: config?.seniorSubdomain,
        migratedData: config?.migratedData,
        initiatedAt: config?.initiatedAt,
        completedAt: config?.completedAt,
      });
    }

    // Update status if changed
    if (config.status !== status) {
      config = await this.config.db.updateGraduation(userId, { status });
    }

    return {
      ...config,
      status,
      eligibleAt,
    };
  }

  /**
   * Initiate the graduation process
   */
  async initiateGraduation(userId: string): Promise<GraduationConfig> {
    const config = await this.checkGraduationEligibility(userId);

    if (config.status !== 'eligible') {
      throw new Error(
        `Cannot initiate graduation: current status is ${config.status}`
      );
    }

    return this.config.db.updateGraduation(userId, {
      status: 'in-progress',
      initiatedAt: new Date(),
    });
  }

  /**
   * Reserve senior subdomain for graduated user
   */
  async reserveSeniorSubdomain(
    userId: string,
    subdomain: string
  ): Promise<GraduationConfig> {
    const config = await this.config.db.findGraduationByUserId(userId);

    if (!config || config.status !== 'in-progress') {
      throw new Error('Graduation must be in-progress to reserve subdomain');
    }

    // Check availability in senior tier
    const tenantResolver = TenantResolver.getInstance();
    const isAvailable = await tenantResolver.checkSubdomainAvailability(
      subdomain,
      'senior'
    );

    if (!isAvailable) {
      throw new Error('Subdomain is not available');
    }

    return this.config.db.updateGraduation(userId, {
      seniorSubdomain: subdomain,
    });
  }

  /**
   * Migrate specific data type to senior tenant
   */
  async migrateDataType(
    userId: string,
    dataType: MigratableData
  ): Promise<boolean> {
    const config = await this.config.db.findGraduationByUserId(userId);

    if (!config || config.status !== 'in-progress') {
      throw new Error('Graduation must be in-progress to migrate data');
    }

    if (!config.seniorSubdomain) {
      throw new Error('Senior subdomain must be reserved before migration');
    }

    // Get data from junior tenant
    const data = await this.config.db.getUserData(userId, dataType);

    if (!data) {
      console.warn(`No ${dataType} data found for user ${userId}`);
      return true; // No data to migrate is still success
    }

    // Migrate to senior tenant
    const success = await this.config.db.migrateData(
      userId,
      config.seniorSubdomain,
      dataType,
      data
    );

    if (success) {
      const migratedData = [...(config.migratedData || []), dataType];
      await this.config.db.updateGraduation(userId, { migratedData });
    }

    return success;
  }

  /**
   * Migrate all data types
   */
  async migrateAllData(userId: string): Promise<MigratableData[]> {
    const allDataTypes: MigratableData[] = [
      'preferences',
      'voice',
      'memories',
      'aac-cards',
      'conversations',
      'achievements',
    ];

    const migrated: MigratableData[] = [];

    for (const dataType of allDataTypes) {
      try {
        const success = await this.migrateDataType(userId, dataType);
        if (success) {
          migrated.push(dataType);
        }
      } catch (error) {
        console.error(`Failed to migrate ${dataType}:`, error);
        // Continue with other data types
      }
    }

    return migrated;
  }

  /**
   * Complete the graduation process
   */
  async completeGraduation(
    userId: string,
    seniorSubdomain: string
  ): Promise<void> {
    const config = await this.config.db.findGraduationByUserId(userId);

    if (!config || config.status !== 'in-progress') {
      throw new Error('Graduation must be in-progress to complete');
    }

    // Ensure subdomain is set
    if (config.seniorSubdomain !== seniorSubdomain) {
      await this.config.db.updateGraduation(userId, {
        seniorSubdomain,
      });
    }

    // Get junior tenant
    const tenants = await this.config.tenantDb.findTenantsByParentId(userId);
    const juniorTenant = tenants.find(
      (t) => t.userId === userId && t.productTier === 'junior'
    );

    if (juniorTenant) {
      // Mark junior tenant as migrated (for nostalgia mode)
      await this.config.tenantDb.updateTenant(juniorTenant.id, {
        status: 'migrated',
        seniorSubdomain,
        updatedAt: new Date(),
      });
    }

    // Create senior tenant
    const tenantResolver = TenantResolver.getInstance();
    await tenantResolver.reserveSubdomain(
      seniorSubdomain,
      userId,
      juniorTenant?.parentUserId || userId,
      juniorTenant?.displayName || 'User',
      juniorTenant?.dateOfBirth || new Date(),
      juniorTenant?.preferences
    );

    // Update graduation config
    await this.config.db.updateGraduation(userId, {
      status: 'completed',
      completedAt: new Date(),
    });
  }

  /**
   * Enable nostalgia mode - access to old junior tenant
   *
   * After graduation, users can still access their junior tenant
   * in a read-only "nostalgia mode" to revisit their old memories
   */
  async getNostalgiaAccess(userId: string): Promise<TenantConfig | null> {
    const config = await this.config.db.findGraduationByUserId(userId);

    if (!config || config.status !== 'completed') {
      return null;
    }

    // Find the migrated junior tenant
    const tenants = await this.config.tenantDb.findTenantsByParentId(userId);
    const juniorTenant = tenants.find(
      (t) =>
        t.userId === userId &&
        t.productTier === 'junior' &&
        t.status === 'migrated'
    );

    return juniorTenant || null;
  }

  /**
   * Get graduation progress percentage
   */
  async getGraduationProgress(userId: string): Promise<number> {
    const config = await this.config.db.findGraduationByUserId(userId);

    if (!config) return 0;

    const allSteps = [
      'initiated',
      'subdomain-reserved',
      'preferences-migrated',
      'voice-migrated',
      'memories-migrated',
      'aac-cards-migrated',
      'conversations-migrated',
      'achievements-migrated',
      'completed',
    ];

    let completedSteps = 0;

    if (config.initiatedAt) completedSteps++;
    if (config.seniorSubdomain) completedSteps++;

    const migratedData = config.migratedData || [];
    completedSteps += migratedData.length;

    if (config.status === 'completed') completedSteps = allSteps.length;

    return Math.round((completedSteps / allSteps.length) * 100);
  }
}

/**
 * Convenience function to check graduation eligibility
 */
export async function checkGraduationEligibility(
  userId: string
): Promise<GraduationConfig> {
  const service = AgeGraduationService.getInstance();
  return service.checkGraduationEligibility(userId);
}

/**
 * Convenience function to initiate graduation
 */
export async function initiateGraduation(userId: string): Promise<void> {
  const service = AgeGraduationService.getInstance();
  await service.initiateGraduation(userId);
}

/**
 * Convenience function to complete graduation
 */
export async function completeGraduation(
  userId: string,
  seniorSubdomain: string
): Promise<void> {
  const service = AgeGraduationService.getInstance();
  await service.completeGraduation(userId, seniorSubdomain);
}

export default AgeGraduationService;
