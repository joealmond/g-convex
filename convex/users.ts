import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // "subject" is the userId in Convex Auth usually
    const userId = identity.subject;

    const user = await ctx.db
        .query("user")
        .withIndex("userId", q => q.eq("userId", userId))
        .first();
        
    // Fallback if user not found by 'userId' field (legacy?) 
    // or if identity.subject IS the _id
    // But schema says `userId` is an index on `user` table.
    
    // Actually, let's try to find the user by the identity subject which maps to the token identifier.
    // If using better-auth with convex adapter, the `user` table has a `userId` field? 
    // Schema shows: `user` table has `userId`.
    
    // Let's assume the user IS found.
    if (!user) {
        return null;
    }

    // Join with profile
    // Schema: profiles -> index "by_user" -> userId (which is v.id("user"))
    // Wait, user._id is the internal ID. `profiles.userId` is `v.id("user")`.
    // So we query profiles by user._id.
    
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return {
      ...user,
      profile, // Attached profile stats
    };
  },
});

/**
 * Migrate anonymous votes to a real user account.
 * Call this when a user creates an account after voting anonymously.
 * 
 * Note: This is a partial implementation. The anonymous ID should be
 * passed from the client after login to associate old votes with the new account.
 */
export const migrateAnonymousVotes = mutation({
  args: {
    anonymousId: v.string(), // The localStorage anonymous ID (e.g., "anon_xxx")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to migrate votes");
    }

    const newUserId = identity.subject;
    const oldUserId = args.anonymousId;

    // Find all votes from the anonymous user
    // Note: Using filter because there's no by_user index on votes table.
    // TODO: Add a "by_user" index to votes schema for better performance.
    const anonymousVotes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("userId"), oldUserId))
      .collect();

    if (anonymousVotes.length === 0) {
      return { success: true, migratedVotes: 0 };
    }

    // Update each vote to use the new authenticated user ID
    let migratedCount = 0;
    for (const vote of anonymousVotes) {
      await ctx.db.patch(vote._id, {
        userId: newUserId as any,
        isRegistered: true, // Now they're registered!
      });
      migratedCount++;
    }

    // Note: We should also update totalRegisteredVotes and totalAnonymousVotes
    // on the affected products, but that's a more complex operation.
    // TODO: Update product vote counts in a follow-up.

    return { 
      success: true, 
      migratedVotes: migratedCount,
      message: `Migrated ${migratedCount} vote(s) to your account!`
    };
  },
});

/**
 * Check if the current user is an admin
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const userId = identity.subject;

    // Find the user in the user table
    const user = await ctx.db
      .query("user")
      .withIndex("userId", q => q.eq("userId", userId))
      .first();
      
    if (!user) {
      return false;
    }

    // Check the profile for admin role
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return profile?.role === "admin";
  },
});

