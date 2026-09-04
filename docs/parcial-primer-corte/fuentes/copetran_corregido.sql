/* ============================================================================
   COPETRAN – SISTEMA INTEGRAL DE TRANSPORTE DE PASAJEROS, CARGA Y NÓMINA
   Motor: Microsoft SQL Server (T-SQL)
   Incluye: Módulos Operativos, Logística, TIC y Triggers de Nómina
   ============================================================================ */

IF DB_ID('COPETRAN') IS NOT NULL
BEGIN
    ALTER DATABASE COPETRAN SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE COPETRAN;
END
GO

CREATE DATABASE COPETRAN;
GO

USE COPETRAN;
GO

/* ============================================================================
   MÓDULO 0 – MULTITABLA DE PARÁMETROS
   ============================================================================ */

CREATE TABLE MULTITABLA_PARAMETRO (
    id_parametro   INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    concepto       VARCHAR(50)    NOT NULL,
    codigo         VARCHAR(25)    NOT NULL,
    descripcion    VARCHAR(100)   NOT NULL,
    estado         VARCHAR(10)    NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT uq_parametro_concepto_codigo UNIQUE (concepto, codigo)
);
GO

INSERT INTO MULTITABLA_PARAMETRO (concepto, codigo, descripcion) VALUES
('TIPO_DOCUMENTO', 'CC', 'Cédula de Ciudadanía'),
('TIPO_DOCUMENTO', 'TI', 'Tarjeta de Identidad'),
('TIPO_DOCUMENTO', 'CE', 'Cédula de Extranjería'),
('TIPO_DOCUMENTO', 'PAS', 'Pasaporte'),
('TIPO_DOCUMENTO', 'NIT', 'Número de Identificación Tributaria'),
('TIPO_CONTRATO', 'INDEFINIDO', 'Término Indefinido'),
('TIPO_CONTRATO', 'FIJO', 'Término Fijo'),
('TIPO_CONTRATO', 'PRESTACION', 'Prestación de Servicios'),
('TIPO_NOVEDAD', 'HORA_EXTRA_DIURNA', 'Hora Extra Diurna'),
('TIPO_NOVEDAD', 'HORA_EXTRA_NOCTURNA', 'Hora Extra Nocturna'),
('TIPO_NOVEDAD', 'RECARGO_NOCTURNO', 'Recargo Nocturno'),
('TIPO_NOVEDAD', 'LLEGADA_TARDE', 'Llegada Tarde'),
('TIPO_NOVEDAD', 'INASISTENCIA', 'Inasistencia Injustificada'),
('TIPO_NOVEDAD', 'INCAPACIDAD', 'Incapacidad Médica'),
('TIPO_MANTENIMIENTO', 'PREVENTIVO', 'Mantenimiento Preventivo Periódico'),
('TIPO_MANTENIMIENTO', 'CORRECTIVO', 'Reparación Correctiva por Falla'),
('TIPO_MANTENIMIENTO', 'ALISTAMIENTO', 'Alistamiento Preoperacional'),
('UBICACION_SILLA', 'VENTANA', 'Ventana'),
('UBICACION_SILLA', 'PASILLO', 'Pasillo'),
('CANAL_VENTA', 'TAQUILLA', 'Taquilla Presencial'),
('CANAL_VENTA', 'WEB', 'Portal Web Oficial'),
('CANAL_VENTA', 'APP', 'Aplicación Móvil'),
('METODO_PAGO', 'EFECTIVO', 'Efectivo'),
('METODO_PAGO', 'TARJETA_DEBITO', 'Tarjeta Débito'),
('METODO_PAGO', 'TARJETA_CREDITO', 'Tarjeta de Crédito'),
('METODO_PAGO', 'TRANSFERENCIA', 'Transferencia Bancaria / QR'),
('ESTADO_TIQUETE', 'RESERVADO', 'Reserva Temporal'),
('ESTADO_TIQUETE', 'PAGADO', 'Pagado y Confirmado'),
('ESTADO_TIQUETE', 'ABIERTO', 'Tiquete Abierto / Reprogramable'),
('ESTADO_TIQUETE', 'CANCELADO', 'Cancelado'),
('ESTADO_TIQUETE', 'VIAJADO', 'Completado por Pasajero'),
('CATEGORIA_MERCANCIA', 'GENERAL', 'Carga General y Paquetería'),
('CATEGORIA_MERCANCIA', 'PERECEDERA', 'Alimentos y Perecederos'),
('CATEGORIA_MERCANCIA', 'FRAGIL', 'Mercancía Frágil / Delicada'),
('CATEGORIA_MERCANCIA', 'VALORES', 'Documentos y Valores'),
('ESTADO_GUIA', 'ADMITIDO', 'Admitido en Origen'),
('ESTADO_GUIA', 'EN_TRANSITO', 'En Tránsito / Ruta'),
('ESTADO_GUIA', 'BODEGA_DESTINO', 'Disponible en Terminal Destino'),
('ESTADO_GUIA', 'ENTREGADO', 'Entregado al Destinatario'),
('ESTADO_GUIA', 'NOVEDAD', 'Retenido por Novedad');
GO

