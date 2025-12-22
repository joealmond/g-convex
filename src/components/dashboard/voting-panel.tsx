'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Flag,
  MapPin,
  Locate,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useGeolocation } from '@/hooks/use-geolocation';

import { Checkbox } from '@/components/ui/checkbox';
import type { Vote, Product } from '@/lib/types';
import type { ImageAnalysisState } from '@/lib/actions-types';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useTranslations } from '@/lib/i18n';
import { useCurrentUser } from '@/hooks/use-current-user';


const FireIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 9.5c0 .938-.443 1.75-1.125 2.25-.682.5-1.125 1.5-1.125 2.25M12 7.5c0 1.5-1 3-2 3s-2-1.5-2-3c0-1.5 1-3 2-3s2 1.5 2 3z"/><path d="M10.5 15.5c-1.5-1-2.5-2.5-2.5-4.5 0-2.5 2-5 5-5s5 2.5 5 5c0 2-1 3.5-2.5 4.5"/><path d="M12.5 18.5c-1.294-.97-2-2.36-2-3.5h-1c0 1.5.706 2.53 2 3.5s2 1.5 2 2.5c0 .5-.5 1-1 1s-1-.5-1-1c0-.5.5-1 1-1h1c0 1.105-1.119 2-2.5 2S9.5 21.605 9.5 20.5s1.119-2 2.5-2 2.5.895 2.5 2z"/></svg>;
const MehIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="12" cy="12" r="10" /><line x1="8" x2="16" y1="15" y2="15" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>;
const IceIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><path d="M12 2v2.4l-3.3 3.3-2.4 2.4-3.6 3.6L2.7 20l6.1-6.1 3.6-3.6 2.4-2.4L18 4.4V2"/><path d="m21.3 11.4-3.6 3.6-2.4 2.4-3.3 3.3V22h2.4l3.3-3.3 2.4-2.4 3.6-3.6Z"/><path d="M18 4.4 12 10.5l-3.6 3.6L2.7 20"/><path d="m11.4 2.7 6.1 6.1 3.6 3.6L22 18l-6.1-6.1-3.6-3.6L8.4 4.4Z"/></svg>;


type SafetyVote = 'Clean' | 'Sketchy' | 'Wrecked';
type TasteVote = 'Yass' | 'Meh' | 'Pass';
type PriceVote = 1 | 2 | 3 | 4 | 5;

const voteMapping = {
  safety: { 'Clean': 80, 'Sketchy': 50, 'Wrecked': 20 },
  taste: { 'Yass': 80, 'Meh': 50, 'Pass': 20 }
};

const priceLabels: Record<PriceVote, string> = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
  5: '$$$$$',
};

// Predefined store list for autocomplete
const PREDEFINED_STORES = [
  'Tesco',
  'Spar',
  'Aldi',
  'Lidl',
  'Penny',
  'CBA',
  'DM',
  'Rossmann',
  'Müller',
  'COOP',
  'Auchan',
  'Interspar',
] as const;

interface VotingPanelProps {
  product: Product | null;
  productName: string;
  analysisResult: ImageAnalysisState | null;
  onVibeSubmit?: (vibe: Vote) => void;
}

