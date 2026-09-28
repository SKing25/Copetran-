# Copetran S.A. — Sistema Integral de Venta y Emisión de Tiquetes de Pasajeros
## Implementación de Patrones Creacionales en Arquitectura MVC / Tres Capas (Corte 2 - Tarea 2)

**Universidad Sergio Arboleda**  
**Ingeniería de Sistemas y Telecomunicaciones**  
**Diseño de Patrones de Software**  

**Integrantes:**
- Santiago José Rodríguez Gutiérrez
- Nicolás Pérez Chuscano
- Camilo Andrés Díaz García

**Fecha de Entrega:** Bogotá D.C., 28 de septiembre de 2026

---

## 1. Descripción del Proyecto y Proceso Seleccionado

Este proyecto implementa formalmente el **Proceso A: Venta y Emisión de Tiquetes de Pasajeros** de la empresa transportadora **COPETRAN S.A.**, integrando de manera sinérgica los **cinco (5) patrones de diseño creacionales** fundamentales bajo una estricta arquitectura en **tres capas / Modelo-Vista-Controlador (MVC)**.

### Los 5 Patrones Creacionales Implementados:
1. **The Builder (`OperarioRutasDirector`, `ViajeProgramadoBuilderImpl`, `ViajeBuilder`):** Ensambla de manera secuencial y desacoplada el objeto complejo `ViajeProgramado` (ruta, autobús de dos pisos, tripulación reglamentaria doble: principal y relevo, horarios de salida y matriz de 60 asientos diferenciados por clase: VIP Cama en piso 1 y Confort en piso 2).
2. **The Prototype (`PrototipoClonable`, `ViajePlantillaClonable`, `CatalogoPlantillasViaje`, `TiqueteAbiertoPrototipo`):** Permite clonar instantáneamente itinerarios recurrentes mediante copia profunda (*deep copy*), duplicando los 60 asientos y restableciendo su estado a `DISPONIBLE`, además de soportar la reprogramación de tiquetes abiertos (Proceso G) preservando el historial del pasajero.
3. **The Singleton (`GestorBloqueoSillas`, `SecuenciadorTiquetes`):** Proporciona un árbitro centralizado y concurrente (*thread-safe*) con temporizadores TTL de 180 segundos (3 minutos) cumpliendo con el requisito RF03 para evitar la doble venta simultánea de sillas entre canales, junto a un generador correlativo atómico de consecutivos de tiquete para cumplimiento tributario.
4. **The Factory Method (`FabricaTarifa`, `FabricaTarifaImpl`, jerarquía de `Tarifa`):** Desacopla la lógica de instanciación de tarifas aplicando validaciones de elegibilidad legal y soportes documentales en tiempo de ejecución (Tarifa Plena 100%, Tarifa Adulto Mayor con 25% de descuento por Ley 1251, Tarifa Estudiante con 20% de descuento validando carné vigente, y Tarifa Infante con 50% de descuento).
5. **The Abstract Factory (`FabricaCanalVenta`, `FabricaTaquilla`, `FabricaWeb`, `FabricaAgenciaAliada`):** Produce familias de componentes coherentes e interoperables según el canal comercial de venta (Taquilla Física, Portal Web / App Móvil y Agencia Aliada B2B), coordinando procesadores de pago, emisores de factura (tirilla POS, electrónica con CUFE DIAN, y por lote), pases de abordaje y componentes de bloqueo.

---

## 2. Arquitectura del Software (MVC / Tres Capas)

El sistema implementa una separación de responsabilidades estricta:
- **Capa de Modelo (`copetran/model/`):** Contiene las entidades de dominio puro (`Pasajero`, `Silla`, `Ruta`, `Conductor`, `Bus`, `Factura`, `Tiquete`) y los paquetes de los patrones creacionales (`copetran/model/patterns/`).
- **Capa de Controlador (`copetran/controller/`):** La clase central `VentaTiqueteController` orquesta el flujo de negocio, actuando como árbitro entre la interfaz de usuario y la lógica de dominio.
- **Capa de Vista (`copetran/view/`):** 
  - **`tkinter_view.py` (Interfaz Gráfica Tkinter):** Vista principal con mapa de asientos interactivo para buses de 2 pisos (60 sillas: VIP y Confort), selección dinámica de tarifas, temporizadores regresivos en tiempo real para bloqueos (180s - RF03), selector multicanal y modales oficiales con QR simulado y datos DIAN.
  - **`consola_view.py`:** Vista complementaria por terminal para entornos sin interfaz gráfica.

---

## 3. Estructura de Directorios

```text
patrones-creacionales/ (Copetran-CR2-T2-Python/)
├── copetran/
│   ├── __init__.py
│   ├── controller/
│   │   ├── __init__.py
│   │   └── venta_controller.py      # Clase de Control Central MVC
│   ├── model/
│   │   ├── __init__.py
│   │   ├── entities.py              # Entidades y Enums del Dominio
│   │   └── patterns/
│   │       ├── __init__.py
│   │       ├── builder.py           # Patrón Builder
│   │       ├── prototype.py         # Patrón Prototype
│   │       ├── singleton.py         # Patrón Singleton
│   │       ├── factory_method.py    # Patrón Factory Method
│   │       └── abstract_factory.py  # Patrón Abstract Factory
│   └── view/
│       ├── __init__.py
│       ├── tkinter_view.py          # Capa de Vista Gráfica Nativa (Tkinter)
│       └── consola_view.py          # Capa de Vista por Consola (CLI)
├── tests/
│   ├── __init__.py
│   └── test_patrones.py             # Suite de Pruebas Unitarias Automatizadas
├── main.py                          # Lanzador Principal Universal (Inicia la Interfaz Gráfica Tkinter)
├── run_gui.py                       # Lanzador Directo de la Interfaz Gráfica Tkinter
├── run.py                           # Demostrador Secuencial por Consola
└── README.md                        # Documentación Técnica
```

---

## 4. Requisitos y Ejecución

### Requisitos del Entorno:
- Python 3.10 o superior (compatible con Python 3.11, 3.12, 3.13).
- Tkinter (incluido por defecto en la instalación estándar de Python).
- No requiere librerías externas.

### Ejecución de la Interfaz Gráfica Tkinter (Modo Recomendado):
```bash
python3 main.py
```
*(O también: `python3 run_gui.py`)*

### Ejecución de la Demostración por Consola:
```bash
python3 run.py
```

### Ejecución de Pruebas Unitarias Automatizadas:
```bash
python3 -m unittest discover tests
```

---
*COPETRAN S.A. — Sistema Desarrollado para Diseño de Patrones de Software.*
