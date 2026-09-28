"""
Patrón Prototype — Copetran (Proceso de Venta de Pasajes)
Capa de Modelo / Patrones Creacionales

Permite clonar objetos de costo computacional alto mediante copias profundas (deep copy):
1. ViajeProgramado: Clona itinerarios frecuentes con su matriz completa de 60 asientos
   sin redigitar rutas, buses ni sillas, reasignando únicamente la fecha y hora de salida.
2. TiqueteAbierto: Clona los datos del pasajero y la tarifa para la reprogramación
   de viaje (Proceso G) sin reconstruir el boleto desde cero.
3. CatalogoPlantillasViaje (PrototypeManager): Almacena y despacha copias por clave.
"""

from abc import ABC, abstractmethod
import copy
import uuid
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from copetran.model.entities import Silla, EstadoTiquete, Tiquete, Pasajero, TipoTarifa, CanalVenta
from copetran.model.patterns.builder import ViajeProgramado


class PrototipoClonable(ABC):
    """Interfaz abstracta que declara el método de clonación."""
    @abstractmethod
    def clonar(self) -> "PrototipoClonable":
        pass


class ViajePlantillaClonable(PrototipoClonable):
    """
    Prototipo Concreto de Viaje Programado.
    Permite clonar un viaje base realizando una copia profunda de sus 60 asientos,
    asegurando que el nuevo viaje nazca con un id_viaje único y todas sus sillas DISPONIBLES.
    """
    def __init__(self, viaje_base: ViajeProgramado):
        self.viaje_base = viaje_base

    def clonar(self, nueva_fecha: Optional[str] = None, nueva_hora: Optional[str] = None,
               nuevo_codigo: Optional[str] = None) -> ViajeProgramado:
        """
        Ejecuta una copia profunda de la plantilla base y reinicia el inventario de sillas.
        """
        # Clonación profunda
        viaje_clonado: ViajeProgramado = copy.deepcopy(self.viaje_base)
        viaje_clonado.id_viaje = str(uuid.uuid4())
        if nuevo_codigo:
            viaje_clonado.codigo_viaje = nuevo_codigo
        else:
            viaje_clonado.codigo_viaje = f"{self.viaje_base.codigo_viaje}-CLON-{uuid.uuid4().hex[:4].upper()}"

        if nueva_fecha:
            viaje_clonado.fecha_salida = nueva_fecha
        if nueva_hora:
            viaje_clonado.hora_salida = nueva_hora

        # Resetear todas las sillas a DISPONIBLE para el nuevo viaje
        for silla in viaje_clonado.sillas:
            silla.estado = EstadoTiquete.DISPONIBLE

        viaje_clonado.estado = "PROGRAMADO"
        return viaje_clonado


class TiqueteAbiertoPrototipo(PrototipoClonable):
    """
    Prototipo Concreto de Tiquete Abierto para Reprogramaciones (Proceso G).
    Permite clonar los datos del pasajero, canal y categoría de un boleto previo,
    reasignándolo a un nuevo viaje y una nueva silla.
    """
    def __init__(self, tiquete_origen: Tiquete, fecha_expiracion_meses: int = 3):
        self.tiquete_origen = tiquete_origen
        self.fecha_expiracion = datetime.now() + timedelta(days=fecha_expiracion_meses * 30)

    def clonar(self, nuevo_id_viaje: str, nueva_silla: Silla, penalidad: float = 0.0) -> Tiquete:
        """Genera un nuevo tiquete reprogramado a partir del tiquete abierto base."""
        tiquete_nuevo = copy.deepcopy(self.tiquete_origen)
        tiquete_nuevo.id_tiquete = str(uuid.uuid4())
        tiquete_nuevo.id_viaje = nuevo_id_viaje
        tiquete_nuevo.silla = nueva_silla
        tiquete_nuevo.estado = EstadoTiquete.PAGADO
        tiquete_nuevo.valor_pagado = self.tiquete_origen.valor_pagado + penalidad
        tiquete_nuevo.fecha_emision = datetime.now()
        tiquete_nuevo.codigo_qr = f"QR-REPROG-{uuid.uuid4().hex[:8].upper()}"
        return tiquete_nuevo


class CatalogoPlantillasViaje:
    """
    PrototypeManager (GoF): Registro centralizado que almacena plantillas de viaje
    por clave y entrega copias listas para el rodamiento diario.
    """
    _instance: Optional["CatalogoPlantillasViaje"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CatalogoPlantillasViaje, cls).__new__(cls)
            cls._instance._catalogo: Dict[str, ViajePlantillaClonable] = {}
        return cls._instance

    @classmethod
    def get_instance(cls) -> "CatalogoPlantillasViaje":
        if cls._instance is None:
            return cls()
        return cls._instance

    def registrar_plantilla(self, clave: str, viaje: ViajeProgramado):
        """Registra una plantilla de viaje en el catálogo."""
        self._catalogo[clave] = ViajePlantillaClonable(viaje)

    def obtener_clon(self, clave: str, nueva_fecha: str, nueva_hora: Optional[str] = None,
                     nuevo_codigo: Optional[str] = None) -> ViajeProgramado:
        """Obtiene un clon listo de la plantilla solicitada."""
        if clave not in self._catalogo:
            raise KeyError(f"No existe ninguna plantilla registrada con el código '{clave}'.")
        return self._catalogo[clave].clonar(nueva_fecha=nueva_fecha, nueva_hora=nueva_hora, nuevo_codigo=nuevo_codigo)

    def listar_plantillas(self) -> List[str]:
        """Lista las claves de las plantillas registradas."""
        return list(self._catalogo.keys())

    def contiene(self, clave: str) -> bool:
        return clave in self._catalogo
