import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<AlertVariant, { classes: string; Icon: typeof Info }> = {
  info: { classes: 'border-sky-200 bg-sky-50 text-sky-800', Icon: Info },
  success: { classes: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  warning: { classes: 'border-amber-200 bg-amber-50 text-amber-800', Icon: AlertTriangle },
  danger: { classes: 'border-rose-200 bg-rose-50 text-rose-800', Icon: XCircle },
};

/** Banner de alerta genérico (ej. sobrepeso volumétrico en mensajería). */
export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const { classes, Icon } = VARIANT_CONFIG[variant];
  return (
    <div role="alert" className={cn('flex gap-3 rounded-lg border p-3 text-sm', classes, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
