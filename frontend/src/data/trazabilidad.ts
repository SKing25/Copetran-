/**
 * Contenido transcrito literalmente de la documentación del parcial primer
 * corte (docs/parcial-primer-corte/01-roles-actores.md, 02-casos-de-uso-alto-nivel.md,
 * 05-especificacion-casos-de-uso.md), para renderizarlo dentro de la app en
 * la pestaña "Trazabilidad del Sistema". No se inventa contenido nuevo aquí.
 */

export interface RolActor {
  rol: string;
  ubicacion: string;
  interviene: string;
}

export const ACTORES_PRIMARIOS: RolActor[] = [
  { rol: 'Cajero de Agencia', ubicacion: 'Dirección de Operaciones y Pasajes — Comercial y Taquillas', interviene: 'Venta de tiquetes (A), reprogramación (G), registro de cliente (M)' },
  { rol: 'Auxiliar de Despacho', ubicacion: 'Dirección de Operaciones y Pasajes — Rodamiento y Despacho', interviene: 'Control de abordaje, cierre de tiquete VIAJADO/CANCELADO (A, B)' },
  { rol: 'Operario de Bodega', ubicacion: 'Dirección de Logística y Carga — Gestión de Bodegas y Hubs', interviene: 'Admisión y consolidación de mensajería (C), registro de cliente (M)' },
  { rol: 'Conductor de Vehículo de Reparto', ubicacion: 'Dirección de Logística y Carga — Distribución y Rutas de Carga', interviene: 'Distribución de última milla (H)' },
  { rol: 'Analista de RRHH', ubicacion: 'Dirección de RRHH y Nómina — Contratos y Licencias', interviene: 'Contratación (E)' },
  { rol: 'Área de Nómina y Novedades', ubicacion: 'Dirección de RRHH y Nómina', interviene: 'Liquidación de nómina (E)' },
  { rol: 'Técnico Mecánico', ubicacion: 'Dirección de Operaciones y Pasajes — Mantenimiento de Flota', interviene: 'Mantenimiento y alta de flota (D, F)' },
  { rol: 'Inspector Técnico / Auxiliar de Laboratorio', ubicacion: 'Dirección de Operaciones y Pasajes — Seguridad Vial y Control', interviene: 'Alistamiento preoperacional (B)' },
  { rol: 'Monitorista de Telemetría', ubicacion: 'Dirección de Tecnología TIC — Centro de Control GPS e IoT', interviene: 'Monitoreo GPS/IoT (J)' },
  { rol: 'Técnico de Incidencias (Mesa de Ayuda)', ubicacion: 'Dirección de Tecnología TIC', interviene: 'Gestión de incidencias TIC (I)' },
  { rol: 'Administrador de Servidores', ubicacion: 'Dirección de Tecnología TIC — Infraestructura y Ciberseguridad', interviene: 'Infraestructura y ciberseguridad (O)' },
  { rol: 'Gerencia General / Direcciones', ubicacion: 'Transversal', interviene: 'Aprobación de rutas (K), gestión organizacional (L)' },
  { rol: 'Auditoría Interna', ubicacion: 'Standalone, reporta a Gerencia', interviene: 'Verificación documental (B), trazabilidad (RNF06)' },
];

export const ACTORES_SECUNDARIOS: RolActor[] = [
  { rol: 'Cliente (Pasajero / Remitente / Destinatario)', ubicacion: 'Externo, humano', interviene: 'Compra de tiquetes (A, canal WEB/APP), envío de mensajería (C)' },
  { rol: 'Sistema de Pagos', ubicacion: 'Externo, sistema', interviene: 'Confirmación de pago (efectivo, débito, crédito, transferencia/QR)' },
  { rol: 'Sistema de Facturación Electrónica (DIAN)', ubicacion: 'Externo, sistema', interviene: 'Emisión de CUFE (RF04, RNF07)' },
];

export interface CasosDeUsoPorRol {
  rol: string;
  casos: string[];
}

export const CASOS_DE_USO_ALTO_NIVEL: CasosDeUsoPorRol[] = [
  { rol: 'Cliente', casos: ['Comprar Tiquete', 'Consultar Disponibilidad de Viaje', 'Reprogramar Tiquete Abierto', 'Cancelar Tiquete', 'Enviar Encomienda', 'Consultar Estado de Envío'] },
  { rol: 'Cajero de Agencia', casos: ['Vender Tiquete', 'Emitir Factura', 'Reprogramar Tiquete', 'Registrar Cliente'] },
  { rol: 'Auxiliar de Despacho', casos: ['Controlar Abordaje', 'Generar Planilla Única de Viaje', 'Cerrar Estado de Viaje'] },
  { rol: 'Operario de Bodega', casos: ['Admitir Guía de Envío', 'Clasificar Mercancía', 'Consolidar Remesa', 'Actualizar Estado de Guía'] },
  { rol: 'Conductor de Vehículo de Reparto', casos: ['Confirmar Entrega de Última Milla'] },
  { rol: 'Analista de RRHH', casos: ['Registrar Empleado', 'Crear Contrato', 'Registrar Licencia de Conducción'] },
  { rol: 'Área de Nómina y Novedades', casos: ['Registrar Novedad', 'Liquidar Nómina'] },
  { rol: 'Técnico Mecánico', casos: ['Registrar Mantenimiento', 'Registrar Cambio de Placa', 'Dar de Alta un Bus'] },
  { rol: 'Inspector Técnico / Auxiliar de Laboratorio', casos: ['Registrar Inspección Preoperacional', 'Registrar Prueba de Alcoholemia'] },
  { rol: 'Monitorista de Telemetría', casos: ['Monitorear Dispositivo IoT', 'Generar Alerta de Desconexión'] },
  { rol: 'Técnico de Incidencias', casos: ['Registrar Incidencia TIC', 'Cerrar Incidencia'] },
  { rol: 'Administrador de Servidores', casos: ['Ejecutar Copia de Respaldo', 'Aplicar Parches de Seguridad'] },
  { rol: 'Gerencia General', casos: ['Aprobar Apertura de Ruta/Agencia', 'Gestionar Estructura Organizacional'] },
  { rol: 'Auditoría Interna', casos: ['Verificar Documentación de Vehículo/Conductor', 'Consultar Historial Auditable'] },
];

