import { useState, useMemo } from 'react';
import {
  User,
  Braces,
  FileText,
  Layers,
  List,
  LayoutList,
  Users,
} from 'lucide-react';
import { CopyablePath } from '@/components/ui/copyable-path';
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
import { useCodeowners } from '@/lib/codeowners-context';
import { useReport } from '@/lib/report-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function OwnerDetail() {
  const { selectedOwner, setSelectedOwner, codeownersReport } = useCodeowners();
  const { report } = useReport();

  const [activeTab, setActiveTab] = useState('components');
  const [filesView, setFilesView] = useState<'flat' | 'grouped'>('flat');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Reset state when owner changes
  const stateKey = selectedOwner?.owner ?? '';
  const [prevKey, setPrevKey] = useState(stateKey);
  if (stateKey !== prevKey) {
    setPrevKey(stateKey);
    setActiveTab('components');
    setFilesView('flat');
  }

  // Co-owned files: files that also appear in another owner's file list
  // Returns Map<filePath, otherOwners[]>
  const coOwnedFileOwners = useMemo(() => {
    if (!codeownersReport || !selectedOwner) return new Map<string, string[]>();
    const map = new Map<string, string[]>();
    const myFileSet = new Set(selectedOwner.files);
    for (const owner of codeownersReport.owners) {
      if (owner.owner === selectedOwner.owner) continue;
      for (const file of owner.files) {
        if (myFileSet.has(file)) {
          if (!map.has(file)) map.set(file, []);
          map.get(file)!.push(owner.owner);
        }
      }
    }
    return map;
  }, [codeownersReport, selectedOwner]);

  const coOwnedCount = coOwnedFileOwners.size;

  // Build component → files map for this owner (for grouped view)
  // Cross-reference normalized report's absolute paths with owner's relative paths
  const componentFilesMap = useMemo(() => {
    if (!report || !selectedOwner) return new Map<string, string[]>();
    const ownerFileSet = new Set(selectedOwner.files);
    const map = new Map<string, string[]>();
    for (const component of report.components) {
      const matchingFiles: string[] = [];
      for (const f of component.files) {
        // normalizePath() strips the common path prefix and prepends "./"
        // e.g. absolute "/repo/src/features/auth/X.tsx" → "./features/auth/X.tsx"
        // while OwnerStats.files has "src/features/auth/X.tsx"
        // So: strip "./" from f.file, then check if rel ends with that suffix
        const normalizedFile = f.file.startsWith('./')
          ? f.file.slice(2)
          : f.file;
        const matched = [...ownerFileSet].find(
          rel => rel === normalizedFile || rel.endsWith('/' + normalizedFile)
        );
        if (matched && !matchingFiles.includes(matched)) {
          matchingFiles.push(matched);
        }
      }
      if (matchingFiles.length > 0) {
        map.set(component.name, matchingFiles);
      }
    }
    return map;
  }, [report, selectedOwner]);

  // Grouped view: sorted by file count desc
  const groupedComponents = useMemo(
    () =>
      [...componentFilesMap.entries()].sort(
        (a, b) => b[1].length - a[1].length
      ),
    [componentFilesMap]
  );

  return (
    <Sheet
      open={selectedOwner !== null}
      onOpenChange={open => !open && setSelectedOwner(null)}
    >
      <SheetContent
        side='right'
        className='w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col'
      >
        {selectedOwner && (
          <div className='flex flex-col h-full'>
            {/* Header */}
            <SheetHeader className='px-6 pt-6 pb-4 border-b border-border shrink-0'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0'>
                  <User className='w-5 h-5 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
                  <SheetTitle className='text-base font-mono font-semibold truncate'>
                    {selectedOwner.owner}
                  </SheetTitle>
                  <SheetDescription className='mt-0.5'>
                    {selectedOwner.totalInstances} instance
                    {selectedOwner.totalInstances !== 1 ? 's' : ''} ·{' '}
                    {selectedOwner.uniqueComponents} component
                    {selectedOwner.uniqueComponents !== 1 ? 's' : ''} ·{' '}
                    {selectedOwner.fileCount} file
                    {selectedOwner.fileCount !== 1 ? 's' : ''}
                    {coOwnedCount > 0 && (
                      <>
                        {' '}
                        ·{' '}
                        <span className='text-amber-500'>
                          {coOwnedCount} co-owned
                        </span>
                      </>
                    )}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex-1 flex flex-col min-h-0'
            >
              <div className='px-6 pt-4 shrink-0'>
                <TabsList className='w-full grid grid-cols-2'>
                  <TabsTrigger value='components' className='gap-1.5'>
                    <Braces className='w-3.5 h-3.5' />
                    <span className='hidden sm:inline'>Components</span>
                    <Badge
                      variant='secondary'
                      className='ml-1 text-[10px] px-1.5 py-0'
                    >
                      {selectedOwner.uniqueComponents}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value='files' className='gap-1.5'>
                    <FileText className='w-3.5 h-3.5' />
                    <span className='hidden sm:inline'>Files</span>
                    <Badge
                      variant='secondary'
                      className='ml-1 text-[10px] px-1.5 py-0'
                    >
                      {selectedOwner.fileCount}
                    </Badge>
                    {coOwnedCount > 0 && (
                      <Badge
                        variant='outline'
                        className='ml-0.5 text-[10px] px-1.5 py-0 border-amber-500/50 text-amber-500'
                      >
                        {coOwnedCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className='flex-1 overflow-y-auto px-6'>
                {/* Components Tab */}
                <TabsContent value='components' className='mt-0 pt-4 pb-6'>
                  <div className='flex flex-col gap-6'>
                    {/* Quick stats — 4 cards */}
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                      <div className='p-3 rounded-lg bg-secondary/50 border border-border'>
                        <div className='flex items-center gap-1.5 mb-1.5'>
                          <Layers className='w-3 h-3 text-muted-foreground' />
                          <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                            Instances
                          </span>
                        </div>
                        <span className='text-xl font-semibold text-foreground tabular-nums'>
                          {selectedOwner.totalInstances}
                        </span>
                      </div>
                      <div className='p-3 rounded-lg bg-secondary/50 border border-border'>
                        <div className='flex items-center gap-1.5 mb-1.5'>
                          <Braces className='w-3 h-3 text-muted-foreground' />
                          <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                            Components
                          </span>
                        </div>
                        <span className='text-xl font-semibold text-foreground tabular-nums'>
                          {selectedOwner.uniqueComponents}
                        </span>
                      </div>
                      <div className='p-3 rounded-lg bg-secondary/50 border border-border'>
                        <div className='flex items-center gap-1.5 mb-1.5'>
                          <FileText className='w-3 h-3 text-muted-foreground' />
                          <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                            Files
                          </span>
                        </div>
                        <span className='text-xl font-semibold text-foreground tabular-nums'>
                          {selectedOwner.fileCount}
                        </span>
                      </div>
                      <div className='p-3 rounded-lg bg-secondary/50 border border-border'>
                        <div className='flex items-center gap-1.5 mb-1.5'>
                          <Users className='w-3 h-3 text-muted-foreground' />
                          <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                            Co-owned
                          </span>
                        </div>
                        <span
                          className={`text-xl font-semibold tabular-nums ${
                            coOwnedCount > 0
                              ? 'text-amber-500'
                              : 'text-foreground'
                          }`}
                        >
                          {coOwnedCount}
                        </span>
                      </div>
                    </div>

                    {/* Bar chart — top 8 components */}
                    {selectedOwner.components.length > 0 && (
                      <div>
                        <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                          Component Usage
                        </h3>
                        <div className='h-52 rounded-lg border border-border bg-card p-3'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                              data={selectedOwner.components.slice(0, 8)}
                              layout='vertical'
                              margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                            >
                              <defs>
                                <linearGradient
                                  id='ownerBarGradient'
                                  x1='0'
                                  y1='0'
                                  x2='1'
                                  y2='0'
                                >
                                  <stop
                                    offset='0%'
                                    stopColor='var(--color-chart-2)'
                                  />
                                  <stop
                                    offset='100%'
                                    stopColor='var(--color-chart-2)'
                                  />
                                </linearGradient>
                                <linearGradient
                                  id='ownerBarGradientHover'
                                  x1='0'
                                  y1='0'
                                  x2='1'
                                  y2='0'
                                >
                                  <stop offset='0%' stopColor='#065f59' />
                                  <stop offset='100%' stopColor='#065f59' />
                                </linearGradient>
                              </defs>
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
                                width={110}
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
                                itemStyle={{
                                  color: 'var(--color-popover-foreground)',
                                }}
                                labelStyle={{
                                  color: 'var(--color-popover-foreground)',
                                }}
                                cursor={{
                                  fill: 'var(--color-accent)',
                                  opacity: 0.3,
                                }}
                              />
                              <Bar
                                dataKey='instances'
                                radius={[0, 4, 4, 0]}
                                cursor='pointer'
                                onMouseEnter={(_, index) =>
                                  setHoveredBarIndex(index)
                                }
                                onMouseLeave={() => setHoveredBarIndex(null)}
                              >
                                {selectedOwner.components
                                  .slice(0, 8)
                                  .map((_, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        hoveredBarIndex === index
                                          ? 'url(#ownerBarGradientHover)'
                                          : 'url(#ownerBarGradient)'
                                      }
                                      opacity={
                                        hoveredBarIndex !== null &&
                                        hoveredBarIndex !== index
                                          ? 0.3
                                          : 1
                                      }
                                    />
                                  ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Full component list */}
                    <div>
                      <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                        All Components
                      </h3>
                      <div className='flex flex-col gap-1.5'>
                        {selectedOwner.components.map(comp => {
                          const pct =
                            selectedOwner.totalInstances > 0
                              ? (comp.instances /
                                  selectedOwner.totalInstances) *
                                100
                              : 0;
                          return (
                            <div
                              key={comp.name}
                              className='flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card'
                            >
                              <span className='font-mono text-sm text-foreground flex-1 truncate'>
                                {comp.name}
                              </span>
                              <div className='w-20 h-1.5 bg-muted rounded-full overflow-hidden shrink-0'>
                                <div
                                  className='h-full rounded-full bg-chart-2'
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className='text-xs tabular-nums text-muted-foreground w-10 text-right shrink-0'>
                                {comp.instances}x
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value='files' className='mt-0 pt-4 pb-6'>
                  <div className='flex flex-col gap-4'>
                    {/* Header row: summary + view toggle */}
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-xs text-muted-foreground'>
                          {selectedOwner.files.length} file
                          {selectedOwner.files.length !== 1 ? 's' : ''} with
                          component usage
                        </span>
                        {coOwnedCount > 0 && (
                          <span className='text-xs text-amber-500 ml-1.5'>
                            · {coOwnedCount} co-owned
                          </span>
                        )}
                      </div>
                      {/* View toggle */}
                      <div className='flex items-center gap-0.5 rounded-md border border-border p-0.5'>
                        <button
                          type='button'
                          onClick={() => setFilesView('flat')}
                          className={`p-1.5 rounded transition-colors ${
                            filesView === 'flat'
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title='Flat list'
                        >
                          <List className='w-3.5 h-3.5' />
                        </button>
                        <button
                          type='button'
                          onClick={() => setFilesView('grouped')}
                          className={`p-1.5 rounded transition-colors ${
                            filesView === 'grouped'
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title='Group by component'
                        >
                          <LayoutList className='w-3.5 h-3.5' />
                        </button>
                      </div>
                    </div>

                    {/* Flat view */}
                    {filesView === 'flat' && (
                      <div className='divide-y divide-border rounded-lg border border-border overflow-hidden'>
                        {selectedOwner.files.map(file => {
                          const coOwners = coOwnedFileOwners.get(file);
                          return (
                            <div
                              key={file}
                              className={`flex items-start gap-3 px-3 py-2.5 ${
                                coOwners ? 'bg-amber-500/5' : 'bg-card'
                              }`}
                            >
                              <FileText className='w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0' />
                              <div className='flex-1 min-w-0'>
                                <CopyablePath path={file} size='sm' />
                                {coOwners && (
                                  <div className='flex flex-wrap items-center gap-1 mt-1'>
                                    <span className='text-[10px] text-muted-foreground'>
                                      also owned by
                                    </span>
                                    {coOwners.map(o => (
                                      <span
                                        key={o}
                                        className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                      >
                                        {o}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {coOwners && (
                                <Badge
                                  variant='outline'
                                  className='text-[10px] shrink-0 border-amber-500/50 text-amber-500'
                                >
                                  Co-owned
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Grouped by component view */}
                    {filesView === 'grouped' && (
                      <div className='flex flex-col gap-4'>
                        {groupedComponents.length > 0 ? (
                          groupedComponents.map(([componentName, files]) => (
                            <div key={componentName}>
                              <div className='flex items-center gap-2 mb-1.5'>
                                <Braces className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
                                <span className='text-xs font-mono font-medium text-foreground'>
                                  {componentName}
                                </span>
                                <span className='text-[10px] text-muted-foreground'>
                                  {files.length} file
                                  {files.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className='ml-5 divide-y divide-border rounded-lg border border-border overflow-hidden'>
                                {files.map(file => {
                                  const coOwners = coOwnedFileOwners.get(file);
                                  return (
                                    <div
                                      key={file}
                                      className={`flex items-start gap-2 px-2.5 py-2 ${
                                        coOwners ? 'bg-amber-500/5' : 'bg-card'
                                      }`}
                                    >
                                      <FileText className='w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0' />
                                      <div className='flex-1 min-w-0'>
                                        <CopyablePath path={file} size='xs' />
                                        {coOwners && (
                                          <div className='flex flex-wrap items-center gap-1 mt-1'>
                                            <span className='text-[10px] text-muted-foreground'>
                                              also owned by
                                            </span>
                                            {coOwners.map(o => (
                                              <span
                                                key={o}
                                                className='text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                              >
                                                {o}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      {coOwners && (
                                        <Badge
                                          variant='outline'
                                          className='text-[10px] shrink-0 border-amber-500/50 text-amber-500'
                                        >
                                          Co-owned
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className='text-center py-8 text-sm text-muted-foreground rounded-lg border border-dashed border-border'>
                            Component grouping requires raw-report format.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
