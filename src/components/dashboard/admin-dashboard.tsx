'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { MatrixChart } from '@/components/dashboard/matrix-chart';
import { ProductSearch } from '@/components/dashboard/product-search';
import { AdminProductList } from '@/components/dashboard/admin-product-list';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  chartData: Array<Product>;
  loading: boolean;
}

export function AdminDashboard({ chartData, loading }: AdminDashboardProps) {
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  // const { toast } = useToast();

  const filteredData = useMemo(() => {
    if (!chartData) return [];
    if (!searchTerm) {
      return chartData;
    }
    return chartData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, chartData]);

  const handlePointClick = (productName: string) => {
    setHighlightedProduct(productName);
    const element = document.getElementById(`product-item-${productName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleItemClick = (productName: string) => {
    setHighlightedProduct(productName);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <MatrixChart
          chartData={filteredData || []}
          onPointClick={handlePointClick}
          highlightedProduct={highlightedProduct}
        />
      </div>
      <div className="lg:col-span-1 flex flex-col gap-6">
        <ProductSearch
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
        <AdminProductList
          chartData={filteredData || []}
          loading={loading}
          onItemClick={handleItemClick}
          highlightedProduct={highlightedProduct}
        />
      </div>
    </div>
  );
}
