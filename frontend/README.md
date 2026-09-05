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
    trazabilidad.ts            Roles, casos de uso y especificaciones ECU, transcritos de docs/
  layouts/
    DashboardLayout.tsx       Shell: sidebar (logo + usuario + salir) + topbar + <Outlet />
  components/
    Login.tsx                 Selector de rol: Cliente, Cajero de Agencia, Operario de Bodega
    DashboardRouter.tsx        Monta el workspace de tabs (Tabs + los 3 paneles)
    CompanyLogo.tsx             Caja de logo con fallback a ícono si la imagen no existe
    ui/                        Kit de UI genérico (Button, Input, Select, Modal/AlertDialog,
                                Spinner/SpinnerOverlay/Skeleton, Tooltip, Tabs, Alert, Card, Badge)
                                + index.ts (barril)
    workspace/
      TrazabilidadTab.tsx        Roles, casos de uso y especificación ECU-01/ECU-02 en tablas
      TiquetesModule.tsx          ECU-01 — mapa de asientos + flujo extendido de descuentos
      SeatMap.tsx                  Mapa de asientos interactivo con CSS Grid
      MensajeriaModule.tsx        ECU-02 — cubicaje + alerta dinámica de sobrepeso
```

## Routing

`react-router-dom` con `BrowserRouter` en `main.tsx`:

- `/` y `/login` → `Login` (autentica contra `AuthContext` y navega a `/dashboard`).
- `/dashboard` → `DashboardLayout` (guardia: redirige a `/login` si no hay usuario autenticado)
  con ruta índice → `DashboardRouter`, que monta el workspace de tabs dentro del `<Outlet />`.

## Workspace (tabs) y flujos implementados

El contenedor principal alterna entre tres pestañas (`components/ui/Tabs.tsx`), visibles para
cualquier rol autenticado:

| Tab | Componente | Contenido |
|---|---|---|
| Trazabilidad del Sistema | `TrazabilidadTab` | Roles, casos de uso de alto nivel y especificación completa de ECU-01/ECU-02, en tablas — mismo contenido que `docs/parcial-primer-corte/01`, `02` y `05` |
| Módulo de Tiquetes (ECU-01) | `TiquetesModule` | Autoservicio (rol Cliente, canal WEB/APP) o venta en taquilla (otros roles): `TIQUETE`, `VIAJE_PROGRAMADO`, `FACTURA`, `SILLA` (mapa interactivo), 5 estados de `ESTADO_TIQUETE`, + código de descuento |
| Módulo de Mensajería (ECU-02) | `MensajeriaModule` | `GUIA_ENVIO`, `REMESA`, 5 estados de `ESTADO_GUIA`, 4 categorías de `CATEGORIA_MERCANCIA`, + cubicaje con alerta de sobrepeso volumétrico |

Las transiciones de estado (`RESERVADO → PAGADO → …`, `ADMITIDO → EN_TRANSITO → …`) están restringidas en
`DataContext` exactamente a las flechas de los diagramas de estados ya entregados en
`docs/parcial-primer-corte/diagramas/estados/`.

### Convenciones de UI que no vienen del brief

Dos piezas de este refinamiento visual no corresponden a un campo del schema ni del brief — son
prácticas habituales del sector, claramente comentadas en el código:

- **Código de descuento** (`TiquetesModule.tsx`, `CODIGOS_DESCUENTO`): `ESTUDIANTE` (-10%) /
  `ADULTOMAYOR` (-20%) sobre `VALOR_TIQUETE_BASE`. `DataContext.venderTiquete` acepta un
  `descuentoPorcentaje` opcional (por defecto 0) para aplicarlo al `monto_total` real de la factura.
- **Cubicaje / peso volumétrico** (`MensajeriaModule.tsx`, `DIVISOR_VOLUMETRICO = 5000`): convención
  estándar de mensajería (largo × ancho × alto en cm ÷ 5000 = kg). Solo se persiste el mayor entre
  peso real y volumétrico en `GUIA_ENVIO.peso_kg` — no se agregan columnas nuevas al modelo.

## Datos y backend

Todo el estado (clientes, tiquetes, facturas, guías, remesas) vive en memoria y se persiste solo en el
`localStorage` del navegador vía `useLocalStorage` — **no hay backend real todavía**. Un par de reglas de
negocio (tarifa por kg, penalidad de reprogramación, vigencia de tiquete abierto) usan valores de
demostración porque el brief exige que existan como campos parametrizables pero no fija su valor exacto;
están señalados con comentarios `// Nota:` en `DataContext.tsx`.

## Logo de la empresa

El sidebar busca `/assets/logo-copetran.png` (carpeta `public/assets/`, que no existe todavía en el
repo). Mientras no se agregue esa imagen, `CompanyLogo.tsx` degrada automáticamente a un ícono de
bus sobre fondo oscuro — no hace falta ningún cambio de código para activar el logo real, solo
colocar el archivo en `frontend/public/assets/logo-copetran.png`.
