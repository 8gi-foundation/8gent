import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get messages for a thread
export const getByThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

// Create a new message
export const create = mutation({
  args: {
    threadId: v.id("threads"),
    userId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    toolCalls: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          arguments: v.string(),
        })
      )
    ),
    toolResults: v.optional(
      v.array(
        v.object({
          toolCallId: v.string(),
          result: v.string(),
        })
      )
    ),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(v.number()),
        latency: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
      toolResults: args.toolResults,
      metadata: args.metadata,
      createdAt: now,
    });

    // Update thread's lastMessageAt and messageCount
    const thread = await ctx.db.get(args.threadId);
    if (thread) {
      await ctx.db.patch(args.threadId, {
        lastMessageAt: now,
        updatedAt: now,
        messageCount: thread.messageCount + 1,
      });
    }

    return messageId;
  },
});

// Get threads for a user
export const getThreads = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Create a new thread
export const createThread = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const threadId = await ctx.db.insert("threads", {
      userId: args.userId,
      title: args.title,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
    });

    return threadId;
  },
});

// Update thread title
export const updateThread = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.archived !== undefined) updates.archived = args.archived;

    await ctx.db.patch(args.threadId, updates);
  },
});
