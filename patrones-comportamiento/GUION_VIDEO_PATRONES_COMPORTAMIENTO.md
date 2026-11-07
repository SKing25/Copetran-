# Guion Oficial de Sustentación en Video — Patrones de Comportamiento (Copetran S.A.)

- **Institución:** Universidad Sergio Arboleda — Escuela Mayor de Ingeniería, Informática y Ciencias Básicas
- **Asignatura:** Patrones de Diseño de Software / Construcción de Software II (SIST0076-G02)
- **Docente:** Ing. José Marcial Téllez Gómez
- **Documento sincronizado en pantalla:** `CR3_Patrones_Comportamiento_Copetran_APA7.docx` (**31 páginas**, con diagramas UML en formato horizontal y código a página completa)
- **Enlace de YouTube al video final:** `https://youtu.be/PEGA_AQUI_EL_ENLACE_FINAL`
- **Requisito obligatorio de cámaras:** Los **tres integrantes** participan equitativamente en la sustentación y mantienen su **cámara encendida permanentemente** de principio a fin:
  1. **Integrante 1:** Santiago José Rodríguez Gutiérrez (~4 min 15 s — **cámara encendida**)
  2. **Integrante 2:** Nicolás Pérez Chuscano (~4 min 30 s — **cámara encendida**)
  3. **Integrante 3:** Camilo Andrés Díaz García (~4 min 15 s — **cámara encendida**)
  4. **Cierre grupal:** Los tres integrantes juntos en cámara (~0 min 45 s)
- **Duración total estimada:** 13 minutos 45 segundos
- **Enfoque de grabación:** Explicación técnica formal proyectando el **Documento Word en pantalla**, el **código fuente en VS Code** y la **ejecución verificable por consola y pruebas automatizadas** (sin narrar interacciones de interfaz web de usuario).

---

## Tabla Resumen de Tiempos, Cámaras y Páginas del Word por Sección

| Bloque | Sección del Video | Expositor (Cámara Encendida) | En Pantalla | Tiempo | Rango |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **1** | Presentación, continuidad modular y Proceso C (Mensajería) | **Santiago Rodríguez** *(cámara ON)* | Documento Word: Págs. 1 y 3 + Explorador VS Code | 01:30 | 00:00 – 01:30 |
| **2** | Análisis de subprocesos y justificación de los 4 patrones | **Santiago Rodríguez** *(cámara ON)* | Documento Word: Pág. 4 (Tabla 1) y Pág. 5 (Fig. 1 Horiz.) | 01:15 | 01:30 – 02:45 |
| **3** | Patrón 1 (Implementado): *Chain of Responsibility* (UML y Código) | **Santiago Rodríguez** *(cámara ON)* | Documento Word: Págs. 6–10 + `chain_of_responsibility.py` | 01:30 | 02:45 – 04:15 |
| **4** | Patrón 2 (Implementado): *State* (UML y Código) | **Nicolás Pérez** *(cámara ON)* | Documento Word: Págs. 13–18 + `state.py` | 02:00 | 04:15 – 06:15 |
| **5** | Patrones 3 y 4 (Subprocesos de Diseño): *Iterator* y *Memento* | **Nicolás Pérez** *(cámara ON)* | Documento Word: Págs. 21–26 (Tablas, UML y Código Ref.) | 02:30 | 06:15 – 08:45 |
| **6** | Arquitectura Tres Capas / MVC y separación de paquetes | **Camilo Díaz** *(cámara ON)* | Documento Word: Págs. 27–29 (Fig. 19 Horiz. y Código DAO) | 01:45 | 08:45 – 10:30 |
| **7** | Demostración de ejecución técnica, semántica HTTP y pruebas | **Camilo Díaz** *(cámara ON)* | Documento Word: Págs. 11, 19 + Terminal (`main.py --demo` y tests) | 02:30 | 10:30 – 13:00 |
| **8** | Conclusiones finales y cierre del equipo | **Santiago, Nicolás y Camilo** *(3 cámaras ON)* | Documento Word: Págs. 30 y 31 (Conclusiones y Referencias) | 00:45 | 13:00 – 13:45 |

