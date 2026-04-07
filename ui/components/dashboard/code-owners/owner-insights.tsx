import { GitFork, Layers, Info } from 'lucide-react';
import { useCodeowners } from '@/lib/codeowners-context';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const COLORS = ['#ff914d', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

export function OwnerInsights() {
  const { codeownersReport } = useCodeowners();
  if (!codeownersReport) return null;

  const { mostSharedComponent, owners } = codeownersReport;

  const sortedBySpread = [...owners].sort(
    (a, b) => b.uniqueComponents - a.uniqueComponents
  );
  const maxUnique = sortedBySpread[0]?.uniqueComponents ?? 0;

  return (
    <div className='flex flex-col gap-4'>
      {/* Most Cross-Team Component */}
      {mostSharedComponent && (
        <div className='rounded-lg border border-border bg-card p-5'>
          <div className='flex items-center gap-2 mb-3'>
            <GitFork className='w-4 h-4 text-muted-foreground shrink-0' />
            <h3 className='text-sm font-medium text-card-foreground flex-1'>
              Most Cross-Team Component
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground shrink-0 cursor-default transition-colors' />
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className='max-w-[220px] text-center leading-relaxed'
              >
                The component whose instances appear in files owned by the most
                distinct teams. Useful for understanding cross-team impact when
                this component changes.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className='text-xl font-semibold text-card-foreground font-mono mb-1'>
            {mostSharedComponent.name}
          </p>
          <p className='text-xs text-muted-foreground mb-3'>
            found in files owned by{' '}
            <span className='font-medium text-card-foreground'>
              {mostSharedComponent.ownerCount}
            </span>{' '}
            distinct teams
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {mostSharedComponent.owners.map(owner => (
              <span
                key={owner}
                className='text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border'
              >
                {owner}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Adoption Spread */}
      {sortedBySpread.length > 0 && (
        <div className='rounded-lg border border-border bg-card p-5'>
          <div className='flex items-center gap-2 mb-3'>
            <Layers className='w-4 h-4 text-muted-foreground' />
            <h3 className='text-sm font-medium text-card-foreground flex-1'>
              Adoption Spread
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground shrink-0 cursor-default transition-colors' />
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className='max-w-[220px] text-center leading-relaxed'
              >
                How many distinct component types appear in each team&apos;s
                files. A wider spread means the team draws on more variety from
                the component library.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className='text-xs text-muted-foreground mb-3'>
            Distinct component types per owner
          </p>
          <div className='space-y-2'>
            {sortedBySpread.slice(0, 5).map((owner, i) => {
              const pct =
                maxUnique > 0 ? (owner.uniqueComponents / maxUnique) * 100 : 0;
              return (
                <div key={owner.owner} className='flex items-center gap-2'>
                  <span
                    className='text-xs font-mono text-muted-foreground w-32 truncate shrink-0'
                    title={owner.owner}
                  >
                    {owner.owner}
                  </span>
                  <div className='flex-1 bg-muted rounded-full h-1.5 overflow-hidden'>
                    <div
                      className='h-full rounded-full'
                      style={{
                        width: `${pct}%`,
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                  <span className='text-xs tabular-nums text-muted-foreground w-14 text-right'>
                    {owner.uniqueComponents} types
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
