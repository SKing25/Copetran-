import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 focus:border-copetran-500 focus:ring-copetran-500',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, id, ...props }, ref) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 focus:border-copetran-500 focus:ring-copetran-500',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';
