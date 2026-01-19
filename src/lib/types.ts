// import type { FieldValue } from "firebase/firestore";

export interface Product {
    _id?: string;
    id: string; // Keep for backward compat if needed, or migration mapping
    name: string;
    mainImage: string;
    
    // Computed weighted averages (registeredSum*2 + anonymousSum) / (registeredCount*2 + anonymousCount)
    avgSafety: number;
    avgTaste: number;
    avgPrice: number; // 1-5 scale (1=Cheap, 5=Expensive)
    // Note: Total voteCount computed as (registeredVoteCount + anonymousVoteCount)
    
    // Registered user vote tracking (2x weight)
    registeredVoteCount: number;
    registeredSafetySum: number;
    registeredTasteSum: number;
    registeredPriceSum: number;
    
    // Anonymous user vote tracking (1x weight)
    anonymousVoteCount: number;
    anonymousSafetySum: number;
    anonymousTasteSum: number;
    anonymousPriceSum: number;
    
    // Future fields - placeholders
    ingredients?: Array<string>;
    backImageUrl?: string;
    price?: number;
    currency?: string;
    purchaseLocation?: string;
    
    // Store availability tracking
    stores?: Array<StoreEntry>;
    
    // Metadata
    createdAt?: number;
    createdBy?: string;
}

export interface GeoPoint {
    lat: number;
    lng: number;
}

export interface StoreEntry {
    name: string;           // e.g., "Tesco", "Spar"
    lastSeenAt: number | Date; // When someone last confirmed availability
    geoPoint?: GeoPoint;    // Optional GPS coordinates
    price?: number;         // 1-5 price rating reported at this store
}

export interface Vote {
    userId: string;
    safety: number;
    taste: number;
    price?: number; // 1-5 (1=Cheap/$, 5=Expensive/$$$$$). Optional.
    storeName?: string; // Where the user found/bought the product. Optional.
    isRegistered: boolean; // true if user signed in with Google, false if anonymous
    votedAt: number; // When the vote was cast (used for time-decay weighting)
    createdAt: number;
    updatedAt?: number;
}

// ============ GAMIFICATION ============

export interface UserProfile {
    points: number;                 // Total Scout Points earned
    badges: Array<string>;               // Badge IDs earned (e.g., 'first_scout', 'trailblazer')
    totalVotes: number;             // Lifetime vote count
    newProductVotes: number;        // First votes on new products (discoveries)
    storesTagged: Array<string>;         // Unique store names this user has tagged
    gpsVotes: number;               // Votes that included GPS coordinates
    lastVoteDate?: Date | string;   // For streak tracking (ISO string or Date)
    currentStreak: number;          // Consecutive days voted
    longestStreak: number;          // Best streak ever achieved
}
