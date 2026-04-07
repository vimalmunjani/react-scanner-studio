import { Users, TrendingUp, Crown, FileWarning, Info } from 'lucide-react';
import { useCodeowners } from '@/lib/codeowners-context';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function OwnerStatCards() {
  const { codeownersReport } = useCodeowners();
  if (!codeownersReport) return null;

  const { owners, totalOwners, totalInstances, unownedFiles } =
    codeownersReport;

  const avgInstances =
    totalOwners > 0 ? Math.round(totalInstances / totalOwners) : 0;
  const topOwner = owners[0] ?? null;

  const cards = [
    {
      label: 'Total Owners',
      icon: Users,
      value: totalOwners.toLocaleString(),
      sub: 'unique code owners',
      tooltip:
        'Number of unique individuals or teams who own at least one scanned file, based on CODEOWNERS rules.',
    },
    {
      label: 'Avg Instances / Owner',
      icon: TrendingUp,
      value: avgInstances.toLocaleString(),
      sub: 'component instances per owner',
      tooltip:
        'Total component instances across all owned files, divided by the number of owners. Higher values indicate that owners are responsible for more component usage on average.',
    },
    {
      label: 'Top Owner',
      icon: Crown,
      value: topOwner ? topOwner.totalInstances.toLocaleString() : '—',
      sub: topOwner ? topOwner.owner : 'no data',
      subTruncate: true,
      tooltip:
        'The owner with the highest total component instances across their files. When a file has multiple owners, each owner gets full credit for every instance in that file.',
    },
    {
      label: 'Unowned Files',
      icon: FileWarning,
      value: unownedFiles.length.toLocaleString(),
      sub: 'files without CODEOWNERS rule',
      warn: unownedFiles.length > 0,
      tooltip:
        'Files that were scanned but do not match any pattern in your CODEOWNERS file. Component instances in these files have no assigned owner. Add patterns to CODEOWNERS to assign ownership.',
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className='flex flex-col gap-2 p-5 rounded-lg border border-border bg-card min-w-0'
          >
            <div className='flex items-center gap-2'>
              <Icon
                className={`w-4 h-4 shrink-0 ${card.warn ? 'text-amber-500' : 'text-muted-foreground'}`}
              />
              <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide flex-1'>
                {card.label}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground shrink-0 cursor-default transition-colors' />
                </TooltipTrigger>
                <TooltipContent
                  side='top'
                  className='max-w-[220px] text-center leading-relaxed'
                >
                  {card.tooltip}
                </TooltipContent>
              </Tooltip>
            </div>
            <span
              className={`text-2xl font-semibold tabular-nums ${card.warn && card.value !== '0' ? 'text-amber-500' : 'text-card-foreground'}`}
            >
              {card.value}
            </span>
            <span
              className={`text-xs text-muted-foreground truncate ${card.subTruncate ? 'font-mono' : ''}`}
              title={card.sub}
            >
              {card.sub}
            </span>
          </div>
        );
      })}
    </div>
  );
}
