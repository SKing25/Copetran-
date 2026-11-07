import type { CanalVenta, CategoriaMercancia, EstadoGuia, MetodoPago } from '@/types/copetran';

export class ServidorBackendOfflineError extends Error {
  constructor(mensaje = 'No fue posible conectar con el servidor Python en http://127.0.0.1:5000.') {
    super(mensaje);
    this.name = 'ServidorBackendOfflineError';
  }
}

export interface RespuestaAdmisionChain {
  aprobado: boolean;
  error_validacion_entrada?: boolean;
  id_guia?: number;
  codigo_barras?: string;
  eslabon_rechazo?: string;
  motivo_rechazo?: string;
  peso_facturable_kg?: number;
  costo_flete?: number;
  estado_actual?: EstadoGuia;
  numero_factura?: string | null;
  cufe_dian?: string | null;
  trazabilidad: string[];
  bitacora_state?: string[];
}

export interface RespuestaTransicionState {
  exitoso: boolean;
  bloqueado_por_state?: boolean;
  codigo_barras: string;
  estado_anterior?: EstadoGuia;
  estado_actual?: EstadoGuia;
  mensaje: string;
  bitacora_state?: string[];
}

export interface RespuestaVentaCreacional {
  exitoso: boolean;
  numero_tiquete_singleton?: string;
  tarifa_factory_method?: string;
  factura_abstract_factory?: string;
  cufe_dian?: string | null;
  notificacion?: string;
  mensaje?: string;
}

async function postJson<T>(ruta: string, cuerpo: Record<string, unknown>): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    });
  } catch {
    throw new ServidorBackendOfflineError();
  }

  const texto = await respuesta.text();
  try {
    return JSON.parse(texto) as T;
  } catch {
    // Cuando Vite no puede redirigir el proxy porque Flask está apagado, devuelve 500/502 sin JSON de dominio
    throw new ServidorBackendOfflineError();
  }
}

export async function validarAdmisionChainPython(params: {
  remitente: string;
  destinatario: string;
  ciudad_origen: string;
  ciudad_destino: string;
  categoria: CategoriaMercancia;
  peso_real_kg: number;
  largo_cm: number;
  ancho_cm: number;
  alto_cm: number;
  valor_declarado: number;
  tiene_poliza_extra: boolean;
  paga_inmediato: boolean;
  canal_venta?: string;
}): Promise<RespuestaAdmisionChain> {
  return postJson<RespuestaAdmisionChain>('/api/comportamiento/admitir', params);
}

export async function ejecutarTransicionStatePython(params: {
  codigo_barras: string;
  estado_actual_ui: EstadoGuia;
  nuevo_estado: EstadoGuia;
  detalle?: string;
  sincronizar_semilla?: boolean;
  remitente?: string;
  destinatario?: string;
  categoria?: CategoriaMercancia;
  peso_kg?: number;
  valor_total?: number;
}): Promise<RespuestaTransicionState> {
  return postJson<RespuestaTransicionState>('/api/comportamiento/estado', params);
}

export async function registrarVentaCreacionalPython(params: {
  numero_silla: number;
  nombre_pasajero: string;
  documento: string;
  codigo_descuento: string;
  canal: CanalVenta;
  metodo_pago: MetodoPago;
}): Promise<RespuestaVentaCreacional> {
  return postJson<RespuestaVentaCreacional>('/api/creacionales/vender-tiquete', params);
}
