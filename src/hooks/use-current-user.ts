'use client';

import { useState, useEffect, useMemo } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAnonymousId } from './use-anonymous-id';

export interface CurrentUser {
  /** The user ID - either authenticated user ID or anonymous ID */
  userId: string;
  /** Whether this is an authenticated (registered) user */
  isRegistered: boolean;
  /** Whether still loading auth state */
  loading: boolean;
  /** The full auth user object if logged in */
  authUser: any | null;
}

/**
 * Unified hook that returns the current user - either authenticated or anonymous.
 * 
 * Use this throughout the app to get a consistent user identity for:
 * - Submitting votes
 * - Tracking gamification  
 * - Later migrating anonymous data to a real account
 */
export function useCurrentUser(): CurrentUser {
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const anonymousId = useAnonymousId();
  
  useEffect(() => {
    // Get initial session
    authClient.getSession().then((session) => {
      setAuthUser(session?.data?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    
    // Subscribe to auth changes
    // Note: better-auth may have different subscription patterns
    // This is a simple check approach
  }, []);
  
  const result = useMemo((): CurrentUser => {
    if (loading) {
      return {
        userId: anonymousId,
        isRegistered: false,
        loading: true,
        authUser: null,
      };
    }
    
    if (authUser) {
      return {
        userId: authUser.id,
        isRegistered: true,
        loading: false,
        authUser,
      };
    }
    
    return {
      userId: anonymousId,
      isRegistered: false,
      loading: false,
      authUser: null,
    };
  }, [authUser, loading, anonymousId]);
  
  return result;
}
