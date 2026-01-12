'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { authClient } from '@/lib/auth-client';
import { useAnonymousId, clearAnonymousId, getAnonymousId } from './use-anonymous-id';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

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
  const migrationAttempted = useRef(false);
  const migrateVotes = useMutation(api.votes.migrateAnonymousVotes);
  
  useEffect(() => {
    // Get initial session
    authClient.getSession().then(async (session) => {
      const user = session?.data?.user ?? null;
      setAuthUser(user);
      setLoading(false);
      
      // Migrate anonymous votes when user first authenticates
      if (user && !migrationAttempted.current) {
        migrationAttempted.current = true;
        const storedAnonId = getAnonymousId();
        if (storedAnonId && storedAnonId.startsWith('anon_') && storedAnonId !== 'anon_server') {
          try {
            const result = await migrateVotes({ anonymousUserId: storedAnonId });
            if (result.migratedCount > 0) {
              console.log(`Migrated ${result.migratedCount} anonymous votes to your account`);
            }
            // Clear the anonymous ID after successful migration
            clearAnonymousId();
          } catch (err) {
            console.error('Failed to migrate anonymous votes:', err);
          }
        }
      }
    }).catch(() => {
      setLoading(false);
    });
    
    // Subscribe to auth changes
    // Note: better-auth may have different subscription patterns
    // This is a simple check approach
  }, [migrateVotes]);
  
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
