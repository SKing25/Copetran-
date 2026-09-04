import type { HTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_PX: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex text-copetran-600', className)} {...props}>
      <Loader2 className={cn('animate-spin', SIZE_PX[size])} aria-hidden />
      <span className="sr-only">Cargando…</span>
    </span>
  );
}

/** Overlay de carga sobre un contenedor relativo (ej. una Card en proceso). */
export function SpinnerOverlay({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/70 backdrop-blur-sm">
      <Spinner size="lg" />
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}

/** Placeholder de carga tipo "skeleton" (pulso). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200', className)} />;
}