export interface EspecificacionCasoUso {
  id: string;
  nombre: string;
  actores: string;
  descripcion: string;
  precondiciones: string;
  postcondiciones: string;
  flujoPrincipal: string[];
  flujosAlternativos: { codigo: string; descripcion: string }[];
  reglasNegocio: string;
  frecuenciaUso: string;
}

export const ESPECIFICACIONES_CASO_USO: EspecificacionCasoUso[] = [
  {
    id: 'ECU-01',
    nombre: 'Comprar Tiquete de Pasajero',
    actores: 'Cliente (principal, WEB/APP), Cajero de Agencia (principal, TAQUILLA), Sistema de Pagos (secundario)',
    descripcion:
      'Permite registrar la venta de un tiquete para un viaje programado, bloqueando la silla seleccionada, generando la factura y confirmando el pago.',
    precondiciones: 'Existe al menos un VIAJE_PROGRAMADO con sillas disponibles; el cliente está registrado o se registra en el paso 2 (Proceso M).',
    postcondiciones:
      'Se crea un TIQUETE en estado PAGADO (o RESERVADO/ABIERTO según flujo alterno) asociado a una FACTURA; la silla queda ocupada para ese viaje (UNIQUE(id_viaje, id_silla), RF01).',
    flujoPrincipal: [
      'Consultar disponibilidad de sillas del viaje.',
      'Seleccionar silla y registrar/reutilizar datos del cliente.',
      'Definir canal de venta (TAQUILLA, WEB, APP).',
      'Bloquear la silla temporalmente (RF03, p. ej. 3 minutos).',
      'Emitir factura (cliente, cajero, método de pago).',
      'Confirmar recepción del pago.',
      'Confirmar tiquete como PAGADO.',
    ],
    flujosAlternativos: [
      { codigo: 'A1', descripcion: 'Reserva sin pago inmediato — el tiquete queda en RESERVADO con fecha_expiracion_reserva.' },
      { codigo: 'A2', descripcion: 'Tiquete abierto — estado ABIERTO con penalidad_reprogramacion.' },
      { codigo: 'A3', descripcion: 'Cancelación por el Auxiliar de Despacho si no se usa.' },
    ],
    reglasNegocio: 'RF03 (bloqueo temporal de silla), RF04 (factura debe emitir CUFE), 5 estados y 3 canales parametrizados en MULTITABLA_PARAMETRO.',
    frecuenciaUso: 'Alta — varias veces por minuto en horas pico, por agencia.',
  },
  {
    id: 'ECU-02',
    nombre: 'Admitir y Consolidar Guía de Envío',
    actores: 'Operario de Bodega (principal), Cliente/Remitente (secundario), Sistema de Facturación (secundario)',
    descripcion:
      'Permite admitir un paquete en bodega, clasificarlo, generar su guía con código de barras y, si aplica, consolidarlo en una remesa.',
    precondiciones: 'El remitente y el destinatario están registrados o se registran en el momento (Proceso M).',
    postcondiciones: 'Se crea una GUIA_ENVIO en estado ADMITIDO, con o sin id_remesa asociado; si se paga en el momento, queda asociada a una FACTURA.',
    flujoPrincipal: [
      'Admisión: registrar remitente, destinatario, pesaje y dimensionamiento.',
      'Clasificar mercancía (general, perecedera, frágil, documentos/valores).',
      'Calcular tarifa y generar guía con código de barras (estado ADMITIDO).',
      'Recepción en bodega/hub, con control de capacidad/temperatura si aplica.',
      'Consolidar en remesa si comparte remitente/destino con otras guías pendientes.',
      'Actualizar estado: EN_TRANSITO → BODEGA_DESTINO → ENTREGADO.',
    ],
    flujosAlternativos: [
      { codigo: 'A1', descripcion: 'Pago inmediato — se asocia id_factura en la admisión.' },
      { codigo: 'A2', descripcion: 'Envío sin remesa — una guía puede viajar sin consolidarse.' },
      { codigo: 'A3', descripcion: 'Novedad — el estado puede pasar a NOVEDAD si el envío queda retenido.' },
    ],
    reglasNegocio: 'RF05 (cálculo automático de valor según peso/categoría), RF11 (hallazgo: falta id_empleado en GUIA_ENVIO), RF17 (recálculo de totales en REMESA).',
    frecuenciaUso: 'Alta — continua durante horario operativo, por bodega/hub.',
  },
];
