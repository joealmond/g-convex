import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const importUsers = mutation({
  args: {
    users: v.array(v.object({
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
        role: v.optional(v.string()),
        firebaseId: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const user of args.users) {
      // Check if user exists by email to avoid duplicates?
      // For migration, we might just insert.
      const id = await ctx.db.insert("user", {
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          // role: user.role === "admin" ? "admin" : "user", // Role is in profiles now
          // We don't store firebaseId in the main schema unless we added it.
          // For mapping, we just return the new ID.
      });
      ids.push(id);
    }
    return ids;
  },
});

export const importProducts = mutation({
    args: {
        products: v.array(v.object({
            name: v.string(),
            description: v.optional(v.string()),
            price: v.number(),
            mainImage: v.string(),
            firebaseId: v.string(),
            
            avgSafety: v.number(),
            avgTaste: v.number(),
            avgPrice: v.number(),
            voteCount: v.number(),
            
            registeredVoteCount: v.number(),
            registeredSafetySum: v.number(),
            registeredTasteSum: v.number(),
            registeredPriceSum: v.number(),
            
            anonymousVoteCount: v.number(),
            anonymousSafetySum: v.number(),
            anonymousTasteSum: v.number(),
            anonymousPriceSum: v.number(),
            
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
            createdBy: v.optional(v.string()),
        }))
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const p of args.products) {
            const id = await ctx.db.insert("products", {
                name: p.name,
                description: p.description,
                price: p.price,
                mainImage: p.mainImage,
                avgSafety: p.avgSafety,
                avgTaste: p.avgTaste,
                avgPrice: p.avgPrice,
                voteCount: p.voteCount,
                registeredVoteCount: p.registeredVoteCount,
                registeredSafetySum: p.registeredSafetySum,
                registeredTasteSum: p.registeredTasteSum,
                registeredPriceSum: p.registeredPriceSum,
                anonymousVoteCount: p.anonymousVoteCount,
                anonymousSafetySum: p.anonymousSafetySum,
                anonymousTasteSum: p.anonymousTasteSum,
                anonymousPriceSum: p.anonymousPriceSum,
                ingredients: p.ingredients,
                backImageUrl: p.backImageUrl,
                currency: p.currency,
                purchaseLocation: p.purchaseLocation,
                stores: p.stores,
                createdAt: p.createdAt,
                createdBy: p.createdBy,
            });
            ids.push(id);
        }
        return ids;
    }
});
export const importVotes = mutation({
    args: {
        votes: v.array(v.object({
            productId: v.id("products"),
            userId: v.id("user"),
            voteType: v.string(),
            value: v.number(),
            timestamp: v.number(),
        }))
    },
    handler: async (ctx, args) => {
        let count = 0;
        for (const v of args.votes) {
            // Map legacy simple value to safety/taste/price
            let safety = 50;
            let taste = 50;
            let price: number | undefined = undefined;

            if (v.voteType === 'vibe' || v.voteType === 'safety' || v.voteType === 'taste') {
                safety = v.value;
                taste = v.value;
            } else if (v.voteType === 'value' || v.voteType === 'price') {
                price = v.value;
            }

            await ctx.db.insert("votes", {
                productId: v.productId,
                userId: v.userId,
                isRegistered: true, // Assume imported votes are registered
                safety,
                taste,
                price,
                // voteType: v.voteType, // Removed from schema
                // value: v.value,       // Removed from schema
                timestamp: v.timestamp,
            });
            count++;
        }
        return count;
    }
});

export const importProfiles = mutation({
    args: {
        profiles: v.array(v.object({
            userId: v.id("user"),
            points: v.number(),
            badges: v.array(v.string()), // IDs of badges
            totalVotes: v.number(),
            role: v.optional(v.string()),
        }))
    },
    handler: async (ctx, args) => {
        let count = 0;
        for (const p of args.profiles) {
            await ctx.db.insert("profiles", {
                userId: p.userId,
                points: p.points,
                badges: p.badges,
                totalVotes: p.totalVotes,
                role: p.role,
                newProductVotes: 0,
                gpsVotes: 0,
                storesTagged: [],
                currentStreak: 0,
                longestStreak: 0,
            });
            count++;
        }
        return count;
    }
});
