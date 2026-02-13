import { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useReport } from '@/lib/report-context';

export function UsageChart() {
  const { report, setSelectedComponent } = useReport();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new window.MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => {
    if (!report) return [];
    return report.components.slice(0, 20).map(c => ({
      name: c.name,
      instances: c.instances,
      component: c,
    }));
  }, [report]);

  if (!report || data.length === 0) return null;

  return (
    <div className='rounded-lg border border-border bg-card p-5'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-sm font-medium text-card-foreground'>
          Component Usage
        </h2>
        <span className='text-xs text-muted-foreground'>
          Top {data.length} components
        </span>
      </div>
      <div className='h-[520px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            layout='vertical'
            margin={{ top: 12, right: 24, bottom: 8, left: 0 }}
          >
            <defs>
              <linearGradient id='barGradient' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='10%' stopColor='#ff914d' />
                <stop offset='100%' stopColor='#ff3131' />
              </linearGradient>
              <linearGradient id='barGradientHover' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='10%' stopColor='#ffab75' />
                <stop offset='100%' stopColor='#ff5a5a' />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='3 3'
              horizontal={false}
              stroke='var(--color-border)'
            />
            <XAxis
              type='number'
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type='category'
              dataKey='name'
              width={160}
              tick={{
                fill: 'var(--color-muted-foreground)',
                fontSize: 14,
                fontWeight: 400,
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
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
              cursor={{ fill: 'var(--color-accent)', opacity: 0.3 }}
            />
            <Bar
              dataKey='instances'
              radius={[0, 4, 4, 0]}
              barSize={22}
              barGap={8}
              cursor='pointer'
              onClick={entry => {
                if (entry?.component) {
                  setSelectedComponent(entry.component);
                }
              }}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    hoveredIndex === index
                      ? isDark
                        ? '#ffffff'
                        : '#000000'
                      : 'url(#barGradient)'
                  }
                  opacity={
                    hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
