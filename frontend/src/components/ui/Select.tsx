import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1 block text-xs font-medium text-slate-600">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-md border px-2 py-1.5 text-sm text-slate-900',
            'focus:outline-none focus:ring-1',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
              : 'border-slate-300 focus:border-copetran-500 focus:ring-copetran-500',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
