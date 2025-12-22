import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth"; // Helper if we create one, or use ctx.auth directly?
// Better-auth integration usually implies we use ctx.auth for user ID.

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Basic implementation: fetch most recent or just all
    // Firestore legacy: limit 100
    // Optimization: Use an index if sorting needed.
    // For now, by_creation_time default? Or by_name?
    // User used "by_name" index in schema.
    const products = await ctx.db.query("products")
      .withIndex("by_name") // Optional, just an example
      .take(args.limit ?? 100);
      
    return products;
  },
});

export const get = query({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
});

export const getByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("products")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();
    }
});