/* ============================================================================
   MÓDULO 1 – INFRAESTRUCTURA Y PERSONAL (Con nueva estructura de áreas)
   ============================================================================ */

CREATE TABLE AGENCIA (
    id_agencia   INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    ciudad       VARCHAR(60)  NOT NULL,
    direccion    VARCHAR(150) NOT NULL,
    telefono     VARCHAR(20)
);

CREATE TABLE DEPARTAMENTO (
    id_departamento   INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre_area       VARCHAR(100)   NOT NULL,
    id_jefe           INT,           -- FK añadida más abajo para evitar dependencia circular
    presupuesto_anual DECIMAL(12,2)
);

CREATE TABLE EMPLEADO (
    id_empleado  INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    cedula       VARCHAR(20)  NOT NULL UNIQUE,
    nombres      VARCHAR(100) NOT NULL,
    apellidos    VARCHAR(100) NOT NULL,
    telefono     VARCHAR(20),
    correo       VARCHAR(120),
    id_agencia   INT          NOT NULL,
    CONSTRAINT fk_empleado_agencia FOREIGN KEY (id_agencia) REFERENCES AGENCIA(id_agencia)
);

-- Resolución de la dependencia circular entre Jefe y Empleado
ALTER TABLE DEPARTAMENTO
ADD CONSTRAINT fk_departamento_jefe FOREIGN KEY (id_jefe) REFERENCES EMPLEADO(id_empleado);

CREATE TABLE CARGO (
    id_cargo         INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    nivel_jerarquico INT          DEFAULT 1,
    id_departamento  INT          NOT NULL,
    CONSTRAINT fk_cargo_departamento FOREIGN KEY (id_departamento) REFERENCES DEPARTAMENTO(id_departamento)
);

CREATE TABLE CONTRATO (
    id_contrato      INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_empleado      INT            NOT NULL,
    id_cargo         INT            NOT NULL,
    id_tipo_contrato INT            NOT NULL,
    fecha_inicio     DATE           NOT NULL,
    fecha_fin        DATE,
    salario_base     DECIMAL(10,2)  NOT NULL,
    jornada          VARCHAR(50),
    estado           VARCHAR(20)    NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_contrato_empleado FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado),
    CONSTRAINT fk_contrato_cargo FOREIGN KEY (id_cargo) REFERENCES CARGO(id_cargo),
    CONSTRAINT fk_contrato_tipo FOREIGN KEY (id_tipo_contrato) REFERENCES MULTITABLA_PARAMETRO(id_parametro)
);

CREATE TABLE LICENCIA_CONDUCCION (
    id_licencia       INT         IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_empleado       INT         NOT NULL,
    numero_licencia   VARCHAR(30) NOT NULL,
    categoria         VARCHAR(5)  NOT NULL,
    fecha_expedicion  DATE        NOT NULL,
    fecha_vencimiento DATE        NOT NULL,
    CONSTRAINT fk_licencia_empleado FOREIGN KEY (id_empleado) REFERENCES EMPLEADO(id_empleado)
);
GO

/* ============================================================================
   MÓDULO 2 – NÓMINA Y NOVEDADES
   ============================================================================ */

CREATE TABLE NOMINA (
    id_nomina       INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_contrato     INT           NOT NULL,
    periodo         VARCHAR(20)   NOT NULL,
    fecha_pago      DATE          NOT NULL,
    total_devengado DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_deducido  DECIMAL(10,2) NOT NULL DEFAULT 0,
    neto_pagar      DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_nomina_contrato FOREIGN KEY (id_contrato) REFERENCES CONTRATO(id_contrato)
);

CREATE TABLE NOMINA_DEVENGADO (
    id_devengado INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_nomina    INT           NOT NULL,
    concepto     VARCHAR(50)   NOT NULL,
    porcentaje   DECIMAL(5,2),
    valor        DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_devengado_nomina FOREIGN KEY (id_nomina) REFERENCES NOMINA(id_nomina)
);

