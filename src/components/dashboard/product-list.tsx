'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Link } from '@tanstack/react-router';
import { Users, ShieldCheck, MapPin } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

type ProductListProps = {
  chartData: Product[];
  onItemClick?: (productName: string) => void;
  highlightedProduct?: string | null;
  loading: boolean;
};

export function ProductList({ chartData, onItemClick, highlightedProduct, loading }: ProductListProps) {
  const t = useTranslations('ProductList');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <ul className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </ul>
        )}
        {!loading && chartData.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
                <p>{t('noProducts')}</p>
                <p className="text-sm">{t('scanToStart')}</p>
            </div>
        )}
        <ul className="space-y-2">
          {chartData.map((item) => (
            <li
              key={item._id ?? item.id}
              id={`product-item-${item.name}`}
              onClick={() => onItemClick?.(item.name)}
              className={cn(
                "rounded-md transition-all scroll-mt-20",
                highlightedProduct === item.name ? 'bg-muted ring-2 ring-primary' : 'hover:bg-muted'
              )}
              style={{scrollMarginTop: '80px'}} // For smooth scroll offset
            >
              <Link to="/product/$name" params={{ name: item.name }} className="flex items-center gap-4 p-2 cursor-pointer">
                <div
                  className="h-12 w-12 rounded-md bg-muted flex-shrink-0 relative overflow-hidden"
                >
                  {item?.mainImage ? (
                    <img
                      src={item.mainImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground"></span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t('safety', { value: Math.round(item.avgSafety || 0) })}</span>
                    <span>•</span>
                    <span>{t('taste', { value: Math.round(item.avgTaste || 0) })}</span>
                  </div>
                  {/* Vote counts */}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      <Users className="h-3 w-3 mr-1" />
                      {item.voteCount || 0}
                    </Badge>
                    {(item.registeredVoteCount || 0) > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        {item.registeredVoteCount}
                      </Badge>
                    )}
                  </div>
                  {/* Store badges with freshness indicator */}
                  {item.stores && item.stores.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {item.stores.slice(0, 3).map((store: any) => {
                        // Calculate freshness based on lastSeenAt
                        let opacity = 'opacity-100';
                        if (store.lastSeenAt) {
                          const lastSeen = store.lastSeenAt instanceof Date 
                            ? store.lastSeenAt 
                            : (store.lastSeenAt.toDate ? store.lastSeenAt.toDate() : new Date(store.lastSeenAt));
                          const daysSince = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
                          if (daysSince > 30) {
                            opacity = 'opacity-30';
                          } else if (daysSince > 7) {
                            opacity = 'opacity-60';
                          }
                        }
                        return (
                          <Badge 
                            key={store.name} 
                            variant="outline" 
                            className={`text-xs px-1 py-0 text-muted-foreground ${opacity}`}
                          >
                            {store.name}
                          </Badge>
                        );
                      })}
                      {item.stores.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{item.stores.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
