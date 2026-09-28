"""
Patrón Builder — Copetran (Proceso de Venta de Pasajes)
Capa de Modelo / Patrones Creacionales

Permite la construcción ordenada y paso a paso del objeto complejo ViajeProgramado:
asigna ruta, vehículo de flota homologado, tripulación doble reglamentaria (principal y relevo),
horarios y matriz completa de 60 asientos de dos pisos (VIP Cama abajo y Confort arriba).
"""

from abc import ABC, abstractmethod
from typing import List, Optional
import uuid
from datetime import datetime
from copetran.model.entities import Ruta, Bus, Conductor, Silla, ClaseSilla, EstadoTiquete


class ViajeProgramado:
    """
    Producto Complejo resultante de la construcción.
    Representa un viaje programado listo para recibir pasajeros.
    """
    def __init__(self):
        self.id_viaje: str = str(uuid.uuid4())
        self.codigo_viaje: str = ""
        self.ruta: Optional[Ruta] = None
        self.bus: Optional[Bus] = None
        self.conductor_principal: Optional[Conductor] = None
        self.conductor_relevo: Optional[Conductor] = None
        self.fecha_salida: str = ""
        self.hora_salida: str = ""
        self.sillas: List[Silla] = []
        self.estado: str = "PROGRAMADO"

    def obtener_silla(self, numero: int) -> Optional[Silla]:
        """Busca una silla por su número."""
        for s in self.sillas:
            if s.numero == numero:
                return s
        return None

    def obtener_sillas_disponibles(self) -> List[Silla]:
        """Retorna las sillas que se encuentran libres."""
        return [s for s in self.sillas if s.estado == EstadoTiquete.DISPONIBLE]

    def __str__(self) -> str:
        origen = self.ruta.origen if self.ruta else "N/A"
        destino = self.ruta.destino if self.ruta else "N/A"
        placa = self.bus.placa if self.bus else "N/A"
        c1 = self.conductor_principal.nombre_completo if self.conductor_principal else "N/A"
        return (
            f"Viaje [{self.codigo_viaje}] | Ruta: {origen} -> {destino} | "
            f"Fecha: {self.fecha_salida} {self.hora_salida} | Bus: {placa} | "
            f"Conductor: {c1} | Sillas: {len(self.sillas)} ({len(self.obtener_sillas_disponibles())} disp.)"
        )


class ViajeBuilder(ABC):
    """
    Constructor Abstracto: Define los pasos requeridos para ensamblar el viaje.
    """
    @abstractmethod
    def reset(self) -> "ViajeBuilder":
        pass

    @abstractmethod
    def asignar_codigo(self, codigo: str) -> "ViajeBuilder":
        pass

    @abstractmethod
    def asignar_ruta(self, ruta: Ruta) -> "ViajeBuilder":
        pass

    @abstractmethod
    def asignar_bus(self, bus: Bus) -> "ViajeBuilder":
        pass

    @abstractmethod
    def asignar_conductores(self, principal: Conductor, relevo: Conductor) -> "ViajeBuilder":
        pass

    @abstractmethod
    def definir_horario(self, fecha_salida: str, hora_salida: str) -> "ViajeBuilder":
        pass

    @abstractmethod
    def configurar_asientos_doble_piso(self, sillas_vip_piso1: int = 12,
                                       sillas_confort_piso2: int = 48) -> "ViajeBuilder":
        pass

    @abstractmethod
    def obtener_viaje(self) -> ViajeProgramado:
        pass


class ViajeProgramadoBuilderImpl(ViajeBuilder):
    """
    Constructor Concreto: Acumula las partes del viaje y ejecuta las validaciones
    reglamentarias de transporte antes de entregar el producto.
    """
    def __init__(self):
        self._viaje = ViajeProgramado()

    def reset(self) -> "ViajeBuilder":
        self._viaje = ViajeProgramado()
        return self

    def asignar_codigo(self, codigo: str) -> "ViajeBuilder":
        self._viaje.codigo_viaje = codigo
        return self

    def asignar_ruta(self, ruta: Ruta) -> "ViajeBuilder":
        self._viaje.ruta = ruta
        return self

    def asignar_bus(self, bus: Bus) -> "ViajeBuilder":
        self._viaje.bus = bus
        return self

    def asignar_conductores(self, principal: Conductor, relevo: Conductor) -> "ViajeBuilder":
        if principal.id_conductor == relevo.id_conductor:
            raise ValueError("Por norma de seguridad vial, el conductor principal y de relevo deben ser diferentes.")
        self._viaje.conductor_principal = principal
        self._viaje.conductor_relevo = relevo
        return self

    def definir_horario(self, fecha_salida: str, hora_salida: str) -> "ViajeBuilder":
        self._viaje.fecha_salida = fecha_salida
        self._viaje.hora_salida = hora_salida
        return self

    def configurar_asientos_doble_piso(self, sillas_vip_piso1: int = 12,
                                       sillas_confort_piso2: int = 48) -> "ViajeBuilder":
        tarifa_base = self._viaje.ruta.tarifa_base if self._viaje.ruta else 80000.0
        sillas: List[Silla] = []

        # Piso 1: VIP Cama (Recargo del 25% sobre la tarifa base)
        for num in range(1, sillas_vip_piso1 + 1):
            sillas.append(Silla(
                numero=num,
                piso=1,
                clase=ClaseSilla.VIP_PISO_1,
                estado=EstadoTiquete.DISPONIBLE,
                precio_base=tarifa_base * 1.25
            ))

        # Piso 2: Confort estándar (Tarifa base)
        inicio_piso2 = sillas_vip_piso1 + 1
        for num in range(inicio_piso2, inicio_piso2 + sillas_confort_piso2):
            sillas.append(Silla(
                numero=num,
                piso=2,
                clase=ClaseSilla.CONFORT_PISO_2,
                estado=EstadoTiquete.DISPONIBLE,
                precio_base=tarifa_base
            ))

        self._viaje.sillas = sillas
        return self

    def obtener_viaje(self) -> ViajeProgramado:
        # Validación de integridad de armado
        if not self._viaje.ruta:
            raise ValueError("El viaje debe tener una ruta asignada.")
        if not self._viaje.bus:
            raise ValueError("El viaje debe tener un bus asignado.")
        if not self._viaje.conductor_principal or not self._viaje.conductor_relevo:
            raise ValueError("El viaje debe contar con tripulación completa (conductor principal y relevo).")
        if not self._viaje.sillas:
            raise ValueError("El viaje debe tener configurada su matriz de asientos.")

        resultado = self._viaje
        self.reset()
        return resultado


class OperarioRutasDirector:
    """
    Director: Orquesta la secuencia de pasos de construcción para despachos regulares.
    """
    def __init__(self, builder: ViajeBuilder):
        self._builder = builder

    def cambiar_builder(self, builder: ViajeBuilder):
        self._builder = builder

    def armar_despacho_completo(self, codigo: str, ruta: Ruta, bus: Bus,
                                c_principal: Conductor, c_relevo: Conductor,
                                fecha: str, hora: str) -> ViajeProgramado:
        """Secuencia predefinida de ensamblaje de un despacho de alta demanda."""
        return (
            self._builder
            .reset()
            .asignar_codigo(codigo)
            .asignar_ruta(ruta)
            .asignar_bus(bus)
            .asignar_conductores(c_principal, c_relevo)
            .definir_horario(fecha, hora)
            .configurar_asientos_doble_piso(sillas_vip_piso1=12, sillas_confort_piso2=48)
            .obtener_viaje()
        )
