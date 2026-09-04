import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import type { CategoriaMercancia, EstadoGuia, MetodoPago } from '@/types/copetran';
import { AlertDialog, Badge, Button, Card, CardTitle, Input, Select } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/format';

const ID_OPERARIO_DEMO = 200;

const CATEGORIAS: { valor: CategoriaMercancia; etiqueta: string }[] = [
  { valor: 'GENERAL', etiqueta: 'General y paquetería' },
  { valor: 'PERECEDERA', etiqueta: 'Perecedera' },
  { valor: 'FRAGIL', etiqueta: 'Frágil' },
  { valor: 'VALORES', etiqueta: 'Documentos y valores' },
];

const SIGUIENTES_ESTADOS: Record<EstadoGuia, EstadoGuia[]> = {
  ADMITIDO: ['EN_TRANSITO', 'NOVEDAD'],
  EN_TRANSITO: ['BODEGA_DESTINO', 'NOVEDAD'],
  BODEGA_DESTINO: ['ENTREGADO', 'NOVEDAD'],
  NOVEDAD: ['EN_TRANSITO', 'BODEGA_DESTINO'],
  ENTREGADO: [],
};

interface CambioEstadoPendiente {
  idGuia: number;
  codigoBarras: string;
  nuevoEstado: EstadoGuia;
}

/**
 * ECU-02 — Admitir y Consolidar Guía de Envío (Proceso C).
 * Ver docs/parcial-primer-corte/05-especificacion-casos-de-uso.md.
 */
