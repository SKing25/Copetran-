"""
Módulo de Entidades de Dominio — Copetran (Proceso de Venta de Pasajes)
Capa de Modelo (MVC / Tres Capas)
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List
from datetime import datetime


class TipoTarifa(Enum):
    PLENA = "PLENA"
    ADULTO_MAYOR = "ADULTO_MAYOR"
    ESTUDIANTE = "ESTUDIANTE"
    INFANTE = "INFANTE"


class CanalVenta(Enum):
    TAQUILLA = "TAQUILLA"
    WEB = "WEB"
    AGENCIA_ALIADA = "AGENCIA_ALIADA"


class EstadoTiquete(Enum):
    DISPONIBLE = "DISPONIBLE"
    BLOQUEADO = "BLOQUEADO"
    PAGADO = "PAGADO"
    ABIERTO = "ABIERTO"
    CANCELADO = "CANCELADO"


class ClaseSilla(Enum):
    VIP_PISO_1 = "VIP Cama (Piso 1)"
    CONFORT_PISO_2 = "Confort (Piso 2)"


@dataclass
class Pasajero:
    """Representa a un pasajero del sistema."""
    numero_documento: str
    tipo_documento: str
    nombre_completo: str
    edad: int
    tiene_carne_estudiantil: bool = False
    telefono: str = ""
    email: str = ""


@dataclass
class Silla:
    """Representa una silla física en el bus de dos pisos."""
    numero: int
    piso: int
    clase: ClaseSilla
    estado: EstadoTiquete = EstadoTiquete.DISPONIBLE
    precio_base: float = 0.0


@dataclass
class Ruta:
    """Representa el trayecto intermunicipal."""
    id_ruta: str
    origen: str
    destino: str
    distancia_km: float
    tarifa_base: float


@dataclass
class Conductor:
    """Conductor formal de la empresa."""
    id_conductor: str
    nombre_completo: str
    numero_licencia: str
    es_relevo: bool = False


@dataclass
class Bus:
    """Vehículo de transporte de la flota de Copetran."""
    placa: str
    modelo: str
    capacidad_total: int = 60
    pisos: int = 2


@dataclass
class Factura:
    """Comprobante contable y tributario de la transacción."""
    id_factura: str
    numero_factura: str
    monto_total: float
    canal: CanalVenta
    cufe: Optional[str] = None
    fecha_emision: datetime = field(default_factory=datetime.now)
    estado: str = "EMITIDA"


@dataclass
class Tiquete:
    """Tiquete formal de viaje que vincula al pasajero con la silla y el viaje."""
    id_tiquete: str
    numero_tiquete: str
    id_viaje: str
    silla: Silla
    pasajero: Pasajero
    tipo_tarifa: TipoTarifa
    valor_pagado: float
    estado: EstadoTiquete
    canal: CanalVenta
    factura: Optional[Factura] = None
    fecha_emision: datetime = field(default_factory=datetime.now)
    codigo_qr: Optional[str] = None
