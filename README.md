# Copetran — Sistema de Información para Empresa Transportadora de Pasajeros

Proyecto académico de formulación y diseño de software para el sistema de información integral de
Copetran (transporte de pasajeros, mensajería, logística de última milla, gestión de flota, talento
humano y tecnología, a nivel nacional).

## Integrantes

- Santiago José Rodríguez Gutiérrez
- Nicolás Pérez Chuscano
- Camilo Andrés Díaz García

## Curso

Patrones de Diseño de Software (SIST0076-G02) — Universidad Sergio Arboleda
Docente: José Marcial Téllez Gómez

## Índice de entregables

### Parcial primer corte (vence 7 de septiembre de 2026)

- [Brief completo](docs/parcial-primer-corte/00-brief.md)
- [1. Roles y actores del sistema](docs/parcial-primer-corte/01-roles-actores.md)
- [2. Casos de uso de alto nivel (por rol)](docs/parcial-primer-corte/02-casos-de-uso-alto-nivel.md)
- [3. Procesos principales](docs/parcial-primer-corte/03-procesos-principales.md)
- [4. Casos de uso extendidos](docs/parcial-primer-corte/04-casos-de-uso-extendidos.md)
- [5. Especificación de casos de uso](docs/parcial-primer-corte/05-especificacion-casos-de-uso.md)

**Diagramas** (`docs/parcial-primer-corte/diagramas/`):

- [Diagrama de clases DAO](docs/parcial-primer-corte/diagramas/clases-dao/clases-dao.puml)
- Diagramas de estados:
  - [Tiquete](docs/parcial-primer-corte/diagramas/estados/estado-tiquete.puml)
  - [Guía de envío](docs/parcial-primer-corte/diagramas/estados/estado-guia-envio.puml)
  - [Viaje programado](docs/parcial-primer-corte/diagramas/estados/estado-viaje-programado.puml)
- Diagramas de colaboración:
  - [Proceso A — Venta de tiquetes](docs/parcial-primer-corte/diagramas/colaboracion/colaboracion-venta-tiquetes.puml)
  - [Proceso C — Admisión y consolidación de mensajería](docs/parcial-primer-corte/diagramas/colaboracion/colaboracion-admision-mensajeria.puml)
- Diagramas de secuencia:
  - [Proceso A — Venta de tiquetes](docs/parcial-primer-corte/diagramas/secuencia/secuencia-venta-tiquetes.puml)
  - [Proceso C — Admisión y consolidación de mensajería](docs/parcial-primer-corte/diagramas/secuencia/secuencia-admision-mensajeria.puml)

**Fuentes de trazabilidad** (`docs/parcial-primer-corte/fuentes/`):

- [Script SQL corregido (schema real, T-SQL)](docs/parcial-primer-corte/fuentes/copetran_corregido.sql)
- [Organigrama definitivo de Copetran (transcripción)](docs/parcial-primer-corte/fuentes/organigrama-copetran.md)

### CR-1 T-2 — Formulación de Proyecto

Documento fuente de verdad del caso Copetran (organigrama, procesos, requerimientos, modelo relacional
en SQL Server, auditoría del modelo). El parcial primer corte se construye sobre este documento,
manteniendo trazabilidad total con él.
