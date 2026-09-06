# 1. Roles del sistema (actores)

> Extraído de [00-brief.md](00-brief.md), Sección 1. Fuente de verdad: `cr1_t2_formulacion_proyecto.tex`
> (organigrama definitivo de Copetran, Sección 4).

## Actores primarios (operan la interfaz del sistema)

| Rol / Actor | Ubicación en el organigrama | Interviene en |
|---|---|---|
| Cajero de Agencia | Dirección de Operaciones y Pasajes — Comercial y Taquillas | Venta de tiquetes (A), reprogramación (G), registro de cliente (M) |
| Auxiliar de Despacho | Dirección de Operaciones y Pasajes — Rodamiento y Despacho | Control de abordaje, cierre de tiquete VIAJADO/CANCELADO (A, B) |
| Operario de Bodega | Dirección de Logística y Carga — Gestión de Bodegas y Hubs | Admisión y consolidación de mensajería (C), registro de cliente (M) |
| Conductor de Vehículo de Reparto | Dirección de Logística y Carga — Distribución y Rutas de Carga | Distribución de última milla (H) |
| Analista de RRHH | Dirección de RRHH y Nómina — Contratos y Licencias | Contratación (E) |
| Área de Nómina y Novedades | Dirección de RRHH y Nómina | Liquidación de nómina (E) |
| Técnico Mecánico | Dirección de Operaciones y Pasajes — Mantenimiento de Flota | Mantenimiento y alta de flota (D, F) |
| Inspector Técnico / Auxiliar de Laboratorio | Dirección de Operaciones y Pasajes — Seguridad Vial y Control | Alistamiento preoperacional (B) |
| Monitorista de Telemetría | Dirección de Tecnología TIC — Centro de Control GPS e IoT | Monitoreo GPS/IoT (J) |
| Técnico de Incidencias (Mesa de Ayuda) | Dirección de Tecnología TIC | Gestión de incidencias TIC (I) |
| Administrador de Servidores | Dirección de Tecnología TIC — Infraestructura y Ciberseguridad | Infraestructura y ciberseguridad (O) |
| Gerencia General / Direcciones | Transversal | Aprobación de rutas (K), gestión organizacional (L) |
| Auditoría Interna | Standalone, reporta a Gerencia | Verificación documental (B), trazabilidad (RNF06) |

## Actores secundarios / externos

| Rol / Actor | Naturaleza | Interviene en |
|---|---|---|
| Cliente (Pasajero / Remitente / Destinatario) | Externo, humano | Compra de tiquetes (A, canal WEB/APP), envío de mensajería (C) |
| Sistema de Pagos | Externo, sistema | Confirmación de pago (efectivo, débito, crédito, transferencia/QR) |
| Sistema de Facturación Electrónica (DIAN) | Externo, sistema | Emisión de CUFE (RF04, RNF07) |

## Nota de alcance

Se listan los 22 grupos de cargo ya documentados en la Sección 6 del CR-1 T-2 como base; para este
parcial se consolidan en los roles anteriores porque son los que efectivamente operan pantallas o son
actores de caso de uso — coherente con RNF01 (control de acceso por cargo).

## Aclaración: tres niveles de detalle, no una inconsistencia

El CR-1 T-2 y este parcial manejan intencionalmente **tres niveles de detalle distintos** sobre el
personal de Copetran, que no son inconsistentes entre sí sino que responden a propósitos diferentes:

1. **22 grupos de cargo entrevistados** (CR-1 T-2, Sección 6) — nivel de *levantamiento de
   información*: las preguntas de entrevista se organizaron por grupo funcional, no por cargo
   individual.
2. **30 cargos individuales del organigrama** (CR-1 T-2, Sección 4, Figura 1) — nivel de *estructura
   organizacional*: cada caja del organigrama es un cargo formal dentro de una dirección o área.
3. **13 actores de interfaz** (tabla de actores primarios de este documento) — nivel de *caso de uso*:
   son los roles que efectivamente operan una pantalla del sistema o participan como actor en un
   diagrama de casos de uso, coherente con RNF01.

Un mismo cargo del organigrama (nivel 2) puede pertenecer a un grupo de entrevista (nivel 1) y, si
opera pantallas, aparecer también como actor de interfaz (nivel 3) — por eso los tres números (22, 30,
13) son correctos simultáneamente y no requieren conciliarse en una única lista.
