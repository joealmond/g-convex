import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export const migrations = new Migrations((components as any).migrations);

export const run = migrations.runner();

// Migration: Remove deprecated voteCount field from products
export const removeVoteCount = migrations.define({
    table: "products",
    migrateOne: async (ctx, doc) => {
        // Check if the document has the old voteCount field
        if ("voteCount" in doc) {
            // Use raw patch to remove the field
            await ctx.db.patch(doc._id, {
                // Can't directly delete fields with patch, so we'll use replace
            });
        }
    },
});

// Alternative: Direct mutation to clean up all voteCount fields
export const cleanupVoteCount = internalMutation({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db.query("products").collect();
        let cleaned = 0;
        
        for (const product of products) {
            // Access the raw document to check for voteCount
            const rawDoc = product as any;
            if ("voteCount" in rawDoc) {
                // Replace the entire document without voteCount
                const { voteCount, ...rest } = rawDoc;
                await ctx.db.replace(product._id, rest);
                cleaned++;
            }
        }
        
        return { success: true, cleanedCount: cleaned };
    },
});