---

## Preparación Técnica Antes de Grabar

1. **Cámaras web:** Configurar la cuadrícula o recuadro lateral en la plataforma de grabación (OBS / Zoom / Teams) de modo que los tres integrantes estén visibles con **cámara encendida** durante toda la presentación.
2. **Documento Word:** Tener abierto `CR3_Patrones_Comportamiento_Copetran_APA7.docx` a pantalla completa en la **Página 1**, listo para desplazarse hacia las secciones indicadas en cada bloque.
3. **VS Code:** Tener abierto el proyecto en la raíz mostrando la separación de carpetas (`patrones-creacionales/`, `patrones-comportamiento/` y `frontend/`) y los archivos clave:
   - `patrones-comportamiento/mensajeria/model/patterns/chain_of_responsibility.py`
   - `patrones-comportamiento/mensajeria/model/patterns/state.py`
   - `patrones-comportamiento/mensajeria/controller/mensajeria_controller.py`
   - `patrones-comportamiento/servidor_api.py`
4. **Terminal:** Tener abierta la consola en la carpeta `patrones-comportamiento/` con los comandos listos para ejecutar la demostración por consola (`python3 main.py --demo`) y la suite automatizada (`python3 -m unittest discover -s tests -v`).

---

## Desarrollo Textual Completo del Guion (Listo para Leer)

### Bloque 1. Introducción, Continuidad del Proyecto y Proceso C (00:00 – 01:30)
- **Expositor:** Santiago José Rodríguez Gutiérrez *(cámara encendida visible en pantalla)*
- **En pantalla:** 
  - **00:00 – 00:45:** Documento Word — **Página 1** (Portada APA 7 con título oficial, datos académicos y campo del enlace de YouTube).
  - **00:45 – 01:30:** Documento Word — **Página 3** (Continuidad y supuestos operativos) y cambio rápido a VS Code mostrando la raíz del proyecto.

**Texto para decir:**
> "Un cordial saludo, profesor José Marcial y compañeros. Somos el equipo conformado por Nicolás Pérez Chuscano, Camilo Andrés Díaz García y quien les habla, Santiago José Rodríguez Gutiérrez. En cumplimiento estricto de las directrices de evaluación, los tres integrantes participamos activamente a lo largo de toda esta sustentación con nuestras cámaras encendidas de principio a fin.
>
> En esta tercera entrega damos continuidad formal al desarrollo orientado a objetos para la empresa de transportes y mensajería Copetran S.A. En la fase anterior resolvimos el proceso de venta de pasajes intermunicipales implementando cinco patrones creacionales en Python. En esta nueva etapa abordamos el Proceso C de la organización: la gestión integral de mensajería expresa, transporte de encomiendas, cálculo de cubicaje volumétrico, liquidación de seguros y control del ciclo operativo de los paquetes. 
>
> Como observamos en la estructura del repositorio en pantalla, mantuvimos una arquitectura limpia y separada físicamente por carpetas: la carpeta `patrones-creacionales` conserva intactos los patrones previos, la carpeta `patrones-comportamiento` concentra la nueva lógica de encomiendas y el gateway de servicios, y la carpeta `frontend` aloja la aplicación cliente, asegurando que todos los patrones convivan armónicamente en una sola solución ejecutable sin duplicar archivos."

---

### Bloque 2. Análisis del Proceso y Articulación de los 4 Patrones (01:30 – 02:45)
- **Expositor:** Santiago José Rodríguez Gutiérrez *(cámara encendida visible en pantalla)*
- **En pantalla:** Documento Word — **Página 4** (Tabla 1: Matriz de trazabilidad) y **Página 5 en formato horizontal** (Figura 1: Diagrama integral de los cuatro subprocesos de la empresa).

