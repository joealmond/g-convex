import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { calculatePoints, checkNewBadges, calculateStreak, type ProfileStats } from "./lib/gamification";
import { REGISTERED_VOTE_WEIGHT, ANONYMOUS_VOTE_WEIGHT } from "./lib/config";

// --- HELPER: Calculate weighted average ---
function calculateWeightedAverage(
  registeredSum: number,
  registeredCount: number,
  anonymousSum: number,
  anonymousCount: number
): number {
  const totalWeightedSum = (registeredSum * REGISTERED_VOTE_WEIGHT) + anonymousSum;
  const totalWeightedCount = (registeredCount * REGISTERED_VOTE_WEIGHT) + (anonymousCount * ANONYMOUS_VOTE_WEIGHT);
  
  if (totalWeightedCount === 0) return 0;
  return totalWeightedSum / totalWeightedCount;
}

// --- HELPER: Core Vote Logic ---
async function applyVoteLogic(
    ctx: MutationCtx,
    productId: Id<"products">,
    userId: Id<"user">,
    isRegistered: boolean,
    args: {
        safety: number,
        taste: number,
        price?: number,
        storeName?: string,
        geoPoint?: { lat: number; lng: number }
        voteType?: string
    }
) {
    // 2. Fetch Prerequisite Data
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");

    const existingVote = await ctx.db.query("votes")
        .withIndex("by_user_product", q => q.eq("userId", userId).eq("productId", productId))
        .first();

    // 3. Prepare Update Data
    let regCount = product.registeredVoteCount;
    let regSafetySum = product.registeredSafetySum;
    let regTasteSum = product.registeredTasteSum;
    let regPriceSum = product.registeredPriceSum;
    
    let anonCount = product.anonymousVoteCount;
    let anonSafetySum = product.anonymousSafetySum;
    let anonTasteSum = product.anonymousTasteSum;
    let anonPriceSum = product.anonymousPriceSum;
    
    let totalVoteCount = product.voteCount;

    // 4. Subtract Old Vote Logic (if exists)
    if (existingVote) {
        if (existingVote.isRegistered) {
            regSafetySum -= existingVote.safety;
            regTasteSum -= existingVote.taste;
            if (existingVote.price) regPriceSum -= existingVote.price;
            regCount -= 1;
        } else {
            anonSafetySum -= existingVote.safety;
            anonTasteSum -= existingVote.taste;
            if (existingVote.price) anonPriceSum -= existingVote.price;
            anonCount -= 1;
        }
        totalVoteCount -= 1;
    }

    // 5. Add New Vote Logic
    if (isRegistered) {
        regSafetySum += args.safety;
        regTasteSum += args.taste;
        if (args.price) regPriceSum += args.price;
        regCount += 1;
    } else {
        anonSafetySum += args.safety;
        anonTasteSum += args.taste;
        if (args.price) anonPriceSum += args.price;
        anonCount += 1;
    }
    totalVoteCount += 1;

    // 6. Calculate New Averages
    const newAvgSafety = calculateWeightedAverage(regSafetySum, regCount, anonSafetySum, anonCount);
    const newAvgTaste = calculateWeightedAverage(regTasteSum, regCount, anonTasteSum, anonCount);
    const newAvgPrice = calculateWeightedAverage(regPriceSum, regCount, anonPriceSum, anonCount);

    // 7. Store Handling
    let stores = product.stores || [];
    if (args.storeName) {
        const existingStoreIndex = stores.findIndex(s => s.name.toLowerCase() === args.storeName!.toLowerCase());
        const storeEntry = {
            name: args.storeName,
            lastSeenAt: Date.now(),
            price: args.price,
            geoPoint: args.geoPoint
        };
        if (existingStoreIndex >= 0) {
            stores[existingStoreIndex] = storeEntry;
        } else {
            stores.push(storeEntry);
        }
    }

    // 8. Update Product
    await ctx.db.patch(productId, {
        registeredVoteCount: regCount,
        registeredSafetySum: regSafetySum,
        registeredTasteSum: regTasteSum,
        registeredPriceSum: regPriceSum,
        anonymousVoteCount: anonCount,
        anonymousSafetySum: anonSafetySum,
        anonymousTasteSum: anonTasteSum,
        anonymousPriceSum: anonPriceSum,
        voteCount: totalVoteCount,
        avgSafety: newAvgSafety,
        avgTaste: newAvgTaste,
        avgPrice: newAvgPrice,
        stores: stores,
    });

    // 9. Upsert Vote
    if (existingVote) {
        await ctx.db.patch(existingVote._id, {
            safety: args.safety,
            taste: args.taste,
            price: args.price,
            storeName: args.storeName,
            geoPoint: args.geoPoint,
            isRegistered,
            timestamp: Date.now(),
            updatedAt: Date.now(),
        });
    } else {
        await ctx.db.insert("votes", {
            productId: productId,
            userId: userId,
            isRegistered,
            safety: args.safety,
            taste: args.taste,
            price: args.price,
            storeName: args.storeName,
            geoPoint: args.geoPoint,
            timestamp: Date.now(),
            updatedAt: Date.now(),
        });
    }

    // 10. Gamification (only for registered users, wrapped in try-catch to not block voting)
    if (isRegistered) {
        try {
            await processGamification(ctx, userId, {
                hasPrice: !!args.price,
                hasStore: !!args.storeName,
                hasGps: !!args.geoPoint,
                isNewProduct: product.voteCount <= 1,
                votesTodayCount: 0,
            });
        } catch (e) {
            console.error("Gamification failed (non-blocking):", e);
        }
    }
    
    return { success: true, productId };
}

