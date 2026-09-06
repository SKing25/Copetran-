import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useData } from '@/context/DataContext';
import type { CategoriaMercancia, EstadoGuia, GuiaEnvio, MetodoPago } from '@/types/copetran';
import { Alert, AlertDialog, Badge, Button, Card, CardTitle, Input, Modal, Select } from '@/components/ui';
import { formatCurrency, formatDate } from '@/utils/format';
import { Printer, Barcode, Calculator, ShieldAlert } from 'lucide-react';

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

/**
 * Divisor volumétrico estándar de mensajería/carga aérea (cm³ / 5000 = kg).
 * No es un campo del schema ni del brief — es una convención habitual del
 * sector para calcular el "peso facturable" cuando el paquete es voluminoso
 * pero liviano. GUIA_ENVIO solo persiste peso_kg (el mayor entre real y
 * volumétrico); no se agregan columnas nuevas.
 */
const DIVISOR_VOLUMETRICO = 5000;

interface CambioEstadoPendiente {
  idGuia: number;
  codigoBarras: string;
  nuevoEstado: EstadoGuia;
}

/**
 * Módulo ECU-02 — Admitir y Consolidar Guía de Envío (Proceso C), con
 * formulario de cubicaje (dimensiones) y alerta dinámica de sobrepeso
 * volumétrico.
 */