**Texto para decir:**
> "Pasando a las páginas cuatro y cinco de nuestro documento, analizamos detalladamente el flujo operativo de una encomienda en Copetran. Para estructurar este proceso evaluamos cuatro patrones de comportamiento: Chain of Responsibility, State, Iterator y Memento. Como establece la guía académica, analizamos y diseñamos un subproceso para cada uno de los cuatro patrones, e implementamos funcionalmente dos de ellos en la aplicación integrada: Chain of Responsibility y State.
>
> En el diagrama panorámico de la página cinco observamos cómo se articulan los cuatro momentos del negocio:
>
> Primero, en la etapa previa de programación y edición de solicitudes de recogida a domicilio, los coordinadores logísticos modifican horarios, direcciones y furgones asignados. Para permitir deshacer cambios erróneos sin violar el encapsulamiento de la entidad, diseñamos el subproceso con el patrón **Memento**.
>
> Segundo, cuando el paquete ingresa a la agencia o terminal, debe someterse a una tubería secuencial y obligatoria de validaciones que incluye cobertura geográfica, pesaje con cubicaje volumétrico y contratación de póliza aseguradora para mercancías de alto valor antes de autorizar la emisión de la guía. Este subproceso lo implementamos completamente mediante el patrón **Chain of Responsibility**.
>
> Tercero, una vez emitida la guía, el paquete inicia su viaje físico. Su comportamiento ante eventos como el despacho, el reporte de incidencias en carretera o la entrega final varía radicalmente según su situación actual. Este ciclo de vida lo implementamos con el patrón **State**.
>
> Y cuarto, en las bodegas de consolidación de remesas y manifiestos de despacho, los supervisores requieren recorrer colecciones de envíos aplicando filtros específicos —como separar primero la carga perecedera— sin acoplarse a la estructura interna de almacenamiento de la remesa. Para este subproceso diseñamos el patrón **Iterator**."

---

### Bloque 3. Patrón 1 (Implementado): Chain of Responsibility (02:45 – 04:15)
- **Expositor:** Santiago José Rodríguez Gutiérrez *(cámara encendida visible en pantalla)*
- **En pantalla:** 
  - **02:45 – 03:25:** Documento Word — **Página 6** (Explicación conceptual y Tabla 2 de participantes) y **Página 7 en formato horizontal** (Figura 2: Diagrama de Clases UML de Chain of Responsibility).
  - **03:25 – 04:15:** VS Code abierto en `patrones-comportamiento/mensajeria/model/patterns/chain_of_responsibility.py` y `mensajeria_controller.py` (correspondiente a las **Páginas 8, 9 y 10** del Word).

**Texto para decir:**
> "Entre las páginas seis y diez documentamos el primer patrón implementado: Chain of Responsibility. Conceptualmente, este patrón desacopla al emisor de una solicitud respecto de sus receptores, encadenando múltiples manejadores donde cada uno decide si procesa y delega la petición o si corta el flujo inmediatamente. En la admisión de encomiendas de Copetran, resuelve el problema de tener un bloque monolítico lleno de condicionales anidados, cumpliendo los principios de Responsabilidad Única y Abierto/Cerrado.
>
> En nuestro diagrama de clases de la página siete vemos sus participantes: la clase abstracta `ManejadorAdmisionEnvio` asume el rol de Handler, almacenando la referencia polimórfica `_siguiente` y definiendo el contrato `validar`. De ella heredan tres eslabones concretos:
>
> El primer eslabón, `ValidadorDatosYCoberturaHandler`, normaliza las cadenas y comprueba que remitente y destinatario sean distintos y que la ruta entre ciudades pertenezca a los siete corredores autorizados de Copetran.
>
> El segundo eslabón, `ValidadorPesoYCubicajeHandler`, aplica la fórmula sectorial de cubicaje: largo por ancho por alto sobre cinco mil, y evalúa el mayor entre peso real y volumétrico frente al tope de la categoría, como treinta y cinco kilos en carga frágil o veinticinco en perecedera.
>
> Y el tercer eslabón, `LiquidadorTarifaYPolizaHandler`, exige obligatoriamente póliza aseguradora del uno punto cinco por ciento cuando el valor declarado excede los dos millones de pesos, liquidando finalmente el flete exacto. 
>
> Como observamos en el código fuente en pantalla, el controlador `MensajeriaController` ensambla la cadena de forma fluida. Si cualquiera de los eslabones detecta un incumplimiento, detiene el procesamiento y registra el motivo exacto en el objeto `ResultadoValidacionCadena`. Le cedo la palabra a mi compañero Nicolás para explicar el patrón State y los subprocesos de diseño."

