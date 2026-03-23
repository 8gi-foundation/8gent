import { internalMutation } from "./_generated/server";

/**
 * GDPR Data Retention — Auto-purge expired children's data
 *
 * Per DPIA (docs/DPIA.md):
 * - sentenceHistory: 90-day retention, then purge
 * - consentRecords: NEVER deleted (immutable audit trail)
 *
 * Runs daily via cron. Respects tenant isolation.
 */

const RETENTION_DAYS = 90;
const BATCH_SIZE = 100;

export const purgeExpiredData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let totalDeleted = 0;

    // Get all active tenants
    const tenants = await ctx.db.query("tenants").collect();

    for (const tenant of tenants) {
      let tenantDeleted = 0;

      // Query expired records for this tenant using the by_tenant index
      // The index is ["tenantId", "spokenAt"] so we can filter by range
      while (true) {
        const expired = await ctx.db
          .query("sentenceHistory")
          .withIndex("by_tenant", (q) =>
            q.eq("tenantId", tenant._id).lt("spokenAt", cutoff)
          )
          .take(BATCH_SIZE);

        if (expired.length === 0) break;

        for (const record of expired) {
          await ctx.db.delete(record._id);
        }

        tenantDeleted += expired.length;

        // If we got fewer than BATCH_SIZE, no more records to delete
        if (expired.length < BATCH_SIZE) break;
      }

      if (tenantDeleted > 0) {
        console.log(
          `[retention] Purged ${tenantDeleted} expired sentenceHistory records for tenant ${tenant.subdomain} (${tenant._id})`
        );
      }

      totalDeleted += tenantDeleted;
    }

    console.log(
      `[retention] Daily purge complete. Total deleted: ${totalDeleted}. Cutoff: ${new Date(cutoff).toISOString()}`
    );

    return { deleted: totalDeleted, cutoffDate: new Date(cutoff).toISOString() };
  },
});
