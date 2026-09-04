import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)} {...props}>
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold text-slate-900', className)} {...props}>
      {children}
    </h2>
  ),
);
CardTitle.displayName = 'CardTitle';
