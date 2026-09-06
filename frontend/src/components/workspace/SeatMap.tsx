import { useState, useEffect } from 'react';
import { Armchair, Clock, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SillaConEstado } from '@/context/DataContext';

interface SeatMapProps {
  sillas: SillaConEstado[];
  idSillaSeleccionada: number | null;
  onSeleccionar: (idSilla: number) => void;
}

/**
 * Mapa de asientos interactivo para Bus Doble Piso de Copetran.
 * Permite alternar entre Piso 1 (VIP Cama 160°) y Piso 2 (Confort Panorámico).
 * Incluye temporizador de bloqueo temporal de silla (RF03, 3 minutos).
 */
export function SeatMap({ sillas, idSillaSeleccionada, onSeleccionar }: SeatMapProps) {
  const [pisoActual, setPisoActual] = useState<1 | 2>(1);
  const [tiempoRestante, setTiempoRestante] = useState<number>(180); // 3 minutos (RF03)

  // Separar sillas por piso (Piso 1: 1 a 8 VIP; Piso 2: 9 en adelante)
  const sillasPiso1 = sillas.filter((s) => s.numero <= 8);
  const sillasPiso2 = sillas.filter((s) => s.numero > 8);

  const sillasMostrar = pisoActual === 1 ? sillasPiso1 : sillasPiso2;

  // Si se selecciona una silla que está en el otro piso, cambiar de pestaña automáticamente
  useEffect(() => {
    if (idSillaSeleccionada) {
      const silla = sillas.find((s) => s.id_silla === idSillaSeleccionada);
      if (silla) {
        if (silla.numero <= 8 && pisoActual !== 1) setPisoActual(1);
        if (silla.numero > 8 && pisoActual !== 2) setPisoActual(2);
      }
      setTiempoRestante(180); // Reiniciar temporizador RF03 a 3 minutos
    }
  }, [idSillaSeleccionada, sillas]);

  // Temporizador regresivo de reserva temporal (RF03)
  useEffect(() => {
    if (!idSillaSeleccionada) return;
    const interval = setInterval(() => {
      setTiempoRestante((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [idSillaSeleccionada]);

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const tiempoFormateado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  // Agrupar en filas de 4 (2 + pasillo + 2)
  const filas: SillaConEstado[][] = [];
  for (let i = 0; i < sillasMostrar.length; i += 4) {
    filas.push(sillasMostrar.slice(i, i + 4));
  }

  return (
    <div className="inline-flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Selector de Piso (Bus Doble Piso) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Layers className="h-4 w-4 text-copetran-600" />
          <span>Nivel del Bus:</span>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPisoActual(1)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-md transition',
              pisoActual === 1
                ? 'bg-copetran-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            Piso 1 (VIP Cama)
          </button>
          <button
            type="button"
            onClick={() => setPisoActual(2)}
            className={cn(
              'px-3 py-1.5 rounded-md transition',
              pisoActual === 2
                ? 'bg-copetran-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            Piso 2 (Confort)
          </button>
        </div>
      </div>

      {/* Temporizador RF03 si hay silla seleccionada */}
      {idSillaSeleccionada && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold">
            <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            <span>Bloqueo temporal (RF03):</span>
          </div>
          <span className="font-mono font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
            {tiempoFormateado} min
          </span>
        </div>
      )}

      {/* Cabecera del Bus */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <Armchair className="h-3.5 w-3.5" aria-hidden />
          <span>Frente del vehículo</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {pisoActual === 1 ? 'Sillas 1 - 8' : 'Sillas 9 - 20'}
        </span>
      </div>

      {/* Grid de Asientos */}
      <div className="space-y-2 py-1">
        {filas.map((fila, i) => (
          <div key={i} className="grid grid-cols-[2.5rem_2.5rem_1.25rem_2.5rem_2.5rem] gap-2 items-center">
            {fila.map((silla, idx) => {
              const columna = idx < 2 ? idx + 1 : idx + 2;
              const esSeleccionada = silla.id_silla === idSillaSeleccionada;
              return (
                <button
                  key={silla.id_silla}
                  type="button"
                  disabled={silla.ocupada}
                  title={`Silla ${silla.numero} — ${silla.ubicacion} (${pisoActual === 1 ? 'Piso 1 VIP' : 'Piso 2 Confort'})`}
                  onClick={() => onSeleccionar(silla.id_silla)}
                  style={{ gridColumnStart: columna }}
                  className={cn(
                    'relative flex h-10 w-10 flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all transform active:scale-95 shadow-sm',
                    silla.ocupada &&
                      'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 shadow-none',
                    !silla.ocupada &&
                      !esSeleccionada &&
                      'border-slate-300 bg-white text-slate-800 hover:border-copetran-500 hover:bg-copetran-50 hover:shadow',
                    esSeleccionada &&
                      'border-copetran-600 bg-gradient-to-tr from-copetran-700 to-copetran-500 text-white ring-2 ring-copetran-300 shadow-md scale-105',
                  )}
                >
                  <span>{silla.numero}</span>
                  <span className="text-[9px] font-normal opacity-70 leading-none">
                    {silla.ubicacion === 'VENTANA' ? 'V' : 'P'}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Leyenda de Asientos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-slate-300 bg-white shadow-xs" /> Libre
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-copetran-700">
          <span className="h-3 w-3 rounded bg-copetran-600 shadow-xs" /> Seleccionada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-slate-200 bg-slate-100" /> Ocupada
        </span>
      </div>
    </div>
  );
}
