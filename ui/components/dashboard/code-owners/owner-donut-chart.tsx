import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Info } from 'lucide-react';
import { useCodeowners } from '@/lib/codeowners-context';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const COLORS = [
  '#ff914d',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
];

const OTHERS_COLOR = '#6b7280';

interface LabelProps {
  cx: number;
  cy: number;
  totalInstances: number;
}

function CenterLabel({ cx, cy, totalInstances }: LabelProps) {
  return (
    <text textAnchor='middle' dominantBaseline='central'>
      <tspan
        x={cx}
        y={cy - 10}
        fontSize={22}
        fontWeight={700}
        fill='var(--color-card-foreground)'
        fontFamily='var(--font-sans)'
      >
        {totalInstances.toLocaleString()}
      </tspan>
      <tspan
        x={cx}
        y={cy + 14}
        fontSize={11}
        fill='var(--color-muted-foreground)'
        fontFamily='var(--font-sans)'
      >
        instances
      </tspan>
    </text>
  );
}

export function OwnerDonutChart() {
  const { codeownersReport } = useCodeowners();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { chartData, totalInstances } = useMemo(() => {
    if (!codeownersReport) return { chartData: [], totalInstances: 0 };

    const { owners, totalInstances: total } = codeownersReport;
    const top5 = owners.slice(0, 5);
    const othersTotal = owners
      .slice(5)
      .reduce((s, o) => s + o.totalInstances, 0);

    const data = top5.map(o => ({
      name: o.owner,
      value: o.totalInstances,
    }));

    if (othersTotal > 0) {
      data.push({ name: 'Others', value: othersTotal });
    }

    return { chartData: data, totalInstances: total };
  }, [codeownersReport]);

  if (!codeownersReport || chartData.length === 0) return null;

  return (
    <div className='rounded-lg border border-border bg-card p-5 flex flex-col'>
      <div className='mb-4'>
        <div className='flex items-center gap-2'>
          <h2 className='text-sm font-medium text-card-foreground'>
            Top Owners by Usage
          </h2>
          <UITooltip>
            <TooltipTrigger asChild>
              <Info className='w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground shrink-0 cursor-default transition-colors' />
            </TooltipTrigger>
            <TooltipContent
              side='top'
              className='max-w-[220px] text-center leading-relaxed'
            >
              Shows the top 5 owners by total component instances. Remaining
              owners are grouped as &quot;Others&quot;. Each owner&apos;s slice
              reflects how many component instances exist in their files.
            </TooltipContent>
          </UITooltip>
        </div>
        <p className='text-xs text-muted-foreground mt-0.5'>
          Component instances attributed per owner
        </p>
      </div>
      <div className='flex-1 h-[280px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={chartData}
              cx='50%'
              cy='45%'
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey='value'
              labelLine={false}
              animationBegin={0}
              animationDuration={500}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.name === 'Others'
                      ? OTHERS_COLOR
                      : COLORS[index % COLORS.length]
                  }
                  stroke='var(--color-background)'
                  strokeWidth={2}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.3
                  }
                />
              ))}
              <CenterLabel cx={0} cy={0} totalInstances={totalInstances} />
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)',
                fontSize: 12,
              }}
              itemStyle={{ color: 'var(--color-popover-foreground)' }}
              labelStyle={{ color: 'var(--color-popover-foreground)' }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} instances`,
                name.length > 22 ? name.slice(0, 21) + '…' : name,
              ]}
            />
            <Legend
              iconType='circle'
              iconSize={8}
              formatter={(value: string) => (
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--color-muted-foreground)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
