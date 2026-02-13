import { useMemo } from 'react';
import { X, Hash, FileText, Braces, Layers } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useReport } from '@/lib/report-context';

export function ComponentDetail() {
  const { selectedComponent, setSelectedComponent, report } = useReport();

  const propData = useMemo(() => {
    if (!selectedComponent) return [];
    return Object.entries(selectedComponent.props)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [selectedComponent]);

  const propValueData = useMemo(() => {
    if (!selectedComponent) return {};
    return selectedComponent.propValues;
  }, [selectedComponent]);

  const uniqueFiles = useMemo(() => {
    if (!selectedComponent) return [];
    const grouped: Record<string, { line: number; column: number }[]> = {};
    for (const f of selectedComponent.files) {
      if (!grouped[f.file]) grouped[f.file] = [];
      grouped[f.file].push({ line: f.line, column: f.column });
    }
    return Object.entries(grouped)
      .map(([file, locations]) => ({
        file,
        locations: locations.sort((a, b) => a.line - b.line),
      }))
      .sort((a, b) => b.locations.length - a.locations.length);
  }, [selectedComponent]);

  if (!selectedComponent || !report) return null;

  const hasProps = propData.length > 0;
  const hasFiles = uniqueFiles.length > 0;
  const hasPropValues = Object.keys(propValueData).length > 0;

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-end'>
      <div
        className='absolute inset-0 bg-background/60 backdrop-blur-sm'
        onClick={() => setSelectedComponent(null)}
      />
      <div className='relative w-full max-w-xl h-full bg-card border-l border-border overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 z-10 flex items-center justify-between p-5 border-b border-border bg-card'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-8 h-8 rounded-md bg-primary/10'>
              <Braces className='w-4 h-4 text-primary' />
            </div>
            <div>
              <h2 className='text-base font-mono font-semibold text-card-foreground'>
                {'<'}
                {selectedComponent.name}
                {' />'}
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {selectedComponent.instances} instance
                {selectedComponent.instances !== 1 ? 's' : ''}
                {selectedComponent.propsSpreadCount > 0 && (
                  <span>
                    {' / '}
                    {selectedComponent.propsSpreadCount} with spread
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={() => setSelectedComponent(null)}
            className='p-2 rounded-md hover:bg-secondary transition-colors'
          >
            <X className='w-4 h-4 text-muted-foreground' />
            <span className='sr-only'>Close detail panel</span>
          </button>
        </div>

        <div className='p-5 flex flex-col gap-6'>
          {/* Quick stats */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='p-3 rounded-lg bg-secondary'>
              <div className='flex items-center gap-1.5 mb-1'>
                <Layers className='w-3 h-3 text-muted-foreground' />
                <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                  Instances
                </span>
              </div>
              <span className='text-lg font-semibold text-foreground tabular-nums'>
                {selectedComponent.instances}
              </span>
            </div>
            <div className='p-3 rounded-lg bg-secondary'>
              <div className='flex items-center gap-1.5 mb-1'>
                <Hash className='w-3 h-3 text-muted-foreground' />
                <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                  Props
                </span>
              </div>
              <span className='text-lg font-semibold text-foreground tabular-nums'>
                {Object.keys(selectedComponent.props).length}
              </span>
            </div>
            <div className='p-3 rounded-lg bg-secondary'>
              <div className='flex items-center gap-1.5 mb-1'>
                <FileText className='w-3 h-3 text-muted-foreground' />
                <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                  Files
                </span>
              </div>
              <span className='text-lg font-semibold text-foreground tabular-nums'>
                {uniqueFiles.length || '--'}
              </span>
            </div>
          </div>

          {/* Prop usage chart */}
          {hasProps && (
            <div>
              <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                Prop Usage
              </h3>
              <div className='h-50'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={propData}
                    layout='vertical'
                    margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      horizontal={false}
                      stroke='var(--color-border)'
                    />
                    <XAxis
                      type='number'
                      tick={{
                        fill: 'var(--color-muted-foreground)',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type='category'
                      dataKey='name'
                      width={90}
                      tick={{
                        fill: 'var(--color-muted-foreground)',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-popover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-popover-foreground)',
                        fontSize: 11,
                      }}
                    />
                    <Bar
                      dataKey='count'
                      fill='var(--color-chart-2)'
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Prop value distributions */}
          {hasPropValues && (
            <div>
              <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                Prop Value Distribution
              </h3>
              <div className='flex flex-col gap-3'>
                {Object.entries(propValueData)
                  .sort(
                    ([, a], [, b]) =>
                      Object.keys(b).length - Object.keys(a).length
                  )
                  .map(([propName, values]) => {
                    const total = Object.values(values).reduce(
                      (s, v) => s + v,
                      0
                    );
                    const entries = Object.entries(values).sort(
                      ([, a], [, b]) => b - a
                    );
                    return (
                      <div
                        key={propName}
                        className='rounded-lg border border-border p-3'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <span className='text-xs font-mono font-medium text-foreground'>
                            {propName}
                          </span>
                          <span className='text-[10px] text-muted-foreground'>
                            {total} usage{total !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className='flex flex-col gap-1.5'>
                          {entries.map(([value, count]) => (
                            <div
                              key={value}
                              className='flex items-center gap-2'
                            >
                              <div className='flex-1 h-1.5 rounded-full bg-secondary overflow-hidden'>
                                <div
                                  className='h-full rounded-full bg-chart-3'
                                  style={{
                                    width: `${(count / total) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className='text-[11px] font-mono text-muted-foreground shrink-0 w-24 truncate text-right'>
                                {value}
                              </span>
                              <span className='text-[11px] tabular-nums text-muted-foreground shrink-0 w-6 text-right'>
                                {count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* File locations */}
          {hasFiles && (
            <div>
              <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                File Locations
              </h3>
              <div className='flex flex-col gap-2'>
                {uniqueFiles.map(({ file, locations }) => (
                  <div
                    key={file}
                    className='rounded-lg border border-border p-3'
                  >
                    <div className='flex items-start gap-2'>
                      <FileText className='w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs font-mono text-foreground truncate'>
                          {file}
                        </p>
                        <div className='flex flex-wrap gap-1.5 mt-1.5'>
                          {locations.map((loc, i) => (
                            <span
                              key={i}
                              className='inline-flex items-center px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground'
                            >
                              L{loc.line}:{loc.column}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasProps && !hasFiles && (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No detailed data available for this component. Try using the{' '}
              <span className='font-mono'>raw-report</span> or{' '}
              <span className='font-mono'>count-components-and-props</span>{' '}
              processor for more detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
