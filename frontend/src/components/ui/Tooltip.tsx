import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Tooltip simple on-hover, sin dependencia de una librería de posicionamiento. */
export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap',
          'rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity',
          'group-hover:opacity-100',
        )}
      >
        {content}
      </span>
    </span>
  );
}
