import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useReport } from '@/lib/report-context';

// Gradient color pairs [start, end] for each segment
const GRADIENT_COLORS = [
  ['#ff914d', '#ff6b3d'], // Orange
  ['#3b82f6', '#1d4ed8'], // Blue
  ['#10b981', '#059669'], // Emerald
  ['#8b5cf6', '#6d28d9'], // Violet
  ['#ec4899', '#db2777'], // Pink
  ['#f59e0b', '#d97706'], // Amber
  ['#06b6d4', '#0891b2'], // Cyan
  ['#ef4444', '#dc2626'], // Red
];

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  index: number;
}

function CustomContent({
  x,
  y,
  width,
  height,
  name,
  index,
}: TreemapContentProps) {
  const showLabel = width > 50 && height > 30;
  const gradientId = `treemap-gradient-${index}`;
  const colorPair = GRADIENT_COLORS[index % GRADIENT_COLORS.length];

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor={colorPair[0]} />
          <stop offset='100%' stopColor={colorPair[1]} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
        stroke='var(--color-background)'
        strokeWidth={2}
        rx={4}
        opacity={0.9}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor='middle'
          dominantBaseline='central'
          fill='#ffffff'
          fontSize={Math.min(14, (width / name.length) * 1.5)}
          fontWeight={600}
          fontFamily='var(--font-sans)'
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        >
          {name}
        </text>
      )}
    </g>
  );
}

export function TreemapChart() {
  const { report } = useReport();

  const data = useMemo(() => {
    if (!report) return [];
    return report.components.map(c => ({
      name: c.name,
      size: c.instances,
    }));
  }, [report]);

  if (!report || data.length === 0) return null;

  return (
    <div className='rounded-lg border border-border bg-card p-5'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-sm font-medium text-card-foreground'>
          Usage Distribution
        </h2>
        <span className='text-xs text-muted-foreground'>
          Area proportional to usage
        </span>
      </div>
      <div className='h-[320px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <Treemap
            data={data}
            dataKey='size'
            nameKey='name'
            content={
              <CustomContent
                x={0}
                y={0}
                width={0}
                height={0}
                name=''
                index={0}
              />
            }
          >
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)',
                fontSize: 12,
              }}
              itemStyle={{
                color: 'var(--color-popover-foreground)',
              }}
              labelStyle={{
                color: 'var(--color-popover-foreground)',
              }}
              formatter={(value: number) => [`${value} instances`, 'Usage']}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