CREATE TABLE NOMINA_DEDUCIDO (
    id_deducido INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_nomina   INT           NOT NULL,
    concepto    VARCHAR(50)   NOT NULL,
    porcentaje  DECIMAL(5,2),
    valor       DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_deducido_nomina FOREIGN KEY (id_nomina) REFERENCES NOMINA(id_nomina)
);

CREATE TABLE NOVEDAD (
    id_novedad      INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_contrato     INT          NOT NULL,
    id_tipo_novedad INT          NOT NULL,
    fecha           DATE         NOT NULL,
    cantidad_horas  DECIMAL(5,2),
    CONSTRAINT fk_novedad_contrato FOREIGN KEY (id_contrato) REFERENCES CONTRATO(id_contrato),
    CONSTRAINT fk_novedad_tipo FOREIGN KEY (id_tipo_novedad) REFERENCES MULTITABLA_PARAMETRO(id_parametro)
);
GO

/* ============================================================================
   MÓDULO 3 – CLIENTES, FLOTA Y MANTENIMIENTO
   ============================================================================ */

CREATE TABLE CLIENTE (
    id_cliente INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    documento  VARCHAR(20)  NOT NULL UNIQUE,
    nombres    VARCHAR(100) NOT NULL,
    apellidos  VARCHAR(100) NOT NULL,
    celular    VARCHAR(20)
);

CREATE TABLE PROPIETARIO (
    id_propietario  INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    documento       VARCHAR(20)  NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono        VARCHAR(20)
);

CREATE TABLE BUS (
    id_bus              INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    placa               VARCHAR(10)  NOT NULL UNIQUE,
    id_propietario      INT          NOT NULL,
    modelo              SMALLINT     NOT NULL,
    marca               VARCHAR(40),
    capacidad_pasajeros SMALLINT     NOT NULL,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_bus_propietario FOREIGN KEY (id_propietario) REFERENCES PROPIETARIO(id_propietario)
);

CREATE TABLE HISTORIAL_PLACA (
    id_historial_placa INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_bus             INT          NOT NULL,
    placa_anterior     VARCHAR(10)  NOT NULL,
    placa_nueva        VARCHAR(10)  NOT NULL,
    fecha_cambio       DATE         NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    motivo_cambio      VARCHAR(200),
    CONSTRAINT fk_historial_bus FOREIGN KEY (id_bus) REFERENCES BUS(id_bus)
);

CREATE TABLE SILLA (
    id_silla     INT      IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_bus       INT      NOT NULL,
    numero       SMALLINT NOT NULL,
    id_ubicacion INT      NOT NULL,
    CONSTRAINT fk_silla_bus FOREIGN KEY (id_bus) REFERENCES BUS(id_bus),
    CONSTRAINT fk_silla_ubicacion FOREIGN KEY (id_ubicacion) REFERENCES MULTITABLA_PARAMETRO(id_parametro),
    CONSTRAINT uq_bus_silla UNIQUE (id_bus, numero)
);

CREATE TABLE MANTENIMIENTO (
    id_mantenimiento INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_bus           INT           NOT NULL,
    id_tipo_mtto     INT           NOT NULL,
    fecha            DATE          NOT NULL,
    costo            DECIMAL(10,2),
    observaciones    VARCHAR(300),
    CONSTRAINT fk_mantenimiento_bus FOREIGN KEY (id_bus) REFERENCES BUS(id_bus),
    CONSTRAINT fk_mantenimiento_tipo FOREIGN KEY (id_tipo_mtto) REFERENCES MULTITABLA_PARAMETRO(id_parametro)
);
GO

/* ============================================================================
   MÓDULO 4 – OPERACIÓN, VIAJES, TIQUETES Y FACTURACIÓN
   ============================================================================ */

CREATE TABLE RUTA (
    id_ruta        INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    origen_ciudad  VARCHAR(60)  NOT NULL,
    destino_ciudad VARCHAR(60)  NOT NULL,
    distancia_km   DECIMAL(6,2) NOT NULL
);

CREATE TABLE ITINERARIO (
    id_itinerario    INT         IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_ruta          INT         NOT NULL,
    frecuencia       VARCHAR(50),
    hora_salida_base TIME,
    CONSTRAINT fk_itinerario_ruta FOREIGN KEY (id_ruta) REFERENCES RUTA(id_ruta)
);

