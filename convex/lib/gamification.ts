// import type { Doc } from "../_generated/dataModel";

// ============ POINT VALUES ============
export const POINTS = {
  VOTE_BASE: 10,           // Basic vote (taste + safety)
  PRICE_BONUS: 5,          // Added price info
  STORE_BONUS: 10,         // Tagged a store location
  GPS_BONUS: 5,            // Added GPS coordinates
  NEW_PRODUCT_BONUS: 25,   // First vote on a new product
  DAILY_STREAK_BONUS: 15,  // Voted 3+ times in a day
} as const;

// ============ BADGE DEFINITIONS ============
// ============ BADGE DEFINITIONS ============

export interface ProfileStats {
    points: number;
    totalVotes: number;
    newProductVotes: number;
    gpsVotes: number;
    storesTagged: Array<string>;
    currentStreak: number;
    longestStreak: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  nameHu: string;
  description: string;
  descriptionHu: string;
  icon: string;
  condition: (profile: ProfileStats) => boolean;
}

export const BADGES: Array<BadgeDefinition> = [
  {
    id: 'first_scout',
    name: 'First Scout',
    nameHu: 'Első Felderítő',
    description: 'Cast your first vote',
    descriptionHu: 'Add le az első szavazatod',
    icon: '🏅',
    condition: (p) => p.totalVotes >= 1,
  },
  {
    id: 'trailblazer',
    name: 'Trailblazer',
    nameHu: 'Úttörő',
    description: 'Be first to vote on 5 new products',
    descriptionHu: 'Legyél az első, aki 5 új terméket értékel',
    icon: '🔍',
    condition: (p) => p.newProductVotes >= 5,
  },
  {
    id: 'location_pro',
    name: 'Location Pro',
    nameHu: 'Helymeghatározó Profi',
    description: 'Add GPS coordinates to 10 votes',
    descriptionHu: 'Adj GPS koordinátákat 10 szavazathoz',
    icon: '📍',
    condition: (p) => p.gpsVotes >= 10,
  },
  {
    id: 'store_hunter',
    name: 'Store Hunter',
    nameHu: 'Boltvadász',
    description: 'Tag 10 different stores',
    descriptionHu: 'Jelölj meg 10 különböző boltot',
    icon: '🏪',
    condition: (p) => p.storesTagged.length >= 10,
  },
  {
    id: 'century_scout',
    name: 'Century Scout',
    nameHu: 'Százados Felderítő',
    description: 'Earn 100 Scout Points',
    descriptionHu: 'Szerezz 100 Felderítő Pontot',
    icon: '⭐',
    condition: (p) => p.points >= 100,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    nameHu: 'Szériamester',
    description: 'Vote for 7 consecutive days',
    descriptionHu: 'Szavazz 7 egymást követő napon',
    icon: '🔥',
    condition: (p) => p.longestStreak >= 7,
  },
];

// ============ HELPER FUNCTIONS ============

export interface VoteDetails {
  hasPrice: boolean;
  hasStore: boolean;
  hasGps: boolean;
  isNewProduct: boolean;
  votesTodayCount: number;
}

export function calculatePoints(details: VoteDetails): number {
  let points = POINTS.VOTE_BASE;
  
  if (details.hasPrice) points += POINTS.PRICE_BONUS;
  if (details.hasStore) points += POINTS.STORE_BONUS;
  if (details.hasGps) points += POINTS.GPS_BONUS;
  if (details.isNewProduct) points += POINTS.NEW_PRODUCT_BONUS;
  
  if (details.votesTodayCount >= 2) {
    points += POINTS.DAILY_STREAK_BONUS;
  }
  
  return points;
}

export function checkNewBadges(profile: ProfileStats, existingBadgeIds: Array<string>): Array<BadgeDefinition> {
  const newBadges: Array<BadgeDefinition> = [];
  
  for (const badge of BADGES) {
    if (existingBadgeIds.includes(badge.id)) continue;
    if (badge.condition(profile)) {
      newBadges.push(badge);
    }
  }
  
  return newBadges;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const oneDay = 24 * 60 * 60 * 1000;
  // Use UTC dates to avoid timezone issues/DST if possible, but simple diff works for now
  // Round to ignore time within day
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffDays = Math.round((d2.getTime() - d1.getTime()) / oneDay);
  return diffDays === 1;
}

export function calculateStreak(
  lastVoteDateStr: string | undefined,
  currentStreak: number,
  now: Date = new Date()
): { currentStreak: number; isNewDay: boolean } {
  if (!lastVoteDateStr) {
    return { currentStreak: 1, isNewDay: true };
  }
  
  const lastVoteDate = new Date(lastVoteDateStr);
  
  if (isSameDay(lastVoteDate, now)) {
    return { currentStreak, isNewDay: false };
  }
  
  if (isConsecutiveDay(lastVoteDate, now)) {
    return { currentStreak: currentStreak + 1, isNewDay: true };
  }
  
  return { currentStreak: 1, isNewDay: true };
}
