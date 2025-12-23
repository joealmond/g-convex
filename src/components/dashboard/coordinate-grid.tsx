'use client';

import { cn } from '@/lib/utils';
import { useState, useRef, useCallback } from 'react';

// Quadrant labels
const QUADRANT_LABELS = {
  vibe: {
    topRight: 'HOLY GRAIL',
    topLeft: 'SURVIVOR FOOD',
    bottomRight: 'RUSSIAN ROULETTE',
    bottomLeft: 'THE BIN',
  },
  value: {
    topRight: 'TREAT',
    topLeft: 'RIP OFF',
    bottomRight: 'THE STEAL',
    bottomLeft: 'CHEAP FILLER',
  },
};

// Quadrant colors
const QUADRANT_COLORS = {
  vibe: {
    topRight: 'bg-green-500/10',      // Holy Grail - Green
    topLeft: 'bg-muted/30',            // Survivor Food - Muted
    bottomRight: 'bg-destructive/10',  // Russian Roulette - Red
    bottomLeft: 'bg-destructive/20',   // The Bin - Red
  },
  value: {
    topRight: 'bg-muted/20',           // Treat - Muted
    topLeft: 'bg-destructive/20',      // Rip Off - Red
    bottomRight: 'bg-green-500/10',    // The Steal - Green
    bottomLeft: 'bg-muted/30',         // Cheap Filler - Muted
  },
};

interface Dot {
  x: number;  // 0-100 (taste)
  y: number;  // 0-100 (safety/price based on mode)
  color?: string;
  highlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

interface DraggableConfig {
  x: number;
  y: number;
  onChange: (x: number, y: number) => void;
}

interface CoordinateGridProps {
  mode?: 'vibe' | 'value';
  dots?: Dot[];
  draggable?: DraggableConfig;
  showLabels?: boolean;
  showAxisLabels?: boolean;
  className?: string;
}

const DOT_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

export function CoordinateGrid({
  mode = 'vibe',
  dots = [],
  draggable,
  showLabels = true,
  showAxisLabels = true,
  className,
}: CoordinateGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const labels = QUADRANT_LABELS[mode];
  const colors = QUADRANT_COLORS[mode];

  // Calculate position from pointer event
  const getPositionFromEvent = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    
    // Clamp values to 0-100
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100));
    
    return { x: Math.round(x), y: Math.round(y) };
  }, []);

  // Handle drag start
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!draggable) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    const pos = getPositionFromEvent(e);
    if (pos) {
      draggable.onChange(pos.x, pos.y);
    }
  }, [draggable, getPositionFromEvent]);

  // Handle drag move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !draggable) return;
    
    const pos = getPositionFromEvent(e);
    if (pos) {
      draggable.onChange(pos.x, pos.y);
    }
  }, [isDragging, draggable, getPositionFromEvent]);

  // Handle drag end
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const yAxisLabel = mode === 'vibe' ? 'Safety' : 'Price';
  const xAxisLabel = 'Taste';

  return (
    <div className={cn('relative w-full aspect-square', className)}>
      {/* Y-Axis Label */}
      {showAxisLabels && (
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
          {yAxisLabel}
        </div>
      )}

      {/* Main Grid Container */}
      <div
        ref={gridRef}
        className={cn(
          'relative w-full h-full rounded-md border border-border overflow-hidden',
          draggable && 'cursor-crosshair',
          isDragging && 'cursor-grabbing'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Quadrant Grid - 2x2 */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Top-Left Quadrant */}
          <div className={cn('relative border-r border-b border-border/50', colors.topLeft)}>
            {showLabels && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                {labels.topLeft}
              </span>
            )}
          </div>
          {/* Top-Right Quadrant */}
          <div className={cn('relative border-b border-border/50', colors.topRight)}>
            {showLabels && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                {labels.topRight}
              </span>
            )}
          </div>
          {/* Bottom-Left Quadrant */}
          <div className={cn('relative border-r border-border/50', colors.bottomLeft)}>
            {showLabels && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                {labels.bottomLeft}
              </span>
            )}
          </div>
          {/* Bottom-Right Quadrant */}
          <div className={cn('relative', colors.bottomRight)}>
            {showLabels && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-foreground/30 pointer-events-none">
                {labels.bottomRight}
              </span>
            )}
          </div>
        </div>

        {/* Axis Ticks */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[10px] text-muted-foreground pointer-events-none">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
        <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-between py-1 text-[10px] text-muted-foreground pointer-events-none">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        {/* Static Dots */}
        {dots.map((dot, index) => (
          <div
            key={dot.id || index}
            className={cn(
              'absolute rounded-full pointer-events-none transform -translate-x-1/2 translate-y-1/2',
              DOT_SIZES[dot.size || 'md'],
              dot.highlighted && 'ring-2 ring-white ring-offset-2 ring-offset-background z-10'
            )}
            style={{
              left: `${dot.x}%`,
              bottom: `${dot.y}%`,
              backgroundColor: dot.color || 'hsl(var(--primary))',
            }}
          />
        ))}

        {/* Draggable Dot */}
        {draggable && (
          <div
            className={cn(
              'absolute w-6 h-6 rounded-full bg-primary border-4 border-primary-foreground shadow-lg transform -translate-x-1/2 translate-y-1/2 cursor-grab z-20',
              isDragging && 'cursor-grabbing scale-125'
            )}
            style={{
              left: `${draggable.x}%`,
              bottom: `${draggable.y}%`,
              transition: isDragging ? 'none' : 'transform 0.1s',
            }}
          />
        )}
      </div>

      {/* X-Axis Label */}
      {showAxisLabels && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
          {xAxisLabel}
        </div>
      )}
    </div>
  );
}
