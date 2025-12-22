'use client';

import { useUser } from '@/firebase';
import { useAdmin } from '@/hooks/use-admin';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  // Use isRealAdmin to allow access even when viewing as user
  const { isRealAdmin, isLoading: isAdminLoading, error: adminError } = useAdmin();
  const navigate = useNavigate();
  const isLoading = isUserLoading || isAdminLoading;

  // Debug logging
  useEffect(() => {
    console.log('[AdminGuard] State:', { 
      user: user && (user as any).uid, 
      isUserLoading, 
      isRealAdmin, 
      isAdminLoading, 
      isLoading,
      adminError
    });
  }, [user, isUserLoading, isRealAdmin, isAdminLoading, isLoading, adminError]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('[AdminGuard] No user, redirecting to login');
        navigate({ to: '/login' });
      } else if (!isRealAdmin) {
        if (adminError) {
          console.error('[AdminGuard] Admin check failed with error:', adminError);
          // Optionally stay on page or show error instead of redirecting?
          // For now, let's see the error.
        }
        console.log('[AdminGuard] Not admin, redirecting to home');
        navigate({ to: '/' });
      }
    }
  }, [user, isRealAdmin, isLoading, navigate, adminError]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isRealAdmin) {
    return null;
  }

  return <>{children}</>;
}
