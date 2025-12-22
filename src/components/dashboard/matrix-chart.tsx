'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/lib/types';
import { ArrowRight, ArrowUp } from 'lucide-react';
import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Label,
  ReferenceArea,
  ZAxis,
} from 'recharts';
// import { useTranslations } from 'next-intl';
// Mock t function
const t = (key: string) => {
    const map: Record<string, string> = {
        'title': 'Vibe Matrix',
        'valueLensTitle': 'Value Matrix',
        'safetyLabel': 'Safety',
        'priceLabel': 'Price',
        'vsLabel': 'vs',
        'safetyAxisLabel': 'Safety Score',
        'priceAxisLabel': 'Price',
        'tasteAxisLabel': 'Taste Score',
        'holyGrail': 'HOLY GRAIL',
        'survivorFood': 'SURVIVOR FOOD',
        'theBin': 'THE BIN',
        'russianRoulette': 'RUSSIAN ROULETTE',
        'theSteal': 'THE STEAL',
        'cheapFiller': 'CHEAP FILLER',
        'ripOff': 'RIP OFF',
        'treat': 'TREAT'
    };
    return map[key] || key;
};

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

const chartConfig = {
  safety: {
    label: 'Safety',
  },
  taste: {
    label: 'Taste',
  },
  price: {
    label: 'Price',
  },
  product: {
    label: 'Product',
  },
};

export type ChartMode = 'vibe' | 'value';

type MatrixChartProps = {
  chartData: Product[];
  highlightedProduct?: string | null;
  onPointClick?: (productName: string) => void;
  mode?: ChartMode;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload, onPointClick, highlightedProduct, fill } = props;

  if (isNaN(cx) || isNaN(cy)) {
    return null;
  }

  const isHighlighted = highlightedProduct === payload.name;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isHighlighted ? 10 : 6}
      fill={fill}
      stroke={isHighlighted ? 'hsl(var(--card))' : 'transparent'}
      strokeWidth={2}
      onClick={() => onPointClick?.(payload.name)}
      className="cursor-pointer transition-all"
      style={{ filter: `drop-shadow(0 2px 4px ${fill}A0)` }}
    />
  );
};


