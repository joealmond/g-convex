import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { AdminProductList } from '@/components/dashboard/admin-product-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { useAdmin } from '@/hooks/use-admin'
import { useTranslations } from '@/lib/i18n'
import { useState } from 'react'
import { useMutation as useConvexMutationDirect } from 'convex/react'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const t = useTranslations('Admin');
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  // Fetch products
  const { data: products } = useSuspenseQuery(convexQuery(api.products.list, { limit: 100 }));
  
  // Recalculate all mutation
  const recalculateAllMutation = useConvexMutationDirect(api.products.recalculateAll);
  
  const handleRecalculateAll = async () => {
    setIsRecalculating(true);
    try {
      const result = await recalculateAllMutation();
      if (result.success) {
        toast({
          title: t('recalculateAllSuccess') || 'Recalculation Complete',
          description: t('recalculateAllSuccessDesc', { count: result.processed }) || `${result.processed} products recalculated`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('recalculateAllFailed') || 'Recalculation Failed',
          description: `${result.errors} errors occurred`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('recalculateAllFailed') || 'Recalculation Failed',
        description: error.message,
      });
    } finally {
      setIsRecalculating(false);
    }
  };
  
  // Check admin access
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShieldCheck className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-headline">{t('accessDenied') || 'Access Denied'}</h1>
        <p className="text-muted-foreground">{t('adminRequired') || 'Admin privileges required'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline">{t('title') || 'Admin Dashboard'}</h1>
          <p className="text-muted-foreground">{t('subtitle') || 'Manage products and recalculate stats'}</p>
        </div>
        <Button 
          onClick={handleRecalculateAll}
          disabled={isRecalculating}
          variant="outline"
        >
          {isRecalculating ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t('recalculateAll') || 'Recalculate All'}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('productManagement') || 'Product Management'}</CardTitle>
          <CardDescription>
            {t('productCount', { count: products?.length || 0 }) || `${products?.length || 0} products`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminProductList
            chartData={(products as any) || []}
            loading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
