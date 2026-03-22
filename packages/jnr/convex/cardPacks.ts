import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Required consent types that must be active before storing child data
const REQUIRED_CONSENTS = ["data_processing", "health_data"] as const;

/**
 * Server-side consent gate.
 * Returns true only if ALL required consents are active (granted + not withdrawn)
 * for the given tenant. This MUST be checked before any mutation that stores
 * child-related data.
 */
async function hasActiveConsent(
  ctx: MutationCtx,
  tenantId: Id<"tenants">
): Promise<boolean> {
  const tenant = await ctx.db.get(tenantId);
  if (!tenant) return false;

  // Find the owner/parent user for this tenant
  const ownerId = tenant.parentId ?? tenant.ownerId;
  if (!ownerId) return false;

  const allConsents = await ctx.db
    .query("consentRecords")
    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
    .collect();

  for (const required of REQUIRED_CONSENTS) {
    const hasActive = allConsents.some(
      (c) =>
        c.consentType === required &&
        c.granted &&
        !c.withdrawnAt
    );
    if (!hasActive) return false;
  }
  return true;
}

// Card schema for validation
const cardSchema = v.object({
  id: v.string(),
  label: v.string(),
  speechText: v.string(),
  imageUrl: v.string(),
  categoryId: v.string(),
  arasaacId: v.optional(v.number()),
  glpStage: v.optional(v.number()),
  tags: v.optional(v.array(v.string())),
});

/**
 * Get the latest default card pack
 */
export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const pack = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_latest", (q) => q.eq("isLatest", true))
      .first();

    return pack;
  },
});

/**
 * Get a specific card pack version
 */
export const getByVersion = query({
  args: { version: v.string() },
  handler: async (ctx, { version }) => {
    const pack = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_version", (q) => q.eq("version", version))
      .first();

    return pack;
  },
});

/**
 * Get cards for a specific tenant (merged: default + custom - hidden)
 */
export const getCardsForTenant = query({
  args: { subdomain: v.string() },
  handler: async (ctx, { subdomain }) => {
    // Get tenant
    const tenant = await ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain.toLowerCase()))
      .first();

    if (!tenant) {
      return null;
    }

    // Get default card pack (latest)
    const defaultPack = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_latest", (q) => q.eq("isLatest", true))
      .first();

    // Get user cards for this tenant
    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
      .first();

    // Get hidden cards
    const hiddenIds = new Set(userCards?.hiddenCards || []);

    // Filter out hidden cards from default pack
    const defaultCards = (defaultPack?.cards || []).filter(
      (card) => !hiddenIds.has(card.id)
    );

    // Merge with custom cards
    const customCards = userCards?.cards || [];

    return {
      defaultCards,
      customCards,
      favorites: userCards?.favorites || [],
      recentlyUsed: userCards?.recentlyUsed || [],
      packVersion: defaultPack?.version || "1.0.0",
      tenantId: tenant._id,
    };
  },
});

/**
 * Publish a new card pack version (admin only)
 */
export const publishCardPack = mutation({
  args: {
    version: v.string(),
    cards: v.array(cardSchema),
    changelog: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Add admin check here
    // For now, any authenticated user can publish (dev mode)

    // Check version doesn't exist
    const existing = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_version", (q) => q.eq("version", args.version))
      .first();

    if (existing) {
      throw new Error(`Version ${args.version} already exists`);
    }

    // Unset current latest
    const currentLatest = await ctx.db
      .query("defaultCardPack")
      .withIndex("by_latest", (q) => q.eq("isLatest", true))
      .first();

    if (currentLatest) {
      await ctx.db.patch(currentLatest._id, { isLatest: false });
    }

    // Create new version
    const packId = await ctx.db.insert("defaultCardPack", {
      version: args.version,
      cards: args.cards,
      changelog: args.changelog,
      isLatest: true,
      publishedBy: user._id,
      createdAt: Date.now(),
    });

    return { packId, version: args.version };
  },
});

/**
 * Add a custom card for a tenant
 */
