'use client';

import { useRouter } from '@tanstack/react-router';
// import Link from 'next/link'; // Removed
import { Upload, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUploadDialog } from '@/components/product/image-upload-dialog'; // Need to check this dependency
import { useState } from 'react';
// import { useUser, useAuth } from '@/firebase'; // Removed
// import { useAdmin } from '@/hooks/use-admin'; // Removed
// import { useUserProfile } from '@/hooks/use-user-profile'; // Removed
// import { useGeolocation } from '@/hooks/use-geolocation'; // Removed
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
// import { Badge } from '../ui/badge';
/*
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
*/
// import { ScoutCard } from '@/components/profile/scout-card';
// import LocaleSwitcher from './LocaleSwitcher'; // Removed
// import { useTranslations } from 'next-intl'; // Mocked
// import { useIsMobile } from '@/hooks/use-mobile';
import { authClient } from '@/lib/auth-client';

export function DynamicHeaderButtons() {
  // const isMobile = useIsMobile();
  const [isDialogOpen, setDialogOpen] = useState(false);
  
  // Use Better Auth Client
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  
  // Mock translations
  const t = (k: string) => {
    if (k === 'logout') return 'Logout';
    if (k === 'login') return 'Login';
    if (k === 'backToHome') return 'Back to Home';
    if (k === 'scanProduct') return 'Scan Product';
    return k;
  };

  const user = session?.user;
  const isLoading = isPending;

  const handleScanClick = () => {
    setDialogOpen(true);
  };
  
  const handleLogin = async () => {
      await authClient.signIn.social({
          provider: "google",
          callbackURL: "/"
      });
  };

  const handleLogout = async () => {
      await authClient.signOut();
      router.navigate({ to: '/' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  const renderAuthButtons = () => {
    if (user) {
      return (
        <>
           <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={handleLogout} title={t('logout')}>
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      );
    }
    return (
      <Button variant="outline" size="icon" onClick={handleLogin} title={t('login')}>
          <LogIn className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <div className="flex items-center gap-4 w-auto justify-end">
        <ImageUploadDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={handleScanClick}>
            <Upload className="mr-2 h-4 w-4" />
            <span>{t('scanProduct')}</span>
          </Button>
        </ImageUploadDialog>

      <div className="flex items-center gap-2">
        {renderAuthButtons()}
      </div>
    </div>
  );
}

