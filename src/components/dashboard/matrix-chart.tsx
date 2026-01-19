'use client';

import { ArrowRight, ArrowUp } from 'lucide-react';
import type { Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from '@/lib/i18n';

export const chartColors = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
];

// Generate a consistent color index based on product name
export function getColorForProduct(productName: string): string {
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % chartColors.length;
  return chartColors[index];
}

// Quadrant colors - FIXED for both modes (position-based, not mode-based)
// Green = best of both coordinates (top-right)
// Red = worst of both coordinates (bottom-left)
const QUADRANT_COLORS = {
  topRight: 'bg-green-500/15',   // Best: high X, high Y
  topLeft: 'bg-yellow-500/10',   // Mixed: low X, high Y
  bottomRight: 'bg-orange-500/10', // Mixed: high X, low Y
  bottomLeft: 'bg-red-500/15',   // Worst: low X, low Y
};

export type ChartMode = 'vibe' | 'value';

type MatrixChartProps = {
  chartData: Array<Product>;
  highlightedProduct?: string | null;
  onPointClick?: (productName: string) => void;
  mode?: ChartMode;
};

export function MatrixChart({
  chartData,
  highlightedProduct,
  onPointClick,
  mode = 'vibe',
}: MatrixChartProps) {
  // Translations
  const t = useTranslations('MatrixChart');
  
  // Dynamic labels based on mode and locale
  const labels = {
    topRight: mode === 'vibe' ? t('holyGrail') : t('treat'),
    topLeft: mode === 'vibe' ? t('survivorFood') : t('ripOff'),
    bottomRight: mode === 'vibe' ? t('russianRoulette') : t('theSteal'),
    bottomLeft: mode === 'vibe' ? t('theBin') : t('cheapFiller'),
  };
  // Colors are now fixed - same for all modes

  // Map data - fixed 0-100 scale for all modes
  const mappedData = chartData
    .filter(item => item.avgTaste !== undefined && item.avgSafety !== undefined)
    .map(item => {
      // For value mode: map price 1-5 to 0-100 scale
      // Price 1 = bottom (0), Price 5 = top (100)
      const yValue = mode === 'vibe' 
        ? (item.avgSafety ?? 50)
        : item.avgPrice ? ((item.avgPrice - 1) / 4) * 100 : 50;
      
      return {
        name: item.name,
        x: item.avgTaste ?? 50,
        y: yValue,
        color: getColorForProduct(item.name),
      };
    });

  const title = mode === 'vibe' ? t('title') : t('valueLensTitle');
  const yLabel = mode === 'vibe' ? t('safetyLabel') : t('priceLabel');
  const xLabel = t('tasteAxisLabel');

  // Y-axis ticks
  const yTicks = mode === 'vibe' 
    ? [0, 25, 50, 75, 100]
    : ['$', '$$', '$$$', '$$$$', '$$$$$'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <span>{yLabel}</span>
          <ArrowUp className="h-4 w-4" />
          <span>{t('vsLabel')}</span>
          <ArrowRight className="h-4 w-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full">
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between items-end pr-1 text-xs text-muted-foreground">
            {yTicks.slice().reverse().map((tick, i) => (
              <span key={i}>{tick}</span>
            ))}
          </div>

          {/* Y-Axis Title - positioned further left to avoid overlap */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
            {yLabel}
          </div>

          {/* Main Chart Area */}
          <div className="ml-10 mr-2">
            <div className="relative w-full aspect-[16/10] rounded-md border border-border overflow-hidden">
              {/* Quadrant Grid - 2x2 */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                {/* Top-Left Quadrant */}
                <div className={cn('relative border-r border-b border-border/50', QUADRANT_COLORS.topLeft)}>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                    {labels.topLeft}
                  </span>
                </div>
                {/* Top-Right Quadrant */}
                <div className={cn('relative border-b border-border/50', QUADRANT_COLORS.topRight)}>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                    {labels.topRight}
                  </span>
                </div>
                {/* Bottom-Left Quadrant */}
                <div className={cn('relative border-r border-border/50', QUADRANT_COLORS.bottomLeft)}>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                    {labels.bottomLeft}
                  </span>
                </div>
                {/* Bottom-Right Quadrant */}
                <div className={cn('relative', QUADRANT_COLORS.bottomRight)}>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                    {labels.bottomRight}
                  </span>
                </div>
              </div>

              {/* Product Dots */}
              <TooltipProvider delayDuration={0}>
                {mappedData.map((item) => (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'absolute w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-150',
                          highlightedProduct === item.name && 'ring-2 ring-white ring-offset-2 ring-offset-background scale-150 z-10'
                        )}
                        style={{
                          left: `${item.x}%`,
                          bottom: `${item.y}%`,
                          backgroundColor: item.color,
                          transform: 'translate(-50%, 50%)',
                          boxShadow: `0 2px 4px ${item.color}80`,
                        }}
                        onClick={() => onPointClick?.(item.name)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="font-semibold" style={{ color: item.color }}>{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mode === 'vibe' 
                          ? `Safety: ${Math.round(item.y)}% | Taste: ${Math.round(item.x)}%`
                          : `Taste: ${Math.round(item.x)}%`
                        }
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>

            {/* X-Axis Title */}
            <div className="text-center mt-1 text-xs text-muted-foreground">
              {xLabel} Score
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
