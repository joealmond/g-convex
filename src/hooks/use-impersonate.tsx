'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ImpersonateContextType {
  /** If true, admin is viewing as a regular user */
  isViewingAsUser: boolean;
  /** The user ID being impersonated (for viewing their votes, etc.) */
  impersonatedUserId: string | null;
  /** Start viewing as a regular user (hides admin features) */
  startViewingAsUser: (userId?: string) => void;
  /** Stop impersonation and return to admin view */
  stopViewingAsUser: () => void;
  /** Toggle between admin and user view */
  toggleViewAsUser: () => void;
}

const ImpersonateContext = createContext<ImpersonateContextType | null>(null);

export function ImpersonateProvider({ children }: { children: ReactNode }) {
  const [isViewingAsUser, setIsViewingAsUser] = useState(false);
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);

  const startViewingAsUser = useCallback((userId?: string) => {
    setIsViewingAsUser(true);
    setImpersonatedUserId(userId || null);
  }, []);

  const stopViewingAsUser = useCallback(() => {
    setIsViewingAsUser(false);
    setImpersonatedUserId(null);
  }, []);

  const toggleViewAsUser = useCallback(() => {
    if (isViewingAsUser) {
      stopViewingAsUser();
    } else {
      startViewingAsUser();
    }
  }, [isViewingAsUser, startViewingAsUser, stopViewingAsUser]);

  return (
    <ImpersonateContext.Provider
      value={{
        isViewingAsUser,
        impersonatedUserId,
        startViewingAsUser,
        stopViewingAsUser,
        toggleViewAsUser,
      }}
    >
      {children}
    </ImpersonateContext.Provider>
  );
}

export function useImpersonate(): ImpersonateContextType {
  const context = useContext(ImpersonateContext);
  if (!context) {
    // Return a default state if used outside provider (for non-admin pages)
    return {
      isViewingAsUser: false,
      impersonatedUserId: null,
      startViewingAsUser: () => {},
      stopViewingAsUser: () => {},
      toggleViewAsUser: () => {},
    };
  }
  return context;
}
