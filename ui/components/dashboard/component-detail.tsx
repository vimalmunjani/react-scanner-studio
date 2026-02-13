import { useMemo, useState } from 'react';
import {
  Hash,
  FileText,
  Braces,
  Layers,
  Search,
  BarChart3,
} from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function ComponentDetail() {
  const { selectedComponent, setSelectedComponent, report } = useReport();

  const maxFilesToShow = 10;
  const maxPropsToShow = 5;

  // Use component name as state key to reset local state when component changes
  const stateKey = selectedComponent?.name ?? '';

  const [propSearch, setPropSearch] = useState('');
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [showAllProps, setShowAllProps] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Reset all local state when the selected component changes
  const [prevStateKey, setPrevStateKey] = useState(stateKey);
  if (stateKey !== prevStateKey) {
    setPrevStateKey(stateKey);
    setPropSearch('');
    setShowAllFiles(false);
    setShowAllProps(false);
    setActiveTab('overview');
  }

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

  const visibleFiles = useMemo(() => {
    if (showAllFiles) return uniqueFiles;
    return uniqueFiles.slice(0, maxFilesToShow);
  }, [uniqueFiles, showAllFiles]);

  const hasMoreFiles = uniqueFiles.length > maxFilesToShow;

  const propValueEntries = useMemo(() => {
    return Object.entries(propValueData).sort(
      ([, a], [, b]) => Object.keys(b).length - Object.keys(a).length
    );
  }, [propValueData]);

  // Filter prop values based on search
  const filteredPropValues = useMemo(() => {
    if (!propSearch.trim()) return propValueEntries;
    const query = propSearch.toLowerCase();
    return propValueEntries.filter(([propName, values]) => {
      // Match prop name
      if (propName.toLowerCase().includes(query)) return true;
      // Match any value within the prop
      return Object.keys(values).some(value =>
        value.toLowerCase().includes(query)
      );
    });
  }, [propValueEntries, propSearch]);

  const visiblePropValues = useMemo(() => {
    // When searching, show all results
    if (propSearch.trim()) return filteredPropValues;
    if (showAllProps) return filteredPropValues;
    return filteredPropValues.slice(0, maxPropsToShow);
  }, [filteredPropValues, showAllProps, propSearch]);

  const hasMoreProps =
    !propSearch.trim() && filteredPropValues.length > maxPropsToShow;

  if (!report) return null;

  const hasProps = propData.length > 0;
  const hasFiles = uniqueFiles.length > 0;
  const hasPropValues = Object.keys(propValueData).length > 0;

  const isOpen = selectedComponent !== null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => !open && setSelectedComponent(null)}
    >
      <SheetContent
        side='right'
        className='w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 flex flex-col'
      >
        {selectedComponent && (
          <div className='flex flex-col h-full'>
            {/* Header */}
            <SheetHeader className='px-6 pt-6 pb-4 border-b border-border shrink-0'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                  <Braces className='w-5 h-5 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
                  <SheetTitle className='text-lg font-mono font-semibold truncate'>
                    {'<'}
                    {selectedComponent.name}
                    {' />'}
                  </SheetTitle>
                  <SheetDescription className='flex items-center gap-2 mt-0.5'>
                    <span>
                      {selectedComponent.instances} instance
                      {selectedComponent.instances !== 1 ? 's' : ''}
                    </span>
                    {selectedComponent.propsSpreadCount > 0 && (
                      <Badge
                        variant='secondary'
                        className='text-[10px] px-1.5 py-0'
                      >
                        {selectedComponent.propsSpreadCount} spread
                      </Badge>
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
              {/* Tabs Navigation */}
              <div className='px-6 pt-4 shrink-0'>
                <TabsList className='w-full grid grid-cols-3'>
                  <TabsTrigger value='overview' className='gap-1.5'>
                    <Layers className='w-3.5 h-3.5' />
                    <span className='hidden sm:inline'>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value='props' className='gap-1.5'>
                    <BarChart3 className='w-3.5 h-3.5' />
                    <span className='hidden sm:inline'>Props</span>
                    {hasProps && (
                      <Badge
                        variant='secondary'
                        className='ml-1 text-[10px] px-1.5 py-0'
                      >
                        {propData.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value='files' className='gap-1.5'>
                    <FileText className='w-3.5 h-3.5' />
                    <span className='hidden sm:inline'>Files</span>
                    {hasFiles && (
                      <Badge
                        variant='secondary'
                        className='ml-1 text-[10px] px-1.5 py-0'
                      >
                        {uniqueFiles.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className='flex-1 overflow-y-auto px-6'>
                {/* Overview Tab */}
                <TabsContent value='overview' className='mt-0 pt-4 pb-6'>
                  <div className='flex flex-col gap-6'>
                    {/* Quick stats */}
                    <div className='grid grid-cols-3 gap-3'>
                      <div className='p-4 rounded-lg bg-secondary/50 border border-border'>
                        <div className='flex items-center gap-1.5 mb-2'>
                          <Layers className='w-3.5 h-3.5 text-muted-foreground' />
                          <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                            Instances
                          </span>
                        </div>
                        <span className='text-2xl font-semibold text-foreground tabular-nums'>
                          {selectedComponent.instances}
                        </span>
                      </div>
                      <div className='p-4 rounded-lg bg-secondary/50 border border-border'>
                        <div className='flex items-center gap-1.5 mb-2'>
                          <Hash className='w-3.5 h-3.5 text-muted-foreground' />
                          <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                            Props
                          </span>
                        </div>
                        <span className='text-2xl font-semibold text-foreground tabular-nums'>
                          {Object.keys(selectedComponent.props).length}
                        </span>
                      </div>
                      <div className='p-4 rounded-lg bg-secondary/50 border border-border'>
                        <div className='flex items-center gap-1.5 mb-2'>
                          <FileText className='w-3.5 h-3.5 text-muted-foreground' />
                          <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                            Files
                          </span>
                        </div>
                        <span className='text-2xl font-semibold text-foreground tabular-nums'>
                          {uniqueFiles.length || '--'}
                        </span>
                      </div>
                    </div>

                    {/* Prop usage chart */}
                    {hasProps && (
                      <div>
                        <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                          Top Props by Usage
                        </h3>
                        <div className='h-52 rounded-lg border border-border bg-card p-3'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                              data={propData.slice(0, 8)}
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
                                width={100}
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

                    {!hasProps && !hasFiles && (
                      <div className='text-center py-12 text-sm text-muted-foreground rounded-lg border border-dashed border-border'>
                        No detailed data available for this component.
                        <br />
                        <span className='text-xs'>
                          Try using the{' '}
                          <span className='font-mono'>raw-report</span> or{' '}
                          <span className='font-mono'>
                            count-components-and-props
                          </span>{' '}
                          processor.
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Props Tab */}
                <TabsContent value='props' className='mt-0 pt-4 pb-6'>
                  <div className='flex flex-col gap-4'>
                    {hasPropValues ? (
                      <>
                        {/* Search input */}
                        <div className='relative'>
                          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                          <Input
                            placeholder='Search props or values...'
                            value={propSearch}
                            onChange={e => setPropSearch(e.target.value)}
                            className='pl-9 h-9 text-sm bg-card border-border'
                          />
                        </div>

                        {/* Results count */}
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-muted-foreground'>
                            {propSearch.trim()
                              ? `${filteredPropValues.length} of ${propValueEntries.length} props match`
                              : `${propValueEntries.length} props with tracked values`}
                          </span>
                          {propSearch.trim() &&
                            filteredPropValues.length === 0 && (
                              <button
                                type='button'
                                onClick={() => setPropSearch('')}
                                className='text-xs text-primary hover:underline'
                              >
                                Clear search
                              </button>
                            )}
                        </div>

                        {/* Prop value distributions */}
                        <div className='flex flex-col gap-3'>
                          {visiblePropValues.length > 0 ? (
                            visiblePropValues.map(([propName, values]) => {
                              const total = Object.values(values).reduce(
                                (s, v) => s + v,
                                0
                              );
                              const entries = Object.entries(values)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 10);
                              const totalEntries = Object.keys(values).length;

                              // Highlight matching text
                              const query = propSearch.toLowerCase();
                              const propNameMatches =
                                query && propName.toLowerCase().includes(query);

                              return (
                                <div
                                  key={propName}
                                  className={`rounded-lg border p-4 transition-colors ${
                                    propNameMatches
                                      ? 'border-primary/50 bg-primary/5'
                                      : 'border-border bg-card'
                                  }`}
                                >
                                  <div className='flex items-center justify-between mb-3'>
                                    <span
                                      className={`text-sm font-mono font-medium ${
                                        propNameMatches
                                          ? 'text-primary'
                                          : 'text-foreground'
                                      }`}
                                    >
                                      {propName}
                                    </span>
                                    <span className='text-[11px] text-muted-foreground'>
                                      {total} usage{total !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <div className='flex flex-col gap-2'>
                                    {entries.map(([value, count]) => {
                                      const valueMatches =
                                        query &&
                                        value.toLowerCase().includes(query);
                                      return (
                                        <div
                                          key={value}
                                          className='flex items-center gap-3'
                                        >
                                          <div className='flex-1 h-2 rounded-full bg-secondary overflow-hidden'>
                                            <div
                                              className={`h-full rounded-full transition-colors ${
                                                valueMatches
                                                  ? 'bg-primary'
                                                  : 'bg-chart-3'
                                              }`}
                                              style={{
                                                width: `${(count / total) * 100}%`,
                                              }}
                                            />
                                          </div>
                                          <span
                                            className={`text-xs font-mono shrink-0 max-w-35 truncate text-right ${
                                              valueMatches
                                                ? 'text-primary font-medium'
                                                : 'text-muted-foreground'
                                            }`}
                                            title={value}
                                          >
                                            {value}
                                          </span>
                                          <span className='text-xs tabular-nums text-muted-foreground shrink-0 w-8 text-right'>
                                            {count}
                                          </span>
                                        </div>
                                      );
                                    })}
                                    {totalEntries > 10 && (
                                      <div className='text-[10px] text-muted-foreground mt-1 pl-1'>
                                        +{totalEntries - 10} more values
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className='text-center py-8 text-sm text-muted-foreground rounded-lg border border-dashed border-border'>
                              No props match &ldquo;{propSearch}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Show more button */}
                        {hasMoreProps && (
                          <button
                            type='button'
                            onClick={() => setShowAllProps(!showAllProps)}
                            className='w-full py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border transition-colors'
                          >
                            {showAllProps
                              ? 'Show less'
                              : `Show all ${filteredPropValues.length} props`}
                          </button>
                        )}
                      </>
                    ) : hasProps ? (
                      <div>
                        <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                          All Props
                        </h3>
                        <div className='rounded-lg border border-border bg-card p-4'>
                          <div className='flex flex-wrap gap-2'>
                            {propData.map(({ name, count }) => (
                              <div
                                key={name}
                                className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-sm'
                              >
                                <span className='font-mono text-foreground'>
                                  {name}
                                </span>
                                <span className='text-xs text-muted-foreground tabular-nums'>
                                  ({count})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-12 text-sm text-muted-foreground rounded-lg border border-dashed border-border'>
                        No props data available for this component.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value='files' className='mt-0 pt-4 pb-6'>
                  <div className='flex flex-col gap-4'>
                    {hasFiles ? (
                      <>
                        <span className='text-xs text-muted-foreground'>
                          {uniqueFiles.length} file
                          {uniqueFiles.length !== 1 ? 's' : ''} containing this
                          component
                        </span>

                        <div className='flex flex-col gap-2'>
                          {visibleFiles.map(({ file, locations }) => (
                            <div
                              key={file}
                              className='rounded-lg border border-border bg-card p-4'
                            >
                              <div className='flex items-start gap-3'>
                                <FileText className='w-4 h-4 text-muted-foreground mt-0.5 shrink-0' />
                                <div className='min-w-0 flex-1'>
                                  <p className='text-sm font-mono text-foreground break-all'>
                                    {file}
                                  </p>
                                  <div className='flex flex-wrap gap-1.5 mt-2'>
                                    {locations.slice(0, 20).map((loc, i) => (
                                      <span
                                        key={i}
                                        className='inline-flex items-center px-2 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground'
                                      >
                                        L{loc.line}:{loc.column}
                                      </span>
                                    ))}
                                    {locations.length > 20 && (
                                      <span className='inline-flex items-center px-2 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground'>
                                        +{locations.length - 20} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {hasMoreFiles && (
                          <button
                            type='button'
                            onClick={() => setShowAllFiles(!showAllFiles)}
                            className='w-full py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border transition-colors'
                          >
                            {showAllFiles
                              ? 'Show less'
                              : `Show all ${uniqueFiles.length} files`}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className='text-center py-12 text-sm text-muted-foreground rounded-lg border border-dashed border-border'>
                        No file location data available.
                        <br />
                        <span className='text-xs'>
                          Use the <span className='font-mono'>raw-report</span>{' '}
                          processor to track file locations.
                        </span>
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
