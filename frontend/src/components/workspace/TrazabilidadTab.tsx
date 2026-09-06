import { Badge, Card, CardTitle } from '@/components/ui';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/utils/format';
import {
  ACTORES_PRIMARIOS,
  ACTORES_SECUNDARIOS,
  CASOS_DE_USO_ALTO_NIVEL,
  ESPECIFICACIONES_CASO_USO,
} from '@/data/trazabilidad';
import { Ticket, Package, AlertTriangle, DollarSign } from 'lucide-react';

/**
 * Vista de trazabilidad enriquecida:
 * 1. KPIs del sistema en tiempo real.
 * 2. Stepper visual del ciclo de vida de los estados (Tiquete y Guía).
 * 3. Roles del sistema, organigrama y especificaciones de casos de uso (ECU-01 y ECU-02).
 */
export function TrazabilidadTab() {
  const { tiquetes, guias } = useData();

  // Métricas en tiempo real
  const totalTiquetes = tiquetes.length;
  const totalGuias = guias.length;
  const totalNovedades = guias.filter((g) => g.id_estado_guia === 'NOVEDAD').length;

  const recaudoTiquetes = tiquetes
    .filter((t) => t.id_estado_tiquete === 'PAGADO')
    .reduce((acc, t) => acc + t.valor_pagado, 0);
  const recaudoGuias = guias.reduce((acc, g) => acc + (g.valor_total ?? 0), 0);
  const recaudoTotal = recaudoTiquetes + recaudoGuias;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Trazabilidad del Sistema y KPIs Operativos</h1>
        <p className="text-sm text-slate-500">
          Supervisión en tiempo real del ciclo de vida de procesos, estados de negocio y matriz de trazabilidad RUP.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TARJETAS DE KPIS EN TIEMPO REAL */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tiquetes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-copetran-50 text-copetran-600 flex items-center justify-center shrink-0">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tiquetes Emitidos</span>
            <span className="text-2xl font-black text-slate-900">{totalTiquetes}</span>
            <span className="text-[10px] text-slate-500 block">Proceso A (Pasajeros)</span>
          </div>
        </div>

        {/* KPI 2: Recaudo Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Recaudo Estimado</span>
            <span className="text-xl font-black text-slate-900">{formatCurrency(recaudoTotal)}</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">Taquillas y Bodegas</span>
          </div>
        </div>

        {/* KPI 3: Guías de Envío */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Guías de Envío</span>
            <span className="text-2xl font-black text-slate-900">{totalGuias}</span>
            <span className="text-[10px] text-slate-500 block">Proceso C (Mensajería)</span>
          </div>
        </div>

        {/* KPI 4: Novedades */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Guías con Novedad</span>
            <span className="text-2xl font-black text-slate-900">{totalNovedades}</span>
            <span className="text-[10px] text-amber-600 font-semibold block">Retenciones operativas</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* STEPPERS VISUALES DE CICLO DE VIDA DE ESTADOS */}
      {/* ------------------------------------------------------------- */}
      <Card>
        <CardTitle>Ciclos de Vida y Transiciones de Estado Parametrizadas</CardTitle>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Visualización de las máquinas de estados documentadas en la Sección 8 del informe parcial.
        </p>

        <div className="space-y-6">
          {/* Stepper Proceso A: Tiquetes */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-copetran-600" />
                Ciclo de Vida del Tiquete (ESTADO_TIQUETE)
              </h4>
              <span className="text-[10px] font-bold bg-copetran-100 text-copetran-700 px-2 py-0.5 rounded-full">
                5 Estados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  1
                </div>
                <span className="font-bold text-slate-800 block">RESERVADO</span>
                <span className="text-[10px] text-slate-400">Reserva temporal A1</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-copetran-300 bg-copetran-50/40 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-copetran-600 text-white font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  2
                </div>
                <span className="font-bold text-copetran-800 block">PAGADO</span>
                <span className="text-[10px] text-slate-400">Confirmación CUFE</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  3
                </div>
                <span className="font-bold text-slate-800 block">ABIERTO</span>
                <span className="text-[10px] text-slate-400">Fecha flexible A2</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-300 bg-emerald-50/40 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  4
                </div>
                <span className="font-bold text-emerald-800 block">VIAJADO</span>
                <span className="text-[10px] text-slate-400">Abordaje cerrado</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/40 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-rose-100 text-rose-700 font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  5
                </div>
                <span className="font-bold text-rose-800 block">CANCELADO</span>
                <span className="text-[10px] text-slate-400">Liberación de silla</span>
              </div>
            </div>
          </div>

          {/* Stepper Proceso C: Mensajería */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Package className="h-4 w-4 text-copetran-600" />
                Ciclo de Vida de Guía de Envío (ESTADO_GUIA)
              </h4>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                5 Estados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  1
                </div>
                <span className="font-bold text-slate-800 block">ADMITIDO</span>
                <span className="text-[10px] text-slate-400">Pesaje y código barras</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-copetran-600 text-white font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  2
                </div>
                <span className="font-bold text-slate-800 block">EN_TRANSITO</span>
                <span className="text-[10px] text-slate-400">Despacho en ruta</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  3
                </div>
                <span className="font-bold text-slate-800 block">BODEGA_DESTINO</span>
                <span className="text-[10px] text-slate-400">Recepción en Hub</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-300 bg-emerald-50/40 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  4
                </div>
                <span className="font-bold text-emerald-800 block">ENTREGADO</span>
                <span className="text-[10px] text-slate-400">Firma y cierre</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-300 bg-amber-50/40 shadow-xs">
                <div className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 font-bold mx-auto mb-1 flex items-center justify-center text-[10px]">
                  !
                </div>
                <span className="font-bold text-amber-900 block">NOVEDAD</span>
                <span className="text-[10px] text-slate-400">Retención operativa</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* ROLES PRIMARIOS */}
      {/* ------------------------------------------------------------- */}
      <Card>
        <CardTitle>Roles del sistema — actores primarios</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="rounded-l-md py-2.5 pl-3 pr-4">Rol / Actor</th>
                <th className="py-2.5 pr-4">Ubicación en el organigrama</th>
                <th className="rounded-r-md py-2.5 pr-3">Interviene en</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTORES_PRIMARIOS.map((a) => (
                <tr key={a.rol} className="transition hover:bg-slate-50/80">
                  <td className="py-2 pl-3 pr-4 font-medium text-slate-900">{a.rol}</td>
                  <td className="py-2 pr-4">
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {a.ubicacion}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-slate-600">{a.interviene}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* ACTORES SECUNDARIOS / EXTERNOS */}
      {/* ------------------------------------------------------------- */}
      <Card>
        <CardTitle>Actores secundarios / externos</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="rounded-l-md py-2.5 pl-3 pr-4">Rol / Actor</th>
                <th className="py-2.5 pr-4">Naturaleza</th>
                <th className="rounded-r-md py-2.5 pr-3">Interviene en</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTORES_SECUNDARIOS.map((a) => (
                <tr key={a.rol} className="transition hover:bg-slate-50/80">
                  <td className="py-2 pl-3 pr-4 font-medium text-slate-900">{a.rol}</td>
                  <td className="py-2 pr-4 text-slate-600">{a.ubicacion}</td>
                  <td className="py-2 pr-3 text-slate-600">{a.interviene}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* CASOS DE USO DE ALTO NIVEL */}
      {/* ------------------------------------------------------------- */}
      <Card>
        <CardTitle>Casos de uso de alto nivel (por rol)</CardTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CASOS_DE_USO_ALTO_NIVEL.map((c) => (
            <div key={c.rol} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">{c.rol}</p>
              <ul className="mt-1.5 space-y-1">
                {c.casos.map((caso) => (
                  <li key={caso} className="text-xs text-slate-600">
                    · {caso}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* ESPECIFICACIONES DE CASO DE USO */}
      {/* ------------------------------------------------------------- */}
      {ESPECIFICACIONES_CASO_USO.map((ecu) => (
        <Card key={ecu.id}>
          <div className="flex items-center gap-2">
            <CardTitle>
              {ecu.id} — {ecu.nombre}
            </CardTitle>
            <Badge estado={ecu.id} className="bg-copetran-50 text-copetran-700" />
          </div>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Actores</dt>
              <dd className="text-slate-700">{ecu.actores}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descripción</dt>
              <dd className="text-slate-700">{ecu.descripcion}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Precondiciones</dt>
                <dd className="text-slate-700">{ecu.precondiciones}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Postcondiciones</dt>
                <dd className="text-slate-700">{ecu.postcondiciones}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flujo principal</dt>
              <dd>
                <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-slate-700">
                  {ecu.flujoPrincipal.map((paso, i) => (
                    <li key={i}>{paso}</li>
                  ))}
                </ol>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flujos alternativos</dt>
              <dd className="mt-1 space-y-1">
                {ecu.flujosAlternativos.map((fa) => (
                  <p key={fa.codigo} className="text-slate-700">
                    <span className="font-semibold">{fa.codigo}:</span> {fa.descripcion}
                  </p>
                ))}
              </dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reglas de negocio</dt>
                <dd className="text-slate-700">{ecu.reglasNegocio}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Frecuencia de uso</dt>
                <dd className="text-slate-700">{ecu.frecuenciaUso}</dd>
              </div>
            </div>
          </dl>
        </Card>
      ))}
    </div>
  );
}