---

### Bloque 4. Patrón 2 (Implementado): Patrón State (04:15 – 06:15)
- **Expositor:** Nicolás Pérez Chuscano *(cámara encendida visible en pantalla)*
- **En pantalla:** 
  - **04:15 – 05:00:** Documento Word — **Página 13** (Explicación conceptual y Tabla 3 de participantes) y **Página 14 en formato horizontal** (Figura 8: Diagrama de Clases UML del patrón State).
  - **05:00 – 06:15:** VS Code abierto en `patrones-comportamiento/mensajeria/model/patterns/state.py` y `mensajeria/model/exceptions.py` (correspondiente a las **Páginas 15 a 18** del Word).

**Texto para decir:**
> "Muchas gracias, Santiago. Continuando en las páginas trece a dieciocho de nuestro documento, abordamos el segundo patrón implementado en el sistema: el patrón State. Este patrón permite que un objeto altere su comportamiento cuando cambia su estado interno, aparentando cambiar de clase. En el transporte de encomiendas de Copetran, una guía atraviesa cinco estados: `ADMITIDO`, `EN_TRANSITO`, `BODEGA_DESTINO`, `NOVEDAD` y `ENTREGADO`. Sin este patrón, tendríamos sentencias `if` y `elif` esparcidas por todo el sistema, con el grave riesgo de permitir transiciones ilegales, como entregar un paquete que continúa en viaje troncal o alterar una guía ya cerrada.
>
> En el diagrama UML de la página catorce apreciamos la estructura del patrón: `GuiaEnvioContext` funge como Context, conservando los datos fiscales, la bitácora con marcas de tiempo y la referencia a la interfaz abstracta `EstadoGuia`. Para lograr una delegación polimórfica pura y eliminar cualquier fuga de condicionales en la capa de control, implementamos el método `solicitar_transicion` dentro de la jerarquía de estados.
>
> Como vemos en el código de `state.py`, definimos cinco clases de estado concreto:
> - `EstadoAdmitido` autoriza únicamente el despacho a ruta nacional o el reporte de novedad inicial, pero bloquea el arribo directo o la entrega anticipada.
> - `EstadoEnTransito` permite el arribo a la terminal de destino o el reporte de incidencias en carretera, pero impide la entrega sin recepción física previa.
> - `EstadoBodegaDestino` autoriza reportar novedades de última milla o confirmar la entrega final exigiendo documento de identidad y firma del destinatario.
> - `EstadoNovedad` retiene operativamente el envío; sobrescribe `solicitar_transicion` para resolver la incidencia reanudando hacia tránsito o bodega, pero bloquea tajantemente cualquier intento de entrega.
> - Y `EstadoEntregado` actúa como estado terminal inmutable, rechazando de forma definitiva cualquier cambio posterior.
>
> Si una transición no es legal según las reglas del estado activo, el objeto lanza de inmediato nuestra excepción de dominio `TransicionInvalidaError`, blindando por completo la integridad de la máquina de estados."

---

