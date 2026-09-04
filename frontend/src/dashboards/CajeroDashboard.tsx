import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import type { MetodoPago, Tiquete } from '../types/copetran';
import { Card, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { formatCurrency, formatDate } from '../utils/format';

const ID_CAJERO_DEMO = 100;

/**
 * ECU-01 — Comprar Tiquete de Pasajero (Proceso A), canal Cajero (TAQUILLA).
 * Mismo caso de uso que ClienteDashboard, pero el actor principal es el
 * Cajero de Agencia vendiendo en nombre de un cliente ya registrado.
 */
export function CajeroDashboard() {
  const { clientes, viajes, sillasDisponibles, venderTiquete, tiquetes, cambiarEstadoTiquete, registrarCliente } = useData();

  const [idCliente, setIdCliente] = useState<number | ''>('');
  const [idViaje, setIdViaje] = useState<number | null>(null);
  const [idSilla, setIdSilla] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [tipoTiquete, setTipoTiquete] = useState<'PAGADO' | 'RESERVADO' | 'ABIERTO'>('PAGADO');
  const [error, setError] = useState<string | null>(null);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  const sillas = useMemo(() => (idViaje ? sillasDisponibles(idViaje) : []), [idViaje, sillasDisponibles]);
  const ventas = useMemo(
    () => [...tiquetes].sort((a, b) => b.id_tiquete - a.id_tiquete),
    [tiquetes],
  );

  function confirmarVenta() {
    if (!idCliente || !idViaje || !idSilla) return;
    setError(null);
    try {
      venderTiquete({
        idViaje,
        idSilla,
        idPasajero: idCliente,
        idCajero: ID_CAJERO_DEMO,
        idCanalVenta: 'TAQUILLA',
        idMetodoPago: metodoPago,
        tipoTiquete,
      });
      setIdViaje(null);
      setIdSilla(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible completar la venta.');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Vender Tiquete (Taquilla)</h1>

      <Card>
        <CardTitle>1. Cliente</CardTitle>
        {!mostrarRegistro ? (
          <div className="mt-3 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600">Cliente registrado</label>
              <select
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value ? Number(e.target.value) : '')}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="">Selecciona un cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombres} {c.apellidos} — {c.documento}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setMostrarRegistro(true)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
            >
              Registrar cliente nuevo
            </button>
          </div>
        ) : (
          <RegistroRapidoCliente
            onCancelar={() => setMostrarRegistro(false)}
            onRegistrado={(c) => {
              setIdCliente(c.id_cliente);
              setMostrarRegistro(false);
            }}
            registrarCliente={registrarCliente}
          />
        )}
      </Card>

      {idCliente && (
        <Card>
          <CardTitle>2. Viaje y silla</CardTitle>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {viajes.map((v) => (
              <button
                key={v.id_viaje}
                onClick={() => {
                  setIdViaje(v.id_viaje);
                  setIdSilla(null);
                }}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left text-sm transition',
                  idViaje === v.id_viaje ? 'border-copetran-500 bg-copetran-50 ring-1 ring-copetran-500' : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <span className="font-medium text-slate-900">
                  {v.origen_ciudad} → {v.destino_ciudad}
                </span>
                <span className="block text-xs text-slate-500">
                  {formatDate(v.fecha)} · {v.hora_salida} · Bus {v.placa_bus}
                </span>
              </button>
            ))}
          </div>

          {idViaje && (
            <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-10">
              {sillas.map((s) => (
                <button
                  key={s.id_silla}
                  onClick={() => setIdSilla(s.id_silla)}
                  title={s.ubicacion}
                  className={cn(
                    'rounded-md border py-2 text-xs font-medium transition',
                    idSilla === s.id_silla ? 'border-copetran-500 bg-copetran-500 text-white' : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  {s.numero}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {idCliente && idViaje && idSilla && (
        <Card>
          <CardTitle>3. Pago</CardTitle>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">Método de pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta débito</option>
                <option value="TRANSFERENCIA">Transferencia / QR</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Tipo de tiquete</label>
              <select
                value={tipoTiquete}
                onChange={(e) => setTipoTiquete(e.target.value as typeof tipoTiquete)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="PAGADO">Pago inmediato</option>
                <option value="RESERVADO">Reserva sin pago (A1)</option>
                <option value="ABIERTO">Tiquete abierto (A2)</option>
              </select>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          <button
            onClick={confirmarVenta}
            className="mt-4 rounded-lg bg-copetran-600 px-4 py-2 text-sm font-semibold text-white hover:bg-copetran-700"
          >
            Confirmar venta
          </button>
        </Card>
      )}

      <Card>
        <CardTitle>Ventas recientes</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="pb-2 pr-4">Tiquete</th>
                <th className="pb-2 pr-4">Cliente</th>
                <th className="pb-2 pr-4">Canal</th>
                <th className="pb-2 pr-4">Valor</th>
                <th className="pb-2 pr-4">Estado</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ventas.map((t: Tiquete) => {
                const cliente = clientes.find((c) => c.id_cliente === t.id_pasajero);
                return (
                  <tr key={t.id_tiquete}>
                    <td className="py-2 pr-4 font-medium text-slate-900">{t.numero_tiquete}</td>
                    <td className="py-2 pr-4 text-slate-600">{cliente ? `${cliente.nombres} ${cliente.apellidos}` : '—'}</td>
                    <td className="py-2 pr-4 text-slate-600">{t.id_canal_venta}</td>
                    <td className="py-2 pr-4 text-slate-600">{formatCurrency(t.valor_pagado)}</td>
                    <td className="py-2 pr-4">
                      <Badge estado={t.id_estado_tiquete} />
                    </td>
                    <td className="py-2">
                      {t.id_estado_tiquete === 'RESERVADO' && (
                        <button
                          onClick={() => cambiarEstadoTiquete(t.id_tiquete, 'PAGADO')}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                        >
                          Confirmar pago
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RegistroRapidoCliente({
  onRegistrado,
  onCancelar,
  registrarCliente,
}: {
  onRegistrado: (c: { id_cliente: number }) => void;
  onCancelar: () => void;
  registrarCliente: (datos: { documento: string; nombres: string; apellidos: string; celular?: string }) => { id_cliente: number };
}) {
  const [documento, setDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!documento || !nombres || !apellidos) return;
        onRegistrado(registrarCliente({ documento, nombres, apellidos }));
      }}
      className="mt-3 grid gap-2 sm:grid-cols-4"
    >
      <input placeholder="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" required />
      <input placeholder="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" required />
      <input placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" required />
      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-copetran-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-copetran-700">
          Guardar
        </button>
        <button type="button" onClick={onCancelar} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100">
          Cancelar
        </button>
      </div>
    </form>
  );
}
