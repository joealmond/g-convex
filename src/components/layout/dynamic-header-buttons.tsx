'use client';

import { useRouter, useLocation, Link } from '@tanstack/react-router';
import { ArrowLeft, Upload, LogIn, LogOut, User, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUploadDialog } from '@/components/product/image-upload-dialog';
import { useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { ScoutCard } from '@/components/profile/scout-card';
import { LanguageSwitcher } from './language-switcher';
import { authClient } from '@/lib/auth-client';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useTranslations } from '@/lib/i18n';

export function DynamicHeaderButtons() {
  const t = useTranslations('DynamicHeaderButtons');
  const [isDialogOpen, setDialogOpen] = useState(false);
  
  // Use Better Auth Client
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const location = useLocation();
  
  // User profile for ScoutCard
  const { profile } = useUserProfile();
  
  // Location for GPS indicator
  const { coords, error: geoError, requestLocation } = useGeolocation();

  const user = session?.user;
  const isLoading = isPending;
  
  // Location status
  const hasLocation = !!coords;
  const locationDenied = !!geoError;
  
  // Check if on a "special" page that needs Back to Home button
  const isSpecialPage = location.pathname.startsWith('/product/') || 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/profile');

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
        <Skeleton className="h-10 w-10" />
      </div>
    );
  }

  const renderAuthButtons = () => {
    if (user) {
      return (
        <>
          {/* Scout Points badge - only for users with points */}
          {profile && profile.points > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-yellow-500">{profile.points}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <ScoutCard profile={profile} />
              </PopoverContent>
            </Popover>
          )}
          {/* User avatar */}
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
      {isSpecialPage ? (
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>{t('backToHome')}</span>
          </Link>
        </Button>
      ) : (
        <ImageUploadDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={handleScanClick}>
            <Upload className="mr-2 h-4 w-4" />
            <span>{t('scanProduct')}</span>
          </Button>
        </ImageUploadDialog>
      )}

      <div className="flex items-center gap-2">
        {/* Location button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={requestLocation}
          title={hasLocation ? t('locationEnabled') : t('enableLocation')}
          className={hasLocation ? 'text-green-500' : locationDenied ? 'text-red-500' : ''}
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <LanguageSwitcher />
        {renderAuthButtons()}
      </div>
    </div>
  );
}
