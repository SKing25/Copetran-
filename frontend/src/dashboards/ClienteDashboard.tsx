import React, { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLocalStorage } from '@/hooks';
import type { CanalVenta, Cliente, MetodoPago, Tiquete } from '@/types/copetran';
import { AlertDialog, Badge, Button, Card, CardTitle, Input, Select } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatDate } from '@/utils/format';

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
  const [comprando, setComprando] = useState(false);
  const [tiquetePorConfirmar, setTiquetePorConfirmar] = useState<Tiquete | null>(null);

  const sillas = useMemo(() => (idViaje ? sillasDisponibles(idViaje) : []), [idViaje, sillasDisponibles]);
  const misTiquetes = useMemo(
    () => (clienteActual ? tiquetes.filter((t) => t.id_pasajero === clienteActual.id_cliente) : []),
    [clienteActual, tiquetes],
  );

  if (!clienteActual) {
    return <RegistroCliente nombreSugerido={usuario?.nombre ?? ''} onRegistrado={setClienteActual} registrarCliente={registrarCliente} />;
  }

  async function confirmarCompra() {
    if (!clienteActual || !idViaje || !idSilla) return;
    setError(null);
    setComprando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
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
    } finally {
      setComprando(false);
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
            <Select label="Canal de venta" value={canal} onChange={(e) => setCanal(e.target.value as CanalVenta)}>
              <option value="WEB">WEB</option>
              <option value="APP">APP</option>
            </Select>
            <Select
              label="Método de pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
              disabled={tipoTiquete === 'RESERVADO'}
            >
              <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
              <option value="TARJETA_DEBITO">Tarjeta débito</option>
              <option value="TRANSFERENCIA">Transferencia / QR</option>
            </Select>
            <Select
              label="Tipo de tiquete"
              value={tipoTiquete}
              onChange={(e) => setTipoTiquete(e.target.value as typeof tipoTiquete)}
            >
              <option value="PAGADO">Pago inmediato</option>
              <option value="RESERVADO">Reserva sin pago (A1)</option>
              <option value="ABIERTO">Tiquete abierto (A2)</option>
            </Select>
          </div>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <Button onClick={confirmarCompra} loading={comprando} className="mt-4">
            Confirmar compra
          </Button>
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
                      <Button variant="secondary" size="sm" onClick={() => setTiquetePorConfirmar(t)}>
                        Confirmar pago
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <AlertDialog
        open={tiquetePorConfirmar !== null}
        onClose={() => setTiquetePorConfirmar(null)}
        onConfirm={() => {
          if (tiquetePorConfirmar) cambiarEstadoTiquete(tiquetePorConfirmar.id_tiquete, 'PAGADO');
          setTiquetePorConfirmar(null);
        }}
        title="Confirmar pago"
        description={
          tiquetePorConfirmar
            ? `¿Confirmar el pago del tiquete ${tiquetePorConfirmar.numero_tiquete}? Pasará de RESERVADO a PAGADO.`
            : undefined
        }
        confirmLabel="Sí, confirmar pago"
      />
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
        <Input placeholder="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} required />
        <Input placeholder="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} required />
        <Input placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
        <Input placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} />
        <Button type="submit" fullWidth>
          Continuar
        </Button>
      </form>
    </Card>
  );
}
