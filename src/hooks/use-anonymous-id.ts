/**
 * React hook version for getting the anonymous ID
 */
import { useEffect, useState } from 'react';



const ANON_ID_KEY = 'g-convex-anon-id';

/**
 * Get or create an anonymous user ID stored in localStorage.
 * This ID persists across sessions and can later be migrated to a real account.
 */
export function getAnonymousId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return a placeholder
    return 'anon_server';
  }
  
  let anonId = localStorage.getItem(ANON_ID_KEY);
  
  if (!anonId) {
    // Generate a new anonymous ID
    anonId = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(ANON_ID_KEY, anonId);
  }
  
  return anonId;
}

/**
 * Clear the anonymous ID (useful when migrating to a real account)
 */
export function clearAnonymousId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ANON_ID_KEY);
  }
}

export function useAnonymousId(): string {
  const [anonId, setAnonId] = useState<string>('anon_loading');
  
  useEffect(() => {
    setAnonId(getAnonymousId());
  }, []);
  
  return anonId;
}
