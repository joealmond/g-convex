'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useImpersonate } from '@/hooks/use-impersonate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield, User } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export function AdminToolbar() {
  const { isRealAdmin } = useAdmin();
  const { isViewingAsUser, toggleViewAsUser, stopViewingAsUser, impersonatedUserId } = useImpersonate();
  const t = useTranslations('AdminToolbar');

  // Only show for real admins
  if (!isRealAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-2">
      {isViewingAsUser ? (
        <>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
            <Eye className="h-3 w-3 mr-1" />
            {t('viewingAsUser')}
          </Badge>
          {impersonatedUserId && (
            <Badge variant="outline" className="text-xs font-mono">
              <User className="h-3 w-3 mr-1" />
              {impersonatedUserId.slice(0, 8)}...
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={stopViewingAsUser}
            className="text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            {t('backToAdmin')}
          </Button>
        </>
      ) : (
        <>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/50">
            <Shield className="h-3 w-3 mr-1" />
            {t('adminMode')}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleViewAsUser}
            className="text-xs"
          >
            <EyeOff className="h-3 w-3 mr-1" />
            {t('viewAsUser')}
          </Button>
        </>
      )}
    </div>
  );
}
