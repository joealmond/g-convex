'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState, useCallback }from 'react';
import type { Product, Vote } from '@/lib/types';
import { ProductVibeChart } from './product-vibe-chart';
import { DraggableDot } from './draggable-dot';
// import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
// import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
// import { errorEmitter } from '@/firebase/error-emitter';
// import {
//   FirestorePermissionError,
//   type SecurityRuleContext,
// } from '@/firebase/errors';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useTranslations } from '@/lib/i18n';

interface FineTunePanelProps {
  product: Product;
  initialVote: Vote | null;
}

export function FineTunePanel({ product, initialVote }: FineTunePanelProps) {
  const [vibe, setVibe] = useState({
    safety: initialVote?.safety ?? 50,
    taste: initialVote?.taste ?? 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const firestore = useFirestore();
  const { toast } = useToast();
  const t = useTranslations('FineTunePanel');
  
  // Use a placeholder or anonymous ID since auth is disabled
  const userId = `anonymous_${Date.now()}`;


  const handleVibeChange = (newVibe: {
    safety: number;
    taste: number;
  }) => {
    setVibe(newVibe);
  };

  const handleSliderChange = (type: 'safety' | 'taste', value: number[]) => {
    setVibe(prev => ({...prev, [type]: value[0]}));
  }

  const handleSubmit = useCallback(async () => {
    if (!userId || !initialVote) return;
    setIsSubmitting(true);

    try {
      console.log("Mock fine-tune submit", { vibe, product });
      toast({
        title: t('fineTuneComplete'),
        description: t('fineTuneCompleteDesc')
      })
    } catch (e: any) {
        console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, product.id, product.voteCount, product.avgSafety, product.avgTaste, initialVote, vibe, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6 h-[400px]">
          <ProductVibeChart />
          <DraggableDot
            safety={vibe.safety}
            taste={vibe.taste}
            onVibeChange={handleVibeChange}
          />
        </div>
        <div className="space-y-4 pt-4">
            <div>
                <Label htmlFor="safety-slider" className="mb-2 block">{t('safetyLabel', { value: vibe.safety })}</Label>
                <Slider
                    id="safety-slider"
                    value={[vibe.safety]}
                    onValueChange={(val) => handleSliderChange('safety', val)}
                    max={100}
                    step={1}
                    disabled={isSubmitting}
                />
            </div>
             <div>
                <Label htmlFor="taste-slider" className="mb-2 block">{t('tasteLabel', { value: vibe.taste })}</Label>
                <Slider
                    id="taste-slider"
                    value={[vibe.taste]}
                    onValueChange={(val) => handleSliderChange('taste', val)}
                    max={100}
                    step={1}
                    disabled={isSubmitting}
                />
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? t('submitting') : t('submitButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
