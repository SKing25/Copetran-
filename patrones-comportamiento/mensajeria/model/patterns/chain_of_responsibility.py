"""
Patrón Chain of Responsibility — Copetran S.A. (Proceso C: Mensajería y Encomiendas)
Módulo independiente en patrones-comportamiento (sin duplicar patrones creacionales).

Evalúa secuencialmente cada SolicitudAdmisionGuia a través de tres eslabones:
1. ValidadorDatosYCoberturaHandler: Verifica remitente, destinatario y cobertura de ruta.
2. ValidadorPesoYCubicajeHandler: Controla cubicaje y peso máximo permitido por categoría (ECU-02).
3. LiquidadorTarifaYPolizaHandler: Verifica póliza de alto valor (> $2,000,000 COP) y liquida flete (RF05).
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from mensajeria.model.entities import SolicitudAdmisionGuia, CategoriaMercancia


@dataclass
class ResultadoValidacionCadena:
    """Almacena el dictamen y la trazabilidad paso a paso de la cadena."""
    aprobado: bool = True
    eslabon_rechazo: Optional[str] = None
    motivo_rechazo: str = ""
    peso_facturable_kg: float = 0.0
    costo_flete: float = 0.0
    trazabilidad: List[str] = field(default_factory=list)

    def registrar_exito(self, eslabon: str, detalle: str) -> None:
        self.trazabilidad.append(f"[APROBADO - {eslabon}] {detalle}")

    def registrar_rechazo(self, eslabon: str, motivo: str) -> None:
        self.aprobado = False
        self.eslabon_rechazo = eslabon
        self.motivo_rechazo = motivo
        self.trazabilidad.append(f"[RECHAZADO - {eslabon}] {motivo}")


class ManejadorAdmisionEnvio(ABC):
    """
    Rol GoF: Handler (Manejador Abstracto).
    Define el contrato de validación y conserva la referencia al siguiente eslabón.
    """

    def __init__(self) -> None:
        self._siguiente: Optional["ManejadorAdmisionEnvio"] = None

    def enlazar_siguiente(self, siguiente: "ManejadorAdmisionEnvio") -> "ManejadorAdmisionEnvio":
        """Enlaza el siguiente eslabón permitiendo encadenamiento fluido."""
        self._siguiente = siguiente
        return siguiente

    def validar(self, solicitud: SolicitudAdmisionGuia,
                resultado: ResultadoValidacionCadena) -> ResultadoValidacionCadena:
        """Ejecuta la regla actual; si aprueba y hay otro eslabón, delega la solicitud."""
        continuar = self._verificar_regla(solicitud, resultado)
        if continuar and resultado.aprobado and self._siguiente is not None:
            return self._siguiente.validar(solicitud, resultado)
        return resultado

    @abstractmethod
    def _verificar_regla(self, solicitud: SolicitudAdmisionGuia,
                         resultado: ResultadoValidacionCadena) -> bool:
        """Regla específica que debe implementar cada manejador concreto."""
        pass


class ValidadorDatosYCoberturaHandler(ManejadorAdmisionEnvio):
    """
    Rol GoF: ConcreteHandler 1.
    Verifica datos obligatorios de cliente y cobertura geográfica de rutas Copetran.
    """
    CIUDADES_CUBIERTAS = {
        "BOGOTA", "BUCARAMANGA", "MEDELLIN", "CALI", "BARRANQUILLA", "CUCUTA", "SANTA MARTA"
    }

    def _verificar_regla(self, solicitud: SolicitudAdmisionGuia,
                         resultado: ResultadoValidacionCadena) -> bool:
        if not solicitud.remitente.strip() or not solicitud.destinatario.strip():
            resultado.registrar_rechazo(
                "Datos y Cobertura",
                "Debe especificar tanto el remitente como el destinatario de la guía."
            )
            return False

        if solicitud.remitente.strip().lower() == solicitud.destinatario.strip().lower():
            resultado.registrar_rechazo(
                "Datos y Cobertura",
                "El remitente y el destinatario deben ser personas o entidades distintas."
            )
            return False

        origen = self._normalizar(solicitud.ciudad_origen)
        destino = self._normalizar(solicitud.ciudad_destino)

        if origen not in self.CIUDADES_CUBIERTAS or destino not in self.CIUDADES_CUBIERTAS:
            resultado.registrar_rechazo(
                "Datos y Cobertura",
                f"Ruta sin cobertura de mensajería entre {solicitud.ciudad_origen} y {solicitud.ciudad_destino}."
            )
            return False

        resultado.registrar_exito(
            "Datos y Cobertura",
            f"Ruta habilitada ({origen} -> {destino}) para {solicitud.remitente} -> {solicitud.destinatario}."
        )
        return True

    @classmethod
    def _normalizar(cls, texto: str) -> str:
        tabla = str.maketrans("ÁÉÍÓÚáéíóú", "AEIOUaeiou")
        limpio = texto.translate(tabla).upper()
        for c in cls.CIUDADES_CUBIERTAS:
            if c in limpio:
                return c
        return limpio.strip()


class ValidadorPesoYCubicajeHandler(ManejadorAdmisionEnvio):
    """
    Rol GoF: ConcreteHandler 2.
    Calcula el peso facturable por cubicaje y valida el peso máximo por categoría (ECU-02 Excepción 2).
    """
    PESO_MAXIMO_CATEGORIA: Dict[CategoriaMercancia, float] = {
        CategoriaMercancia.GENERAL: 50.0,
        CategoriaMercancia.FRAGIL: 35.0,
        CategoriaMercancia.PERECEDERA: 25.0,
        CategoriaMercancia.VALORES: 10.0,
    }

    def _verificar_regla(self, solicitud: SolicitudAdmisionGuia,
                         resultado: ResultadoValidacionCadena) -> bool:
        if solicitud.peso_real_kg <= 0:
            resultado.registrar_rechazo("Peso y Cubicaje", "El peso real debe ser mayor a 0 kg.")
            return False

        peso_eval = solicitud.peso_facturable_kg
        tope = self.PESO_MAXIMO_CATEGORIA[solicitud.categoria]

        if peso_eval > tope:
            resultado.registrar_rechazo(
                "Peso y Cubicaje",
                f"El peso facturable ({peso_eval:.2f} kg) supera el máximo permitido "
                f"para categoría {solicitud.categoria.value} ({tope:.1f} kg)."
            )
            return False

        resultado.peso_facturable_kg = peso_eval
        resultado.registrar_exito(
            "Peso y Cubicaje",
            f"Categoría {solicitud.categoria.value} aprobada con {peso_eval:.2f} kg facturables (máx {tope:.0f} kg)."
        )
        return True


class LiquidadorTarifaYPolizaHandler(ManejadorAdmisionEnvio):
    """
    Rol GoF: ConcreteHandler 3.
    Verifica póliza aseguradora para envíos de alto valor (> $2,000,000 COP) y calcula el flete (RF05).
    """
    TOPE_SIN_POLIZA_EXTRA = 2_000_000.0
    TARIFA_POR_KG = 3_500.0
    PORCENTAJE_RECARGO: Dict[CategoriaMercancia, float] = {
        CategoriaMercancia.GENERAL: 0.0,
        CategoriaMercancia.PERECEDERA: 0.15,
        CategoriaMercancia.FRAGIL: 0.20,
        CategoriaMercancia.VALORES: 0.25,
    }

    def _verificar_regla(self, solicitud: SolicitudAdmisionGuia,
                         resultado: ResultadoValidacionCadena) -> bool:
        if solicitud.valor_declarado <= 0:
            resultado.registrar_rechazo("Tarifa y Póliza", "El valor declarado debe ser mayor a $0 COP.")
            return False

        if solicitud.valor_declarado > self.TOPE_SIN_POLIZA_EXTRA and not solicitud.tiene_poliza_extra:
            resultado.registrar_rechazo(
                "Tarifa y Póliza",
                f"Mercancía de alto valor (${solicitud.valor_declarado:,.0f} COP) exige activar póliza extra."
            )
            return False

        tarifa_base = round(solicitud.peso_facturable_kg * self.TARIFA_POR_KG)
        recargo = round(tarifa_base * self.PORCENTAJE_RECARGO[solicitud.categoria])
        prima_poliza = round(solicitud.valor_declarado * 0.015) if solicitud.tiene_poliza_extra else 0
        total = float(tarifa_base + recargo + prima_poliza)

        resultado.costo_flete = total
        resultado.registrar_exito(
            "Tarifa y Póliza",
            f"Flete liquidado en ${total:,.0f} COP (Base ${tarifa_base:,.0f} + Recargo ${recargo:,.0f}"
            + (f" + Póliza ${prima_poliza:,.0f}" if prima_poliza else "") + ")."
        )
        return True
