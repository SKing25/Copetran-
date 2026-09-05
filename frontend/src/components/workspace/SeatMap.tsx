import { Armchair } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SillaConEstado } from '@/context/DataContext';

interface SeatMapProps {
  sillas: SillaConEstado[];
  idSillaSeleccionada: number | null;
  onSeleccionar: (idSilla: number) => void;
}

/**
 * Mapa de asientos interactivo con CSS Grid, en filas de 4 (2 + pasillo + 2),
 * como un bus intercity estándar. La numeración y ubicación (ventana/pasillo)
 * de cada silla viene de SILLA (docs/parcial-primer-corte/00-brief.md).
 */
export function SeatMap({ sillas, idSillaSeleccionada, onSeleccionar }: SeatMapProps) {
  const filas: SillaConEstado[][] = [];
  for (let i = 0; i < sillas.length; i += 4) {
    filas.push(sillas.slice(i, i + 4));
  }

  return (
    <div className="inline-flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        <Armchair className="h-3.5 w-3.5" aria-hidden />
        Frente del bus
      </div>
      {filas.map((fila, i) => (
        <div key={i} className="grid grid-cols-[2.25rem_2.25rem_1rem_2.25rem_2.25rem] gap-1.5">
          {fila.map((silla, idx) => {
            // Columnas 1-2 = lado izquierdo, columna 3 = pasillo (vacía), columnas 4-5 = lado derecho.
            const columna = idx < 2 ? idx + 1 : idx + 2;
            return (
              <button
                key={silla.id_silla}
                type="button"
                disabled={silla.ocupada}
                title={`Silla ${silla.numero} — ${silla.ubicacion}`}
                onClick={() => onSeleccionar(silla.id_silla)}
                style={{ gridColumnStart: columna }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium transition',
                  silla.ocupada && 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300',
                  !silla.ocupada &&
                    silla.id_silla !== idSillaSeleccionada &&
                    'border-slate-300 bg-white text-slate-700 hover:border-copetran-400 hover:bg-copetran-50',
                  silla.id_silla === idSillaSeleccionada && 'border-copetran-600 bg-copetran-600 text-white',
                )}
              >
                {silla.numero}
              </button>
            );
          })}
        </div>
      ))}

      <div className="mt-2 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-slate-300 bg-white" /> Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-copetran-600 bg-copetran-600" /> Seleccionada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-slate-200 bg-slate-100" /> Ocupada
        </span>
      </div>
    </div>
  );
}
