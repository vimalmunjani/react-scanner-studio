import { Users, FileText, AlertCircle } from 'lucide-react';
import { useCodeowners } from '@/lib/codeowners-context';
import { useReport } from '@/lib/report-context';
import { OwnerStatCards } from './owner-stat-cards';
import { OwnerDonutChart } from './owner-donut-chart';
import { OwnerInsights } from './owner-insights';
import { OwnerTable } from './owner-table';
import { UnownedFiles } from './unowned-files';
import { OwnerDetail } from './owner-detail';

function EmptyState({
  icon: Icon,
  title,
  description,
  hint,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  hint?: string;
}) {
  return (
    <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
      <div className='rounded-full bg-muted p-4 mb-4'>
        <Icon className='w-8 h-8 text-muted-foreground' />
      </div>
      <h2 className='text-lg font-semibold text-card-foreground mb-2'>
        {title}
      </h2>
      <p className='text-sm text-muted-foreground max-w-sm mb-4'>
        {description}
      </p>
      {hint && (
        <code className='text-xs bg-muted px-3 py-1.5 rounded-md font-mono text-muted-foreground border border-border'>
          {hint}
        </code>
      )}
    </div>
  );
}

export function CodeOwnersView() {
  const { codeownersReport, isLoading } = useCodeowners();
  const { report } = useReport();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-24'>
        <span className='text-sm text-muted-foreground animate-pulse'>
          Loading code owners data…
        </span>
      </div>
    );
  }

  // No scan loaded at all
  if (!report) {
    return (
      <EmptyState
        icon={FileText}
        title='No scan data loaded'
        description='Run a scan first to generate component usage data, then this page will show code ownership insights.'
        hint='react-scanner-studio scan'
      />
    );
  }

  // Scan exists but wrong format (needs raw-report for file paths)
  if (report.format !== 'raw-report') {
    return (
      <EmptyState
        icon={FileText}
        title='raw-report format required'
        description='Code Owners insights require file-level data. Update your react-scanner.config to use the raw-report processor.'
        hint='processors: [["raw-report", { outputTo: "scan-results.json" }]]'
      />
    );
  }

  // Scan is raw-report but no CODEOWNERS found
  if (!codeownersReport) {
    return (
      <EmptyState
        icon={Users}
        title='No CODEOWNERS file found'
        description='Create a CODEOWNERS file in your repository to enable ownership insights. react-scanner-studio will automatically detect it on the next scan.'
        hint='.github/CODEOWNERS'
      />
    );
  }

  // No owners matched any files
  if (codeownersReport.totalOwners === 0) {
    return (
      <EmptyState
        icon={Users}
        title='No ownership matches found'
        description='A CODEOWNERS file was found but none of its patterns matched the scanned files. Check that your patterns cover the files in your scan.'
      />
    );
  }

  // Owners found but the scan picked up zero component instances — show a
  // notice banner but still render the ownership structure below it.
  const noInstances = codeownersReport.totalInstances === 0;

  return (
    <div className='flex flex-col gap-6'>
      {noInstances && (
        <div className='flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3'>
          <AlertCircle className='w-4 h-4 text-muted-foreground mt-0.5 shrink-0' />
          <div>
            <p className='text-sm font-medium text-card-foreground'>
              No component usage detected
            </p>
            <p className='text-xs text-muted-foreground mt-0.5'>
              CODEOWNERS rules matched {codeownersReport.totalOwners} owner
              {codeownersReport.totalOwners !== 1 ? 's' : ''}, but the scan
              found zero component instances. Run a scan on a project that
              contains React component usage to see ownership insights.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <OwnerStatCards />

      {/* Unowned files warning (conditional) — shown early so coverage gaps are visible */}
      <UnownedFiles />

      {/* Charts row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <OwnerDonutChart />
        <OwnerInsights />
      </div>

      {/* Full owner table */}
      <OwnerTable />

      {/* Owner detail drawer */}
      <OwnerDetail />
    </div>
  );
}
