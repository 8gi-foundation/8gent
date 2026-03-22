import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Data Management — GDPR Article 17 (Right to Erasure) & Article 20 (Data Portability)
 *
 * Strengthened protections for children's data per GDPR recital 38.
 * Consent records are NEVER deleted (audit trail requirement).
 */

/** Helper: get current authenticated user */
async function getCurrentUser(ctx: { auth: { getUserIdentity: () => Promise<any> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();
}

/** Helper: verify caller is owner of tenant */
async function requireOwner(ctx: { auth: { getUserIdentity: () => Promise<any> }; db: any }, tenantId: any) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");

  const membership = await ctx.db
    .query("tenantMembers")
    .withIndex("by_tenant_user", (q: any) =>
      q.eq("tenantId", tenantId).eq("userId", user._id)
    )
    .first();

  if (!membership || membership.role !== "owner") {
    throw new Error("Only the account owner can perform this action");
  }

  return user;
}

/**
 * Get a summary of all data stored for a tenant.
 * Returns counts of each data type — no PII in the response.
 */
export const getDataSummary = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Verify membership
    const membership = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", user._id)
      )
      .first();
    if (!membership) return null;

    // Count userCards
    const userCardsDoc = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .first();

    const customCardCount = userCardsDoc?.cards?.length ?? 0;
    const favoriteCount = userCardsDoc?.favorites?.length ?? 0;
    const hiddenCardCount = userCardsDoc?.hiddenCards?.length ?? 0;
    const recentlyUsedCount = userCardsDoc?.recentlyUsed?.length ?? 0;

    // Count sentence history
    const sentenceRecords = await ctx.db
      .query("sentenceHistory")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    // Count consent records (for info, never deleted)
    const consentRecords = await ctx.db
      .query("consentRecords")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    return {
      customCards: customCardCount,
      favorites: favoriteCount,
      hiddenCards: hiddenCardCount,
      recentlyUsed: recentlyUsedCount,
      sentenceHistory: sentenceRecords.length,
      consentRecords: consentRecords.length,
    };
  },
});

/**
 * Export all child data as JSON — GDPR Article 20 (data portability).
 * Returns structured data suitable for download.
 */
export const exportChildData = mutation({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const user = await requireOwner(ctx, tenantId);

    const tenant = await ctx.db.get(tenantId);
    if (!tenant) throw new Error("Tenant not found");

    // Gather userCards
    const userCardsDoc = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .first();

    // Gather sentence history
    const sentenceRecords = await ctx.db
      .query("sentenceHistory")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    // Gather consent records (included for transparency)
    const consentRecords = await ctx.db
      .query("consentRecords")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    return {
      exportedAt: new Date().toISOString(),
      exportedBy: user._id,
      gdprArticle: "Article 20 - Right to data portability",
      tenant: {
        displayName: tenant.displayName,
        subdomain: tenant.subdomain,
        mode: tenant.mode,
        preferences: tenant.preferences ?? null,
        createdAt: tenant.createdAt,
      },
      cards: {
        customCards: userCardsDoc?.cards ?? [],
        favorites: userCardsDoc?.favorites ?? [],
        hiddenCards: userCardsDoc?.hiddenCards ?? [],
        recentlyUsed: userCardsDoc?.recentlyUsed ?? [],
      },
      communicationHistory: sentenceRecords.map((s) => ({
        sentence: s.sentence,
        cardIds: s.cardIds,
        spokenAt: new Date(s.spokenAt).toISOString(),
      })),
      consentRecords: consentRecords.map((c) => ({
        type: c.consentType,
        granted: c.granted,
        grantedAt: new Date(c.grantedAt).toISOString(),
        withdrawnAt: c.withdrawnAt ? new Date(c.withdrawnAt).toISOString() : null,
        policyVersion: c.version,
      })),
    };
  },
});

/**
 * Delete all child-specific data — GDPR Article 17 (right to erasure).
 *
 * Deletes:
 *   - userCards (custom cards, favorites, recently used, hidden cards)
 *   - sentenceHistory (all communication patterns)
 *
 * Does NOT delete:
 *   - Tenant record (account structure)
 *   - User account
 *   - Consent records (immutable audit trail — GDPR Article 7(1))
 *
 * Returns:
 *   - Summary of what was deleted
 *   - Instruction to clear client-side localStorage
 */
export const deleteChildData = mutation({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    await requireOwner(ctx, tenantId);

    const tenant = await ctx.db.get(tenantId);
    if (!tenant) throw new Error("Tenant not found");

    let deletedCustomCards = 0;
    let deletedFavorites = 0;
    let deletedSentences = 0;

    // 1. Delete userCards document
    const userCardsDoc = await ctx.db
      .query("userCards")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .first();

    if (userCardsDoc) {
      deletedCustomCards = userCardsDoc.cards?.length ?? 0;
      deletedFavorites = userCardsDoc.favorites?.length ?? 0;
      await ctx.db.delete(userCardsDoc._id);
    }

    // 2. Delete all sentence history records
    const sentenceRecords = await ctx.db
      .query("sentenceHistory")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    for (const record of sentenceRecords) {
      await ctx.db.delete(record._id);
    }
    deletedSentences = sentenceRecords.length;

    // 3. Reset tenant preferences (personalization data)
    await ctx.db.patch(tenantId, {
      preferences: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      deletedAt: new Date().toISOString(),
      summary: {
        customCards: deletedCustomCards,
        favorites: deletedFavorites,
        sentenceHistory: deletedSentences,
        preferencesReset: true,
      },
      // Client must act on this
      clientAction: "CLEAR_LOCAL_STORAGE",
      message: `Deleted ${deletedCustomCards} custom cards, ${deletedFavorites} favorites, and ${deletedSentences} communication records. Tenant preferences reset. Consent records preserved for audit trail.`,
    };
  },
});
