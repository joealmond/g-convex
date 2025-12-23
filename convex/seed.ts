import { internalMutation } from "./_generated/server";

/**
 * Seed the database with test products (internal - no auth required for CLI)
 */
export const seedProductsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if products already exist
    const existingProducts = await ctx.db.query("products").take(1);
    if (existingProducts.length > 0) {
      return { success: false, message: "Products already exist. Delete them first." };
    }
    if (existingProducts.length > 0) {
      return { success: false, message: "Products already exist. Delete them first." };
    }

    const now = Date.now();
    
    // Seed products with realistic-looking data
    const products = [
      {
        name: "Schär Gluten-Free Bread",
        description: "Classic white bread, gluten-free certified",
        price: 5,
        mainImage: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400",
        avgSafety: 85,
        avgTaste: 72,
        avgPrice: 60,
        voteCount: 24,
        registeredVoteCount: 18,
        registeredSafetySum: 1530,
        registeredTasteSum: 1296,
        registeredPriceSum: 1080,
        anonymousVoteCount: 6,
        anonymousSafetySum: 510,
        anonymousTasteSum: 432,
        anonymousPriceSum: 360,
        stores: [
          { name: "Tesco", lastSeenAt: now - 1000 * 60 * 60 * 24 * 2, price: 4.99 },
          { name: "Lidl", lastSeenAt: now - 1000 * 60 * 60 * 24 * 5, price: 4.79 },
        ],
        createdAt: now - 1000 * 60 * 60 * 24 * 30,
      },
      {
        name: "Barilla GF Pasta",
        description: "Gluten-free penne made with corn and rice",
        price: 3,
        mainImage: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400",
        avgSafety: 92,
        avgTaste: 88,
        avgPrice: 40,
        voteCount: 45,
        registeredVoteCount: 35,
        registeredSafetySum: 3220,
        registeredTasteSum: 3080,
        registeredPriceSum: 1400,
        anonymousVoteCount: 10,
        anonymousSafetySum: 920,
        anonymousTasteSum: 880,
        anonymousPriceSum: 400,
        stores: [
          { name: "Aldi", lastSeenAt: now - 1000 * 60 * 60 * 24 * 1, price: 2.99 },
        ],
        createdAt: now - 1000 * 60 * 60 * 24 * 60,
      },
      {
        name: "Enjoy Life Cookies",
        description: "Chocolate chip cookies, free from top 14 allergens",
        price: 6,
        mainImage: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
        avgSafety: 95,
        avgTaste: 82,
        avgPrice: 80,
        voteCount: 15,
        registeredVoteCount: 12,
        registeredSafetySum: 1140,
        registeredTasteSum: 984,
        registeredPriceSum: 960,
        anonymousVoteCount: 3,
        anonymousSafetySum: 285,
        anonymousTasteSum: 246,
        anonymousPriceSum: 240,
        stores: [
          { name: "Whole Foods", lastSeenAt: now - 1000 * 60 * 60 * 24 * 10, price: 5.99 },
        ],
        createdAt: now - 1000 * 60 * 60 * 24 * 15,
      },
      {
        name: "Questionable Street Snack",
        description: "Mystery meat on a stick from unknown vendor",
        price: 2,
        mainImage: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400",
        avgSafety: 25,
        avgTaste: 65,
        avgPrice: 20,
        voteCount: 8,
        registeredVoteCount: 5,
        registeredSafetySum: 125,
        registeredTasteSum: 325,
        registeredPriceSum: 100,
        anonymousVoteCount: 3,
        anonymousSafetySum: 75,
        anonymousTasteSum: 195,
        anonymousPriceSum: 60,
        stores: [],
        createdAt: now - 1000 * 60 * 60 * 24 * 3,
      },
      {
        name: "Generic Store Brand Rice",
        description: "Plain white rice, naturally gluten-free",
        price: 2,
        mainImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
        avgSafety: 78,
        avgTaste: 45,
        avgPrice: 20,
        voteCount: 32,
        registeredVoteCount: 25,
        registeredSafetySum: 1950,
        registeredTasteSum: 1125,
        registeredPriceSum: 500,
        anonymousVoteCount: 7,
        anonymousSafetySum: 546,
        anonymousTasteSum: 315,
        anonymousPriceSum: 140,
        stores: [
          { name: "Spar", lastSeenAt: now - 1000 * 60 * 60 * 24 * 40, price: 1.99 },
        ],
        createdAt: now - 1000 * 60 * 60 * 24 * 90,
      },
    ];

    // Insert all products
    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return { 
      success: true, 
      message: `Seeded ${products.length} products`,
      count: products.length 
    };
  },
});
