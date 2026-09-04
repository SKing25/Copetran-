import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { CanalVenta, Cliente, MetodoPago, Tiquete } from '../types/copetran';
import { Card, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/cn';
import { formatCurrency, formatDate } from '../utils/format';

/**
 * ECU-01 — Comprar Tiquete de Pasajero (Proceso A), canal Cliente (WEB/APP).
 * Ver docs/parcial-primer-corte/05-especificacion-casos-de-uso.md.
 */
export function ClienteDashboard() {
  const { usuario } = useAuth();
  const { viajes, sillasDisponibles, venderTiquete, tiquetes, registrarCliente, cambiarEstadoTiquete } = useData();

  // Proceso M — Registro y gestión de clientes: se identifica una sola vez
  // por documento y el mismo registro se reutiliza en compras posteriores.
  const [clienteActual, setClienteActual] = useLocalStorage<Cliente | null>('copetran.clienteActual', null);

  const [idViaje, setIdViaje] = useState<number | null>(null);
  const [idSilla, setIdSilla] = useState<number | null>(null);
  const [canal, setCanal] = useState<CanalVenta>('WEB');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('TARJETA_CREDITO');
  const [tipoTiquete, setTipoTiquete] = useState<'PAGADO' | 'RESERVADO' | 'ABIERTO'>('PAGADO');
  const [ultimoTiquete, setUltimoTiquete] = useState<Tiquete | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sillas = useMemo(() => (idViaje ? sillasDisponibles(idViaje) : []), [idViaje, sillasDisponibles]);
  const misTiquetes = useMemo(
    () => (clienteActual ? tiquetes.filter((t) => t.id_pasajero === clienteActual.id_cliente) : []),
    [clienteActual, tiquetes],
  );

  if (!clienteActual) {
    return <RegistroCliente nombreSugerido={usuario?.nombre ?? ''} onRegistrado={setClienteActual} registrarCliente={registrarCliente} />;
  }

  function confirmarCompra() {
    if (!clienteActual || !idViaje || !idSilla) return;
    setError(null);
    try {
      const tiquete = venderTiquete({
        idViaje,
        idSilla,
        idPasajero: clienteActual.id_cliente,
        idCajero: 0, // canal WEB/APP: sin cajero — venta directa del cliente
        idCanalVenta: canal,
        idMetodoPago: metodoPago,
        tipoTiquete,
      });
      setUltimoTiquete(tiquete);
      setIdViaje(null);
      setIdSilla(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible completar la compra.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Comprar Tiquete</h1>
        <p className="text-sm text-slate-500">
          Hola {clienteActual.nombres} {clienteActual.apellidos} (doc. {clienteActual.documento})
        </p>
      </div>

      {ultimoTiquete && (
        <Card className="border-emerald-300 bg-emerald-50">
          <p className="text-sm font-medium text-emerald-800">
            Tiquete {ultimoTiquete.numero_tiquete} generado — estado{' '}
            <Badge estado={ultimoTiquete.id_estado_tiquete} />
          </p>
        </Card>
      )}

      <Card>
        <CardTitle>1. Consultar disponibilidad de viaje</CardTitle>
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
      </Card>

      {idViaje && (
        <Card>
          <CardTitle>2. Seleccionar silla</CardTitle>
          {sillas.length === 0 ? (
            <p className="mt-2 text-sm text-rose-600">No hay sillas disponibles para este viaje.</p>
          ) : (
            <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-10">
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

      {idViaje && idSilla && (
        <Card>
          <CardTitle>3. Canal, pago y tipo de tiquete</CardTitle>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">Canal de venta</label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value as CanalVenta)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="WEB">WEB</option>
                <option value="APP">APP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Método de pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                disabled={tipoTiquete === 'RESERVADO'}
              >
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
            onClick={confirmarCompra}
            className="mt-4 rounded-lg bg-copetran-600 px-4 py-2 text-sm font-semibold text-white hover:bg-copetran-700"
          >
            Confirmar compra
          </button>
        </Card>
      )}

      <Card>
        <CardTitle>Mis tiquetes</CardTitle>
        {misTiquetes.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Todavía no has comprado tiquetes.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {misTiquetes.map((t) => {
              const viaje = viajes.find((v) => v.id_viaje === t.id_viaje);
              return (
                <li key={t.id_tiquete} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{t.numero_tiquete}</p>
                    <p className="text-xs text-slate-500">
                      {viaje ? `${viaje.origen_ciudad} → ${viaje.destino_ciudad} · ${formatDate(viaje.fecha)}` : ''} ·{' '}
                      {formatCurrency(t.valor_pagado)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge estado={t.id_estado_tiquete} />
                    {t.id_estado_tiquete === 'RESERVADO' && (
                      <button
                        onClick={() => cambiarEstadoTiquete(t.id_tiquete, 'PAGADO')}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                      >
                        Confirmar pago
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function RegistroCliente({
  nombreSugerido,
  onRegistrado,
  registrarCliente,
}: {
  nombreSugerido: string;
  onRegistrado: (c: Cliente) => void;
  registrarCliente: (datos: Omit<Cliente, 'id_cliente'>) => Cliente;
}) {
  const [documento, setDocumento] = useState('');
  const [nombres, setNombres] = useState(nombreSugerido);
  const [apellidos, setApellidos] = useState('');
  const [celular, setCelular] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!documento || !nombres || !apellidos) return;
    onRegistrado(registrarCliente({ documento, nombres, apellidos, celular }));
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardTitle>Registro de cliente</CardTitle>
      <p className="mt-1 text-sm text-slate-500">
        Proceso M — primera vez que compras un tiquete se registra tu documento, nombre y celular; en
        compras posteriores se reutiliza el mismo registro.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          placeholder="Documento"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Nombres"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Celular"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="w-full rounded-lg bg-copetran-600 px-4 py-2 text-sm font-semibold text-white hover:bg-copetran-700">
          Continuar
        </button>
      </form>
    </Card>
  );
}
