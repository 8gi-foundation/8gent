import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Helper: get the current authenticated user from the DB.
 */
async function getCurrentUser(ctx: { auth: { getUserIdentity: () => Promise<any> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();
}

/**
 * Get the current user's role for a tenant.
 * Returns the role string or null if not a member.
 */
export const getRole = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const membership = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", user._id)
      )
      .first();

    return membership?.role ?? null;
  },
});

/**
 * Add a member to a tenant.
 * Only owners can add members.
 * Jr tenants (mode: "kid") allow "child" role.
 * OS tenants (mode: "adult") allow "visitor" role.
 */
export const addMember = mutation({
  args: {
    tenantId: v.id("tenants"),
    userId: v.id("users"),
    role: v.union(v.literal("child"), v.literal("visitor")),
  },
  handler: async (ctx, { tenantId, userId, role }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Not authenticated");

    // Verify caller is an owner of this tenant
    const callerMembership = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", currentUser._id)
      )
      .first();

    if (!callerMembership || callerMembership.role !== "owner") {
      throw new Error("Only owners can add members");
    }

    // Validate role against tenant mode
    const tenant = await ctx.db.get(tenantId);
    if (!tenant) throw new Error("Tenant not found");

    if (tenant.mode === "kid" && role === "visitor") {
      throw new Error("Jr accounts only support 'child' role");
    }
    if (tenant.mode === "adult" && role === "child") {
      throw new Error("OS accounts only support 'visitor' role");
    }

    // Check if already a member
    const existing = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", userId)
      )
      .first();

    if (existing) {
      throw new Error("User is already a member of this tenant");
    }

    // Verify target user exists
    const targetUser = await ctx.db.get(userId);
    if (!targetUser) throw new Error("User not found");

    const memberId = await ctx.db.insert("tenantMembers", {
      tenantId,
      userId,
      role,
      createdAt: Date.now(),
    });

    return memberId;
  },
});

/**
 * Remove a member from a tenant.
 * Only owners can remove members. Owners cannot remove themselves.
 */
export const removeMember = mutation({
  args: {
    tenantId: v.id("tenants"),
    userId: v.id("users"),
  },
  handler: async (ctx, { tenantId, userId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Not authenticated");

    // Verify caller is an owner
    const callerMembership = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", currentUser._id)
      )
      .first();

    if (!callerMembership || callerMembership.role !== "owner") {
      throw new Error("Only owners can remove members");
    }

    // Find the membership to remove
    const membership = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", userId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member of this tenant");
    }

    if (membership.role === "owner") {
      throw new Error("Cannot remove the owner");
    }

    await ctx.db.delete(membership._id);
    return { success: true };
  },
});

/**
 * List all members of a tenant.
 * Any member can view the member list.
 */
export const listMembers = query({
  args: { tenantId: v.id("tenants") },
  handler: async (ctx, { tenantId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // Verify caller is a member
    const callerMembership = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant_user", (q: any) =>
        q.eq("tenantId", tenantId).eq("userId", currentUser._id)
      )
      .first();

    if (!callerMembership) return [];

    // Get all memberships
    const memberships = await ctx.db
      .query("tenantMembers")
      .withIndex("by_tenant", (q: any) => q.eq("tenantId", tenantId))
      .collect();

    // Enrich with user data
    const members = await Promise.all(
      memberships.map(async (m: any) => {
        const user = await ctx.db.get(m.userId) as any;
        return {
          _id: m._id,
          userId: m.userId,
          role: m.role,
          createdAt: m.createdAt,
          user: user
            ? {
                name: user.name,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
              }
            : null,
        };
      })
    );

    return members;
  },
});
