'use client';

import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useImpersonate } from './use-impersonate';

/**
 * Hook to check if current user is an admin.
 * Also handles the "view as user" impersonation state.
 */
export function useAdmin() {
  const isAdminResult = useQuery(api.users.isAdmin);
  const { isViewingAsUser } = useImpersonate();
  
  // Real admin status from Convex
  const isRealAdmin = isAdminResult === true;
  
  // When viewing as user, pretend not to be admin for UI purposes
  const isAdmin = isRealAdmin && !isViewingAsUser;
  
  return {
    isRealAdmin,
    isAdmin,
    isLoading: isAdminResult === undefined,
    error: null
  };
}

