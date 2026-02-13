import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ChevronRight,
  Search,
  Package,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReport } from '@/lib/report-context';
import type { NormalizedComponent } from '@/lib/report-types';

type SortKey = 'name' | 'instances' | 'props' | 'files' | 'propsSpread';
type SortDir = 'asc' | 'desc';

function SortHeader({
  label,
  sortKeyName,
  sortKey,
  onToggleSort,
  className = '',
}: {
  label: string;
  sortKeyName: SortKey;
  sortKey: SortKey;
  onToggleSort: (key: SortKey) => void;
  className?: string;
}) {
  return (
    <button
      type='button'
      onClick={() => onToggleSort(sortKeyName)}
      className={`flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors ${className}`}
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${sortKey === sortKeyName ? 'text-primary' : ''}`}
      />
    </button>
  );
}

export function ComponentInventory() {
  const { report, setSelectedComponent } = useReport();
  const [sortKey, setSortKey] = useState<SortKey>('instances');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');
  const [minInstances, setMinInstances] = useState(0);

  const sorted = useMemo(() => {
    if (!report) return [];

    let filtered = report.components;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
    }

    if (minInstances > 0) {
      filtered = filtered.filter(c => c.instances >= minInstances);
    }

    return [...filtered].sort((a, b) => {
      let compare = 0;
      switch (sortKey) {
        case 'name':
          compare = a.name.localeCompare(b.name);
          break;
        case 'instances':
          compare = a.instances - b.instances;
          break;
        case 'props':
          compare = Object.keys(a.props).length - Object.keys(b.props).length;
          break;
        case 'files':
          compare = a.files.length - b.files.length;
          break;
        case 'propsSpread':
          compare = a.propsSpreadCount - b.propsSpreadCount;
          break;
      }
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [report, sortKey, sortDir, search, minInstances]);

  if (!report) return null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const maxInstances = Math.max(...report.components.map(c => c.instances), 1);
  const maxProps = Math.max(
    ...report.components.map(c => Object.keys(c.props).length),
    1
  );

  const renderInstanceBar = (component: NormalizedComponent) => {
    const pct = (component.instances / maxInstances) * 100;
    return (
      <div className='flex items-center gap-3'>
        <div className='flex-1 h-2 rounded-full bg-secondary overflow-hidden max-w-[120px]'>
          <div
            className='h-full rounded-full bg-chart-1 transition-all'
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className='text-sm tabular-nums text-foreground font-medium w-8 text-right'>
          {component.instances}
        </span>
      </div>
    );
  };

  const renderPropBar = (component: NormalizedComponent) => {
    const propCount = Object.keys(component.props).length;
    if (propCount === 0) {
      return <span className='text-muted-foreground text-xs'>--</span>;
    }
    const pct = (propCount / maxProps) * 100;
    return (
      <div className='flex items-center gap-3'>
        <div className='flex-1 h-2 rounded-full bg-secondary overflow-hidden max-w-[120px]'>
          <div
            className='h-full rounded-full bg-chart-2 transition-all'
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className='text-sm tabular-nums text-muted-foreground w-8 text-right'>
          {propCount}
        </span>
      </div>
    );
  };

  const renderPropNames = (component: NormalizedComponent) => {
    const props = Object.keys(component.props);
    if (props.length === 0) {
      return <span className='text-muted-foreground text-xs'>--</span>;
    }
    const shown = props.slice(0, 3);
    const remaining = props.length - shown.length;
    return (
      <div className='flex flex-wrap gap-1'>
        {shown.map(p => (
          <span
            key={p}
            className='inline-flex px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground'
          >
            {p}
          </span>
        ))}
        {remaining > 0 && (
          <span className='inline-flex px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground'>
            +{remaining}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-muted'>
            <Package className='w-4.5 h-4.5 text-foreground' />
          </div>
          <div>
            <h1 className='text-lg font-semibold text-foreground font-sans'>
              Component Inventory
            </h1>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {sorted.length} of {report.totalUniqueComponents} components
              {search || minInstances > 0 ? ' (filtered)' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search components...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9 h-9 text-sm bg-card border-border'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Filter className='w-3.5 h-3.5 text-muted-foreground' />
          <span className='text-xs text-muted-foreground'>Min instances:</span>
          <Input
            type='number'
            min={0}
            value={minInstances}
            onChange={e => setMinInstances(Math.max(0, Number(e.target.value)))}
            className='w-20 h-9 text-sm bg-card border-border tabular-nums'
          />
        </div>
      </div>

      {/* Table */}
      <div className='rounded-lg border border-border bg-card overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border bg-muted/30'>
                <th className='text-left p-3 pl-5'>
                  <SortHeader
                    label='Component'
                    sortKeyName='name'
                    sortKey={sortKey}
                    onToggleSort={toggleSort}
                  />
                </th>
                <th className='text-left p-3'>
                  <SortHeader
                    label='Instances'
                    sortKeyName='instances'
                    sortKey={sortKey}
                    onToggleSort={toggleSort}
                  />
                </th>
                <th className='text-left p-3'>
                  <SortHeader
                    label='Props'
                    sortKeyName='props'
                    sortKey={sortKey}
                    onToggleSort={toggleSort}
                  />
                </th>
                <th className='text-left p-3 hidden lg:table-cell'>
                  <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                    Prop Names
                  </span>
                </th>
                {report.format === 'raw-report' && (
                  <>
                    <th className='text-left p-3 hidden md:table-cell'>
                      <SortHeader
                        label='Files'
                        sortKeyName='files'
                        sortKey={sortKey}
                        onToggleSort={toggleSort}
                      />
                    </th>
                    <th className='text-left p-3 hidden lg:table-cell'>
                      <SortHeader
                        label='Spread'
                        sortKeyName='propsSpread'
                        sortKey={sortKey}
                        onToggleSort={toggleSort}
                      />
                    </th>
                  </>
                )}
                <th className='p-3 w-10' />
              </tr>
            </thead>
            <tbody>
              {sorted.map(component => (
                <tr
                  key={component.name}
                  className='border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer group'
                  onClick={() => setSelectedComponent(component)}
                >
                  <td className='p-3 pl-5'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-mono font-medium text-foreground'>
                        {'<'}
                        {component.name}
                        {' />'}
                      </span>
                      {component.propsSpreadCount > 0 && (
                        <Badge
                          variant='secondary'
                          className='text-[9px] px-1 py-0'
                        >
                          spread
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className='p-3'>{renderInstanceBar(component)}</td>
                  <td className='p-3'>{renderPropBar(component)}</td>
                  <td className='p-3 hidden lg:table-cell'>
                    {renderPropNames(component)}
                  </td>
                  {report.format === 'raw-report' && (
                    <>
                      <td className='p-3 hidden md:table-cell'>
                        <span className='text-sm tabular-nums text-muted-foreground'>
                          {component.files.length > 0
                            ? component.files.length
                            : '--'}
                        </span>
                      </td>
                      <td className='p-3 hidden lg:table-cell'>
                        <span className='text-sm tabular-nums text-muted-foreground'>
                          {component.propsSpreadCount > 0
                            ? component.propsSpreadCount
                            : '--'}
                        </span>
                      </td>
                    </>
                  )}
                  <td className='p-3 pr-5'>
                    <ChevronRight className='w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sorted.length === 0 && (
          <div className='p-12 text-center text-sm text-muted-foreground'>
            No components match your current filters.
          </div>
        )}
      </div>
    </div>
  );
}
