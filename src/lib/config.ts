/**
 * G-Matrix Application Configuration
 * 
 * This file contains all tunable parameters for the voting and ranking system.
 * Adjust these values to fine-tune how votes are weighted and displayed.
 */

// =============================================================================
// VOTING WEIGHTS
// =============================================================================

/**
 * Weight multiplier for registered (Google-authenticated) user votes.
 * 
 * Registered users' votes count more than anonymous users because:
 * - They are accountable (linked to real Google account)
 * - Less likely to spam or manipulate ratings
 * - More invested in the community
 * 
 * Example: If set to 2, a registered user's vote counts as 2 anonymous votes.
 * 
 * @default 2
 */
export const REGISTERED_VOTE_WEIGHT = 2;

/**
 * Weight multiplier for anonymous user votes.
 * 
 * Anonymous users can still vote, but their votes carry less weight.
 * This allows casual users to participate while prioritizing verified feedback.
 * 
 * @default 1
 */
export const ANONYMOUS_VOTE_WEIGHT = 1;

// =============================================================================
// TIME DECAY
// =============================================================================

/**
 * Annual decay factor for vote weights.
 * 
 * Older votes gradually lose influence because:
 * - Product formulations may change over time
 * - Manufacturing processes can improve or degrade
 * - Fresh reviews are more relevant to current buyers
 * 
 * Formula: final_weight = base_weight × (decay_factor ^ years_since_vote)
 * 
 * Examples with 0.9 decay factor:
 * - Fresh vote (today): 100% weight
 * - 1 year old: 90% weight
 * - 2 years old: 81% weight
 * - 3 years old: 73% weight
 * - 5 years old: 59% weight
 * - 10 years old: 35% weight
 * 
 * Set to 1.0 to disable time decay entirely.
 * Set lower (e.g., 0.8) for faster decay.
 * Set higher (e.g., 0.95) for slower decay.
 * 
 * @default 0.9 (10% reduction per year)
 */
export const TIME_DECAY_FACTOR_PER_YEAR = 0.9;

/**
 * Minimum weight a vote can have after time decay.
 * 
 * Prevents very old votes from becoming completely worthless.
 * Even ancient votes still provide some signal about a product.
 * 
 * @default 0.1 (10% of original weight)
 */
export const TIME_DECAY_MINIMUM_WEIGHT = 0.1;

// =============================================================================
// QUADRANT THRESHOLDS
// =============================================================================

/**
 * Threshold for "high" safety rating (used for quadrant filtering).
 * Products with avgSafety >= this value are considered "safe".
 * 
 * @default 50 (50% on the safety scale)
 */
export const QUADRANT_SAFETY_THRESHOLD = 50;

/**
 * Threshold for "high" taste rating (used for quadrant filtering).
 * Products with avgTaste >= this value are considered "tasty".
 * 
 * @default 50 (50% on the taste scale)
 */
export const QUADRANT_TASTE_THRESHOLD = 50;

// =============================================================================
// RATE LIMITING
// =============================================================================

/**
 * Time window for rate limiting (in milliseconds).
 * 
 * @default 60000 (1 minute)
 */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Maximum number of image uploads allowed per IP within the rate limit window.
 * 
 * @default 5
 */
export const RATE_LIMIT_MAX_REQUESTS = 5;

// =============================================================================
// UI DISPLAY
// =============================================================================

/**
 * Rating thresholds for displaying quality labels.
 * Used to show "Excellent", "Good", "Fair", "Poor" badges.
 */
export const RATING_THRESHOLDS = {
  /** Minimum rating for "Excellent" label */
  excellent: 75,
  /** Minimum rating for "Good" label */
  good: 50,
  /** Minimum rating for "Fair" label */
  fair: 25,
  /** Below this is "Poor" */
  poor: 0,
} as const;

/**
 * Number of characters to show for truncated user IDs in admin views.
 * 
 * @default 8
 */
export const USER_ID_DISPLAY_LENGTH = 8;

// =============================================================================
// RECALCULATION SCHEDULE
// =============================================================================

/**
 * How often to recalculate time-decayed averages (in hours).
 * 
 * This is used by scheduled jobs/Cloud Functions.
 * More frequent = more accurate but more compute cost.
 * 
 * @default 24 (once per day)
 */
export const RECALCULATION_INTERVAL_HOURS = 24;
