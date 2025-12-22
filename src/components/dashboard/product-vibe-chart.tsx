'use client';

import {
  ChartContainer,
} from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Label,
  ReferenceArea,
  ScatterChart,
  ResponsiveContainer
} from 'recharts';
import { useTranslations } from '@/lib/i18n';

interface ProductVibeChartProps {
  mode?: 'vibe' | 'value';  // vibe = Safety vs Taste, value = Price vs Taste
}

export function ProductVibeChart({ mode = 'vibe' }: ProductVibeChartProps) {
  const isMobile = useIsMobile();
  const t = useTranslations('MatrixChart');
  
  const chartConfig = {
    safety: { label: 'Safety' },
    taste: { label: 'Taste' },
    price: { label: 'Price' },
  };
  
  // Y-axis config based on mode - matches main page exactly
  const yDataKey = mode === 'vibe' ? 'safety' : 'price';
  const yAxisLabel = mode === 'value' ? t('priceAxisLabel') : t('safetyAxisLabel');

  return (
    <div className="h-full w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: isMobile ? 10 : 20,
            bottom: 20,
            left: isMobile ? -20 : 0,
          }}
        >
          {/* Quadrant Backgrounds - colors match main page MatrixChart */}
          {/* Top-Right: Vibe=Holy Grail(Green), Value=Treat(Muted-yellow) */}
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

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          
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
              // Value lens labels - matching main page
              return (
                <>
                  <text x={cx + width/4} y={cy - height/4} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('treat')}</text>
                  <text x={cx - width/4} y={cy - height/4} fill="hsl(var(--destructive-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('ripOff')}</text>
                  <text x={cx - width/4} y={cy + height/4} fill="hsl(var(--foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('cheapFiller')}</text>
                  <text x={cx + width/4} y={cy + height/4} fill="hsl(var(--accent-foreground))" textAnchor="middle" dominantBaseline="middle" className="font-bold opacity-50 pointer-events-none">{t('theSteal')}</text>
                </>
              );
            }
          }} />
        </ScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
