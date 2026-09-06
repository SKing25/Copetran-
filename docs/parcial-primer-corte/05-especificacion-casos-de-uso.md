# 5. Especificación de casos de uso (formato completo)

> Extraído de [00-brief.md](00-brief.md), Sección 5. Dos formatos de especificación de caso de uso,
> correspondientes a los dos casos de uso extendidos de [04-casos-de-uso-extendidos.md](04-casos-de-uso-extendidos.md).

## ECU-01 — Comprar Tiquete de Pasajero

| Campo | Contenido |
|---|---|
| **ID** | ECU-01 |
| **Nombre** | Comprar Tiquete de Pasajero |
| **Actor(es)** | Cliente (principal en canal WEB/APP), Cajero de Agencia (principal en canal TAQUILLA), Sistema de Pagos (secundario) |
| **Descripción** | Permite registrar la venta de un tiquete para un viaje programado, bloqueando la silla seleccionada, generando la factura y confirmando el pago. |
| **Precondiciones** | Existe al menos un `VIAJE_PROGRAMADO` con sillas disponibles; el cliente está registrado o se registra en el paso 2 (Proceso M). |
| **Postcondiciones** | Se crea un `TIQUETE` en estado `PAGADO` (o `RESERVADO`/`ABIERTO` según flujo alterno) asociado a una `FACTURA`; la silla queda ocupada para ese viaje (`UNIQUE(id_viaje, id_silla)`, RF01). |
| **Flujo principal** | 1. Consultar disponibilidad de sillas del viaje.<br>2. Seleccionar silla y registrar/reutilizar datos del cliente.<br>3. Definir canal de venta (TAQUILLA, WEB, APP).<br>4. Bloquear la silla temporalmente (RF03, p. ej. 3 minutos) para evitar condición de carrera entre canales.<br>5. Emitir factura (cliente, cajero, método de pago).<br>6. Confirmar recepción del pago.<br>7. Confirmar tiquete como `PAGADO`. |
| **Flujos alternativos** | **A1 (Reserva sin pago inmediato):** en el paso 6 el cliente no paga de inmediato — el tiquete queda en `RESERVADO` con `fecha_expiracion_reserva`; si vence sin pago, se libera la silla.<br>**A2 (Tiquete abierto):** en el paso 7 el cliente solicita flexibilidad de fecha — estado `ABIERTO` con `penalidad_reprogramacion`.<br>**A3 (Cancelación):** el Auxiliar de Despacho marca el tiquete como `CANCELADO` si no se usa. |
| **Reglas de negocio** | RF03 (bloqueo temporal de silla, un tiquete por silla por viaje), RF04 (factura debe emitir CUFE), 5 estados y 3 canales parametrizados en `MULTITABLA_PARAMETRO`. |
| **Frecuencia de uso** | Alta — varias veces por minuto en horas pico, por agencia. |

## ECU-02 — Admitir y Consolidar Guía de Envío

| Campo | Contenido |
|---|---|
| **ID** | ECU-02 |
| **Nombre** | Admitir y Consolidar Guía de Envío |
| **Actor(es)** | Operario de Bodega (principal), Cliente/Remitente (secundario), Sistema de Facturación (secundario) |
| **Descripción** | Permite admitir un paquete en bodega, clasificarlo, generar su guía con código de barras y, si aplica, consolidarlo en una remesa. |
| **Precondiciones** | El remitente y el destinatario están registrados o se registran en el momento (Proceso M). |
| **Postcondiciones** | Se crea una `GUIA_ENVIO` en estado `ADMITIDO`, con o sin `id_remesa` asociado; si se paga en el momento, queda asociada a una `FACTURA`. |
| **Flujo principal** | 1. Admisión: registrar remitente, destinatario, pesaje y dimensionamiento.<br>2. Clasificar mercancía (general, perecedera, frágil, documentos/valores).<br>3. Calcular tarifa y generar guía con código de barras (estado `ADMITIDO`).<br>4. Recepción en bodega/hub, con control de capacidad/temperatura si aplica.<br>5. Consolidar en remesa si comparte remitente/destino con otras guías pendientes.<br>6. Actualizar estado a lo largo del ciclo: `EN_TRANSITO` → `BODEGA_DESTINO` → `ENTREGADO`. |
| **Flujos alternativos** | **A1 (Pago inmediato):** en el paso 3, si el envío se paga al momento, se asocia `id_factura`.<br>**A2 (Envío sin remesa):** en el paso 5, una guía puede viajar sin consolidarse en remesa.<br>**A3 (Novedad):** en cualquier punto del paso 6, el estado puede pasar a `NOVEDAD` si el envío queda retenido. |
| **Reglas de negocio** | RF05 (cálculo automático de valor según peso/categoría, seguimiento de estado), RF11 (hallazgo: el modelo aún no registra qué empleado ejecuta la admisión — pendiente de corrección), RF17 (los totales de la remesa deben recalcularse a partir de sus guías — pendiente de trigger, ver auditoría CR-1 T-2 Sección 14.6). |
| **Frecuencia de uso** | Alta — continua durante horario operativo, por bodega/hub. |

> **Aclaración:** los hallazgos RF11 y RF17 se documentan aquí de forma **intencionalmente sin
> corregir** en este parcial — no son un olvido. Ambos son responsabilidad del **modelo relacional**
> del CR-1 T-2 (`copetran_corregido.sql`), no del diseño de interfaz de usuario que exige esta
> consigna; corregirlos implicaría alterar el schema (agregar `id_empleado` a `GUIA_ENVIO` y un
> trigger de recálculo en `REMESA`), lo cual está fuera del alcance de este entregable y queda descrito
> como pendiente de decisión del equipo (CR-1 T-2, Sección 14.6).
