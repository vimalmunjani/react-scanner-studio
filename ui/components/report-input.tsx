import { FileText, Loader2 } from 'lucide-react';
import { useReport } from '@/lib/report-context';

export function ReportInput() {
  const { error } = useReport();

  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] px-4'>
      <div className='w-full max-w-2xl'>
        <div className='text-center mb-10'>
          <div className='flex items-center justify-center gap-3 mb-4'>
            <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
              <FileText className='w-5 h-5 text-primary' />
            </div>
            <h1 className='text-3xl font-semibold tracking-tight text-foreground font-sans text-balance'>
              React Scanner Studio
            </h1>
          </div>
          <p className='text-muted-foreground text-base leading-relaxed max-w-md mx-auto'>
            Visualize component usage, prop distribution, and file locations
            from your react-scanner report.
          </p>
        </div>

        {error ? (
          <div className='flex flex-col items-center gap-4'>
            <div className='p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center'>
              <p className='font-medium mb-1'>Failed to load report</p>
              <p className='text-destructive/80'>{error}</p>
            </div>
            <p className='text-sm text-muted-foreground'>
              Make sure you have run{' '}
              <code className='px-1.5 py-0.5 rounded bg-secondary font-mono text-xs'>
                react-scanner-studio scan
              </code>{' '}
              to generate the report.
            </p>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-4'>
            <div className='flex items-center justify-center w-16 h-16 rounded-full bg-secondary'>
              <Loader2 className='w-8 h-8 text-muted-foreground animate-spin' />
            </div>
            <p className='text-sm text-muted-foreground'>
              Loading scan report...
            </p>
          </div>
        )}

        <div className='mt-12 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground'>
          <span className='text-muted-foreground/60'>Supported formats:</span>
          <span className='px-2 py-1 rounded bg-secondary font-mono'>
            count-components
          </span>
          <span className='px-2 py-1 rounded bg-secondary font-mono'>
            count-components-and-props
          </span>
          <span className='px-2 py-1 rounded bg-secondary font-mono'>
            raw-report
          </span>
        </div>
      </div>
    </div>
  );
}
