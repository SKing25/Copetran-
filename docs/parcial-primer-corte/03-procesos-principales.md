# 3. Procesos principales elegidos

> Extraído de [00-brief.md](00-brief.md), Sección 3.

**Proceso A — Venta de tiquetes de pasajeros** y **Proceso C — Admisión y consolidación de mensajería en
bodega** (numeración original del CR-1 T-2, Sección 5).

## Justificación

1. Cubren las **dos líneas de negocio** de Copetran (pasajeros y carga/mensajería), no solo una — el
   criterio pedido de máxima cobertura ("lo más abarcativo posible").
2. Son los **dos procesos con estados parametrizados más ricos** del modelo: `ESTADO_TIQUETE` (5 estados)
   y `ESTADO_GUIA` (5 estados), ideales para el diagrama de estados pedido.
3. Ya están **documentados paso a paso con rol responsable** en el CR-1 T-2 (Secciones 5.1 y 5.3), lo que
   garantiza trazabilidad exacta entre este parcial y el entregable grande del curso.
4. Tienen **requerimientos funcionales y hallazgos de auditoría ya trabajados** (RF03/RF04 para A;
   RF05/RF11/RF17 para C), lo que da contenido real para las reglas de negocio de las especificaciones de
   caso de uso, en lugar de inventarlas desde cero.

## Referencia cruzada con CR-1 T-2

- Proceso A: `cr1_t2_formulacion_proyecto.tex`, Sección 5.1 — Venta de tiquetes de pasajeros.
- Proceso C: `cr1_t2_formulacion_proyecto.tex`, Sección 5.3 — Admisión y consolidación de mensajería en
  bodega.
