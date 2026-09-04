import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import type { MetodoPago, Tiquete } from '@/types/copetran';
import { AlertDialog, Badge, Button, Card, CardTitle, Input, Select } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatCurrency, formatDate } from '@/utils/format';

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
  const [vendiendo, setVendiendo] = useState(false);
  const [tiquetePorConfirmar, setTiquetePorConfirmar] = useState<Tiquete | null>(null);

  const sillas = useMemo(() => (idViaje ? sillasDisponibles(idViaje) : []), [idViaje, sillasDisponibles]);
  const ventas = useMemo(() => [...tiquetes].sort((a, b) => b.id_tiquete - a.id_tiquete), [tiquetes]);

  async function confirmarVenta() {
    if (!idCliente || !idViaje || !idSilla) return;
    setError(null);
    setVendiendo(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
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
    } finally {
      setVendiendo(false);
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
              <Select
                label="Cliente registrado"
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecciona un cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombres} {c.apellidos} — {c.documento}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setMostrarRegistro(true)}>
              Registrar cliente nuevo
            </Button>
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
            <Select label="Método de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}>
              <option value="EFECTIVO">Efectivo</option>
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
          <Button onClick={confirmarVenta} loading={vendiendo} className="mt-4">
            Confirmar venta
          </Button>
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
                        <Button variant="secondary" size="sm" onClick={() => setTiquetePorConfirmar(t)}>
                          Confirmar pago
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
      <Input placeholder="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} required />
      <Input placeholder="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} required />
      <Input placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Guardar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
