import { AlertTriangle, Copy, Check, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { useCodeowners } from '@/lib/codeowners-context';
import { CopyablePath } from '@/components/ui/copyable-path';

export function UnownedFiles() {
  const { codeownersReport } = useCodeowners();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!codeownersReport || codeownersReport.unownedFiles.length === 0)
    return null;

  const { unownedFiles, unownedInstances } = codeownersReport;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(unownedFiles.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className='rounded-lg border border-amber-500/30 bg-amber-500/5 overflow-hidden'>
      {/* Clickable header — always visible */}
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-amber-500/5 transition-colors group'
      >
        <div className='flex items-center gap-3'>
          <AlertTriangle className='w-4 h-4 text-amber-500 shrink-0' />
          <div>
            <span className='text-sm font-medium text-card-foreground'>
              {unownedFiles.length} Unowned{' '}
              {unownedFiles.length === 1 ? 'File' : 'Files'}
            </span>
            <span className='text-xs text-muted-foreground ml-2 tabular-nums'>
              · {unownedInstances.toLocaleString()}{' '}
              {unownedInstances === 1 ? 'instance' : 'instances'}
            </span>
          </div>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          {/* Copy all — only shown when expanded */}
          {open && (
            <button
              type='button'
              onClick={handleCopy}
              className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-card-foreground transition-colors px-2 py-1 rounded border border-border bg-card'
            >
              {copied ? (
                <>
                  <Check className='w-3 h-3 text-emerald-500' />
                  Copied
                </>
              ) : (
                <>
                  <Copy className='w-3 h-3' />
                  Copy all
                </>
              )}
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expandable file list — animated with grid-rows trick */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className='overflow-hidden'>
          <div className='px-5 pb-4 border-t border-amber-500/20'>
            <p className='text-xs text-muted-foreground mt-3 mb-3'>
              Add patterns to{' '}
              <code className='font-mono bg-muted px-1 py-0.5 rounded'>
                .github/CODEOWNERS
              </code>{' '}
              to assign ownership.
            </p>
            <div className='flex flex-col max-h-56 overflow-y-auto pr-1 divide-y divide-border/50'>
              {unownedFiles.map(f => (
                <div key={f} className='py-1.5'>
                  <CopyablePath path={f} size='xs' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
