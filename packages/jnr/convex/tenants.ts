import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Check if a subdomain is available
 */
export const checkSubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, { subdomain }) => {
    // Normalize subdomain
    const normalized = subdomain.toLowerCase().trim();

    // Reserved subdomains
    const reserved = [
      "www",
      "app",
      "api",
      "admin",
      "dashboard",
      "help",
      "support",
      "blog",
      "docs",
      "status",
      "mail",
      "test",
      "staging",
      "dev",
    ];

    if (reserved.includes(normalized)) {
      return { available: false, reason: "reserved" };
    }

    // Check if already taken
    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", normalized))
      .first();

    if (existing) {
      return { available: false, reason: "taken" };
    }

    return { available: true };
  },
});

/**
 * Generate subdomain suggestions from a name
 */
export const suggestSubdomains = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    // Generate base suggestions
    const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const suggestions = [
      baseName,
      `${baseName}s-board`,
      `${baseName}-aac`,
      `${baseName}123`,
      `my${baseName}`,
    ];

    // Check availability for each
    const results = await Promise.all(
      suggestions.map(async (subdomain) => {
        const existing = await ctx.db
          .query("tenants")
          .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
          .first();
        return {
          subdomain,
          available: !existing,
        };
      })
    );

    return results;
  },
});

/**
 * Create a new tenant
 */
export const create = mutation({
  args: {
    subdomain: v.string(),
    displayName: v.string(),
    mode: v.union(v.literal("kid"), v.literal("adult")),
    dateOfBirth: v.optional(v.number()),
    preferences: v.optional(
      v.object({
        themeColor: v.optional(v.string()),
        voiceId: v.optional(v.string()),
        ttsRate: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get user from auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Find or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      // Create user
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        username: args.subdomain,
        email: identity.email || "",
        name: identity.name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Check subdomain availability
    const normalized = args.subdomain.toLowerCase().trim();
    const existing = await ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", normalized))
      .first();

    if (existing) {
      throw new Error("Subdomain already taken");
    }

    // Get latest card pack version
    const latestPack = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_latest", (q) => q.eq("isLatest", true))
      .first();

    const cardPackVersion = latestPack?.version || "1.0.0";

    // Create tenant
    const tenantId = await ctx.db.insert("tenants", {
      subdomain: normalized,
      ownerId: user._id,
      displayName: args.displayName,
      dateOfBirth: args.dateOfBirth,
      mode: args.mode,
      status: "active",
      preferences: args.preferences,
      cardPackVersion,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create owner membership
    await ctx.db.insert("tenantMembers", {
      tenantId,
      userId: user._id,
      role: "owner",
      createdAt: Date.now(),
    });

    // Initialize empty userCards for tenant
    await ctx.db.insert("userCards", {
      tenantId,
      cards: [],
      favorites: [],
      recentlyUsed: [],
      updatedAt: Date.now(),
    });

    return { tenantId, subdomain: normalized };
  },
});

/**
 * Get tenant by subdomain
 */
export const getBySubdomain = query({
  args: { subdomain: v.string() },
  handler: async (ctx, { subdomain }) => {
    const normalized = subdomain.toLowerCase().trim();

    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", normalized))
      .first();

    if (!tenant || tenant.status !== "active") {
      return null;
    }

    return tenant;
  },
});

/**
 * Get tenant by ID
 */
export const get = query({
  args: { id: v.id("tenants") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Get all tenants for current user (parent)
 */
export const listForUser = query({
  args: {},
  handler: async (ctx) => {
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

    // Get tenants owned by user
    const ownedTenants = await ctx.db
      .query("tenants")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Get tenants where user is parent
    const parentTenants = await ctx.db
      .query("tenants")
      .withIndex("by_parent", (q) => q.eq("parentId", user._id))
      .collect();

    return [...ownedTenants, ...parentTenants];
  },
});

/**
 * Update tenant preferences
 */
export const updatePreferences = mutation({
  args: {
    tenantId: v.id("tenants"),
    preferences: v.object({
      themeColor: v.optional(v.string()),
      voiceId: v.optional(v.string()),
      ttsRate: v.optional(v.number()),
      cardSize: v.optional(v.union(v.literal("small"), v.literal("medium"), v.literal("large"))),
      showLabels: v.optional(v.boolean()),
      enableAnimations: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { tenantId, preferences }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tenant = await ctx.db.get(tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (tenant.ownerId !== user._id && tenant.parentId !== user._id)) {
      throw new Error("Not authorized");
    }

    // Merge preferences
    const updatedPreferences = {
      ...tenant.preferences,
      ...preferences,
    };

    await ctx.db.patch(tenantId, {
      preferences: updatedPreferences,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
