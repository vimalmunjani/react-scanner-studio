import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCodeowners } from '@/lib/codeowners-context';

type SortKey = 'owner' | 'totalInstances' | 'uniqueComponents' | 'fileCount';
type SortDir = 'asc' | 'desc';

function SortHeader({
  label,
  col,
  sortKey,
  onToggleSort,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  onToggleSort: (key: SortKey) => void;
}) {
  return (
    <button
      type='button'
      onClick={() => onToggleSort(col)}
      className='flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors'
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${sortKey === col ? 'text-primary' : ''}`}
      />
    </button>
  );
}

export function OwnerTable() {
  const { codeownersReport, setSelectedOwner } = useCodeowners();
  const [sortKey, setSortKey] = useState<SortKey>('totalInstances');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [search, setSearch] = useState('');

  const sorted = useMemo(() => {
    if (!codeownersReport) return [];
    let filtered = [...codeownersReport.owners];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(o => o.owner.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => {
      const compare =
        sortKey === 'owner'
          ? a.owner.localeCompare(b.owner)
          : (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [codeownersReport, sortKey, sortDir, search]);

  if (!codeownersReport || codeownersReport.owners.length === 0) return null;

  const { owners, totalInstances } = codeownersReport;
  const maxInstances = Math.max(...owners.map(o => o.totalInstances), 1);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className='rounded-lg border border-border bg-card overflow-hidden'>
      <div className='px-5 py-4 border-b border-border flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-sm font-medium text-card-foreground'>
            All Owners
          </h2>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {owners.length} owners found in CODEOWNERS
          </p>
        </div>
        <div className='relative w-48 shrink-0'>
          <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none' />
          <Input
            placeholder='Search owners…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-8 h-8 text-xs'
          />
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border bg-muted/30'>
              <th className='text-left p-3 pl-5'>
                <SortHeader
                  label='Owner'
                  col='owner'
                  sortKey={sortKey}
                  onToggleSort={toggleSort}
                />
              </th>
              <th className='text-left p-3'>
                <SortHeader
                  label='Instances'
                  col='totalInstances'
                  sortKey={sortKey}
                  onToggleSort={toggleSort}
                />
              </th>
              <th className='text-left p-3'>
                <SortHeader
                  label='Components'
                  col='uniqueComponents'
                  sortKey={sortKey}
                  onToggleSort={toggleSort}
                />
              </th>
              <th className='text-left p-3 hidden md:table-cell'>
                <SortHeader
                  label='Files'
                  col='fileCount'
                  sortKey={sortKey}
                  onToggleSort={toggleSort}
                />
              </th>
              <th className='text-left p-3 hidden lg:table-cell'>
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  % of Total
                </span>
              </th>
              <th className='p-3 w-10' />
            </tr>
          </thead>
          <tbody>
            {sorted.map(owner => {
              const pct =
                totalInstances > 0
                  ? ((owner.totalInstances / totalInstances) * 100).toFixed(1)
                  : '0.0';
              const barPct = (owner.totalInstances / maxInstances) * 100;
              return (
                <tr
                  key={owner.owner}
                  className='border-b border-border last:border-b-0 hover:bg-accent/50 transition-colors cursor-pointer group'
                  onClick={() => setSelectedOwner(owner)}
                >
                  <td className='p-3 pl-5'>
                    <span className='text-sm font-mono font-medium text-foreground'>
                      {owner.owner}
                    </span>
                  </td>
                  <td className='p-3'>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 h-1.5 rounded-full bg-secondary overflow-hidden max-w-[80px]'>
                        <div
                          className='h-full rounded-full bg-chart-1 transition-all'
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                      <span className='text-sm tabular-nums text-foreground font-medium'>
                        {owner.totalInstances.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className='p-3'>
                    <span className='text-sm tabular-nums text-muted-foreground'>
                      {owner.uniqueComponents.toLocaleString()}
                    </span>
                  </td>
                  <td className='p-3 hidden md:table-cell'>
                    <span className='text-sm tabular-nums text-muted-foreground'>
                      {owner.fileCount.toLocaleString()}
                    </span>
                  </td>
                  <td className='p-3 hidden lg:table-cell'>
                    <span className='text-sm tabular-nums text-muted-foreground'>
                      {pct}%
                    </span>
                  </td>
                  <td className='p-3 pr-5'>
                    <ChevronRight className='w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors' />
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className='p-8 text-center text-sm text-muted-foreground'
                >
                  No owners found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
