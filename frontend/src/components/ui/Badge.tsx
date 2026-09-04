import { cn } from '../../utils/cn';

const COLOR_POR_ESTADO: Record<string, string> = {
  // ESTADO_TIQUETE
  RESERVADO: 'bg-amber-100 text-amber-800',
  PAGADO: 'bg-emerald-100 text-emerald-800',
  ABIERTO: 'bg-sky-100 text-sky-800',
  CANCELADO: 'bg-rose-100 text-rose-800',
  VIAJADO: 'bg-slate-200 text-slate-700',
  // ESTADO_GUIA
  ADMITIDO: 'bg-sky-100 text-sky-800',
  EN_TRANSITO: 'bg-amber-100 text-amber-800',
  BODEGA_DESTINO: 'bg-violet-100 text-violet-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  NOVEDAD: 'bg-rose-100 text-rose-800',
};

export function Badge({ estado, className }: { estado: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COLOR_POR_ESTADO[estado] ?? 'bg-slate-100 text-slate-700',
        className,
      )}
    >
      {estado}
    </span>
  );
}
