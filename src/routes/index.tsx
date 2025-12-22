import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useState, useMemo } from 'react'
import { ProductList } from '@/components/dashboard/product-list'
import { ProductSearch } from '@/components/dashboard/product-search'
import { MatrixChart, type ChartMode } from '@/components/dashboard/matrix-chart'
import { Button } from '@/components/ui/button'
import { Loader2, MapPinned } from 'lucide-react'
import { useGeolocation } from '@/hooks/use-geolocation'
import type { Product } from '@/lib/types'

// Mock translations
const t = (key: string) => {
    const map: Record<string, string> = {
        'vibeLens': 'Vibe Lens',
        'valueLens': 'Value Lens',
        'nearMe': 'Near Me',
        'holyGrail': 'Holy Grail',
        'theSteal': 'The Steal',
        'survivorFood': 'Survivor Food',
        'cheapFiller': 'Cheap Filler',
        'russianRoulette': 'Russian Roulette',
        'treat': 'Treat',
        'theBin': 'The Bin',
        'ripOff': 'Rip Off',
    };
    return map[key] || key;
}

const QUADRANT_TASTE_THRESHOLD = 50;
const QUADRANT_SAFETY_THRESHOLD = 50;
const NEAR_ME_RADIUS_KM = 5;

// Quadrant definitions
type QuadrantFilter = 'all' | 'holyGrail' | 'survivorFood' | 'russianRoulette' | 'theBin';

const quadrantConfig = {
  holyGrail: { minTaste: QUADRANT_TASTE_THRESHOLD, maxTaste: 100, minSafety: QUADRANT_SAFETY_THRESHOLD, maxSafety: 100 },
  survivorFood: { minTaste: 0, maxTaste: QUADRANT_TASTE_THRESHOLD, minSafety: QUADRANT_SAFETY_THRESHOLD, maxSafety: 100 },
  russianRoulette: { minTaste: QUADRANT_TASTE_THRESHOLD, maxTaste: 100, minSafety: 0, maxSafety: QUADRANT_SAFETY_THRESHOLD },
  theBin: { minTaste: 0, maxTaste: QUADRANT_TASTE_THRESHOLD, minSafety: 0, maxSafety: QUADRANT_SAFETY_THRESHOLD },
};

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
    // Fetch Data from Convex
    const { data: products } = useSuspenseQuery(convexQuery(api.products.list, { limit: 100 }));
    // Note: products type needs to assume it matches Product interface roughly

    const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [quadrantFilter, setQuadrantFilter] = useState<QuadrantFilter>('all');
    const [chartMode, setChartMode] = useState<ChartMode>('vibe');
    const [nearMeFilter, setNearMeFilter] = useState(false);
    
    // Kept the hook as is (client-side)
    const { coords, loading: geoLoading, requestLocation } = useGeolocation();

    const filteredData = useMemo(() => {
        if (!products) return [];
        let data = products as unknown as Product[]; // Cast for now

        // Apply search
        if (searchTerm) {
            data = data.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply quadrant
        if (quadrantFilter !== 'all') {
            const config = quadrantConfig[quadrantFilter];
            data = data.filter(item => 
                item.avgTaste >= config.minTaste && 
                item.avgTaste < config.maxTaste &&
                item.avgSafety >= config.minSafety && 
                item.avgSafety < config.maxSafety
            );
        }

        // Apply Near Me
        if (nearMeFilter && coords) {
            data = data.filter(item => {
                if (!item.stores || item.stores.length === 0) return false;
                return item.stores.some((store: any) => {
                    if (!store.geoPoint) return false;
                    const distance = getDistanceKm(
                        coords.lat, coords.lng,
                        store.geoPoint.lat, store.geoPoint.lng
                    );
                    return distance <= NEAR_ME_RADIUS_KM;
                });
            });
        }
        return data;
    }, [products, searchTerm, quadrantFilter, nearMeFilter, coords]);

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

    const handleQuadrantClick = (quadrant: QuadrantFilter) => {
        setQuadrantFilter(current => current === quadrant ? 'all' : quadrant);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                        variant={chartMode === 'vibe' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartMode('vibe')}
                    >
                        {t('vibeLens')}
                    </Button>
                    <Button
                        variant={chartMode === 'value' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChartMode('value')}
                    >
                        {t('valueLens')}
                    </Button>
                    <Button
                        variant={nearMeFilter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                            if (!nearMeFilter && !coords) {
                                requestLocation();
                            }
                            setNearMeFilter(!nearMeFilter);
                        }}
                        disabled={geoLoading}
                        className={nearMeFilter ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    >
                        {geoLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                            <MapPinned className="h-4 w-4 mr-1" />
                        )}
                        {t('nearMe')}
                    </Button>
                </div>
                
                <MatrixChart
                    chartData={filteredData}
                    onPointClick={handlePointClick}
                    highlightedProduct={highlightedProduct}
                    mode={chartMode}
                />

                <div className="flex gap-2 justify-center">
                   <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuadrantClick('holyGrail')}
                        className={`bg-green-500/30 hover:bg-green-500/50 ${quadrantFilter === 'holyGrail' ? 'ring-2 ring-green-500' : ''}`}
                    >
                        {chartMode === 'vibe' ? t('holyGrail') : t('theSteal')}
                    </Button>
                    <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuadrantClick('survivorFood')}
                        className={`bg-yellow-500/30 hover:bg-yellow-500/50 ${quadrantFilter === 'survivorFood' ? 'ring-2 ring-yellow-500' : ''}`}
                    >
                        {chartMode === 'vibe' ? t('survivorFood') : t('cheapFiller')}
                    </Button>
                    <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuadrantClick('russianRoulette')}
                        className={`bg-red-500/30 hover:bg-red-500/50 ${quadrantFilter === 'russianRoulette' ? 'ring-2 ring-red-500' : ''}`}
                    >
                        {chartMode === 'vibe' ? t('russianRoulette') : t('treat')}
                    </Button>
                    <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuadrantClick('theBin')}
                        className={`bg-gray-500/30 hover:bg-gray-500/50 ${quadrantFilter === 'theBin' ? 'ring-2 ring-gray-500' : ''}`}
                    >
                        {chartMode === 'vibe' ? t('theBin') : t('ripOff')}
                    </Button>
                </div>
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6">
                 <ProductSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                 <ProductList
                  chartData={filteredData}
                  loading={false}
                  onItemClick={handleItemClick}
                  highlightedProduct={highlightedProduct}
                />
            </div>
        </div>
    );
}