### Bloque 5. Patrones 3 y 4 (Subprocesos de Diseño): Iterator y Memento (06:15 – 08:45)
- **Expositor:** Nicolás Pérez Chuscano *(cámara encendida visible en pantalla)*
- **En pantalla:** 
  - **06:15 – 07:30:** Documento Word — **Páginas 21, 22 y 23** (Subproceso C.3 `Iterator`: justificación, Tabla 4, Figura 12 UML a página completa y Figura 13 código Python de referencia).
  - **07:30 – 08:45:** Documento Word — **Páginas 24, 25 y 26** (Subproceso C.4 `Memento`: justificación, Tabla 5, Figura 14 UML a página completa y Figura 15 código Python de referencia).

**Texto para decir:**
> "Avanzando hacia las páginas veintiuno a veintiséis, explicamos los dos patrones correspondientes a los subprocesos de diseño no implementados en la aplicación ejecutable: Iterator y Memento, presentando para cada uno su análisis, participantes, diagrama de clases UML y código de referencia en Python.
>
> En la página veintiuno detallamos el patrón **Iterator**, aplicado al subproceso de consolidación y auditoría de manifiestos de remesa en bodega. En un centro logístico, una remesa agrupa decenas de paquetes con distintas prioridades. Si el despachador necesita procesar primero la carga perecedera hacia una ciudad específica, acceder directamente a la lista o árbol interno de la remesa rompería el encapsulamiento. El patrón Iterator resuelve esto abstrayendo el recorrido a través de una interfaz estándar. 
>
> En el diagrama UML de la página veintidós definimos la interfaz `IteradorGuias` como Iterator, `IteradorPerecederosRuta` como ConcreteIterator que aplica el filtro sin mutar los datos, `ColeccionManifiesto` como Aggregate y `ManifiestoBodega` como ConcreteAggregate. En la página veintitrés presentamos su implementación de referencia en Python, demostrando cómo el cliente `CoordinadorDespachoClient` recorre secuencialmente la carga mediante métodos estándar como `tiene_siguiente` y `siguiente` sin acoplarse a la estructura interna.
>
> Ahora, en la página veinticuatro, abordamos el patrón **Memento**, aplicado a la edición y reversión de solicitudes de recogida a domicilio. Cuando un cliente solicita un servicio, el operador programa dirección, franja horaria y furgón. Si se comete un error en la digitación o el cliente pide cancelar un cambio antes de confirmarlo, el sistema debe restaurar el estado previo exacto sin hacer públicos los atributos privados de la entidad.
>
> Como observamos en el diagrama de clases de la página veinticinco, el participante Originator es la clase `SolicitudRecogidaOriginator`, que genera instantáneas de sí misma en el método `guardar_memento` y se restaura en `restaurar_memento`. La clase `SnapshotSolicitudMemento` actúa como Memento; nótese en el código de la página veintiséis que la declaramos con `@dataclass(frozen=True)`, garantizando que una vez creada la instantánea sea inmutable en memoria. Finalmente, `HistorialCambiosCaretaker` administra la pila LIFO de versiones mediante operaciones de respaldo y deshacer, protegiendo la entidad. Con esto cubrimos el diseño de los cuatro patrones, y le doy paso a Camilo para explicar la arquitectura y la ejecución del sistema."

---

### Bloque 6. Arquitectura Tres Capas / MVC y Separación Modular (08:45 – 10:30)
- **Expositor:** Camilo Andrés Díaz García *(cámara encendida visible en pantalla)*
- **En pantalla:** 
  - **08:45 – 09:35:** Documento Word — **Página 27** (Tabla 6 de capas) y **Página 28 en formato horizontal** (Figura 19: Diagrama General de Arquitectura MVC / Tres Capas).
  - **09:35 – 10:30:** VS Code mostrando `servidor_api.py`, `validacion.py` y `mensajeria/model/repository.py` (correspondiente a la **Página 29** del Word).