export const addCustomCard = mutation({
  args: {
    tenantId: v.id("tenants"),
    card: v.object({
      id: v.string(),
      label: v.string(),
      speechText: v.string(),
      imageUrl: v.string(),
      categoryId: v.string(),
      arasaacId: v.optional(v.number()),
      generatedBy: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { tenantId, card }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify tenant ownership
    const tenant = await ctx.db.get(tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (tenant.ownerId !== user._id && tenant.parentId !== user._id)) {
      throw new Error("Not authorized");
    }

    // Get or create userCards
    let userCards = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .first();

    if (!userCards) {
      const id = await ctx.db.insert("userCards", {
        tenantId,
        cards: [],
        favorites: [],
        recentlyUsed: [],
        updatedAt: Date.now(),
      });
      userCards = await ctx.db.get(id);
    }

    if (!userCards) {
      throw new Error("Failed to get userCards");
    }

    // Add the custom card
    const customCard = {
      ...card,
      isCustom: true as const,
      createdAt: Date.now(),
    };

    await ctx.db.patch(userCards._id, {
      cards: [...userCards.cards, customCard],
      updatedAt: Date.now(),
    });

    return { success: true, cardId: card.id };
  },
});

/**
 * Toggle card favorite status
 */
export const toggleFavorite = mutation({
  args: {
    tenantId: v.id("tenants"),
    cardId: v.string(),
  },
  handler: async (ctx, { tenantId, cardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get userCards
    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .first();

    if (!userCards) {
      throw new Error("UserCards not found");
    }

    const favorites = userCards.favorites || [];
    const isFavorite = favorites.includes(cardId);

    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== cardId)
      : [...favorites, cardId];

    await ctx.db.patch(userCards._id, {
      favorites: newFavorites,
      updatedAt: Date.now(),
    });

    return { isFavorite: !isFavorite };
  },
});

/**
 * Record card usage (for recently used)
 * CONSENT GATE: Requires active data_processing + health_data consent.
 */
export const recordCardUsage = mutation({
  args: {
    tenantId: v.id("tenants"),
    cardId: v.string(),
  },
  handler: async (ctx, { tenantId, cardId }) => {
    // CONSENT GATE: No consent = no data stored
    if (!(await hasActiveConsent(ctx, tenantId))) {
      return; // Silently skip — no data stored without consent
    }

    // Get userCards
    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .first();

    if (!userCards) {
      return; // Silently fail
    }

    // Update recently used (keep last 20)
    const recentlyUsed = userCards.recentlyUsed || [];
    const filtered = recentlyUsed.filter((id) => id !== cardId);
    const updated = [cardId, ...filtered].slice(0, 20);

    await ctx.db.patch(userCards._id, {
      recentlyUsed: updated,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Hide a default card for a tenant
 */
export const hideCard = mutation({
  args: {
    tenantId: v.id("tenants"),
    cardId: v.string(),
  },
  handler: async (ctx, { tenantId, cardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .first();

    if (!userCards) {
      throw new Error("UserCards not found");
    }

    const hiddenCards = userCards.hiddenCards || [];
    if (!hiddenCards.includes(cardId)) {
      await ctx.db.patch(userCards._id, {
        hiddenCards: [...hiddenCards, cardId],
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Unhide a default card for a tenant
 */
export const unhideCard = mutation({
  args: {
    tenantId: v.id("tenants"),
    cardId: v.string(),
  },
  handler: async (ctx, { tenantId, cardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .first();

    if (!userCards) {
      throw new Error("UserCards not found");
    }

    const hiddenCards = userCards.hiddenCards || [];
    await ctx.db.patch(userCards._id, {
      hiddenCards: hiddenCards.filter((id) => id !== cardId),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Save sentence to history
 * CONSENT GATE: Requires active data_processing + health_data consent.
 */
export const saveSentence = mutation({
  args: {
    tenantId: v.id("tenants"),
    sentence: v.string(),
    cardIds: v.array(v.string()),
  },
  handler: async (ctx, { tenantId, sentence, cardIds }) => {
    // CONSENT GATE: No consent = no data stored
    if (!(await hasActiveConsent(ctx, tenantId))) {
      return { success: false, reason: "consent_required" };
    }

    await ctx.db.insert("sentenceHistory", {
      tenantId,
      sentence,
      cardIds,
      spokenAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get sentence history for a tenant
 */
export const getSentenceHistory = query({
  args: {
    tenantId: v.id("tenants"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { tenantId, limit = 50 }) => {
    const history = await ctx.db
      .query("sentenceHistory")
      .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
      .order("desc")
      .take(limit);

    return history;
  },
});
