import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyablePathProps {
  path: string;
  /** 'sm' matches component-detail / owner-detail flat (text-sm), 'xs' matches grouped view / unowned list */
  size?: 'sm' | 'xs';
}

export function CopyablePath({ path, size = 'sm' }: CopyablePathProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(path).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const iconSize = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    // Inline so the button flows right after the text ends, even mid-wrap
    <span className='group/path'>
      <span
        className={`font-mono break-all ${
          size === 'xs' ? 'text-xs' : 'text-sm'
        } text-foreground`}
      >
        {path}
      </span>
      <button
        type='button'
        onClick={handleCopy}
        className={`inline-flex items-center ml-1.5 cursor-pointer align-middle transition-opacity text-muted-foreground hover:text-foreground ${
          copied
            ? 'opacity-100 text-emerald-500 hover:text-emerald-500'
            : 'opacity-40 group-hover/path:opacity-100'
        }`}
        title='Copy path'
      >
        {copied ? (
          <Check className={iconSize} />
        ) : (
          <Copy className={iconSize} />
        )}
      </button>
    </span>
  );
}
