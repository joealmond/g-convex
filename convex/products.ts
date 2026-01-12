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

/**
 * Recalculate product averages with time decay weighting (admin only)
 */
export const recalculateWithTimeDecay = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email || !ADMIN_EMAILS.includes(identity.email)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Fetch all votes for this product
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    if (votes.length === 0) {
      // No votes, reset to 0
      await ctx.db.patch(args.productId, {
        avgSafety: 0,
        avgTaste: 0,
        avgPrice: 0,
        voteCount: 0,
        registeredVoteCount: 0,
        anonymousVoteCount: 0,
      });
      return { success: true, voteCount: 0 };
    }

    // Calculate time-decayed weighted averages
    const TIME_DECAY_FACTOR = 0.9; // Per year
    const MIN_WEIGHT = 0.1;
    const REGISTERED_WEIGHT = 2;
    const ANONYMOUS_WEIGHT = 1;

    let totalWeightedSafety = 0;
    let totalWeightedTaste = 0;
    let totalWeightedPrice = 0;
    let totalWeight = 0;
    let priceCount = 0;
    let registeredCount = 0;
    let anonymousCount = 0;

    const now = Date.now();

    for (const vote of votes) {
      const votedAt = vote.timestamp || now;
      const yearsAgo = (now - votedAt) / (1000 * 60 * 60 * 24 * 365);
      const timeDecay = Math.max(Math.pow(TIME_DECAY_FACTOR, yearsAgo), MIN_WEIGHT);
      const baseWeight = vote.isRegistered ? REGISTERED_WEIGHT : ANONYMOUS_WEIGHT;
      const finalWeight = baseWeight * timeDecay;

      totalWeightedSafety += vote.safety * finalWeight;
      totalWeightedTaste += vote.taste * finalWeight;
      if (vote.price) {
        totalWeightedPrice += vote.price * finalWeight;
        priceCount++;
      }
      totalWeight += finalWeight;

      if (vote.isRegistered) {
        registeredCount++;
      } else {
        anonymousCount++;
      }
    }

    const avgSafety = totalWeight > 0 ? totalWeightedSafety / totalWeight : 0;
    const avgTaste = totalWeight > 0 ? totalWeightedTaste / totalWeight : 0;
    const avgPrice = priceCount > 0 ? totalWeightedPrice / totalWeight : 0;

    await ctx.db.patch(args.productId, {
      avgSafety,
      avgTaste,
      avgPrice,
      voteCount: votes.length,
      registeredVoteCount: registeredCount,
      anonymousVoteCount: anonymousCount,
    });

    return { success: true, voteCount: votes.length };
  },
});

/**
 * Recalculate all products with time decay (admin only)
 */
export const recalculateAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email || !ADMIN_EMAILS.includes(identity.email)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const products = await ctx.db.query("products").collect();
    let processed = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Inline recalculation logic for efficiency
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect();

        if (votes.length === 0) {
          await ctx.db.patch(product._id, {
            avgSafety: 0,
            avgTaste: 0,
            avgPrice: 0,
            voteCount: 0,
          });
          processed++;
          continue;
        }

        const TIME_DECAY_FACTOR = 0.9;
        const MIN_WEIGHT = 0.1;
        const REGISTERED_WEIGHT = 2;
        const ANONYMOUS_WEIGHT = 1;
        const now = Date.now();

        let totalWeightedSafety = 0;
        let totalWeightedTaste = 0;
        let totalWeightedPrice = 0;
        let totalWeight = 0;
        let priceCount = 0;

        for (const vote of votes) {
          const votedAt = vote.timestamp || now;
          const yearsAgo = (now - votedAt) / (1000 * 60 * 60 * 24 * 365);
          const timeDecay = Math.max(Math.pow(TIME_DECAY_FACTOR, yearsAgo), MIN_WEIGHT);
          const baseWeight = vote.isRegistered ? REGISTERED_WEIGHT : ANONYMOUS_WEIGHT;
          const finalWeight = baseWeight * timeDecay;

          totalWeightedSafety += vote.safety * finalWeight;
          totalWeightedTaste += vote.taste * finalWeight;
          if (vote.price) {
            totalWeightedPrice += vote.price * finalWeight;
            priceCount++;
          }
          totalWeight += finalWeight;
        }

        await ctx.db.patch(product._id, {
          avgSafety: totalWeight > 0 ? totalWeightedSafety / totalWeight : 0,
          avgTaste: totalWeight > 0 ? totalWeightedTaste / totalWeight : 0,
          avgPrice: priceCount > 0 ? totalWeightedPrice / totalWeight : 0,
          voteCount: votes.length,
        });

        processed++;
      } catch (e) {
        console.error(`Failed to recalculate ${product._id}:`, e);
        errors++;
      }
    }

    return { success: errors === 0, processed, errors };
  },
});

