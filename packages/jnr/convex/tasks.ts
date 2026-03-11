import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all tasks for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get tasks by status (for Kanban columns)
export const getByStatus = query({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", args.status)
      )
      .order("asc")
      .collect();
  },
});

// Create a new task
export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const status = args.status ?? "todo";

    // Get max position for the status column
    const existingTasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", status)
      )
      .collect();

    const maxPosition = existingTasks.reduce(
      (max, task) => Math.max(max, task.position),
      0
    );

    const taskId = await ctx.db.insert("tasks", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      status,
      priority: args.priority ?? "medium",
      tags: args.tags,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
      position: maxPosition + 1,
    });

    return taskId;
  },
});

// Update a task
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.number()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    const now = Date.now();

    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    const patchData: Record<string, unknown> = { updatedAt: now };

    if (updates.title !== undefined) patchData.title = updates.title;
    if (updates.description !== undefined)
      patchData.description = updates.description;
    if (updates.status !== undefined) {
      patchData.status = updates.status;
      if (updates.status === "done") {
        patchData.completedAt = now;
      }
    }
    if (updates.priority !== undefined) patchData.priority = updates.priority;
    if (updates.tags !== undefined) patchData.tags = updates.tags;
    if (updates.dueDate !== undefined) patchData.dueDate = updates.dueDate;
    if (updates.position !== undefined) patchData.position = updates.position;

    await ctx.db.patch(taskId, patchData);
  },
});

// Delete a task
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});

// Move task to different status (Kanban drag & drop)
export const moveToStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    newStatus: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    newPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      status: args.newStatus,
      position: args.newPosition,
      updatedAt: now,
      ...(args.newStatus === "done" ? { completedAt: now } : {}),
    });
  },
});
