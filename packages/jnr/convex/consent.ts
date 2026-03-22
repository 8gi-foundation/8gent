import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Current privacy policy version — bump when policy changes
const CURRENT_POLICY_VERSION = "1.0.0";

// These consent types MUST be granted before a tenant can be used
const REQUIRED_CONSENTS = ["data_processing", "health_data"] as const;

/**
 * Grant a consent record.
 * Creates a new immutable record — never overwrites previous ones.
 */
export const grantConsent = mutation({
  args: {
    tenantId: v.id("tenants"),
    consentType: v.union(
      v.literal("data_processing"),
      v.literal("health_data"),
      v.literal("personalization"),
      v.literal("analytics")
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the user owns this tenant
    const tenant = await ctx.db.get(args.tenantId);
    if (!tenant || (tenant.ownerId !== user._id && tenant.parentId !== user._id)) {
      throw new Error("Not authorized");
    }

    const now = Date.now();

    const recordId = await ctx.db.insert("consentRecords", {
      userId: user._id,
      tenantId: args.tenantId,
      consentType: args.consentType,
      granted: true,
      grantedAt: now,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      version: CURRENT_POLICY_VERSION,
    });

    return { recordId, version: CURRENT_POLICY_VERSION };
  },
});

/**
 * Grant multiple consents at once (used during onboarding).
 */
export const grantConsents = mutation({
  args: {
    tenantId: v.id("tenants"),
    consentTypes: v.array(
      v.union(
        v.literal("data_processing"),
        v.literal("health_data"),
        v.literal("personalization"),
        v.literal("analytics")
      )
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const tenant = await ctx.db.get(args.tenantId);
    if (!tenant || (tenant.ownerId !== user._id && tenant.parentId !== user._id)) {
      throw new Error("Not authorized");
    }

    const now = Date.now();
    const records = [];

    for (const consentType of args.consentTypes) {
      const recordId = await ctx.db.insert("consentRecords", {
        userId: user._id,
        tenantId: args.tenantId,
        consentType,
        granted: true,
        grantedAt: now,
        ipAddress: args.ipAddress,
        userAgent: args.userAgent,
        version: CURRENT_POLICY_VERSION,
      });
      records.push({ recordId, consentType });
    }

    return { records, version: CURRENT_POLICY_VERSION };
  },
});

/**
 * Withdraw consent. Does NOT delete the record — creates a withdrawal timestamp.
 * The original grant record remains for audit trail (GDPR Article 7(1)).
 */
export const withdrawConsent = mutation({
  args: {
    tenantId: v.id("tenants"),
    consentType: v.union(
      v.literal("data_processing"),
      v.literal("health_data"),
      v.literal("personalization"),
      v.literal("analytics")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Find the most recent active consent of this type
    const consents = await ctx.db
      .query("consentRecords")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("consentType", args.consentType)
      )
      .collect();

    // Find the latest granted, non-withdrawn consent for this tenant
    const activeConsent = consents
      .filter(
        (c) =>
          c.tenantId === args.tenantId &&
          c.granted &&
          !c.withdrawnAt
      )
      .sort((a, b) => b.grantedAt - a.grantedAt)[0];

    if (!activeConsent) {
      throw new Error("No active consent found to withdraw");
    }

    await ctx.db.patch(activeConsent._id, {
      withdrawnAt: Date.now(),
    });

    return { withdrawn: true, consentType: args.consentType };
  },
});

/**
 * Get all consent records for a user+tenant pair.
 * Returns full audit trail including withdrawn consents.
 */
export const getConsents = query({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    const allConsents = await ctx.db
      .query("consentRecords")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return allConsents
      .filter((c) => c.tenantId === args.tenantId)
      .sort((a, b) => b.grantedAt - a.grantedAt);
  },
});

/**
 * Check if a user has all required active consents for a tenant.
 * Required: data_processing + health_data (both must be granted and not withdrawn).
 */
export const hasRequiredConsents = query({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasAll: false, missing: [...REQUIRED_CONSENTS] };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return { hasAll: false, missing: [...REQUIRED_CONSENTS] };
    }

    const allConsents = await ctx.db
      .query("consentRecords")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const tenantConsents = allConsents.filter(
      (c) => c.tenantId === args.tenantId
    );

    const missing: string[] = [];

    for (const required of REQUIRED_CONSENTS) {
      const hasActive = tenantConsents.some(
        (c) => c.consentType === required && c.granted && !c.withdrawnAt
      );
      if (!hasActive) {
        missing.push(required);
      }
    }

    return { hasAll: missing.length === 0, missing };
  },
});