export function VotingPanel({ product, productName, analysisResult, onVibeSubmit }: VotingPanelProps) {
  const [safetyVote, setSafetyVote] = useState<SafetyVote | null>(null);
  const [tasteVote, setTasteVote] = useState<TasteVote | null>(null);
  const [priceVote, setPriceVote] = useState<PriceVote | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [customStore, setCustomStore] = useState<string>('');
  const [useLocation, setUseLocation] = useState<boolean>(false);
  const { toast } = useToast();
  const { coords, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

  // Get current user (authenticated or anonymous)
  const { userId, isRegistered } = useCurrentUser();

  const t = useTranslations('VotingPanel');

  const effectiveStore = selectedStore === 'custom' ? customStore : selectedStore;


  const handleSafetyVote = (vote: SafetyVote) => {
    setSafetyVote(current => (current === vote ? null : vote));
  };

  const handleTasteVote = (vote: TasteVote) => {
    setTasteVote(current => (current === vote ? null : vote));
  };

  const handlePriceVote = (vote: PriceVote) => {
    setPriceVote(current => (current === vote ? null : vote));
  };
  


  // ... (previous state hooks)
  
  const castVoteMutation = useMutation(api.votes.castVote);
  const createProductMutation = useMutation(api.votes.createProductAndVote);

  const handleSubmit = async () => {
    if (!safetyVote || !tasteVote || !productName) return;
    
    // Determine effective store
    const effectiveStore = selectedStore === 'custom' ? customStore : selectedStore;
    
    try {
      let result;
      const commonArgs = {
        safety: voteMapping.safety[safetyVote],
        taste: voteMapping.taste[tasteVote],
        price: priceVote ?? undefined,
        storeName: effectiveStore || undefined,
        geoPoint: (useLocation && coords) ? coords : undefined,
      };

      if (product && product._id) {
          // Existing product
          const response = await castVoteMutation({
              productId: product._id as any,
              userId, // Pass current user ID (authenticated or anonymous)
              ...commonArgs
          });
          result = response;
      } else {
          // New product
          if (!analysisResult) return;
          const response = await createProductMutation({
              name: productName,
              mainImage: analysisResult.imageUrl || "",
              aiAnalysis: analysisResult.result,
              userId, // Pass current user ID (authenticated or anonymous)
              ...commonArgs
          });
          result = response;
      }

      if (result.success) {
        toast({
          title: t('vibeSubmitted'),
          description: t('vibeSubmittedDesc', { productName }),
        });
        
        // Show points earned toast for registered users (gamification feedback)
        // Note: Full gamification response can be added when mutations return these values
        if (isRegistered) {
          setTimeout(() => {
            toast({
              title: '+10 Scout Points! 🎉',
              description: 'Keep voting to earn badges!',
            });
          }, 500);
        }
        
        if (onVibeSubmit) {
            onVibeSubmit({
                ...commonArgs,
                userId,
                isRegistered,
                votedAt: new Date(),
                createdAt: new Date(),
            } as any);
        }
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit vote',
        variant: 'destructive',
      });
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 font-semibold text-center">{t('safetyQuestion')}</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => handleSafetyVote('Clean')}
              className={cn("group h-24 flex-col gap-2 transition-all active:scale-95", safetyVote === 'Clean' ? 'border-green-500 bg-green-500/10' : 'hover:border-green-500 hover:bg-green-500/10')}
            >
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <span className={cn("font-semibold", safetyVote === 'Clean' ? 'text-green-400' : 'group-hover:text-green-400')}>
                {t('clean')}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSafetyVote('Sketchy')}
              className={cn("group h-24 flex-col gap-2 transition-all active:scale-95", safetyVote === 'Sketchy' ? 'border-yellow-500 bg-yellow-500/10' : 'hover:border-yellow-500 hover:bg-yellow-500/10')}
            >
              <ShieldAlert className="h-8 w-8 text-yellow-500" />
              <span className={cn("font-semibold", safetyVote === 'Sketchy' ? 'text-yellow-400' : 'group-hover:text-yellow-400')}>
                {t('sketchy')}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSafetyVote('Wrecked')}
              className={cn("group h-24 flex-col gap-2 transition-all active-scale-95", safetyVote === 'Wrecked' ? 'border-red-500 bg-red-500/10' : 'hover:border-red-500 hover:bg-red-500/10')}
            >
              <ShieldX className="h-8 w-8 text-red-500" />
              <span className={cn("font-semibold", safetyVote === 'Wrecked' ? 'text-red-400' : 'group-hover:text-red-400')}>
                {t('wrecked')}
              </span>
            </Button>
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-semibold text-center">{t('tasteQuestion')}</h3>
          <div className="grid grid-cols-3 gap-2">
             <Button
              variant="outline"
              onClick={() => handleTasteVote('Yass')}
              className={cn("group h-24 flex-col gap-2 transition-all active:scale-95", tasteVote === 'Yass' ? 'border-primary bg-primary/10' : 'hover:border-primary hover:bg-primary/10')}
            >
              <FireIcon />
              <span className={cn("font-semibold", tasteVote === 'Yass' ? 'text-primary' : 'group-hover:text-primary')}>
                {t('yass')}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTasteVote('Meh')}
              className={cn("group h-24 flex-col gap-2 transition-all active:scale-95", tasteVote === 'Meh' ? 'bg-secondary' : 'hover:bg-secondary/80')}
            >
              <MehIcon />
              <span className={cn("font-semibold", tasteVote === 'Meh' ? 'text-foreground' : 'group-hover:text-foreground')}>
                {t('meh')}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTasteVote('Pass')}
              className={cn("group h-24 flex-col gap-2 transition-all active:scale-95", tasteVote === 'Pass' ? 'border-destructive bg-destructive/10' : 'hover:border-destructive hover:bg-destructive/10')}
            >
              <IceIcon />
              <span className={cn("font-semibold", tasteVote === 'Pass' ? 'text-destructive' : 'group-hover:text-destructive')}>
                {t('pass')}
              </span>
            </Button>
          </div>
        </div>
        {/* Price Section */}
        <div>
          <h3 className="mb-2 font-semibold text-center">{t('priceQuestion')}</h3>
          <div className="flex justify-center gap-2">
            {([1, 2, 3, 4, 5] as PriceVote[]).map((val) => (
              <Button
                key={val}
                variant="outline"
                onClick={() => handlePriceVote(val)}
                className={cn(
                  "group h-16 w-16 flex-col gap-1 transition-all active:scale-95 text-lg font-bold",
                  priceVote === val
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-400'
                )}
              >
                {priceLabels[val]}
              </Button>
            ))}
          </div>
        </div>
        {/* Store Section */}
        <div>
          <h3 className="mb-2 font-semibold text-center flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('storeQuestion')}
          </h3>
          <div className="space-y-2">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectStore')} />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_STORES.map((store) => (
                  <SelectItem key={store} value={store}>
                    {store}
                  </SelectItem>
                ))}
                <SelectItem value="custom">{t('customStore')}</SelectItem>
              </SelectContent>
            </Select>
            {selectedStore === 'custom' && (
              <Input
                placeholder={t('enterStoreName')}
                value={customStore}
                onChange={(e) => setCustomStore(e.target.value)}
              />
            )}
            {/* Use My Location checkbox - only show when a store is selected */}
            {effectiveStore && (
              <div className="flex items-center gap-2 mt-2">
                <Checkbox 
                  id="use-location" 
                  checked={useLocation}
                  onCheckedChange={(checked) => {
                    setUseLocation(!!checked);
                    if (checked && !coords) {
                      requestLocation();
                    }
                  }}
                />
                <label 
                  htmlFor="use-location" 
                  className="text-sm text-muted-foreground flex items-center gap-2 cursor-pointer"
                >
                  <Locate className="h-4 w-4" />
                  {t('useMyLocation')}
                  {geoLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {useLocation && coords && <span className="text-green-500 text-xs">✓</span>}
                </label>
              </div>
            )}
            {geoError && (
              <p className="text-xs text-destructive">{geoError}</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
         <Button onClick={handleSubmit} disabled={!safetyVote || !tasteVote} className="w-full">
          {t('submitVibe')}
        </Button>
         <Button variant="link" className="text-muted-foreground w-full">
          <Flag className="mr-2 h-4 w-4" />
          {t('reportProduct')}
        </Button>
      </CardFooter>
    </Card>
  );
}
