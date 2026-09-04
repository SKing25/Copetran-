# Copetran — Frontend (scaffold funcional)

Interfaz funcional de demostración para el parcial primer corte, construida con **React + TypeScript +
Vite + TailwindCSS**. Usa un patrón genérico de dashboards por rol (`AuthContext` + `DashboardRouter` +
`hooks/` + `utils/` reutilizables), inspirado en la arquitectura de un proyecto de referencia de un
compañero — **sin copiar nombres de tablas, tipos ni lógica de negocio de esa referencia**. Todo el
contenido de negocio (roles, campos, estados) sale de
[`../docs/parcial-primer-corte/00-brief.md`](../docs/parcial-primer-corte/00-brief.md).

## Cómo correrlo

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Estructura

```
src/
  context/
    AuthContext.tsx     Autenticación simple por rol (persistida en localStorage)
    DataContext.tsx      Store mock en memoria: viajes, tiquetes, facturas, guías, remesas
  hooks/
    useLocalStorage.ts   Hook genérico de persistencia (sin lógica de negocio)
  utils/
    cn.ts                 Combinador de clases Tailwind (equivalente a clsx)
    format.ts             Formato de moneda y fechas (es-CO)
  types/
    copetran.ts            Tipos del dominio — campos snake_case idénticos al schema real
                            (docs/parcial-primer-corte/fuentes/copetran_corregido.sql)
  data/
    mockData.ts             Datos semilla (clientes, viajes, sillas, tiquetes, guías)
  components/
    Login.tsx               Selector de rol: Cliente, Cajero de Agencia, Operario de Bodega
    DashboardRouter.tsx      Enruta al dashboard según el rol autenticado
    Layout.tsx               Cabecera común (usuario, rol, salir)
    ui/                      Badge y Card genéricos
  dashboards/
    ClienteDashboard.tsx     ECU-01 — Comprar Tiquete (Proceso A, canal WEB/APP)
    CajeroDashboard.tsx      ECU-01 — Vender Tiquete (Proceso A, canal TAQUILLA)
    OperarioDashboard.tsx    ECU-02 — Admitir y Consolidar Guía de Envío (Proceso C)
```

## Roles y flujos implementados

| Rol | Dashboard | Caso de uso | Campos reales usados |
|---|---|---|---|
| Cliente | `ClienteDashboard` | ECU-01 (canal WEB/APP) | `TIQUETE`, `VIAJE_PROGRAMADO`, `FACTURA`, `SILLA`, 5 estados de `ESTADO_TIQUETE` |
| Cajero de Agencia | `CajeroDashboard` | ECU-01 (canal TAQUILLA) | idem, más selección/registro de `CLIENTE` (Proceso M) |
| Operario de Bodega | `OperarioDashboard` | ECU-02 | `GUIA_ENVIO`, `REMESA`, 5 estados de `ESTADO_GUIA`, 4 categorías de `CATEGORIA_MERCANCIA` |

Las transiciones de estado (`RESERVADO → PAGADO → …`, `ADMITIDO → EN_TRANSITO → …`) están restringidas en
`DataContext` exactamente a las flechas de los diagramas de estados ya entregados en
`docs/parcial-primer-corte/diagramas/estados/`.

## Datos y backend

Todo el estado (clientes, tiquetes, facturas, guías, remesas) vive en memoria y se persiste solo en el
`localStorage` del navegador vía `useLocalStorage` — **no hay backend real todavía**. Un par de reglas de
negocio (tarifa por kg, penalidad de reprogramación, vigencia de tiquete abierto) usan valores de
demostración porque el brief exige que existan como campos parametrizables pero no fija su valor exacto;
están señalados con comentarios `// Nota:` en `DataContext.tsx`.
