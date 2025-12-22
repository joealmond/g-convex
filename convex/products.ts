import { query, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
// Better-auth integration usually implies we use ctx.auth for user ID.

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

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

export const applyTimeDecay = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch all products (chunked for scalability in real app, simplified here)
    const products = await ctx.db.query("products").collect();
    
    // 2. Decay factor (e.g., 0.5% decay per day to prioritize fresh votes)
    const DECAY_Rate = 0.995; 

    // 3. Update each product
    for (const product of products) {
        // Only decay if there's significant data
        if (product.voteCount > 0) {
           await ctx.db.patch(product._id, {
               avgSafety: product.avgSafety * DECAY_Rate,
               avgTaste: product.avgTaste * DECAY_Rate,
               // Price usually doesn't decay in "vibe" the same way, but maybe? 
               // keeping price stable for now.
           });
        }
    }
  }
});

// Admin emails for authorization
const ADMIN_EMAILS = [
  "jozsef.mandula@gmail.com",
];

/**
 * Delete a product (admin only) - also deletes all associated votes
 */
export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email || !ADMIN_EMAILS.includes(identity.email)) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get the product first to verify it exists
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Delete all votes for this product
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Delete the product
    await ctx.db.delete(args.productId);

    return { success: true, deletedVotes: votes.length, productName: product.name };
  },
});

