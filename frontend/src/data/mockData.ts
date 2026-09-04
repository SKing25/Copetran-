import type {
  Cliente,
  Factura,
  GuiaEnvio,
  Remesa,
  Silla,
  Tiquete,
  ViajeProgramado,
} from '../types/copetran';

/**
 * Datos de prueba en memoria (mock). No hay backend real todavía — este
 * módulo solo sirve como semilla inicial para el DataContext, que es quien
 * mantiene el estado mutable de la sesión (tiquetes, facturas, guías,
 * remesas). El contenido de negocio (viajes, tarifas, categorías) sale de
 * docs/parcial-primer-corte/00-brief.md, Secciones 4 y 5.
 */

export const clientesSeed: Cliente[] = [
  { id_cliente: 1, documento: '1098765432', nombres: 'Laura', apellidos: 'Gómez Rey', celular: '3011234567' },
  { id_cliente: 2, documento: '79456123', nombres: 'Andrés', apellidos: 'Martínez Silva', celular: '3109876543' },
  { id_cliente: 3, documento: '52789456', nombres: 'Camila', apellidos: 'Rojas Peña', celular: '3157894561' },
];

export const viajesProgramadosSeed: ViajeProgramado[] = [
  {
    id_viaje: 1,
    id_itinerario: 1,
    id_bus: 1,
    id_conductor: 10,
    fecha: '2026-09-08',
    hora_salida: '06:00',
    estado_viaje: 'PROGRAMADO',
    origen_ciudad: 'Bucaramanga',
    destino_ciudad: 'Bogotá',
    placa_bus: 'WRT-123',
  },
  {
    id_viaje: 2,
    id_itinerario: 2,
    id_bus: 2,
    id_conductor: 11,
    fecha: '2026-09-08',
    hora_salida: '14:30',
    estado_viaje: 'PROGRAMADO',
    origen_ciudad: 'Bucaramanga',
    destino_ciudad: 'Cúcuta',
    placa_bus: 'WRT-456',
  },
  {
    id_viaje: 3,
    id_itinerario: 3,
    id_bus: 1,
    id_conductor: 10,
    fecha: '2026-09-09',
    hora_salida: '08:15',
    estado_viaje: 'PROGRAMADO',
    origen_ciudad: 'Bucaramanga',
    destino_ciudad: 'Medellín',
    placa_bus: 'WRT-123',
  },
];

/** Genera 20 sillas por bus (10 ventana / 10 pasillo), como en RF06/SILLA. */
function generarSillas(idBus: number): Silla[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id_silla: idBus * 100 + i + 1,
    id_bus: idBus,
    numero: i + 1,
    ubicacion: i % 2 === 0 ? 'VENTANA' : 'PASILLO',
  }));
}

export const sillasPorBus: Record<number, Silla[]> = {
  1: generarSillas(1),
  2: generarSillas(2),
};

export const tiquetesSeed: Tiquete[] = [
  {
    id_tiquete: 1,
    numero_tiquete: 'TQ-000001',
    id_viaje: 1,
    id_silla: 103,
    id_pasajero: 1,
    id_factura: 1,
    id_canal_venta: 'TAQUILLA',
    id_estado_tiquete: 'PAGADO',
    valor_pagado: 85000,
    penalidad_reprogramacion: 0,
  },
];

export const facturasSeed: Factura[] = [
  {
    id_factura: 1,
    id_cliente: 1,
    id_cajero: 100,
    id_metodo_pago: 'EFECTIVO',
    fecha_emision: '2026-09-01T09:15:00',
    monto_total: 85000,
    cufe: 'CUFE-DEMO-0001',
  },
];

export const remesasSeed: Remesa[] = [];

export const guiasSeed: GuiaEnvio[] = [
  {
    id_guia: 1,
    codigo_barras: 'GU-00000001',
    id_remitente: 2,
    id_destinatario: 3,
    id_categoria_mercancia: 'GENERAL',
    id_estado_guia: 'ADMITIDO',
    peso_kg: 4.8,
    valor_total: 32000,
    fecha_admision: '2026-09-01T10:00:00',
  },
];

/** Tarifa base simplificada por kg según categoría (regla de negocio de demo, RF05). */
export const TARIFA_POR_KG: Record<string, number> = {
  GENERAL: 4500,
  PERECEDERA: 6000,
  FRAGIL: 7500,
  VALORES: 9000,
};

/** Valor base simplificado por viaje (regla de negocio de demo, para "Comprar Tiquete"). */
export const VALOR_TIQUETE_BASE = 85000;
