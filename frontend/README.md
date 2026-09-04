# Copetran — Frontend (scaffold funcional)

Interfaz funcional de demostración para el parcial primer corte, construida con **React + TypeScript +
Vite + TailwindCSS**. Usa un patrón genérico de dashboards por rol (`AuthContext` + `DashboardRouter` +
`hooks/` + `utils/` reutilizables), inspirado en la arquitectura de un proyecto de referencia de un
compañero — **sin copiar nombres de tablas, tipos ni lógica de negocio de esa referencia**. Todo el
contenido de negocio (roles, campos, estados) sale de
[`../docs/parcial-primer-corte/00-brief.md`](../docs/parcial-primer-corte/00-brief.md).

## Cómo correrlo

Requisitos: [Node.js](https://nodejs.org) 18+ (con `npm`).

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Para detenerlo: `Ctrl+C` en la misma terminal.

### Problema común en Windows: "la ejecución de scripts está deshabilitada"

Si `npm run dev` falla en PowerShell con un error de `PSSecurityException` / política de ejecución,
es porque PowerShell bloquea por defecto los scripts `.ps1` (incluido el wrapper de `npm`). Dos
soluciones:

- **Rápida, sin tocar configuración:** usa `npm.cmd run dev` en vez de `npm run dev`.
- **Permanente (recomendada):** habilita scripts locales solo para tu usuario (no requiere admin):
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
  Después de esto, `npm run dev` funciona normal en cualquier terminal nueva.

Si acabas de instalar Node.js y `npm`/`node` no se reconocen, cierra y abre una terminal nueva (o
reinicia VSCode) para que tome el PATH actualizado.

## Estructura

Los imports usan el alias `@/` → `src/` (configurado en `vite.config.ts` y `tsconfig.json`).

```
src/
  context/
    AuthContext.tsx      Autenticación simple por rol (persistida en localStorage)
    DataContext.tsx       Store mock en memoria: viajes, tiquetes, facturas, guías, remesas
  hooks/
    useLocalStorage.ts    Persistencia genérica en localStorage
    useDebounce.ts         Debounce genérico de un valor
    useMediaQuery.ts        Suscripción a una media query CSS
    useToggle.ts             Alternar un booleano (sidebar, modales)
    index.ts                  Barril de hooks
  utils/
    cn.ts                  Combinador de clases Tailwind (clsx + tailwind-merge)
    format.ts               Formato de moneda y fechas (es-CO)
  types/
    copetran.ts             Tipos del dominio — campos snake_case idénticos al schema real
                             (docs/parcial-primer-corte/fuentes/copetran_corregido.sql)
  data/
    mockData.ts              Datos semilla (clientes, viajes, sillas, tiquetes, guías)
  layouts/
    DashboardLayout.tsx       Shell compartido: sidebar + topbar + <Outlet /> (react-router-dom)
  components/
    Login.tsx                 Selector de rol: Cliente, Cajero de Agencia, Operario de Bodega
    DashboardRouter.tsx        Decide qué dashboard renderizar según el rol (sin shell propio)
    ui/                        Kit de UI genérico (Button, Input, Select, Modal/AlertDialog,
                                Spinner/SpinnerOverlay/Skeleton, Tooltip, Card, Badge) + index.ts (barril)
  dashboards/
    ClienteDashboard.tsx      ECU-01 — Comprar Tiquete (Proceso A, canal WEB/APP)
    CajeroDashboard.tsx       ECU-01 — Vender Tiquete (Proceso A, canal TAQUILLA)
    OperarioDashboard.tsx     ECU-02 — Admitir y Consolidar Guía de Envío (Proceso C)
```

## Routing

`react-router-dom` con `BrowserRouter` en `main.tsx`:

- `/` y `/login` → `Login` (autentica contra `AuthContext` y navega a `/dashboard`).
- `/dashboard` → `DashboardLayout` (guardia: redirige a `/login` si no hay usuario autenticado)
  con ruta índice → `DashboardRouter`, que renderiza el dashboard del rol dentro del `<Outlet />`.

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