export function OperarioDashboard() {
  const { clientes, guias, remesas, admitirGuia, consolidarEnRemesa, cambiarEstadoGuia, registrarCliente } = useData();

  const [idRemitente, setIdRemitente] = useState<number | ''>('');
  const [idDestinatario, setIdDestinatario] = useState<number | ''>('');
  const [categoria, setCategoria] = useState<CategoriaMercancia>('GENERAL');
  const [pesoKg, setPesoKg] = useState<string>('');
  const [pagaInmediato, setPagaInmediato] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [mostrarRegistro, setMostrarRegistro] = useState<'remitente' | 'destinatario' | null>(null);
  const [ultimoIdGuia, setUltimoIdGuia] = useState<number | null>(null);
  const [admitiendo, setAdmitiendo] = useState(false);
  const [cambioPendiente, setCambioPendiente] = useState<CambioEstadoPendiente | null>(null);

  const guiasOrdenadas = useMemo(() => [...guias].sort((a, b) => b.id_guia - a.id_guia), [guias]);

  async function handleAdmitir(e: React.FormEvent) {
    e.preventDefault();
    if (!idRemitente || !idDestinatario || !pesoKg) return;
    setAdmitiendo(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const guia = admitirGuia({
        idRemitente,
        idDestinatario,
        categoria,
        pesoKg: Number(pesoKg),
        idCajero: ID_OPERARIO_DEMO,
        idMetodoPago: metodoPago,
        pagaInmediato,
      });
      setUltimoIdGuia(guia.id_guia);
      setPesoKg('');
    } finally {
      setAdmitiendo(false);
    }
  }

  function remesasCompatibles(idGuiaBuscada: number) {
    const guia = guias.find((g) => g.id_guia === idGuiaBuscada);
    if (!guia) return [];
    return remesas.filter((r) => r.id_remitente === guia.id_remitente && r.id_destinatario === guia.id_destinatario);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Admitir Guía de Envío</h1>

      <Card>
        <CardTitle>1. Admisión: remitente, destinatario, pesaje</CardTitle>
        <form onSubmit={handleAdmitir} className="mt-3 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectorCliente
              etiqueta="Remitente"
              clientes={clientes}
              valor={idRemitente}
              onChange={setIdRemitente}
              onRegistrarNuevo={() => setMostrarRegistro('remitente')}
            />
            <SelectorCliente
              etiqueta="Destinatario"
              clientes={clientes}
              valor={idDestinatario}
              onChange={setIdDestinatario}
              onRegistrarNuevo={() => setMostrarRegistro('destinatario')}
            />
          </div>

          {mostrarRegistro && (
            <RegistroRapido
              onCancelar={() => setMostrarRegistro(null)}
              onRegistrado={(c) => {
                if (mostrarRegistro === 'remitente') setIdRemitente(c.id_cliente);
                else setIdDestinatario(c.id_cliente);
                setMostrarRegistro(null);
              }}
              registrarCliente={registrarCliente}
            />
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Categoría de mercancía"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaMercancia)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </Select>
            <Input
              label="Peso (kg)"
              type="number"
              min="0.1"
              step="0.1"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              required
            />
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input type="checkbox" checked={pagaInmediato} onChange={(e) => setPagaInmediato(e.target.checked)} />
                Paga en el momento (A1)
              </label>
              {pagaInmediato && (
                <Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)} className="mt-1">
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta débito</option>
                  <option value="TRANSFERENCIA">Transferencia / QR</option>
                </Select>
              )}
            </div>
          </div>

          <Button type="submit" loading={admitiendo}>
            Generar guía
          </Button>
        </form>
      </Card>

      {ultimoIdGuia && (
        <Card>
          <CardTitle>2. Consolidar en remesa (opcional)</CardTitle>
          <ConsolidacionRemesa idGuia={ultimoIdGuia} candidatas={remesasCompatibles(ultimoIdGuia)} onConsolidar={consolidarEnRemesa} />
        </Card>
      )}

      <Card>
        <CardTitle>Guías admitidas</CardTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="pb-2 pr-4">Código</th>
                <th className="pb-2 pr-4">Remitente → Destinatario</th>
                <th className="pb-2 pr-4">Categoría</th>
                <th className="pb-2 pr-4">Peso</th>
                <th className="pb-2 pr-4">Valor</th>
                <th className="pb-2 pr-4">Estado</th>
                <th className="pb-2">Avanzar estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guiasOrdenadas.map((g) => {
                const remitente = clientes.find((c) => c.id_cliente === g.id_remitente);
                const destinatario = clientes.find((c) => c.id_cliente === g.id_destinatario);
                const siguientes = SIGUIENTES_ESTADOS[g.id_estado_guia];
                return (
                  <tr key={g.id_guia}>
                    <td className="py-2 pr-4 font-medium text-slate-900">{g.codigo_barras}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {remitente?.nombres} → {destinatario?.nombres}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{g.id_categoria_mercancia}</td>
                    <td className="py-2 pr-4 text-slate-600">{g.peso_kg} kg</td>
                    <td className="py-2 pr-4 text-slate-600">{g.valor_total ? formatCurrency(g.valor_total) : '—'}</td>
                    <td className="py-2 pr-4">
                      <Badge estado={g.id_estado_guia} />
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {siguientes.map((estado) => (
                          <Button
                            key={estado}
                            variant="secondary"
                            size="sm"
                            onClick={() => setCambioPendiente({ idGuia: g.id_guia, codigoBarras: g.codigo_barras, nuevoEstado: estado })}
                          >
                            → {estado}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Remesas</CardTitle>
        {remesas.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Aún no hay remesas consolidadas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {remesas.map((r) => (
              <li key={r.id_remesa} className="py-2 text-sm">
                <p className="font-medium text-slate-900">{r.numero_remesa}</p>
                <p className="text-xs text-slate-500">
                  {r.bultos_cantidad} bulto(s) · {r.peso_total} kg · {formatCurrency(r.monto_total)} ·{' '}
                  {formatDate(r.fecha_creacion)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AlertDialog
        open={cambioPendiente !== null}
        onClose={() => setCambioPendiente(null)}
        onConfirm={() => {
          if (cambioPendiente) cambiarEstadoGuia(cambioPendiente.idGuia, cambioPendiente.nuevoEstado);
          setCambioPendiente(null);
        }}
        title="Cambiar estado de la guía"
        description={
          cambioPendiente
            ? `¿Cambiar la guía ${cambioPendiente.codigoBarras} a estado ${cambioPendiente.nuevoEstado}?`
            : undefined
        }
        confirmLabel="Sí, cambiar estado"
        variant={cambioPendiente?.nuevoEstado === 'NOVEDAD' ? 'danger' : 'primary'}
      />
    </div>
  );
}

function SelectorCliente({
  etiqueta,
  clientes,
  valor,
  onChange,
  onRegistrarNuevo,
}: {
  etiqueta: string;
  clientes: { id_cliente: number; nombres: string; apellidos: string; documento: string }[];
  valor: number | '';
  onChange: (id: number | '') => void;
  onRegistrarNuevo: () => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600">{etiqueta}</label>
      <div className="mt-1 flex gap-2">
        <Select value={valor} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Selecciona…</option>
          {clientes.map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombres} {c.apellidos} — {c.documento}
            </option>
          ))}
        </Select>
        <Button type="button" variant="secondary" size="sm" onClick={onRegistrarNuevo} className="whitespace-nowrap">
          Nuevo
        </Button>
      </div>
    </div>
  );
}

function RegistroRapido({
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-600">Registrar cliente (Proceso M)</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        <Input placeholder="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} />
        <Input placeholder="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} />
        <Input placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => documento && nombres && apellidos && onRegistrado(registrarCliente({ documento, nombres, apellidos }))}
          >
            Guardar
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConsolidacionRemesa({
  idGuia,
  candidatas,
  onConsolidar,
}: {
  idGuia: number;
  candidatas: { id_remesa: number; numero_remesa: string }[];
  onConsolidar: (idGuia: number, idRemesaExistente?: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {candidatas.length > 0 && (
        <>
          <span className="text-xs text-slate-500">Remesas compatibles (mismo remitente/destino):</span>
          {candidatas.map((r) => (
            <Button key={r.id_remesa} variant="secondary" size="sm" onClick={() => onConsolidar(idGuia, r.id_remesa)}>
              Añadir a {r.numero_remesa}
            </Button>
          ))}
        </>
      )}
      <Button variant="outline" size="sm" onClick={() => onConsolidar(idGuia)}>
        Crear remesa nueva
      </Button>
      <span className="text-xs text-slate-400">(o dejar la guía sin remesa — envío independiente, A2)</span>
    </div>
  );
}
