"""
Patrón Factory Method — Copetran (Proceso de Venta de Pasajes)
Capa de Modelo / Patrones Creacionales

Permite crear dinámicamente las distintas variantes de tarifas de pasajeros
(Plena, Adulto Mayor, Estudiante e Infante) delegando la decisión en la fábrica
e integrando la validación de requisitos de soporte (cédula, edad, carné).
"""

from abc import ABC, abstractmethod
from typing import Optional
from copetran.model.entities import TipoTarifa, Pasajero


class Tarifa(ABC):
    """
    Producto Abstracto: Define el contrato común para todas las tarifas de pasajeros.
    """
    @abstractmethod
    def calcular_precio(self, precio_base: float) -> float:
        """Calcula el valor final a pagar aplicando descuentos o recargos."""
        pass

    @abstractmethod
    def validar_requisitos(self, pasajero: Pasajero) -> bool:
        """Verifica que el pasajero cumpla con las condiciones legales del beneficio."""
        pass

    @abstractmethod
    def get_porcentaje_descuento(self) -> float:
        """Retorna el porcentaje de descuento otorgado (0.0 a 1.0)."""
        pass

    @abstractmethod
    def get_descripcion(self) -> str:
        """Descripción legible de la tarifa."""
        pass


class TarifaPlena(Tarifa):
    """Producto Concreto: Tarifa estándar del trayecto sin condiciones adicionales."""
    def calcular_precio(self, precio_base: float) -> float:
        return float(precio_base)

    def validar_requisitos(self, pasajero: Pasajero) -> bool:
        return True

    def get_porcentaje_descuento(self) -> float:
        return 0.0

    def get_descripcion(self) -> str:
        return "Tarifa Plena Ordinaria (100% valor base)"


class TarifaAdultoMayor(Tarifa):
    """
    Producto Concreto: Descuento legal del 25% para ciudadanos mayores de 60 años.
    """
    EDAD_MINIMA = 60
    DESCUENTO = 0.25

    def calcular_precio(self, precio_base: float) -> float:
        return float(precio_base * (1.0 - self.DESCUENTO))

    def validar_requisitos(self, pasajero: Pasajero) -> bool:
        return pasajero.edad >= self.EDAD_MINIMA

    def get_porcentaje_descuento(self) -> float:
        return self.DESCUENTO

    def get_descripcion(self) -> str:
        return f"Tarifa Adulto Mayor (25% descuento, edad >= {self.EDAD_MINIMA})"


class TarifaEstudiante(Tarifa):
    """
    Producto Concreto: Descuento del 20% mediante carné estudiantil vigente.
    """
    DESCUENTO = 0.20

    def calcular_precio(self, precio_base: float) -> float:
        return float(precio_base * (1.0 - self.DESCUENTO))

    def validar_requisitos(self, pasajero: Pasajero) -> bool:
        return bool(pasajero.tiene_carne_estudiantil)

    def get_porcentaje_descuento(self) -> float:
        return self.DESCUENTO

    def get_descripcion(self) -> str:
        return "Tarifa Estudiante (20% descuento con carné vigente)"


class TarifaInfante(Tarifa):
    """
    Producto Concreto: Descuento del 50% para niños menores de 12 años.
    """
    EDAD_MAXIMA = 12
    DESCUENTO = 0.50

    def calcular_precio(self, precio_base: float) -> float:
        return float(precio_base * (1.0 - self.DESCUENTO))

    def validar_requisitos(self, pasajero: Pasajero) -> bool:
        return pasajero.edad <= self.EDAD_MAXIMA

    def get_porcentaje_descuento(self) -> float:
        return self.DESCUENTO

    def get_descripcion(self) -> str:
        return f"Tarifa Infante (50% descuento, menores de {self.EDAD_MAXIMA} años)"


class FabricaTarifa(ABC):
    """
    Creador Abstracto: Declara el método de fábrica que retorna un objeto Tarifa.
    """
    @abstractmethod
    def crear_tarifa(self, tipo: TipoTarifa, pasajero: Pasajero) -> Tarifa:
        """Método de fábrica para instanciar la tarifa según tipo y pasajero."""
        pass

    def cotizar_pasaje(self, tipo: TipoTarifa, pasajero: Pasajero, precio_base: float) -> float:
        """Operación de negocio que utiliza el método de fábrica."""
        tarifa = self.crear_tarifa(tipo, pasajero)
        return tarifa.calcular_precio(precio_base)


class FabricaTarifaImpl(FabricaTarifa):
    """
    Creador Concreto: Implementa la lógica de selección e instanciación de tarifas.
    """
    def crear_tarifa(self, tipo: TipoTarifa, pasajero: Pasajero) -> Tarifa:
        if tipo == TipoTarifa.PLENA:
            return TarifaPlena()

        elif tipo == TipoTarifa.ADULTO_MAYOR:
            tarifa = TarifaAdultoMayor()
            if not tarifa.validar_requisitos(pasajero):
                raise ValueError(
                    f"El pasajero {pasajero.nombre_completo} tiene {pasajero.edad} años. "
                    f"La tarifa Adulto Mayor exige al menos {TarifaAdultoMayor.EDAD_MINIMA} años."
                )
            return tarifa

        elif tipo == TipoTarifa.ESTUDIANTE:
            tarifa = TarifaEstudiante()
            if not tarifa.validar_requisitos(pasajero):
                raise ValueError(
                    f"El pasajero {pasajero.nombre_completo} no presentó carné estudiantil vigente."
                )
            return tarifa

        elif tipo == TipoTarifa.INFANTE:
            tarifa = TarifaInfante()
            if not tarifa.validar_requisitos(pasajero):
                raise ValueError(
                    f"El pasajero {pasajero.nombre_completo} tiene {pasajero.edad} años. "
                    f"La tarifa Infante aplica únicamente para menores de {TarifaInfante.EDAD_MAXIMA} años."
                )
            return tarifa

        else:
            return TarifaPlena()
