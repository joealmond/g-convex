'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Link } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { recalculateProductAveragesWithTimeDecay } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTranslations } from '@/lib/i18n';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

type AdminProductListProps = {
  chartData: Product[];
  onItemClick?: (productName: string) => void;
  highlightedProduct?: string | null;
  loading: boolean;
};

export function AdminProductList({ chartData, onItemClick, highlightedProduct, loading }: AdminProductListProps) {
    const { toast } = useToast();
    const t = useTranslations('AdminProductList');
    const [recalculatingId, setRecalculatingId] = useState<string | null>(null);
    const deleteProductMutation = useMutation(api.products.deleteProduct);

    const handleDelete = async (productId: string, productName: string) => {
        try {
            await deleteProductMutation({ productId: productId as Id<"products"> });
            toast({
                title: t('productDeleted'),
                description: t('productDeletedDesc', { productName }),
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Delete failed',
                description: error.message,
            });
        }
    };

    const handleRecalculate = async (productId: string, productName: string) => {
        setRecalculatingId(productId);
        try {
            const result = await recalculateProductAveragesWithTimeDecay(productId);
            if (result.success) {
                toast({
                    title: t('recalculateSuccess') || 'Recalculated',
                    description: t('recalculateSuccessDesc', { productName }) || `Stats recalculated for ${productName}`,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: t('recalculateFailed') || 'Recalculate failed',
                    description: result.error,
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('recalculateFailed') || 'Recalculate failed',
                description: error.message,
            });
        } finally {
            setRecalculatingId(null);
        }
    };

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
              key={item.id}
              id={`product-item-${item.name}`}
              className={cn(
                "rounded-md transition-all scroll-mt-20 flex items-center gap-2",
                highlightedProduct === item.name ? 'bg-muted ring-2 ring-primary' : 'hover:bg-muted'
              )}
              style={{scrollMarginTop: '80px'}} // For smooth scroll offset
            >
              <Link 
                to={`/product/$name`}
                params={{ name: item.name }}
                className="flex-1 flex items-center gap-4 p-2 cursor-pointer"
                onClick={() => onItemClick?.(item.name)}
                >
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
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{t('safety', { value: Math.round(item.avgSafety || 0) })}</span>
                    <span>•</span>
                    <span>{t('taste', { value: Math.round(item.avgTaste || 0) })}</span>
                  </div>
                </div>
              </Link>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleRecalculate(item._id ?? item.id, item.name)}
                    disabled={recalculatingId === (item._id ?? item.id)}
                >
                    <RefreshCw className={cn("h-4 w-4", recalculatingId === (item._id ?? item.id) && "animate-spin")} />
                    <span className="sr-only">{t('recalculate') || 'Recalculate'}</span>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive mr-2">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t('delete')}</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('confirmDeleteDesc')}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item._id ?? item.id, item.name)} className="bg-destructive hover:bg-destructive/90">
                            {t('delete')}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