// --- EXPORTED MUTATIONS ---

export const castVote = mutation({
  args: {
    productId: v.id("products"),
    userId: v.optional(v.string()), // Client-provided anonymous ID
    voteType: v.optional(v.string()), 
    safety: v.number(),
    taste: v.number(),
    price: v.optional(v.number()),
    storeName: v.optional(v.string()),
    geoPoint: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // Use authenticated user ID if available, otherwise use client-provided anonymous ID
    const userId = (identity?.subject || args.userId || "anonymous") as Id<"user">;
    const isRegistered = !!identity;
    return await applyVoteLogic(ctx, args.productId, userId, isRegistered, args);
  }
});

export const createProductAndVote = mutation({
  args: {
    name: v.string(),
    mainImage: v.string(),
    aiAnalysis: v.optional(v.any()), 
    userId: v.optional(v.string()), // Client-provided anonymous ID
    // Vote args
    safety: v.number(),
    taste: v.number(),
    price: v.optional(v.number()),
    storeName: v.optional(v.string()),
    geoPoint: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // Use authenticated user ID if available, otherwise use client-provided anonymous ID
    const userId = (identity?.subject || args.userId || "anonymous") as Id<"user">;
    
    // Check if product exists by name
    const existing = await ctx.db.query("products")
      .withIndex("by_name", q => q.eq("name", args.name))
      .first();
      
    let productId: Id<"products">;
    
    if (existing) {
        productId = existing._id;
    } else {
        // Create new product
        productId = await ctx.db.insert("products", {
            name: args.name,
            mainImage: args.mainImage,
            price: args.price || 0,
            avgPrice: args.price || 0,
            avgSafety: args.safety,
            avgTaste: args.taste,
            voteCount: 0, 
            registeredVoteCount: 0,
            registeredSafetySum: 0,
            registeredTasteSum: 0,
            registeredPriceSum: 0,
            anonymousVoteCount: 0,
            anonymousSafetySum: 0,
            anonymousTasteSum: 0,
            anonymousPriceSum: 0,
            createdAt: Date.now(),
            createdBy: userId,
            description: args.aiAnalysis?.reasoning,
            ingredients: args.aiAnalysis?.tags, // Mapping tags to ingredients field for now
        });
    }
    
    return await applyVoteLogic(ctx, productId, userId, !!identity, {
        safety: args.safety,
        taste: args.taste,
        price: args.price,
        storeName: args.storeName,
        geoPoint: args.geoPoint
    });
  }
});

// --- GAMIFICATION LOGIC ---
async function processGamification(ctx: MutationCtx, userId: Id<"user">, details: any) {
    const profile = await ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", userId)).first();
    const now = new Date();
    
    // Stats
    const currentPoints = profile?.points || 0;
    const currentBadges = profile?.badges || [];
    const currentStreak = profile?.currentStreak || 0;
    const lastVoteDateStr = profile?.lastVoteDate;
    
    const streakResult = calculateStreak(lastVoteDateStr, currentStreak, now);
    
    const pointsEarned = calculatePoints({
        ...details,
        votesTodayCount: profile?.votesToday || 0
    });
    
    const newTotalPoints = currentPoints + pointsEarned;
    const newTotalVotes = (profile?.totalVotes || 0) + 1;
    
    const updatedProfileStats: ProfileStats = {
        points: newTotalPoints,
        totalVotes: newTotalVotes,
        newProductVotes: (profile?.newProductVotes || 0) + (details.isNewProduct ? 1 : 0),
        gpsVotes: (profile?.gpsVotes || 0) + (details.hasGps ? 1 : 0),
        storesTagged: profile?.storesTagged || [], 
        currentStreak: streakResult.currentStreak,
        longestStreak: Math.max(profile?.longestStreak || 0, streakResult.currentStreak),
    };

    const newBadges = checkNewBadges(updatedProfileStats, currentBadges);
    const newBadgeIds = newBadges.map(b => b.id);
    
    const finalBadges = [...currentBadges, ...newBadgeIds];
    const isNewDay = streakResult.isNewDay;

    if (profile) {
        await ctx.db.patch(profile._id, {
            ...updatedProfileStats,
            badges: finalBadges,
            lastVoteDate: now.toISOString(),
            votesToday: isNewDay ? 1 : (profile.votesToday || 0) + 1,
        });
    } else {
        await ctx.db.insert("profiles", {
            userId,
            ...updatedProfileStats,
            badges: finalBadges,
            lastVoteDate: now.toISOString(),
            votesToday: 1,
            role: "user"
        });
    }
}

// --- QUERIES ---

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
        const userId = (identity?.subject || "anonymous") as Id<"user">;
        
        return await ctx.db.query("votes")
            .withIndex("by_user_product", q => q.eq("userId", userId).eq("productId", args.productId))
            .first();
    }
});
