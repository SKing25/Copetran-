# 4. Casos de uso extendidos

> Extraído de [00-brief.md](00-brief.md), Sección 4. Modelo de casos de uso extendido — por proceso.

## CUE-01 — Comprar Tiquete de Pasajero (Proceso A)

- **Actor principal:** Cajero de Agencia (canal TAQUILLA) / Cliente (canal WEB o APP)
- **Actores secundarios:** Sistema de Pagos, Sistema de Facturación Electrónica DIAN, Auxiliar de
  Despacho
- **`<<include>>` Consultar Disponibilidad de Viaje** — siempre se ejecuta antes de iniciar la venta.
- **`<<include>>` Consultar Disponibilidad de Silla** — siempre se ejecuta antes de seleccionar asiento.
- **`<<include>>` Registrar Cliente** — siempre se ejecuta si el pasajero no está registrado.
- **`<<include>>` Bloquear Silla Temporalmente** — RF03, evita condición de carrera entre canales.
- **`<<include>>` Generar Factura** — siempre se ejecuta al confirmar la venta (RF04: CUFE).
- **`<<include>>` Confirmar Pago** — siempre se ejecuta al procesar el recibo ante el Sistema de Pagos.
- **`<<extend>>` Reservar Tiquete Sin Pago Inmediato** — extiende cuando el cliente no paga de
  inmediato (estado `RESERVADO`, con `fecha_expiracion_reserva`).
- **`<<extend>>` Habilitar Tiquete Abierto** — extiende cuando el pago se confirma pero el cliente
  pide viajar en fecha flexible (estado `ABIERTO`, con `penalidad_reprogramacion`).
- **`<<extend>>` Reprogramar Tiquete Abierto** (Proceso G) — extiende cuando existe un tiquete en
  estado `ABIERTO` dentro de la fecha límite.
- **`<<extend>>` Cancelar Tiquete** — extiende cuando el Auxiliar de Despacho no registra uso.

![Diagrama de Caso de Uso Extendido — CUE-01](diagramas/casos-uso/casos_uso_extendido_cue01.png)

## CUE-02 — Admitir y Consolidar Guía de Envío (Proceso C)

- **Actor principal:** Operario de Bodega
- **Actores secundarios:** Cliente (Remitente / Destinatario), Sistema de Facturación Electrónica
  DIAN, Conductor de Vehículo de Reparto
- **`<<include>>` Registrar Datos de Remitente y Destinatario** — siempre se ejecuta (Proceso M).
- **`<<include>>` Registrar Pesaje y Dimensionamiento** — siempre se ejecuta en la admisión.
- **`<<include>>` Clasificar Mercancía** — siempre se ejecuta (categoría: general, perecedera,
  frágil, valores).
- **`<<include>>` Calcular Tarifa de Envío** — siempre se ejecuta antes de generar la guía (RF05).
- **`<<include>>` Generar Guía con Código de Barras** — siempre se ejecuta para dejar la guía en
  estado `ADMITIDO`.
- **`<<extend>>` Asociar Guía a Factura Inmediata** — extiende cuando el envío se paga en el momento
  de la admisión.
- **`<<extend>>` Consolidar en Remesa** — extiende cuando la guía comparte remitente/destino con
  otras guías pendientes.
- **`<<extend>>` Marcar Guía con Novedad** — extiende el flujo de seguimiento cuando el envío queda
  retenido (estado `NOVEDAD`).
- **`<<extend>>` Actualizar Estado de Guía** — extiende cuando la guía avanza en `EN_TRANSITO` /
  `BODEGA_DESTINO`.

![Diagrama de Caso de Uso Extendido — CUE-02](diagramas/casos-uso/casos_uso_extendido_cue02.png)