CREATE TABLE VIAJE_PROGRAMADO (
    id_viaje                INT         IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_itinerario           INT         NOT NULL,
    id_bus                  INT         NOT NULL,
    id_conductor            INT         NOT NULL,
    id_conductor_secundario INT,
    fecha                   DATE        NOT NULL,
    hora_salida             TIME        NOT NULL,
    estado_viaje            VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO',
    CONSTRAINT fk_viaje_itinerario FOREIGN KEY (id_itinerario) REFERENCES ITINERARIO(id_itinerario),
    CONSTRAINT fk_viaje_bus FOREIGN KEY (id_bus) REFERENCES BUS(id_bus),
    CONSTRAINT fk_viaje_conductor FOREIGN KEY (id_conductor) REFERENCES EMPLEADO(id_empleado),
    CONSTRAINT fk_viaje_conductor_sec FOREIGN KEY (id_conductor_secundario) REFERENCES EMPLEADO(id_empleado)
);

CREATE TABLE FACTURA (
    id_factura     INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_cliente     INT           NOT NULL,
    id_cajero      INT           NOT NULL,
    id_metodo_pago INT           NOT NULL,
    fecha_emision  DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    monto_total    DECIMAL(10,2) NOT NULL,
    cufe           VARCHAR(100),
    CONSTRAINT fk_factura_cliente FOREIGN KEY (id_cliente) REFERENCES CLIENTE(id_cliente),
    CONSTRAINT fk_factura_cajero FOREIGN KEY (id_cajero) REFERENCES EMPLEADO(id_empleado),
    CONSTRAINT fk_factura_pago FOREIGN KEY (id_metodo_pago) REFERENCES MULTITABLA_PARAMETRO(id_parametro)
);

CREATE TABLE TIQUETE (
    id_tiquete               INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    numero_tiquete           VARCHAR(30)   NOT NULL UNIQUE,
    id_viaje                 INT           NOT NULL,
    id_silla                 INT           NOT NULL,
    id_pasajero              INT           NOT NULL,
    id_factura               INT           NOT NULL,
    id_canal_venta           INT           NOT NULL,
    id_estado_tiquete        INT           NOT NULL,
    valor_pagado             DECIMAL(10,2) NOT NULL,
    fecha_expiracion_reserva DATETIME2,
    fecha_limite_abierto     DATE,
    penalidad_reprogramacion DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT fk_tiquete_viaje FOREIGN KEY (id_viaje) REFERENCES VIAJE_PROGRAMADO(id_viaje),
    CONSTRAINT fk_tiquete_silla FOREIGN KEY (id_silla) REFERENCES SILLA(id_silla),
    CONSTRAINT fk_tiquete_pasajero FOREIGN KEY (id_pasajero) REFERENCES CLIENTE(id_cliente),
    CONSTRAINT fk_tiquete_factura FOREIGN KEY (id_factura) REFERENCES FACTURA(id_factura),
    CONSTRAINT fk_tiquete_canal FOREIGN KEY (id_canal_venta) REFERENCES MULTITABLA_PARAMETRO(id_parametro),
    CONSTRAINT fk_tiquete_estado FOREIGN KEY (id_estado_tiquete) REFERENCES MULTITABLA_PARAMETRO(id_parametro),
    CONSTRAINT uq_tiquete_silla_viaje UNIQUE (id_viaje, id_silla)
);
GO

/* ============================================================================
   MÓDULO 5 – CARGA Y ENCOMIENDAS GENERALES
   ============================================================================ */

CREATE TABLE REMESA (
    id_remesa         INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    numero_remesa     VARCHAR(30)   NOT NULL UNIQUE,
    id_remitente      INT           NOT NULL,
    id_destinatario   INT           NOT NULL,
    fecha_creacion    DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    descripcion_carga VARCHAR(200),
    peso_total        DECIMAL(8,2)  NOT NULL,
    bultos_cantidad   SMALLINT      NOT NULL DEFAULT 1,
    monto_total       DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_remesa_remitente FOREIGN KEY (id_remitente) REFERENCES CLIENTE(id_cliente),
    CONSTRAINT fk_remesa_destinatario FOREIGN KEY (id_destinatario) REFERENCES CLIENTE(id_cliente)
);

