import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// 8gent Schema - Personal OS Platform
// Real-time sync between mobile and web

export default defineSchema({
  // ============================================
  // USERS & WORKSPACES
  // ============================================

  // Users with unique usernames for subdomain routing
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    username: v.string(), // Unique username for {username}.8gentjr.com
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Settings
    settings: v.optional(
      v.object({
        theme: v.optional(v.string()),
        timezone: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
      })
    ),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

  // Device tracking for multi-device sync
  devices: defineTable({
    userId: v.id("users"),
    deviceId: v.string(), // Unique device identifier
    platform: v.union(
      v.literal("ios"),
      v.literal("android"),
      v.literal("web")
    ),
    deviceName: v.optional(v.string()),
    lastActiveAt: v.number(),
    pushToken: v.optional(v.string()), // For push notifications
  })
    .index("by_user", ["userId"])
    .index("by_device_id", ["deviceId"]),

  // ============================================
  // CHAT & MESSAGES
  // ============================================

  // Chat threads
  threads: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.optional(v.number()),
    messageCount: v.number(),
    archived: v.optional(v.boolean()),
  })
    .index("by_user", ["userId", "updatedAt"])
    .index("by_user_active", ["userId", "archived", "updatedAt"]),

  // Chat messages
  messages: defineTable({
    threadId: v.id("threads"),
    userId: v.id("users"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    createdAt: v.number(),
    // Tool calls
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
    // Metadata
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        tokens: v.optional(v.number()),
        latency: v.optional(v.number()),
      })
    ),
  })
    .index("by_thread", ["threadId", "createdAt"])
    .index("by_user", ["userId", "createdAt"]),

  // ============================================
  // TASKS (Kanban)
  // ============================================

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    // Position for drag & drop
    position: v.number(),
  })
    .index("by_user", ["userId", "updatedAt"])
    .index("by_user_status", ["userId", "status", "position"])
    .index("by_user_priority", ["userId", "priority", "updatedAt"]),

  // ============================================
  // ENTITIES (ERV Pattern from AIJamesOS)
  // ============================================

  // Polymorphic entity table for flexible data modeling
  entities: defineTable({
    userId: v.id("users"),
    entityId: v.string(), // Human-readable ID
    entityType: v.union(
      v.literal("note"),
      v.literal("project"),
      v.literal("bookmark"),
      v.literal("contact"),
      v.literal("event"),
      v.literal("memory"),
      v.literal("file")
    ),
    name: v.string(),
    data: v.string(), // JSON-stringified type-specific payload
    tags: v.optional(v.array(v.string())),
    importance: v.optional(v.float64()), // 0-1 for sorting/filtering
    archived: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Full-text search
    searchText: v.optional(v.string()),
  })
    .index("by_user", ["userId", "updatedAt"])
    .index("by_user_type", ["userId", "entityType", "updatedAt"])
    .index("by_entity_id", ["entityId"])
    .index("by_user_archived", ["userId", "archived", "updatedAt"])
    .searchIndex("search_entities", {
      searchField: "searchText",
      filterFields: ["userId", "entityType"],
    }),

  // Relationships between entities (graph edges)
  relationships: defineTable({
    userId: v.id("users"),
    sourceId: v.id("entities"),
    targetId: v.id("entities"),
    relationshipType: v.union(
      v.literal("contains"),
      v.literal("references"),
      v.literal("relatedTo"),
      v.literal("parentOf"),
      v.literal("derivedFrom")
    ),
    weight: v.optional(v.float64()),
    createdAt: v.number(),
  })
    .index("by_source", ["sourceId"])
    .index("by_target", ["targetId"])
    .index("by_user", ["userId"]),

  // ============================================
  // MEMORY (RLM - Recursive Learning Memory)
  // ============================================

  // Episodic memories - "What happened"
  episodicMemories: defineTable({
    userId: v.id("users"),
    content: v.string(),
    context: v.optional(v.string()),
    importance: v.float64(), // 0-1
    createdAt: v.number(),
    accessedAt: v.number(),
    accessCount: v.number(),
    // Source tracking
    sourceType: v.optional(
      v.union(
        v.literal("chat"),
        v.literal("task"),
        v.literal("manual"),
        v.literal("inferred")
      )
    ),
    sourceId: v.optional(v.string()),
  })
    .index("by_user", ["userId", "importance"])
    .index("by_user_recent", ["userId", "accessedAt"])
    .searchIndex("search_memories", {
      searchField: "content",
      filterFields: ["userId"],
    }),

  // Semantic memories - "What I know"
  semanticMemories: defineTable({
    userId: v.id("users"),
    category: v.string(), // e.g., "preferences", "facts", "skills"
    key: v.string(),
    value: v.string(),
    confidence: v.float64(), // 0-1
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_category", ["userId", "category"])
    .index("by_user_key", ["userId", "key"]),

  // ============================================
  // PRESENCE (Real-time awareness)
  // ============================================

  presence: defineTable({
    userId: v.id("users"),
    deviceId: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("away"),
      v.literal("offline")
    ),
    currentPage: v.optional(v.string()),
    lastSeenAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_device", ["deviceId"]),

  // ============================================
  // JNR MULTI-TENANCY (8gent Jr AAC System)
  // ============================================

  // Tenants - one per child (kidname.8gentjr.com)
  tenants: defineTable({
    subdomain: v.string(), // "nick" for nick.8gentjr.com
    ownerId: v.id("users"), // Parent or child user ID
    parentId: v.optional(v.id("users")), // Parent's user ID (if owner is child)
    displayName: v.string(), // "Nick's AAC Board"
    dateOfBirth: v.optional(v.number()), // For age-appropriate content
    mode: v.union(v.literal("kid"), v.literal("adult")),
    status: v.union(
      v.literal("active"),
      v.literal("suspended"),
      v.literal("reserved")
    ),
    preferences: v.optional(
      v.object({
        themeColor: v.optional(v.string()),
        voiceId: v.optional(v.string()), // ElevenLabs voice ID
        ttsRate: v.optional(v.number()), // Speech rate 0.5-2.0
        cardSize: v.optional(v.union(v.literal("small"), v.literal("medium"), v.literal("large"))),
        showLabels: v.optional(v.boolean()),
        enableAnimations: v.optional(v.boolean()),
      })
    ),
    cardPackVersion: v.string(), // Current version of default pack (e.g., "1.0.0")
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_subdomain", ["subdomain"])
    .index("by_owner", ["ownerId"])
    .index("by_parent", ["parentId"])
    .index("by_status", ["status"]),

  // Default card pack (versioned, global)
  // Admins publish new versions, all tenants auto-sync
  defaultCardPack: defineTable({
    version: v.string(), // semver: "1.0.0", "1.1.0"
    cards: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        speechText: v.string(),
        imageUrl: v.string(),
        categoryId: v.string(),
        arasaacId: v.optional(v.number()),
        glpStage: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
      })
    ),
    changelog: v.optional(v.string()),
    isLatest: v.boolean(), // Only one version is "latest"
    publishedBy: v.optional(v.id("users")), // Admin who published
    createdAt: v.number(),
  })
    .index("by_version", ["version"])
    .index("by_latest", ["isLatest"]),

  // User cards (per-tenant custom cards + favorites)
  userCards: defineTable({
    tenantId: v.id("tenants"),
    cards: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        speechText: v.string(),
        imageUrl: v.string(),
        categoryId: v.string(),
        isCustom: v.literal(true),
        arasaacId: v.optional(v.number()),
        generatedBy: v.optional(v.string()), // "fal-ai", "replicate", etc.
        createdAt: v.number(),
      })
    ),
    favorites: v.array(v.string()), // Card IDs marked as favorites
    recentlyUsed: v.array(v.string()), // Last 20 used card IDs
    hiddenCards: v.optional(v.array(v.string())), // Hidden default cards
    updatedAt: v.number(),
  }).index("by_tenant", ["tenantId"]),

  // Tenant members - role-based access control
  // Jr accounts: owner (parent) + child
  // OS accounts: owner (account holder) + visitor
  tenantMembers: defineTable({
    tenantId: v.id("tenants"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("child"),
      v.literal("visitor")
    ),
    createdAt: v.number(),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_user", ["userId"])
    .index("by_tenant_user", ["tenantId", "userId"]),

  // GDPR Consent Records (Article 9 - special category data)
  // Immutable audit trail: records are never deleted, only withdrawn
  consentRecords: defineTable({
    userId: v.id("users"),
    tenantId: v.id("tenants"),
    consentType: v.union(
      v.literal("data_processing"),      // Basic data processing consent
      v.literal("health_data"),          // Article 9 - special category data
      v.literal("personalization"),      // Consent for learning/personalization
      v.literal("analytics")            // Consent for usage analytics
    ),
    granted: v.boolean(),
    grantedAt: v.number(),
    withdrawnAt: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    version: v.string(),  // privacy policy version at time of consent
  })
    .index("by_user", ["userId"])
    .index("by_tenant", ["tenantId"])
    .index("by_user_type", ["userId", "consentType"]),

  // Sentence history (per-tenant)
  sentenceHistory: defineTable({
    tenantId: v.id("tenants"),
    sentence: v.string(), // Full spoken sentence
    cardIds: v.array(v.string()), // Cards used to build it
    spokenAt: v.number(),
  })
    .index("by_tenant", ["tenantId", "spokenAt"]),
});
