import { api } from "../convex/_generated/api";
import admin from 'firebase-admin';
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env for other secrets if needed

// Initialize Firebase Admin
if (!admin.apps.length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
    } else {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
}
const db = admin.firestore();

// Initialize Convex Client
const convex = new ConvexHttpClient(process.env.CONVEX_URL || process.env.VITE_CONVEX_URL!);

// Map Firestore IDs to Convex IDs
const userIdMap = new Map<string, string>();
const productIdMap = new Map<string, string>();

async function migrateUsers() {
  console.log("Migrating users...");
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map(doc => ({
    firebaseId: doc.id,
    name: doc.data().name || doc.data().displayName || "Unknown",
    email: doc.data().email || `noemail-${doc.id}@example.com`,
    image: doc.data().photoURL || doc.data().image,
    role: doc.data().role || "user",
    points: doc.data().points || 0,
    badges: doc.data().badges || [],
    totalVotes: doc.data().totalVotes || 0,
  }));

  if (users.length === 0) return;

  const chunkSize = 50;
  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);
    console.log(`Importing batch of ${chunk.length} users...`);
    // @ts-ignore
    const resultIds = await convex.mutation(api.migrations.importUsers, { users: chunk });
    
    chunk.forEach((u, idx) => {
        if (resultIds[idx]) {
            userIdMap.set(u.firebaseId, resultIds[idx]);
        }
    });

    // Also import Profiles
    // We construct profiles from user data (assuming points/role are on user doc or we default them)
    const profiles = chunk.map((u, idx) => {
        const userId = resultIds[idx];
        if (!userId) return null;
        return {
            userId,
            points: Number((u as any).points) || 0,
            badges: (u as any).badges || [],
            totalVotes: Number((u as any).totalVotes) || 0,
            role: u.role
        };
    }).filter(p => p !== null);
    
    // Call importProfiles (Need to create this internal mutation)
    if (profiles.length > 0) {
        // @ts-ignore
        await convex.mutation(api.migrations.importProfiles, { profiles });
    }
  }
}

async function migrateProducts() {
  console.log("Migrating products...");
  const snapshot = await db.collection("products").get();
  const products = snapshot.docs.map(doc => {
    const d = doc.data();
    return {
      firebaseId: doc.id,
      name: d.name || "Unnamed Product",
      description: d.description,
      price: Number(d.price) || 0,
      mainImage: d.imageUrl || d.mainImage || "", // Handle imageUrl vs mainImage
      
      avgSafety: Number(d.avgSafety) || 0,
      avgTaste: Number(d.avgTaste) || 0,
      avgPrice: Number(d.avgPrice) || 0,
      voteCount: Number(d.voteCount) || 0,
      
      registeredVoteCount: Number(d.registeredVoteCount) || 0,
      registeredSafetySum: Number(d.registeredSafetySum) || 0,
      registeredTasteSum: Number(d.registeredTasteSum) || 0,
      registeredPriceSum: Number(d.registeredPriceSum) || 0,
      
      anonymousVoteCount: Number(d.anonymousVoteCount) || 0,
      anonymousSafetySum: Number(d.anonymousSafetySum) || 0,
      anonymousTasteSum: Number(d.anonymousTasteSum) || 0,
      anonymousPriceSum: Number(d.anonymousPriceSum) || 0,

      ingredients: d.ingredients || [],
      backImageUrl: d.backImageUrl,
      currency: d.currency,
      purchaseLocation: d.purchaseLocation,
      
      // Store entries need to be mapped carefully if structure differs
      stores: (d.stores || []).map((s: any) => ({
          name: s.name,
          geoPoint: s.geoPoint ? { lat: s.geoPoint.latitude || s.geoPoint.lat, lng: s.geoPoint.longitude || s.geoPoint.lng } : undefined,
          lastSeenAt: typeof s.lastSeenAt?.toMillis === 'function' ? s.lastSeenAt.toMillis() : Date.now(),
          price: s.price
      })),
      
      createdAt: typeof d.createdAt?.toMillis === 'function' ? d.createdAt.toMillis() : Date.now(),
      createdBy: d.createdBy
    };
  });

   const chunkSize = 50;
   for (let i = 0; i < products.length; i += chunkSize) {
     const chunk = products.slice(i, i + chunkSize);
     console.log(`Importing batch of ${chunk.length} products...`);
     // @ts-ignore
     const resultIds = await convex.mutation(api.migrations.importProducts, { products: chunk });
     
     chunk.forEach((p, idx) => {
         if (resultIds[idx]) {
             productIdMap.set(p.firebaseId, resultIds[idx]);
         }
     });
   }
}

async function migrateVotes() {
  console.log("Migrating votes...");
  const snapshot = await db.collection("votes").get();
  
  const votes = snapshot.docs.map(doc => {
      const data = doc.data();
      const convexUserId = userIdMap.get(data.userId); 
      const convexProductId = productIdMap.get(data.productId);
      
      // If we miss a mapping (maybe user/product didn't migrate), skip vote
      if (!convexUserId || !convexProductId) return null;

      return {
          voteType: data.voteType || "vibe", 
          value: Number(data.value) || 0,
          timestamp: data.timestamp ? data.timestamp.toMillis() : Date.now(),
          userId: convexUserId as any,
          productId: convexProductId as any
      };
  }).filter(v => v !== null);

  const chunkSize = 50;
  for (let i = 0; i < votes.length; i += chunkSize) {
      const chunk = votes.slice(i, i + chunkSize);
      console.log(`Importing batch of ${chunk.length} votes...`);
      // @ts-ignore
      await convex.mutation(api.migrations.importVotes, { votes: chunk });
  }
}

async function main() {
  await migrateUsers();
  await migrateProducts();
  await migrateVotes();
  console.log("Migration complete.");
}

main().catch(console.error);
