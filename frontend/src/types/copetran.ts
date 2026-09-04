/**
 * Tipos del dominio Copetran.
 * Los campos (snake_case) siguen exactamente el diccionario de datos y el
 * schema real documentados en docs/parcial-primer-corte/00-brief.md y
 * docs/parcial-primer-corte/fuentes/copetran_corregido.sql — no se inventan
 * campos ni estados fuera de esos documentos.
 */

// -- Roles del sistema usados en este scaffold (Sección 1 del brief) --------
export type Rol = 'CLIENTE' | 'CAJERO' | 'OPERARIO';

// -- Catálogos parametrizados en MULTITABLA_PARAMETRO ------------------------
export type EstadoTiquete = 'RESERVADO' | 'PAGADO' | 'ABIERTO' | 'CANCELADO' | 'VIAJADO';
export type CanalVenta = 'TAQUILLA' | 'WEB' | 'APP';
export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA';
export type UbicacionSilla = 'VENTANA' | 'PASILLO';

export type EstadoGuia = 'ADMITIDO' | 'EN_TRANSITO' | 'BODEGA_DESTINO' | 'ENTREGADO' | 'NOVEDAD';
export type CategoriaMercancia = 'GENERAL' | 'PERECEDERA' | 'FRAGIL' | 'VALORES';

// -- Módulo 3/4: Clientes, Flota, Operación de pasajeros ---------------------
export interface Cliente {
  id_cliente: number;
  documento: string;
  nombres: string;
  apellidos: string;
  celular?: string;
}

export interface Silla {
  id_silla: number;
  id_bus: number;
  numero: number;
  ubicacion: UbicacionSilla;
}

export interface ViajeProgramado {
  id_viaje: number;
  id_itinerario: number;
  id_bus: number;
  id_conductor: number;
  id_conductor_secundario?: number;
  fecha: string; // ISO date
  hora_salida: string; // HH:mm
  estado_viaje: string;
  // Campos de solo-presentación (no pertenecen a VIAJE_PROGRAMADO; se derivan
  // de RUTA/ITINERARIO/BUS para mostrar en el dashboard del cliente).
  origen_ciudad: string;
  destino_ciudad: string;
  placa_bus: string;
}

export interface Factura {
  id_factura: number;
  id_cliente: number;
  id_cajero: number;
  id_metodo_pago: MetodoPago;
  fecha_emision: string; // ISO datetime
  monto_total: number;
  cufe?: string;
}

export interface Tiquete {
  id_tiquete: number;
  numero_tiquete: string;
  id_viaje: number;
  id_silla: number;
  id_pasajero: number;
  id_factura: number;
  id_canal_venta: CanalVenta;
  id_estado_tiquete: EstadoTiquete;
  valor_pagado: number;
  fecha_expiracion_reserva?: string;
  fecha_limite_abierto?: string;
  penalidad_reprogramacion: number;
}

// -- Módulo 5: Carga y encomiendas generales ---------------------------------
export interface Remesa {
  id_remesa: number;
  numero_remesa: string;
  id_remitente: number;
  id_destinatario: number;
  fecha_creacion: string;
  descripcion_carga?: string;
  peso_total: number;
  bultos_cantidad: number;
  monto_total: number;
}

export interface GuiaEnvio {
  id_guia: number;
  codigo_barras: string;
  id_remesa?: number;
  id_remitente: number;
  id_destinatario: number;
  id_factura?: number;
  id_categoria_mercancia: CategoriaMercancia;
  id_estado_guia: EstadoGuia;
  peso_kg: number;
  valor_total?: number;
  fecha_admision: string;
  documento_recibe?: string;
  fecha_entrega?: string;
}
