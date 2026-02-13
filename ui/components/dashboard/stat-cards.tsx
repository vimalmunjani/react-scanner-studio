import { Layers, Component, Hash, FolderOpen } from 'lucide-react';
import { useReport } from '@/lib/report-context';
import type { NormalizedReport } from '@/lib/report-types';

interface StatDef {
  label: string;
  icon: typeof Layers;
  getValue: (report: NormalizedReport) => number;
}

const stats: StatDef[] = [
  {
    label: 'Total Instances',
    icon: Layers,
    getValue: r => r.totalInstances,
  },
  {
    label: 'Unique Components',
    icon: Component,
    getValue: r => r.totalUniqueComponents,
  },
  {
    label: 'Unique Props',
    icon: Hash,
    getValue: r => r.totalUniqueProps,
  },
  {
    label: 'Files Scanned',
    icon: FolderOpen,
    getValue: r => r.totalFiles,
  },
];

export function StatCards() {
  const { report } = useReport();
  if (!report) return null;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {stats.map(stat => {
        const value = stat.getValue(report);
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className='flex flex-col gap-2 p-5 rounded-lg border border-border bg-card min-w-0'
          >
            <div className='flex items-center gap-2'>
              <Icon className='w-4 h-4 text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                {stat.label}
              </span>
            </div>
            <span className='text-2xl font-semibold text-card-foreground tabular-nums'>
              {value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
