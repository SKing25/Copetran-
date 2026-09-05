import { Badge, Card, CardTitle } from '@/components/ui';
import { ACTORES_PRIMARIOS, ACTORES_SECUNDARIOS, CASOS_DE_USO_ALTO_NIVEL, ESPECIFICACIONES_CASO_USO } from '@/data/trazabilidad';

/**
 * Vista de trazabilidad: roles, casos de uso de alto nivel y especificación
 * de los dos casos de uso extendidos, tal como quedaron documentados en
 * docs/parcial-primer-corte/. Es una vista de solo lectura, sin lógica de
 * negocio — solo re-presenta la documentación dentro de la app.
 */
export function TrazabilidadTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Trazabilidad del Sistema</h1>
        <p className="text-sm text-slate-500">
          Roles, casos de uso y especificaciones documentadas en el parcial primer corte.
        </p>
      </div>

      <Card>
        <CardTitle>Roles del sistema — actores primarios</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4 font-medium">Rol / Actor</th>
                <th className="py-2 pr-4 font-medium">Ubicación en el organigrama</th>
                <th className="py-2 font-medium">Interviene en</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTORES_PRIMARIOS.map((a) => (
                <tr key={a.rol}>
                  <td className="py-2 pr-4 font-medium text-slate-900">{a.rol}</td>
                  <td className="py-2 pr-4 text-slate-600">{a.ubicacion}</td>
                  <td className="py-2 text-slate-600">{a.interviene}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Actores secundarios / externos</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4 font-medium">Rol / Actor</th>
                <th className="py-2 pr-4 font-medium">Naturaleza</th>
                <th className="py-2 font-medium">Interviene en</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTORES_SECUNDARIOS.map((a) => (
                <tr key={a.rol}>
                  <td className="py-2 pr-4 font-medium text-slate-900">{a.rol}</td>
                  <td className="py-2 pr-4 text-slate-600">{a.ubicacion}</td>
                  <td className="py-2 text-slate-600">{a.interviene}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