export function MatrixChart({
  chartData,
  highlightedProduct,
  onPointClick,
  mode = 'vibe',
}: MatrixChartProps) {
  const isMobile = useIsMobile();
  // const t = useTranslations('MatrixChart');
  
  // Map data based on mode
  // For Value lens: price 1 (cheap) -> 20 (bottom), price 5 (expensive) -> 100 (top)
  const dataWithCoords = chartData
    .filter(item => item.avgTaste !== undefined && item.avgSafety !== undefined)
    .map(item => {
      // Direct mapping: 1->20, 5->100 (cheap at bottom, expensive at top)
      const priceChartValue = item.avgPrice ? (item.avgPrice - 1) * 20 + 20 : 50; // 1->20, 5->100, no price->50
      return {
        ...item,
        taste: item.avgTaste,
        safety: item.avgSafety,
        price: priceChartValue,
        product: item.name,
      };
    });

  const showDots = dataWithCoords.length > 0;
  const yDataKey = mode === 'vibe' ? 'safety' : 'price';
  const yAxisLabel = mode === 'vibe' ? t('safetyAxisLabel') : t('priceAxisLabel');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{mode === 'vibe' ? t('title') : t('valueLensTitle')}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <span>{mode === 'vibe' ? t('safetyLabel') : t('priceLabel')}</span>
          <ArrowUp className="h-4 w-4" />
          <span>{t('vsLabel')}</span>
          <ArrowRight className="h-4 w-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full cursor-default">
          <ChartContainer
            config={chartConfig}
            className="w-full aspect-square sm:aspect-video min-h-[300px]"
          >
            <ScatterChart
              margin={{
                top: 20,
                right: isMobile ? 10 : 20,
                bottom: 20,
                left: isMobile ? -20 : 0,
              }}
            >
                {/* Quadrant Backgrounds - colors depend on mode */}
                {/* Top-Right: Vibe=Holy Grail(Green), Value=Treat(Yellow) */}
                <ReferenceArea
                  x1={50}
                  x2={100}
                  y1={50}
                  y2={100}
                  stroke={mode === 'vibe' ? "hsl(var(--accent) / 0.2)" : "hsl(var(--muted) / 0.3)"}
                  fill={mode === 'vibe' ? "hsl(var(--accent) / 0.1)" : "hsl(var(--muted) / 0.2)"}
                  ifOverflow="visible"
                />
                {/* Top-Left: Vibe=Survivor Food(Muted), Value=Rip-off(Red) */}
                <ReferenceArea
                  x1={0}
                  x2={50}
                  y1={50}
                  y2={100}
                  stroke={mode === 'vibe' ? "hsl(var(--muted) / 0.3)" : "hsl(var(--destructive) / 0.3)"}
                  fill={mode === 'vibe' ? "hsl(var(--muted) / 0.2)" : "hsl(var(--destructive) / 0.2)"}
                  ifOverflow="visible"
                />
                {/* Bottom-Right: Vibe=Russian Roulette(Red), Value=The Steal(Green) */}
                <ReferenceArea
                  x1={50}
                  x2={100}
                  y1={0}
                  y2={50}
                  stroke={mode === 'vibe' ? "hsl(var(--destructive) / 0.2)" : "hsl(var(--accent) / 0.2)"}
                  fill={mode === 'vibe' ? "hsl(var(--destructive) / 0.1)" : "hsl(var(--accent) / 0.1)"}
                  ifOverflow="visible"
                />
                {/* Bottom-Left: Vibe=The Bin(Red), Value=Cheap Filler(Muted) */}
                <ReferenceArea
                  x1={0}
                  x2={50}
                  y1={0}
                  y2={50}
                  stroke={mode === 'vibe' ? "hsl(var(--destructive) / 0.3)" : "hsl(var(--muted) / 0.3)"}
                  fill={mode === 'vibe' ? "hsl(var(--destructive) / 0.2)" : "hsl(var(--muted) / 0.2)"}
                  ifOverflow="visible"
                />

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="taste"
                  type="number"
                  name="Taste"
                  domain={[0, 100]}
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                >
                  <Label
                    value={t('tasteAxisLabel')}
                    offset={-15}
                    position="insideBottom"
                    fill="hsl(var(--foreground))"
                    className="text-sm"
                  />
                </XAxis>
                <YAxis
                  dataKey={yDataKey}
                  type="number"
                  name={mode === 'vibe' ? 'Safety' : 'Price'}
                  domain={[0, 100]}
                  ticks={mode === 'vibe' ? [0, 25, 50, 75, 100] : [20, 40, 60, 80, 100]}
                  tickFormatter={mode === 'vibe' 
                    ? (value: number) => `${value}` 
                    : (value: number) => {
                        // Map Y values to dollar signs: 20=$, 40=$$, 60=$$$, 80=$$$$, 100=$$$$$
                        const dollarMap: Record<number, string> = { 20: '$', 40: '$$', 60: '$$$', 80: '$$$$', 100: '$$$$$' };
                        return dollarMap[value] || '';
                      }
                  }
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                >
                  <Label
                    value={yAxisLabel}
                    angle={-90}
                    offset={isMobile ? 0 : 10}
                    position="insideLeft"
                    fill="hsl(var(--foreground))"
                    className="text-sm"
                  />
                </YAxis>
                
                <Label content={({ viewBox }) => {
                    const cartesianViewBox = viewBox as { x?: number; y?: number; width?: number; height?: number } | undefined;
                    if (!cartesianViewBox || !cartesianViewBox.width || !cartesianViewBox.height) return null;
                    const { x = 0, y = 0, width, height } = cartesianViewBox;
                    const cx = x + width / 2;
                    const cy = y + height / 2;
                    
                    if (mode === 'vibe') {
                      return (
                        <>
                          <text x={cx + width/4} y={cy - height/4} fill="hsl(var(--accent-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('holyGrail')}</text>
                          <text x={cx - width/4} y={cy - height/4} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('survivorFood')}</text>
                          <text x={cx - width/4} y={cy + height/4} fill="hsl(var(--destructive-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('theBin')}</text>
                          <text x={cx + width/4} y={cy + height/4} fill="hsl(var(--destructive-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('russianRoulette')}</text>
                        </>
                      );
                    } else {
                      // Value lens labels
                      return (
                        <>
                          <text x={cx + width/4} y={cy - height/4} fill="hsl(var(--accent-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('theSteal')}</text>
                          <text x={cx - width/4} y={cy - height/4} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('cheapFiller')}</text>
                          <text x={cx - width/4} y={cy + height/4} fill="hsl(var(--destructive-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('ripOff')}</text>
                          <text x={cx + width/4} y={cy + height/4} fill="hsl(var(--destructive-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('treat')}</text>
                        </>
                      );
                    }
                  }}
                />

                <ChartTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      labelKey="product"
                      nameKey="product"
                      formatter={(value, name, props) => {
                        const payloadColor = props.payload?.fill;
                        if (name === 'product') {
                          return (
                            <span className="font-bold" style={{ color: payloadColor }}>
                              {value}
                            </span>
                          );
                        }
                        return [
                          value,
                          name === 'taste' ? 'Taste' : 'Safety',
                        ];
                      }}
                      indicator="dot"
                      className="min-w-[12rem] text-base"
                    />
                  }
                />
                <ZAxis dataKey="product" name="product" />
                {showDots &&
                  dataWithCoords.map((item) => (
                    <Scatter
                      key={item.product}
                      data={[item]}
                      name={item.product}
                      fill={getColorForProduct(item.product)}
                      shape={<CustomDot onPointClick={onPointClick} highlightedProduct={highlightedProduct} />}
                    />
                  ))}
            </ScatterChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
