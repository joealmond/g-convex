import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// ...

export const castVote = mutation({
  args: {
    productId: v.id("products"),
    voteType: v.string(), // "vibe" or "value"
    value: v.number(), // 0-100 or 1-5
    safety: v.optional(v.number()), // Legacy/UI might send this
    taste: v.optional(v.number()),
  },
  handler: async (ctx, args: { 
    productId: Id<"products">; 
    voteType: string; 
    value: number; 
    safety?: number; 
    taste?: number;
  }) => {
    // Check Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
       // throw new Error("Unauthorized");
       // return; 
    }
    const userId = (identity?.subject || "anonymous_user") as Id<"user">;
    
    // Check if vote exists
    // We might need to handle "update" vs "insert" logic based on unique index on userId+productId
    // But convex doesn't have upsert natively on compound index easily without check first.
    
    const existing = await ctx.db.query("votes")
        .withIndex("by_user_product", q => q.eq("userId", userId).eq("productId", args.productId))
        .first();

    if (existing) {
        await ctx.db.patch(existing._id, {
            voteType: args.voteType,
            value: args.value,
            timestamp: Date.now(),
        });
    } else {
        await ctx.db.insert("votes", {
            productId: args.productId,
            userId: userId,
            voteType: args.voteType,
            value: args.value,
            timestamp: Date.now(),
        });
    }

    // TODO: Trigger aggregation or simple calc
  }
});

export const byProduct = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db.query("votes")
            .withIndex("by_product", q => q.eq("productId", args.productId))
            .collect();
    }
});

export const userVote = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const userId = (identity?.subject || "anonymous_user") as Id<"user">;
        
        return await ctx.db.query("votes")
            .withIndex("by_user_product", q => q.eq("userId", userId).eq("productId", args.productId))
            .first();
    }
});