CREATE TABLE GUIA_ENVIO (
    id_guia                INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    codigo_barras          VARCHAR(30)   NOT NULL UNIQUE,
    id_remesa              INT,
    id_remitente           INT           NOT NULL,
    id_destinatario        INT           NOT NULL,
    id_factura             INT,
    id_categoria_mercancia INT           NOT NULL,
    id_estado_guia         INT           NOT NULL,
    peso_kg                DECIMAL(6,2)  NOT NULL,
    valor_total            DECIMAL(10,2),
    fecha_admision         DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    documento_recibe       VARCHAR(20),
    fecha_entrega          DATETIME2,
    CONSTRAINT fk_guia_remesa FOREIGN KEY (id_remesa) REFERENCES REMESA(id_remesa),
    CONSTRAINT fk_guia_remitente FOREIGN KEY (id_remitente) REFERENCES CLIENTE(id_cliente),
    CONSTRAINT fk_guia_destinatario FOREIGN KEY (id_destinatario) REFERENCES CLIENTE(id_cliente),
    CONSTRAINT fk_guia_factura FOREIGN KEY (id_factura) REFERENCES FACTURA(id_factura),
    CONSTRAINT fk_guia_categoria FOREIGN KEY (id_categoria_mercancia) REFERENCES MULTITABLA_PARAMETRO(id_parametro),
    CONSTRAINT fk_guia_estado FOREIGN KEY (id_estado_guia) REFERENCES MULTITABLA_PARAMETRO(id_parametro)
);
GO

/* ============================================================================
   MÓDULO 6 – LOGÍSTICA Y DISTRIBUCIÓN
   ============================================================================ */

CREATE TABLE BODEGA_HUB (
    id_bodega              INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_agencia             INT          NOT NULL,
    nombre                 VARCHAR(100) NOT NULL,
    capacidad_volumen_m3   DECIMAL(8,2) NOT NULL,
    temperatura_controlada BIT          DEFAULT 0, -- 0=Falso, 1=Verdadero
    CONSTRAINT fk_bodega_agencia FOREIGN KEY (id_agencia) REFERENCES AGENCIA(id_agencia)
);

CREATE TABLE VEHICULO_REPARTO (
    id_vehiculo        INT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    placa              VARCHAR(10)  NOT NULL UNIQUE,
    tipo_vehiculo      VARCHAR(30)  NOT NULL,
    capacidad_carga_kg DECIMAL(8,2) NOT NULL,
    id_bodega_base     INT          NOT NULL,
    estado             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_vehiculo_bodega FOREIGN KEY (id_bodega_base) REFERENCES BODEGA_HUB(id_bodega)
);
GO

/* ============================================================================
   MÓDULO 7 – ÁREA TIC, INFRAESTRUCTURA E IOT (GPS)
   ============================================================================ */

CREATE TABLE DISPOSITIVO_IOT_FLOTA (
    id_dispositivo   INT         IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_bus           INT         NOT NULL,
    tipo_dispositivo VARCHAR(50) NOT NULL,
    mac_address      VARCHAR(17) UNIQUE,
    ip_asignada      VARCHAR(15),
    estado_red       VARCHAR(20) NOT NULL DEFAULT 'EN_LINEA',
    CONSTRAINT fk_dispositivo_bus FOREIGN KEY (id_bus) REFERENCES BUS(id_bus)
);

CREATE TABLE INCIDENCIA_TIC (
    id_incidencia       INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    id_empleado_reporta INT           NOT NULL,
    id_tecnico_asignado INT,
    tipo_incidencia     VARCHAR(50)   NOT NULL,
    descripcion         VARCHAR(MAX)  NOT NULL, -- Equivalente a TEXT en T-SQL
    fecha_reporte       DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    fecha_cierre        DATETIME2,
    estado              VARCHAR(20)   NOT NULL DEFAULT 'ABIERTO',
    CONSTRAINT fk_incidencia_reporta FOREIGN KEY (id_empleado_reporta) REFERENCES EMPLEADO(id_empleado),
    CONSTRAINT fk_incidencia_tecnico FOREIGN KEY (id_tecnico_asignado) REFERENCES EMPLEADO(id_empleado)
);
GO

/* ============================================================================
   TRIGGERS – LIQUIDACIÓN AUTOMÁTICA DE TOTALES DE NÓMINA
   ============================================================================ */

CREATE TRIGGER trg_actualiza_totales_nomina_devengado
ON NOMINA_DEVENGADO
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE N
       SET total_devengado = N.total_devengado + I.valor,
           neto_pagar = (N.total_devengado + I.valor) - N.total_deducido
      FROM NOMINA N
      INNER JOIN inserted I ON N.id_nomina = I.id_nomina;
END;
GO

CREATE TRIGGER trg_actualiza_totales_nomina_deducido
ON NOMINA_DEDUCIDO
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE N
       SET total_deducido = N.total_deducido + I.valor,
           neto_pagar = N.total_devengado - (N.total_deducido + I.valor)
      FROM NOMINA N
      INNER JOIN inserted I ON N.id_nomina = I.id_nomina;
END;
GO
