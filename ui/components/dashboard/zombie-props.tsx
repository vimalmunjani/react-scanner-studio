import { Ghost, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useReport } from '@/lib/report-context';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ZombieProps() {
  const { report } = useReport();
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    if (!report) return new Map<string, string[]>();

    const map = new Map<string, string[]>();
    for (const zp of report.zombieProps) {
      const existing = map.get(zp.component) ?? [];
      existing.push(zp.prop);
      map.set(zp.component, existing);
    }
    return map;
  }, [report]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;

    const q = search.toLowerCase();
    const result = new Map<string, string[]>();

    for (const [component, props] of grouped) {
      if (component.toLowerCase().includes(q)) {
        result.set(component, props);
        continue;
      }
      const matchingProps = props.filter(p => p.toLowerCase().includes(q));
      if (matchingProps.length > 0) {
        result.set(component, matchingProps);
      }
    }
    return result;
  }, [grouped, search]);

  if (!report || report.zombieProps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Ghost className='w-5 h-5 text-muted-foreground' />
            <CardTitle className='text-base'>Zombie Props</CardTitle>
          </div>
          <CardDescription>
            Props used only once across the entire codebase. These are
            candidates for removal or consolidation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            No zombie props detected. All props are used more than once.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalZombies = report.zombieProps.length;
  const affectedComponents = grouped.size;

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Ghost className='w-5 h-5 text-primary' />
            <CardTitle className='text-base'>Zombie Props</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='font-mono text-xs'>
              {totalZombies} prop{totalZombies !== 1 ? 's' : ''}
            </Badge>
            <Badge variant='outline' className='font-mono text-xs'>
              {affectedComponents} component
              {affectedComponents !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Props used only once across the entire codebase. These are candidates
          for removal or consolidation.
        </CardDescription>
        <div className='relative mt-2'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Filter by component or prop name...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4 max-h-[28rem] overflow-y-auto pr-1'>
          {[...filtered.entries()].map(([component, props]) => (
            <div key={component} className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-foreground font-mono'>
                  {component}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {props.length} zombie prop{props.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {props.map(prop => (
                  <Badge
                    key={`${component}-${prop}`}
                    variant='secondary'
                    className='font-mono text-xs px-2 py-0.5'
                  >
                    {prop}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          {filtered.size === 0 && (
            <p className='text-sm text-muted-foreground'>
              No results match your search.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
