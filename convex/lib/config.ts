/**
 * G-Matrix Backend Configuration
 * 
 * Tunable parameters for the voting and ranking system.
 */

// =============================================================================
// VOTING WEIGHTS
// =============================================================================

export const REGISTERED_VOTE_WEIGHT = 2;
export const ANONYMOUS_VOTE_WEIGHT = 1;

// =============================================================================
// TIME DECAY
// =============================================================================

export const TIME_DECAY_FACTOR_PER_YEAR = 0.9;
export const TIME_DECAY_MINIMUM_WEIGHT = 0.1;

// =============================================================================
// RATE LIMITING
// =============================================================================

export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per window