/**
 * Internal recalculate for a single product (for CLI debugging)
 * This doesn't require auth - should only be called from CLI
 */
export const internalRecalculate = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Fetch all votes for this product
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    if (votes.length === 0) {
      await ctx.db.patch(args.productId, {
        avgSafety: 0,
        avgTaste: 0,
        avgPrice: 0,
        voteCount: 0,
        registeredVoteCount: 0,
        anonymousVoteCount: 0,
        registeredSafetySum: 0,
        registeredTasteSum: 0,
        registeredPriceSum: 0,
        anonymousSafetySum: 0,
        anonymousTasteSum: 0,
        anonymousPriceSum: 0,
      });
      return { success: true, voteCount: 0, message: "No votes found, reset to 0" };
    }

    // Calculate proper sums and counts
    let registeredCount = 0, registeredSafetySum = 0, registeredTasteSum = 0, registeredPriceSum = 0;
    let anonymousCount = 0, anonymousSafetySum = 0, anonymousTasteSum = 0, anonymousPriceSum = 0;

    for (const vote of votes) {
      if (vote.isRegistered) {
        registeredCount++;
        registeredSafetySum += vote.safety;
        registeredTasteSum += vote.taste;
        if (vote.price) registeredPriceSum += vote.price;
      } else {
        anonymousCount++;
        anonymousSafetySum += vote.safety;
        anonymousTasteSum += vote.taste;
        if (vote.price) anonymousPriceSum += vote.price;
      }
    }

    // Calculate weighted averages (registered = 2x, anonymous = 1x)
    const REGISTERED_WEIGHT = 2;
    const ANONYMOUS_WEIGHT = 1;
    const totalWeight = (registeredCount * REGISTERED_WEIGHT) + (anonymousCount * ANONYMOUS_WEIGHT);
    
    const avgSafety = totalWeight > 0 
      ? ((registeredSafetySum * REGISTERED_WEIGHT) + (anonymousSafetySum * ANONYMOUS_WEIGHT)) / totalWeight 
      : 0;
    const avgTaste = totalWeight > 0 
      ? ((registeredTasteSum * REGISTERED_WEIGHT) + (anonymousTasteSum * ANONYMOUS_WEIGHT)) / totalWeight 
      : 0;
    const avgPrice = totalWeight > 0 
      ? ((registeredPriceSum * REGISTERED_WEIGHT) + (anonymousPriceSum * ANONYMOUS_WEIGHT)) / totalWeight 
      : 0;

    await ctx.db.patch(args.productId, {
      registeredVoteCount: registeredCount,
      registeredSafetySum,
      registeredTasteSum,
      registeredPriceSum,
      anonymousVoteCount: anonymousCount,
      anonymousSafetySum,
      anonymousTasteSum,
      anonymousPriceSum,
      voteCount: registeredCount + anonymousCount,
      avgSafety,
      avgTaste,
      avgPrice,
    });

    return { 
      success: true, 
      voteCount: votes.length,
      registeredCount,
      anonymousCount,
      avgSafety,
      avgTaste,
    };
  },
});
