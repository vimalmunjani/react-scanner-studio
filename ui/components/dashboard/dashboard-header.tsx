import { LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useReport } from '@/lib/report-context';

const FORMAT_LABELS: Record<string, string> = {
  'count-components': 'count-components',
  'count-components-and-props': 'count-components-and-props',
  'raw-report': 'raw-report',
};

export function DashboardHeader() {
  const { report } = useReport();

  if (!report) return null;

  return (
    <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-muted'>
          <LayoutDashboard className='w-4.5 h-4.5 text-foreground' />
        </div>
        <div>
          <h1 className='text-lg font-semibold text-foreground font-sans'>
            Dashboard
          </h1>
          <div className='flex items-center gap-2 mt-0.5'>
            <Badge
              variant='secondary'
              className='text-[10px] font-mono px-1.5 py-0'
            >
              {FORMAT_LABELS[report.format]}
            </Badge>
            <span className='text-xs text-muted-foreground'>
              {report.totalUniqueComponents} component
              {report.totalUniqueComponents !== 1 ? 's' : ''} detected
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
