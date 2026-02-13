import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useReport } from '@/lib/report-context';
import type { NormalizedComponent } from '@/lib/report-types';

type SortKey = 'name' | 'instances' | 'props' | 'files';
type SortDir = 'asc' | 'desc';

function SortHeader({
  label,
  sortKeyName,
  sortKey,
  onToggleSort,
}: {
  label: string;
  sortKeyName: SortKey;
  sortKey: SortKey;
  onToggleSort: (key: SortKey) => void;
}) {
  return (
    <button
      type='button'
      onClick={() => onToggleSort(sortKeyName)}
      className='flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors'
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${sortKey === sortKeyName ? 'text-primary' : ''}`}
      />
    </button>
  );
}

export function ComponentsTable() {
  const { report, setSelectedComponent } = useReport();
  const [sortKey, setSortKey] = useState<SortKey>('instances');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    if (!report) return [];

    let filtered = report.components;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q));
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
      }
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [report, sortKey, sortDir, search]);

  if (!report) return null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const renderPropBar = (component: NormalizedComponent) => {
    const propCount = Object.keys(component.props).length;
    if (propCount === 0)
      return <span className='text-muted-foreground text-xs'>--</span>;

    const maxProps = Math.max(
      ...report.components.map(c => Object.keys(c.props).length)
    );

    return (
      <div className='flex items-center gap-2'>
        <div className='flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]'>
          <div
            className='h-full rounded-full bg-chart-2'
            style={{
              width: `${(propCount / maxProps) * 100}%`,
            }}
          />
        </div>
        <span className='text-xs tabular-nums text-muted-foreground'>
          {propCount}
        </span>
      </div>
    );
  };

  return (
    <div className='rounded-lg border border-border bg-card'>
      <div className='flex items-center justify-between p-5 border-b border-border'>
        <h2 className='text-sm font-medium text-card-foreground'>
          All Components
        </h2>
        <div className='relative w-64'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search components...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9 h-8 text-sm bg-secondary border-border'
          />
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border'>
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
              {report.format === 'raw-report' && (
                <th className='text-left p-3'>
                  <SortHeader
                    label='Files'
                    sortKeyName='files'
                    sortKey={sortKey}
                    onToggleSort={toggleSort}
                  />
                </th>
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
                  <span className='text-sm font-mono font-medium text-foreground'>
                    {'<'}
                    {component.name}
                    {' />'}
                  </span>
                </td>
                <td className='p-3'>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]'>
                      <div
                        className='h-full rounded-full bg-chart-1'
                        style={{
                          width: `${(component.instances / report.components[0].instances) * 100}%`,
                        }}
                      />
                    </div>
                    <span className='text-sm tabular-nums text-foreground font-medium'>
                      {component.instances}
                    </span>
                  </div>
                </td>
                <td className='p-3'>{renderPropBar(component)}</td>
                {report.format === 'raw-report' && (
                  <td className='p-3'>
                    <span className='text-sm tabular-nums text-muted-foreground'>
                      {component.files.length > 0
                        ? component.files.length
                        : '--'}
                    </span>
                  </td>
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
        <div className='p-8 text-center text-sm text-muted-foreground'>
          No components found matching your search.
        </div>
      )}
    </div>
  );
}
