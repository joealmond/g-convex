'use client';
import { useCallback, useState } from 'react';
import { useMutation } from 'convex/react';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { api } from '../../../convex/_generated/api';
import { ProductVibeChart } from './product-vibe-chart';
import { DraggableDot } from './draggable-dot';
import type { Product, Vote } from '@/lib/types';
import type { Id } from '../../../convex/_generated/dataModel';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/lib/i18n';
import { useCurrentUser } from '@/hooks/use-current-user';

interface FineTunePanelProps {
  product: Product;
  initialVote: Vote | null;
  productId: Id<"products">;
}

export function FineTunePanel({ initialVote, productId }: FineTunePanelProps) {
  const [vibe, setVibe] = useState({
    safety: initialVote?.safety ?? 50,
    taste: initialVote?.taste ?? 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('FineTunePanel');
  const { userId } = useCurrentUser();
  
  // Convex mutation for casting vote
  const castVote = useMutation(api.votes.castVote);

  const handleVibeChange = (newVibe: {
    safety: number;
    taste: number;
  }) => {
    setVibe(newVibe);
  };

  const handleSliderChange = (type: 'safety' | 'taste', value: Array<number>) => {
    setVibe(prev => ({...prev, [type]: value[0]}));
  }

  const handleSubmit = useCallback(async () => {
    if (!userId) return;
    setIsSubmitting(true);

    try {
      await castVote({
        productId,
        safety: vibe.safety,
        taste: vibe.taste,
        userId,
      });
      
      toast({
        title: t('fineTuneComplete'),
        description: t('fineTuneCompleteDesc')
      });
    } catch (e: any) {
      console.error('Fine-tune submit error:', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e.message || 'Failed to submit fine-tuned vote'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, productId, vibe, castVote, toast, t]);

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
        <Button onClick={handleSubmit} disabled={isSubmitting || !userId} className="w-full">
            {isSubmitting ? t('submitting') : t('submitButton')}
        </Button>
      </CardFooter>
    </Card>
  );
}