export function MensajeriaModule() {
  const { clientes, guias, remesas, admitirGuia, consolidarEnRemesa, cambiarEstadoGuia, registrarCliente } = useData();

  const [idRemitente, setIdRemitente] = useState<number | ''>('');
  const [idDestinatario, setIdDestinatario] = useState<number | ''>('');
  const [categoria, setCategoria] = useState<CategoriaMercancia>('GENERAL');
  const [pesoKg, setPesoKg] = useState('');
  const [largoCm, setLargoCm] = useState('');
  const [anchoCm, setAnchoCm] = useState('');
  const [altoCm, setAltoCm] = useState('');
  const [pagaInmediato, setPagaInmediato] = useState(false);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
  const [mostrarRegistro, setMostrarRegistro] = useState<'remitente' | 'destinatario' | null>(null);
  const [ultimoIdGuia, setUltimoIdGuia] = useState<number | null>(null);
  const [guiaRotulo, setGuiaRotulo] = useState<GuiaEnvio | null>(null);
  const [admitiendo, setAdmitiendo] = useState(false);
  const [cambioPendiente, setCambioPendiente] = useState<CambioEstadoPendiente | null>(null);

  const guiasOrdenadas = useMemo(() => [...guias].sort((a, b) => b.id_guia - a.id_guia), [guias]);

  const pesoReal = Number(pesoKg) || 0;
  const pesoVolumetrico = (Number(largoCm) || 0) * (Number(anchoCm) || 0) * (Number(altoCm) || 0) / DIVISOR_VOLUMETRICO;
  const hayCubicaje = largoCm !== '' && anchoCm !== '' && altoCm !== '';
  const haySobrepeso = hayCubicaje && pesoVolumetrico > pesoReal;
  const pesoFacturable = hayCubicaje ? Math.max(pesoReal, pesoVolumetrico) : pesoReal;

  // Calculadora Dinámica de Flete
  const tarifaBase = Math.round(pesoFacturable * 3500);
  const porcentajeRecargo = categoria === 'PERECEDERA' ? 0.15 : categoria === 'FRAGIL' ? 0.2 : categoria === 'VALORES' ? 0.25 : 0;
  const valorRecargo = Math.round(tarifaBase * porcentajeRecargo);
  const totalEstimado = tarifaBase + valorRecargo;

  async function handleAdmitir(e: FormEvent) {
    e.preventDefault();
    if (!idRemitente || !idDestinatario || !pesoKg) return;
    setAdmitiendo(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const guia = admitirGuia({
        idRemitente,
        idDestinatario,
        categoria,
        pesoKg: Math.round(pesoFacturable * 100) / 100,
        idCajero: ID_OPERARIO_DEMO,
        idMetodoPago: metodoPago,
        pagaInmediato,
      });
      setUltimoIdGuia(guia.id_guia);
      setGuiaRotulo(guia);
      setPesoKg('');
      setLargoCm('');
      setAnchoCm('');
      setAltoCm('');
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
      <div>
        <h1 className="text-xl font-bold text-slate-900">Módulo de Mensajería (ECU-02)</h1>
        <p className="text-sm text-slate-500">Admisión de guías de envío con cubicaje y cálculo de peso facturable.</p>
      </div>

      <Card>
        <CardTitle>1. Admisión: remitente, destinatario, pesaje y cubicaje</CardTitle>
        <form onSubmit={handleAdmitir} className="mt-3 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectorCliente etiqueta="Remitente" clientes={clientes} valor={idRemitente} onChange={setIdRemitente} onRegistrarNuevo={() => setMostrarRegistro('remitente')} />
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

          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Categoría de mercancía" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaMercancia)}>
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </Select>
            <Input
              label="Peso real"
              type="number"
              min="0.1"
              step="0.1"
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              suffix="kg"
              required
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-600">Cubicaje (dimensiones del paquete)</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <Input placeholder="Largo" type="number" min="0" step="1" value={largoCm} onChange={(e) => setLargoCm(e.target.value)} suffix="cm" />
              <Input placeholder="Ancho" type="number" min="0" step="1" value={anchoCm} onChange={(e) => setAnchoCm(e.target.value)} suffix="cm" />
              <Input placeholder="Alto" type="number" min="0" step="1" value={altoCm} onChange={(e) => setAltoCm(e.target.value)} suffix="cm" />
            </div>
          </div>

          {hayCubicaje && (
            <Alert variant={haySobrepeso ? 'warning' : 'info'} title={haySobrepeso ? 'Sobrepeso volumétrico' : 'Cubicaje calculado'}>
              Peso volumétrico: {pesoVolumetrico.toFixed(2)} kg (largo × ancho × alto ÷ {DIVISOR_VOLUMETRICO}).{' '}
              {haySobrepeso
                ? `Supera el peso real (${pesoReal || 0} kg) — se facturará por el peso volumétrico.`
                : 'No supera el peso real — se facturará por el peso real.'}{' '}
              Peso facturable: <strong>{pesoFacturable.toFixed(2)} kg</strong>.
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <input type="checkbox" checked={pagaInmediato} onChange={(e) => setPagaInmediato(e.target.checked)} />
              Paga en el momento (A1)
            </label>
            {pagaInmediato && (
              <Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as MetodoPago)} className="max-w-xs">
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta débito</option>
                <option value="TRANSFERENCIA">Transferencia / QR</option>
              </Select>
            )}
          </div>

          {/* Calculadora Dinámica de Flete en Tiempo Real */}
          {pesoFacturable > 0 && (
            <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-slate-50 p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2 mb-2">
                <span className="text-xs font-bold text-copetran-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-copetran-600" />
                  Liquidación Dinámica de Flete (Tiempo Real)
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {pesoFacturable.toFixed(2)} Kg facturables
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Tarifa Base ($3.500/Kg):</span>
                  <strong className="text-slate-800">{formatCurrency(tarifaBase)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Recargo ({categoria}):</span>
                  <strong className={porcentajeRecargo > 0 ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                    +{formatCurrency(valorRecargo)} ({porcentajeRecargo * 100}%)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Modalidad:</span>
                  <strong className="text-slate-800">{pagaInmediato ? 'Pago Inmediato' : 'Cobro en Destino'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Liquidado:</span>
                  <strong className="text-copetran-600 text-sm font-black">{formatCurrency(totalEstimado)}</strong>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" loading={admitiendo}>
            Generar guía
          </Button>
        </form>
      </Card>

      {ultimoIdGuia && (
        <Card className="border-blue-300 bg-blue-50 flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-bold text-blue-900">
              Guía de Envío #{ultimoIdGuia} generada exitosamente
            </p>
            <p className="text-xs text-blue-700">Lista para impresión de rótulo de despacho físico.</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const g = guias.find((item) => item.id_guia === ultimoIdGuia);
              if (g) setGuiaRotulo(g);
            }}
            className="gap-1.5 shrink-0"
          >
            <Barcode className="h-4 w-4" />
            Ver Rótulo Imprimible
          </Button>
        </Card>
      )}

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
                <th className="pb-2 pr-4">Rótulo</th>
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
                    <td className="py-2 pr-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setGuiaRotulo(g)}
                        className="!px-2 !py-1 text-xs gap-1 font-semibold"
                        title="Ver rótulo de despacho físico"
                      >
                        <Barcode className="h-3.5 w-3.5" />
                        Rótulo
                      </Button>
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
                  {r.bultos_cantidad} bulto(s) · {r.peso_total} kg · {formatCurrency(r.monto_total)} · {formatDate(r.fecha_creacion)}
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
        description={cambioPendiente ? `¿Cambiar la guía ${cambioPendiente.codigoBarras} a estado ${cambioPendiente.nuevoEstado}?` : undefined}
        confirmLabel="Sí, cambiar estado"
        variant={cambioPendiente?.nuevoEstado === 'NOVEDAD' ? 'danger' : 'primary'}
      />

      {/* MODAL RÓTULO / ETIQUETA DE ENCOMIENDA IMPRIMIBLE */}
      {guiaRotulo && (
        <Modal
          open={true}
          onClose={() => setGuiaRotulo(null)}
          className="max-w-lg p-0 overflow-hidden border-2 border-slate-900 rounded-3xl"
        >
          {/* Cabecera del Rótulo */}
          <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b-4 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-copetran-600 p-0.5 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/assets/copetran-square.png" alt="Copetran" className="h-full w-full object-cover rounded-lg" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-wider">COPETRAN LOGÍSTICA</h3>
                <p className="text-[10px] text-amber-300 font-semibold uppercase tracking-widest">
                  Rótulo de Despacho y Admisión
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-400 block">GUÍA Nº</span>
              <span className="font-mono text-sm font-black text-amber-400">{guiaRotulo.codigo_barras}</span>
            </div>
          </div>

          {/* Cuerpo del Rótulo */}
          <div className="p-6 bg-white space-y-4 text-slate-900">
            {/* Sello de Advertencia / Categoría */}
            <div className="flex items-center justify-between">
              {guiaRotulo.id_categoria_mercancia === 'FRAGIL' && (
                <div className="w-full bg-rose-100 border-2 border-rose-500 text-rose-800 px-3 py-2 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  ⚠️ MANÉJESE CON EXTREMO CUIDADO — FRÁGIL ⚠️
                </div>
              )}
              {guiaRotulo.id_categoria_mercancia === 'PERECEDERA' && (
                <div className="w-full bg-emerald-100 border-2 border-emerald-500 text-emerald-800 px-3 py-2 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider">
                  ❄️ CARGA PERECEDERA — DESPACHO PRIORITARIO ❄️
                </div>
              )}
              {guiaRotulo.id_categoria_mercancia === 'VALORES' && (
                <div className="w-full bg-blue-100 border-2 border-blue-500 text-blue-800 px-3 py-2 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider">
                  🔒 DOCUMENTOS Y VALORES DECLARADOS 🔒
                </div>
              )}
              {guiaRotulo.id_categoria_mercancia === 'GENERAL' && (
                <div className="w-full bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase">
                  📦 ENCOMIENDA GENERAL
                </div>
              )}
            </div>

            {/* Código de Barras Simulado */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <div className="font-mono text-3xl sm:text-4xl tracking-widest font-black text-slate-900 select-all">
                ||| | |||| | || ||||| || |||
              </div>
              <p className="font-mono text-xs font-bold text-slate-600 mt-1">{guiaRotulo.codigo_barras}</p>
            </div>

            {/* Datos de Remitente y Destinatario */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <div className="border-r border-slate-200 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">REMITENTE</span>
                <p className="font-bold text-slate-800 text-sm">
                  {clientes.find((c) => c.id_cliente === guiaRotulo.id_remitente)?.nombres ?? 'Remitente'}{' '}
                  {clientes.find((c) => c.id_cliente === guiaRotulo.id_remitente)?.apellidos ?? ''}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Doc: {clientes.find((c) => c.id_cliente === guiaRotulo.id_remitente)?.documento ?? '1098765432'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tel: {clientes.find((c) => c.id_cliente === guiaRotulo.id_remitente)?.celular ?? '3011234567'}
                </p>
              </div>

              <div className="pl-2">
                <span className="text-[10px] uppercase font-bold text-copetran-600 block mb-1">DESTINATARIO (ENTREGA)</span>
                <p className="font-bold text-slate-900 text-sm">
                  {clientes.find((c) => c.id_cliente === guiaRotulo.id_destinatario)?.nombres ?? 'Destinatario'}{' '}
                  {clientes.find((c) => c.id_cliente === guiaRotulo.id_destinatario)?.apellidos ?? ''}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Doc: {clientes.find((c) => c.id_cliente === guiaRotulo.id_destinatario)?.documento ?? '79456123'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tel: {clientes.find((c) => c.id_cliente === guiaRotulo.id_destinatario)?.celular ?? '3109876543'}
                </p>
              </div>
            </div>

            {/* Flete, Peso y Estado */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Peso Báscula</span>
                <strong className="text-slate-900 font-black">{guiaRotulo.peso_kg} Kg</strong>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Flete Cobrado</span>
                <strong className="text-copetran-700 font-black">{formatCurrency(guiaRotulo.valor_total ?? 0)}</strong>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Estado Inicial</span>
                <span className="text-xs font-bold text-emerald-700">{guiaRotulo.id_estado_guia}</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="gap-2 font-bold">
              <Printer className="h-4 w-4" />
              Imprimir Rótulo
            </Button>
            <Button size="sm" onClick={() => setGuiaRotulo(null)}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}
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
          <Button type="button" size="sm" onClick={() => documento && nombres && apellidos && onRegistrado(registrarCliente({ documento, nombres, apellidos }))}>
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