**Texto para decir:**
> "Muchas gracias, Nicolás. En las páginas veintisiete a veintinueve de nuestro informe exponemos la arquitectura integrada de la aplicación, diseñada combinando el patrón arquitectónico Modelo-Vista-Controlador con una estructura estricta de Tres Capas. Un aspecto fundamental de nuestra solución es que resolvimos el desafío de ingeniería de mantener separados los módulos en el backend sin duplicar código ni acoplar las capas.
>
> En el diagrama arquitectónico de la página veintiocho observamos claramente la distribución:
>
> 1. En la **Capa de Presentación o Vista**, ubicada en la carpeta `frontend`, tenemos los componentes cliente construidos en React y TypeScript, los cuales consumen los servicios backend mediante peticiones HTTP asíncronas en formato JSON estructurado.
>
> 2. En la **Capa de Negocio y Control**, ubicada en `patrones-comportamiento`, disponemos de un gateway REST en Flask dentro de `servidor_api.py` y el módulo `validacion.py`. Este validador actúa como frontera defensiva, comprobando tipos numéricos, rangos no negativos y catálogos válidos antes de que la petición toque el dominio. El servidor delega en dos controladores independientes: `VentaTiqueteController` en la carpeta de creacionales y `MensajeriaController` en la carpeta de comportamiento.
>
> Cuando `MensajeriaController` aprueba una admisión mediante Chain of Responsibility, no reinventa la numeración ni la facturación: importa limpiamente desde `patrones-creacionales` el Singleton `SecuenciadorTiquetes` para asignar el consecutivo único con prefijo `GU`, y la fábrica abstracta `FabricaCanalVenta` para emitir la factura fiscal correspondiente según el canal de venta.
>
> 3. En la **Capa de Modelo y Persistencia**, aislamos completamente el almacenamiento mediante el patrón DAO a través de la interfaz abstracta `IGuiaEnvioDAO` y su implementación `GuiaEnvioMemoriaDAO`. Esto asegura que el negocio dependa de abstracciones y no de un motor de persistencia específico, respetando el Principio de Inversión de Dependencias."

---

### Bloque 7. Demostración de Ejecución Técnica, Semántica HTTP y Pruebas (10:30 – 13:00)
- **Expositor:** Camilo Andrés Díaz García *(cámara encendida visible en pantalla)*
- **En pantalla:** 
  - **10:30 – 11:15:** Documento Word — **Páginas 11, 12, 19 y 20** (Evidencias fotográficas de ejecución documentadas en el informe).
  - **11:15 – 12:15:** Terminal en pantalla ejecutando la demostración de consola:
    ```bash
    python3 main.py --demo
    ```
  - **12:15 – 13:00:** Terminal ejecutando las suites automatizadas de pruebas unitarias:
    ```bash
    python3 -m unittest discover -s tests -v
    cd ../patrones-creacionales && python3 -m unittest discover -s tests -v
    ```

