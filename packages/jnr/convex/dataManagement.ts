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

/** Required consent types for reading child data in reports */
const REPORT_CONSENTS = ["data_processing", "health_data"] as const;

/** Helper: check active consent for read-only queries */
async function hasActiveConsentForQuery(
  ctx: { db: any },
  tenantId: any
): Promise<boolean> {
  const tenant = await ctx.db.get(tenantId);
  if (!tenant) return false;

  const allConsents = await ctx.db
    .query("consentRecords")
    .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
    .collect();

  for (const required of REPORT_CONSENTS) {
    const hasActive = allConsents.some(
      (c: any) =>
        c.consentType === required &&
        c.granted &&
        !c.withdrawnAt
    );
    if (!hasActive) return false;
  }
  return true;
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
 * Generate aggregated therapist report — communication progress metrics.
 * GDPR: Owner-only access + active consent required.
 * Returns anonymized aggregates, not raw sentences.
 */
export const generateTherapistReport = query({
  args: {
    tenantId: v.id("tenants"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { tenantId, startDate, endDate }) => {
    // Owner-only access
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", user._id)
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only the account owner can access therapist reports");
    }

    // Consent gate — no report without active consent
    if (!(await hasActiveConsentForQuery(ctx, tenantId))) {
      throw new Error("Active data processing consent required for reports");
    }

    // Fetch sentences in date range
    const allSentences = await ctx.db
      .query("sentenceHistory")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    const sentences = allSentences.filter(
      (s: any) => s.spokenAt >= startDate && s.spokenAt <= endDate
    );

    if (sentences.length === 0) {
      return {
        totalSentences: 0,
        uniqueWords: 0,
        avgSentenceLength: 0,
        dailyBreakdown: [],
        topWords: [],
        vocabularyGrowth: 0,
      };
    }

    // Word frequency analysis
    const wordCounts: Record<string, number> = {};
    let totalWords = 0;

    for (const s of sentences) {
      const words = s.sentence.toLowerCase().split(/\s+/).filter(Boolean);
      totalWords += words.length;
      for (const w of words) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    }

    const uniqueWords = Object.keys(wordCounts).length;
    const avgSentenceLength = totalWords / sentences.length;

    // Top words (top 20)
    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // Daily breakdown
    const dailyMap: Record<string, { count: number; totalWords: number }> = {};

    for (const s of sentences) {
      const dateKey = new Date(s.spokenAt).toISOString().split("T")[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { count: 0, totalWords: 0 };
      }
      dailyMap[dateKey].count += 1;
      dailyMap[dateKey].totalWords += s.sentence.split(/\s+/).filter(Boolean).length;
    }

    const dailyBreakdown = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        count: data.count,
        avgLength: Math.round((data.totalWords / data.count) * 10) / 10,
      }));

    // Vocabulary growth: unique words in last half vs first half of period
    const midpoint = startDate + (endDate - startDate) / 2;
    const firstHalfWords = new Set<string>();
    const secondHalfWords = new Set<string>();

    for (const s of sentences) {
      const words = s.sentence.toLowerCase().split(/\s+/).filter(Boolean);
      const target = s.spokenAt < midpoint ? firstHalfWords : secondHalfWords;
      for (const w of words) target.add(w);
    }

    const vocabularyGrowth = secondHalfWords.size - firstHalfWords.size;

    return {
      totalSentences: sentences.length,
      uniqueWords,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      dailyBreakdown,
      topWords,
      vocabularyGrowth,
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
