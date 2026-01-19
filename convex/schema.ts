import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Copied from @convex-dev/better-auth/src/component/schema.ts because import failed
const authTables = {
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.union(v.null(), v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    twoFactorEnabled: v.optional(v.union(v.null(), v.boolean())),
    isAnonymous: v.optional(v.union(v.null(), v.boolean())),
    username: v.optional(v.union(v.null(), v.string())),
    displayUsername: v.optional(v.union(v.null(), v.string())),
    phoneNumber: v.optional(v.union(v.null(), v.string())),
    phoneNumberVerified: v.optional(v.union(v.null(), v.boolean())),
    userId: v.optional(v.union(v.null(), v.string())),
  })
    .index("email_name", ["email", "name"])
    .index("name", ["name"])
    .index("userId", ["userId"])
    .index("username", ["username"])
    .index("phoneNumber", ["phoneNumber"]),
  session: defineTable({
    expiresAt: v.number(),
    token: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.union(v.null(), v.string())),
    userAgent: v.optional(v.union(v.null(), v.string())),
    userId: v.string(),
  })
    .index("expiresAt", ["expiresAt"])
    .index("expiresAt_userId", ["expiresAt", "userId"])
    .index("token", ["token"])
    .index("userId", ["userId"]),
  account: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.string(),
    accessToken: v.optional(v.union(v.null(), v.string())),
    refreshToken: v.optional(v.union(v.null(), v.string())),
    idToken: v.optional(v.union(v.null(), v.string())),
    accessTokenExpiresAt: v.optional(v.union(v.null(), v.number())),
    refreshTokenExpiresAt: v.optional(v.union(v.null(), v.number())),
    scope: v.optional(v.union(v.null(), v.string())),
    password: v.optional(v.union(v.null(), v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("accountId", ["accountId"])
    .index("accountId_providerId", ["accountId", "providerId"])
    .index("providerId_userId", ["providerId", "userId"])
    .index("userId", ["userId"]),
  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("expiresAt", ["expiresAt"])
    .index("identifier", ["identifier"]),
  twoFactor: defineTable({
    secret: v.string(),
    backupCodes: v.string(),
    userId: v.string(),
  }).index("userId", ["userId"]),
  passkey: defineTable({
    name: v.optional(v.union(v.null(), v.string())),
    publicKey: v.string(),
    userId: v.string(),
    credentialID: v.string(),
    counter: v.number(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.optional(v.union(v.null(), v.string())),
    createdAt: v.optional(v.union(v.null(), v.number())),
    aaguid: v.optional(v.union(v.null(), v.string())),
  })
    .index("credentialID", ["credentialID"])
    .index("userId", ["userId"]),
};

export default defineSchema({
  ...authTables,

  products: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    mainImage: v.string(),
    
    // Stats
    avgSafety: v.number(),
    avgTaste: v.number(),
    avgPrice: v.number(),

    
    registeredVoteCount: v.number(),
    registeredSafetySum: v.number(),
    registeredTasteSum: v.number(),
    registeredPriceSum: v.number(),
    
    anonymousVoteCount: v.number(),
    anonymousSafetySum: v.number(),
    anonymousTasteSum: v.number(),
    anonymousPriceSum: v.number(),
    
    // Extra Info
    ingredients: v.optional(v.array(v.string())),
    backImageUrl: v.optional(v.string()),
    currency: v.optional(v.string()),
    purchaseLocation: v.optional(v.string()),
    
    stores: v.optional(v.array(v.object({
        name: v.string(),
        lastSeenAt: v.number(),
        price: v.optional(v.number()),
        geoPoint: v.optional(v.object({ lat: v.number(), lng: v.number() }))
    }))),

    createdAt: v.number(),
    createdBy: v.optional(v.string()), // firebase UID string? or we can map to id("users") if known
  }).index("by_name", ["name"]),

  votes: defineTable({
    productId: v.id("products"),
    userId: v.string(), // Changed from v.id("user") to support "anonymous"
    isRegistered: v.boolean(),
    
    // Core Vibe
    safety: v.number(),
    taste: v.number(),
    
    // Optional Value/Context
    price: v.optional(v.number()),
    storeName: v.optional(v.string()),
    geoPoint: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    
    timestamp: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_product", ["productId"])
    .index("by_user_product", ["userId", "productId"]),

  profiles: defineTable({
    userId: v.id("user"),
    name: v.optional(v.string()),
    // Gamification Stats
    points: v.number(), // Total Scout Points
    badges: v.array(v.string()), // IDs of badges earned
    
    totalVotes: v.number(),
    newProductVotes: v.number(),
    gpsVotes: v.number(),
    storesTagged: v.array(v.string()), // List of unique store names
    
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastVoteDate: v.optional(v.string()), // ISO string for date comparison
    votesToday: v.optional(v.number()), // Helper for daily limits/streaks
    
    role: v.optional(v.string()), // "admin", "user"
  }).index("by_user", ["userId"]),
});