**Texto para decir:**
> "Pasemos ahora a la comprobación técnica de la ejecución. En el informe documentamos con evidencias a página completa en las páginas once, doce, diecinueve y veinte tanto los casos exitosos como los bloqueos previstos por los patrones. 
>
> Para apreciar el comportamiento interno sin depender de interfaces de usuario, ejecutemos en terminal nuestro script de demostración `python3 main.py --demo`. Observemos en la salida cómo se manifiestan las reglas:
>
> En la primera fase, probamos **Chain of Responsibility**:
> - En el Caso 1A, enviamos un paquete con destino a Leticia: `ValidadorDatosYCoberturaHandler` detecta la falta de cobertura y detiene la cadena inmediatamente en el primer eslabón, devolviendo error de regla de negocio sin procesar cálculos posteriores.
> - En el Caso 1B, enviamos mercancía perecedera con treinta y un kilos: el primer eslabón aprueba la ruta Bogotá-Bucaramanga, pero el segundo eslabón, `ValidadorPesoYCubicajeHandler`, detiene el trámite porque supera el tope de veinticinco kilos.
> - En el Caso 1C, declaramos un valor de tres millones quinientos mil pesos sin póliza: superamos cobertura y cubicaje, pero el tercer eslabón, `LiquidadorTarifaYPolizaHandler`, bloquea la admisión exigiendo el seguro de alto valor.
> - En el Caso 1D, activamos la póliza: los tres eslabones aprueban, se calcula el flete en ochenta y dos mil setecientos cuarenta pesos, se emite factura fiscal y nace la guía `GU-00001` en estado `ADMITIDO`.
>
> En la segunda fase, probamos el patrón **State** sobre esa misma guía `GU-00001`:
> - Si forzamos una entrega directa estando recién admitida, `EstadoAdmitido` lanza `TransicionInvalidaError` bloqueando la operación.
> - La despachamos legalmente hacia `EN_TRANSITO` y luego reportamos una `NOVEDAD` por cierre vial. Si aquí intentamos confirmar entrega, `EstadoNovedad` vuelve a bloquear la acción protegiendo la invariante del paquete retenido.
> - Una vez levantada la novedad, reanudamos hacia `BODEGA_DESTINO` y finalmente confirmamos `ENTREGADO` registrando cédula y firma. Si intentamos reportar una novedad sobre la guía ya cerrada, `EstadoEntregado` la rechaza por ser un estado terminal inmutable.
>
> Además, como vemos ahora al ejecutar `unittest`, contamos con una suite completa de trece pruebas automatizadas que verifican la semántica estricta de códigos HTTP: doscientos para trámites exitosos, cuatrocientos para entradas corruptas, cuatrocientos cuatro para guías inexistentes en el DAO, cuatrocientos nueve para bloqueos del patrón State y cuatrocientos veintidós para rechazos en Chain of Responsibility, junto con los tests del módulo creacional."

---

### Bloque 8. Conclusiones Finales y Cierre del Equipo (13:00 – 13:45)
- **Expositores:** Santiago Rodríguez, Nicolás Pérez y Camilo Díaz *(los tres integrantes en pantalla con **cámara encendida**)*
- **En pantalla:** Documento Word — **Páginas 30 y 31** (Conclusiones de ingeniería, enlace de YouTube y Referencias en formato APA 7).

**Texto para decir:**
- **Santiago Rodríguez *(cámara encendida)*:**
  > "Para concluir nuestra sustentación, como sintetizamos en la página treinta del documento, la aplicación de patrones de comportamiento sobre el sistema de mensajería de Copetran S.A. demostró que es posible resolver flujos transaccionales complejos manteniendo una arquitectura desacoplada, escalable y mantenible."
- **Nicolás Pérez *(cámara encendida)*:**
  > "Chain of Responsibility nos proporcionó una tubería extensible donde añadir nuevas reglas de cubicaje o normativas aduaneras solo requiere agregar un nuevo manejador sin modificar los existentes; mientras que State blindó las transiciones operativas eliminando condicionales frágiles, respaldado por el diseño riguroso de Iterator y Memento."
- **Camilo Díaz *(cámara encendida)*:**
  > "Y la arquitectura de tres capas y MVC unificó en una sola aplicación ejecutable los patrones creacionales y de comportamiento con persistencia desacoplada y verificación automatizada. En la página uno y veintiséis del documento dejamos consignado el enlace final de YouTube. Muchas gracias por su atención."

---

## Registro Oficial del Enlace de YouTube

> **Nota final para la entrega:** Una vez finalizada la grabación y subido el video a YouTube (en modo público o no listado), se debe reemplazar este marcador tanto en este archivo como en las páginas **1** y **26** del documento Word `CR3_Patrones_Comportamiento_Copetran_APA7.docx`:
>
> **URL Oficial del Video:** `https://youtu.be/PEGA_AQUI_EL_ENLACE_FINAL`
