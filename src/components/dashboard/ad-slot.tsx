'use client';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';

export function AdSlot() {
  const t = useTranslations('AdSlot');
  
  return (
    <Card className="flex min-h-[120px] items-center justify-center border-dashed">
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground">{t('placeholder')}</p>
      </CardContent>
    </Card>
  );
}
