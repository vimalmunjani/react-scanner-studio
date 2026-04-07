import { useMemo, useState } from 'react';
import { FileWarning, ArrowRight, GitFork } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useCodeowners } from '@/lib/codeowners-context';
import { useNavigation } from '@/lib/navigation-context';

const COLORS = [
  '#ff914d',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
];
const OTHERS_COLOR = '#6b7280';

function CenterLabel({
  cx,
  cy,
  totalInstances,
}: {
  cx: number;
  cy: number;
  totalInstances: number;
}) {
  return (
    <text textAnchor='middle' dominantBaseline='central'>
      <tspan
        x={cx}
        y={cy - 10}
        fontSize={20}
        fontWeight={700}
        fill='var(--color-card-foreground)'
        fontFamily='var(--font-sans)'
      >
        {totalInstances.toLocaleString()}
      </tspan>
      <tspan
        x={cx}
        y={cy + 13}
        fontSize={11}
        fill='var(--color-muted-foreground)'
        fontFamily='var(--font-sans)'
      >
        instances
      </tspan>
    </text>
  );
}

export function CodeownersSummary() {
  const { codeownersReport, isLoading } = useCodeowners();
  const { setPage } = useNavigation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { chartData, totalInstances: chartTotal } = useMemo(() => {
    if (!codeownersReport) return { chartData: [], totalInstances: 0 };
    const { owners, totalInstances: total } = codeownersReport;
    const top5 = owners.slice(0, 5);
    const othersTotal = owners
      .slice(5)
      .reduce((s, o) => s + o.totalInstances, 0);
    const data = top5.map(o => ({ name: o.owner, value: o.totalInstances }));
    if (othersTotal > 0) data.push({ name: 'Others', value: othersTotal });
    return { chartData: data, totalInstances: total };
  }, [codeownersReport]);

  if (isLoading || !codeownersReport) return null;

  const {
    owners,
    totalOwners,
    totalInstances,
    unownedFiles,
    mostSharedComponent,
  } = codeownersReport;

  const hasUsage = totalInstances > 0;

  return (
    <div className='rounded-lg border border-border bg-card p-5'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <h2 className='text-sm font-medium text-card-foreground'>
            Code Owners
          </h2>
          <span className='text-xs text-muted-foreground'>
            {totalOwners} owner{totalOwners !== 1 ? 's' : ''}
          </span>
          {unownedFiles.length > 0 && (
            <span className='text-xs text-amber-500'>
              · {unownedFiles.length} unowned
            </span>
          )}
        </div>
        <button
          type='button'
          onClick={() => setPage('code-owners')}
          className='flex items-center gap-1 text-xs font-medium text-primary/70 hover:text-primary transition-colors group cursor-pointer'
        >
          Explore more
          <ArrowRight className='w-3 h-3 group-hover:translate-x-0.5 transition-transform' />
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 items-center'>
        {/* Donut + legend — left 2 columns */}
        <div className='sm:col-span-2'>
          {!hasUsage ? (
            <div className='flex items-center justify-center h-20 rounded-lg border border-dashed border-border'>
              <p className='text-xs text-muted-foreground'>
                No component usage found in owned files
              </p>
            </div>
          ) : (
            /* Donut centered, legend pinned to the right */
            <div className='flex items-center justify-between'>
              {/* Donut — same sizing as the full Code Owners page */}
              <div className='flex-1 flex justify-center'>
                <div className='w-[240px] h-[240px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx='50%'
                        cy='50%'
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
                              activeIndex === null || activeIndex === index
                                ? 1
                                : 0.3
                            }
                          />
                        ))}
                        <CenterLabel
                          cx={0}
                          cy={0}
                          totalInstances={chartTotal}
                        />
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
                        labelStyle={{
                          color: 'var(--color-popover-foreground)',
                        }}
                        formatter={(value: number, name: string) => [
                          `${value.toLocaleString()} instances`,
                          name.length > 22 ? name.slice(0, 21) + '…' : name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vertical legend — pinned to right edge, fixed width for alignment */}
              <div className='flex flex-col gap-3 shrink-0 w-[148px]'>
                {chartData.map((entry, index) => {
                  const color =
                    entry.name === 'Others'
                      ? OTHERS_COLOR
                      : COLORS[index % COLORS.length];
                  const pct =
                    chartTotal > 0
                      ? Math.round((entry.value / chartTotal) * 100)
                      : 0;
                  return (
                    <div key={entry.name} className='flex items-center gap-1.5'>
                      <span
                        className='w-2 h-2 rounded-full shrink-0'
                        style={{ backgroundColor: color }}
                      />
                      <span className='text-xs font-mono text-foreground/80 truncate flex-1 min-w-0'>
                        {entry.name}
                      </span>
                      <span className='text-xs tabular-nums font-medium text-foreground/60 w-8 text-right shrink-0'>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column — stat rows */}
        <div className='flex flex-col gap-3 sm:border-l sm:border-border sm:pl-6'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
              Top owner
            </span>
            <span
              className='text-sm font-mono text-foreground truncate'
              title={owners[0]?.owner}
            >
              {owners[0]?.owner ?? '—'}
            </span>
            <span className='text-xs text-muted-foreground tabular-nums'>
              {owners[0]?.totalInstances ?? 0} instance
              {(owners[0]?.totalInstances ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>

          {mostSharedComponent && (
            <>
              <div className='h-px bg-border' />
              <div className='flex flex-col gap-0.5'>
                <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1'>
                  <GitFork className='w-3 h-3' />
                  Most shared
                </span>
                <span className='text-sm font-mono text-foreground'>
                  {mostSharedComponent.name}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {mostSharedComponent.ownerCount} team
                  {mostSharedComponent.ownerCount !== 1 ? 's' : ''}
                </span>
              </div>
            </>
          )}

          {unownedFiles.length > 0 && (
            <>
              <div className='h-px bg-border' />
              <div className='flex flex-col gap-0.5'>
                <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1'>
                  <FileWarning className='w-3 h-3 text-amber-500' />
                  Unowned files
                </span>
                <span className='text-sm font-semibold text-amber-500 tabular-nums'>
                  {unownedFiles.length}
                </span>
                <span className='text-xs text-muted-foreground'>
                  without CODEOWNERS rule
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
