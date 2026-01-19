'use client';

import { useRef } from 'react';
import { Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export function ProductSearch({ searchTerm, onSearchTermChange }: ProductSearchProps) {
  const t = useTranslations('ProductSearch');
  // const t = (k: string) => {
  //   if (k === 'findYourVibe') return 'Find Your Vibe';
  //   if (k === 'searchPlaceholder') return 'Search products...';
  //   return k;
  // };
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    if (isMobile && cardRef.current) {
      // Small delay to ensure the keyboard has started opening
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <Card ref={cardRef}>
      <CardHeader>
        <CardTitle className="font-headline">{t('findYourVibe')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="w-full pl-8"
            value={searchTerm}
            onChange={e => onSearchTermChange(e.target.value)}
            onFocus={handleFocus}
          />
        </div>
      </CardContent>
    </Card>
  );
}
