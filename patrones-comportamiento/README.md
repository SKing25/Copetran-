# Copetran S.A. — Patrones de Comportamiento + Integración Full-Stack con React

Este directorio contiene la iteración de **Patrones de Diseño de Comportamiento** (`Chain of Responsibility` y `State`) para la empresa de mensajería y transportes **Copetran S.A.**, manteniendo **separados por carpetas** los patrones creacionales (`../patrones-creacionales/`) y los de comportamiento (`./mensajeria/`), y conectando ambos subsistemas a una sola aplicación web ejecutable en React (`../frontend/`) bajo arquitectura de **Tres Capas / MVC**.

## Estructura de Entregables en esta Carpeta

- `CR3_Patrones_Comportamiento_Copetran_APA7.docx`: Documento oficial en normas APA 7.ª edición (27 páginas, con justificación de los 2 patrones elegidos, diagramas UML en formato horizontal 100 % fieles al código real y pantallazos a página completa).
- `GUION_VIDEO_PATRONES_COMPORTAMIENTO.md`: Guion textual completo para los 3 integrantes (con participación equitativa, cámara encendida obligatoria, páginas exactas del Word y sección para el enlace final de YouTube).
- `capturas/`: Carpeta con los 18 diagramas UML y pantallazos en alta resolución del código fuente documentado y de la ejecución real en React y consola.
- `mensajeria/`: Paquete Python organizado por capas (`model/entities.py`, `model/exceptions.py`, `model/repository.py`, `model/patterns/chain_of_responsibility.py`, `model/patterns/state.py`, `controller/validacion.py`, `controller/mensajeria_controller.py`).
- `servidor_api.py` y `main.py`: Gateway REST en Flask que une `frontend/` con `patrones-comportamiento/` y `patrones-creacionales/`.
- `tests/test_comportamiento.py`: Suite automatizada de pruebas unitarias y de integración HTTP (`200`, `400`, `404`, `409`, `422`).

## Cómo Ejecutar la Aplicación Integrada (Python + React)

1. **Terminal 1 — Iniciar el backend Python unificado (`http://127.0.0.1:5000`):**
   ```bash
   cd patrones-comportamiento
   python3 main.py
   ```
2. **Terminal 2 — Iniciar el frontend en React (`http://localhost:5173`):**
   ```bash
   cd frontend
   npm run dev
   ```
   Ingresar en `http://localhost:5173/login` como **Operario de Bodega** o **Cajero** para probar **Módulo de Mensajería (ECU-02)** y **Módulo de Tiquetes (ECU-01)**.

## Cómo Ejecutar las Pruebas Automatizadas y la Demo de Consola

```bash
cd patrones-comportamiento
python3 -m unittest discover -s tests -v
python3 main.py --demo
```
