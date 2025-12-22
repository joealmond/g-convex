'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { authClient } from '@/lib/auth-client';
import type { UserProfile } from '@/lib/types';

/**
 * Hook to get the current user's profile from Convex.
 * Returns null profile for anonymous users.
 */
export function useUserProfile() {
  const { isPending } = authClient.useSession();
  
  // Query user profile from Convex
  const userData = useQuery(api.users.current);
  
  // Convert to UserProfile type
  const profile: UserProfile | null = userData?.profile ? {
    points: userData.profile.points || 0,
    totalVotes: userData.profile.totalVotes || 0,
    newProductVotes: userData.profile.newProductVotes || 0,
    storesTagged: userData.profile.storesTagged || [],
    gpsVotes: userData.profile.gpsVotes || 0,
    currentStreak: userData.profile.currentStreak || 0,
    longestStreak: userData.profile.longestStreak || 0,
    badges: userData.profile.badges || [],
    lastVoteDate: userData.profile.lastVoteDate,
  } : null;

  return {
    profile,
    loading: isPending || userData === undefined,
    error: null,
  };
}

