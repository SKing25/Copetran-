"""
Patrón State — Copetran S.A. (Proceso C.2: Ciclo Operativo de la Guía de Envío)
Módulo independiente en patrones-comportamiento (alineado con ECU-02 y el frontend React).

Estados concretos: ADMITIDO, EN_TRANSITO, BODEGA_DESTINO, NOVEDAD, ENTREGADO.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Type

from mensajeria.model.entities import SolicitudAdmisionGuia
from mensajeria.model.exceptions import DatosSolicitudInvalidosError, TransicionInvalidaError


class EstadoGuia(ABC):
    """
    Rol GoF: State (Interfaz Abstracta de Estado).
    Declara las operaciones logísticas cuyo comportamiento varía según el estado actual
    y resuelve polimórficamente la transición solicitada sin condicionales en el controlador.
    """

    @property
    @abstractmethod
    def nombre_estado(self) -> str:
        """Identificador canónico del estado operativo."""

    @abstractmethod
    def despachar_ruta(self, guia: "GuiaEnvioContext") -> str:
        """Despacha el paquete hacia el corredor nacional."""

    @abstractmethod
    def arribar_bodega_destino(self, guia: "GuiaEnvioContext") -> str:
        """Registra la recepción física en la agencia o terminal de destino."""

    @abstractmethod
    def reportar_novedad(self, guia: "GuiaEnvioContext", motivo: str) -> str:
        """Retiene operativamente la guía ante una incidencia vial o de entrega."""

    @abstractmethod
    def resolver_novedad(self, guia: "GuiaEnvioContext", destino_reanudacion: str, solucion: str) -> str:
        """Levanta una novedad activa reanudando hacia tránsito o bodega destino."""

    @abstractmethod
    def confirmar_entrega(self, guia: "GuiaEnvioContext", documento_recibe: str) -> str:
        """Cierra definitivamente la guía registrando firma y documento del receptor."""

    def solicitar_transicion(self, guia: "GuiaEnvioContext", estado_destino: str, detalle: str = "") -> str:
        """
        Enruta polimórficamente la intención de cambio hacia la operación de negocio
        correspondiente, evitando bloques if/elif sobre el estado actual en el controlador.
        """
        if estado_destino == "ADMITIDO":
            raise TransicionInvalidaError(
                f"Transición bloqueada: la guía en {self.nombre_estado} no puede retroceder a ADMITIDO."
            )
        if estado_destino == "EN_TRANSITO":
            return self.despachar_ruta(guia)
        if estado_destino == "BODEGA_DESTINO":
            return self.arribar_bodega_destino(guia)
        if estado_destino == "NOVEDAD":
            return self.reportar_novedad(guia, detalle or "Retención operativa reportada")
        if estado_destino == "ENTREGADO":
            return self.confirmar_entrega(guia, detalle or "Firma y cédula verificadas")
        raise DatosSolicitudInvalidosError(f"Estado destino '{estado_destino}' no reconocido.")


class GuiaEnvioContext:
    """
    Rol GoF: Context (Contexto).
    Representa una Guía de Envío activa y delega todas las operaciones en su objeto EstadoGuia.
    """

    def __init__(
        self,
        id_guia: int,
        codigo_barras: str,
        solicitud: SolicitudAdmisionGuia,
        valor_total: float,
        numero_factura: Optional[str] = None,
        cufe_dian: Optional[str] = None,
    ) -> None:
        self.id_guia = id_guia
        self.codigo_barras = codigo_barras
        self.solicitud = solicitud
        self.valor_total = valor_total
        self.numero_factura = numero_factura
        self.cufe_dian = cufe_dian

        self.estado_actual: EstadoGuia = EstadoAdmitido()
        self.ultima_novedad: str = "Ninguna"
        self.documento_recibe: Optional[str] = None
        self.bitacora: List[str] = []
        self.registrar_evento(f"Guía {codigo_barras} creada en estado inicial {self.estado_actual.nombre_estado}.")

    def cambiar_estado(self, nuevo_estado: EstadoGuia) -> None:
        """Actualiza la referencia polimórfica interna al nuevo objeto EstadoGuia."""
        self.estado_actual = nuevo_estado

    def registrar_evento(self, detalle: str) -> None:
        """Añade una entrada auditable con marca temporal en la bitácora del contexto."""
        hora = datetime.now().strftime("%H:%M:%S")
        self.bitacora.append(f"[{hora}] {detalle}")

    # Delegación polimórfica pura hacia el objeto EstadoGuia activo
    def solicitar_transicion(self, estado_destino: str, detalle: str = "") -> str:
        return self.estado_actual.solicitar_transicion(self, estado_destino, detalle)

    def despachar_ruta(self) -> str:
        return self.estado_actual.despachar_ruta(self)

    def arribar_bodega_destino(self) -> str:
        return self.estado_actual.arribar_bodega_destino(self)

    def reportar_novedad(self, motivo: str = "Retención operativa en ruta") -> str:
        return self.estado_actual.reportar_novedad(self, motivo)

    def resolver_novedad(
        self,
        destino_reanudacion: str = "EN_TRANSITO",
        solucion: str = "Incidencia verificada y resuelta",
    ) -> str:
        return self.estado_actual.resolver_novedad(self, destino_reanudacion, solucion)

    def confirmar_entrega(self, documento_recibe: str = "Firma destinatario verificada") -> str:
        return self.estado_actual.confirmar_entrega(self, documento_recibe)


class EstadoAdmitido(EstadoGuia):
    """ConcreteState 1: Paquete admitido en agencia o bodega de origen."""

    @property
    def nombre_estado(self) -> str:
        return "ADMITIDO"

    def despachar_ruta(self, guia: GuiaEnvioContext) -> str:
        guia.cambiar_estado(EstadoEnTransito())
        msg = f"Guía {guia.codigo_barras} despachada hacia {guia.solicitud.ciudad_destino}."
        guia.registrar_evento(f"{msg} -> EN_TRANSITO")
        return msg

    def arribar_bodega_destino(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError(
            "Transición inválida: no puede llegar a bodega destino sin antes despacharse a EN_TRANSITO."
        )

    def reportar_novedad(self, guia: GuiaEnvioContext, motivo: str) -> str:
        guia.ultima_novedad = motivo
        guia.cambiar_estado(EstadoNovedad())
        msg = f"Retención en admisión/bodega: {motivo}."
        guia.registrar_evento(f"{msg} -> NOVEDAD")
        return msg

    def resolver_novedad(self, guia: GuiaEnvioContext, destino_reanudacion: str, solucion: str) -> str:
        raise TransicionInvalidaError("La guía está en ADMITIDO y no tiene novedades activas por resolver.")

    def confirmar_entrega(self, guia: GuiaEnvioContext, documento_recibe: str) -> str:
        raise TransicionInvalidaError(
            "Transición bloqueada: no se puede marcar ENTREGADO un paquete recién ADMITIDO."
        )


class EstadoEnTransito(EstadoGuia):
    """ConcreteState 2: Paquete en viaje nacional hacia la ciudad de destino."""

    @property
    def nombre_estado(self) -> str:
        return "EN_TRANSITO"

    def despachar_ruta(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError("La guía ya fue despachada y se encuentra actualmente EN_TRANSITO.")

    def arribar_bodega_destino(self, guia: GuiaEnvioContext) -> str:
        guia.cambiar_estado(EstadoBodegaDestino())
        msg = f"Guía {guia.codigo_barras} recibida en bodega destino ({guia.solicitud.ciudad_destino})."
        guia.registrar_evento(f"{msg} -> BODEGA_DESTINO")
        return msg

    def reportar_novedad(self, guia: GuiaEnvioContext, motivo: str) -> str:
        guia.ultima_novedad = motivo
        guia.cambiar_estado(EstadoNovedad())
        msg = f"Novedad operativa en carretera: {motivo}."
        guia.registrar_evento(f"{msg} -> NOVEDAD")
        return msg

    def resolver_novedad(self, guia: GuiaEnvioContext, destino_reanudacion: str, solucion: str) -> str:
        raise TransicionInvalidaError("La guía viaja normalmente sin novedades pendientes.")

    def confirmar_entrega(self, guia: GuiaEnvioContext, documento_recibe: str) -> str:
        raise TransicionInvalidaError(
            "Transición bloqueada: debe recepcionarse en BODEGA_DESTINO antes de entregarse."
        )


class EstadoBodegaDestino(EstadoGuia):
    """ConcreteState 3: Paquete en terminal destino disponible para entrega final."""

    @property
    def nombre_estado(self) -> str:
        return "BODEGA_DESTINO"

    def despachar_ruta(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError("La guía ya finalizó el trayecto nacional y está en BODEGA_DESTINO.")

    def arribar_bodega_destino(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError("La guía ya se encuentra registrada en BODEGA_DESTINO.")

    def reportar_novedad(self, guia: GuiaEnvioContext, motivo: str) -> str:
        guia.ultima_novedad = motivo
        guia.cambiar_estado(EstadoNovedad())
        msg = f"Incidencia en entrega de última milla: {motivo}."
        guia.registrar_evento(f"{msg} -> NOVEDAD")
        return msg

    def resolver_novedad(self, guia: GuiaEnvioContext, destino_reanudacion: str, solucion: str) -> str:
        raise TransicionInvalidaError("La guía en BODEGA_DESTINO no presenta novedad activa.")

    def confirmar_entrega(self, guia: GuiaEnvioContext, documento_recibe: str) -> str:
        if not documento_recibe.strip():
            raise TransicionInvalidaError(
                "Se requiere firma y cédula del destinatario para cerrar la entrega."
            )
        guia.documento_recibe = documento_recibe.strip()
        guia.cambiar_estado(EstadoEntregado())
        msg = f"Entrega final exitosa recibida por: {guia.documento_recibe}."
        guia.registrar_evento(f"{msg} -> ENTREGADO")
        return msg


class EstadoNovedad(EstadoGuia):
    """ConcreteState 4: Paquete retenido; impide entrega directa hasta resolver la novedad."""

    @property
    def nombre_estado(self) -> str:
        return "NOVEDAD"

    def solicitar_transicion(self, guia: GuiaEnvioContext, estado_destino: str, detalle: str = "") -> str:
        """En NOVEDAD, avanzar a EN_TRANSITO o BODEGA_DESTINO ejecuta polimórficamente resolver_novedad()."""
        if estado_destino in ("EN_TRANSITO", "BODEGA_DESTINO"):
            return self.resolver_novedad(
                guia, estado_destino, detalle or "Incidencia operativa verificada y superada"
            )
        return super().solicitar_transicion(guia, estado_destino, detalle)

    def despachar_ruta(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError(
            f"Acción bloqueada: guía retenida en NOVEDAD ({guia.ultima_novedad})."
        )

    def arribar_bodega_destino(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError("Acción bloqueada: resuelva primero la novedad activa.")

    def reportar_novedad(self, guia: GuiaEnvioContext, motivo: str) -> str:
        raise TransicionInvalidaError("La guía ya se encuentra en estado NOVEDAD.")

    def resolver_novedad(self, guia: GuiaEnvioContext, destino_reanudacion: str, solucion: str) -> str:
        if destino_reanudacion not in ("EN_TRANSITO", "BODEGA_DESTINO"):
            raise TransicionInvalidaError(
                f"Desde NOVEDAD solo puede reanudarse hacia EN_TRANSITO o BODEGA_DESTINO (no '{destino_reanudacion}')."
            )
        nuevo = EstadoBodegaDestino() if destino_reanudacion == "BODEGA_DESTINO" else EstadoEnTransito()
        guia.cambiar_estado(nuevo)
        guia.ultima_novedad = "Resuelta"
        msg = f"Novedad resuelta ({solucion}). La guía retoma estado {nuevo.nombre_estado}."
        guia.registrar_evento(msg)
        return msg

    def confirmar_entrega(self, guia: GuiaEnvioContext, documento_recibe: str) -> str:
        raise TransicionInvalidaError(
            "Transición bloqueada: no puede entregarse una guía con NOVEDAD activa."
        )


class EstadoEntregado(EstadoGuia):
    """ConcreteState 5: Estado terminal inmutable tras entrega certificada."""

    @property
    def nombre_estado(self) -> str:
        return "ENTREGADO"

    def despachar_ruta(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError("Operación rechazada: la guía ya fue ENTREGADA y cerrada definitivamente.")

    def arribar_bodega_destino(self, guia: GuiaEnvioContext) -> str:
        raise TransicionInvalidaError("Operación rechazada: la guía ya está en estado terminal ENTREGADO.")

    def reportar_novedad(self, guia: GuiaEnvioContext, motivo: str) -> str:
        raise TransicionInvalidaError("Operación rechazada: no se permiten novedades sobre una guía ENTREGADA.")

    def resolver_novedad(self, guia: GuiaEnvioContext, destino_reanudacion: str, solucion: str) -> str:
        raise TransicionInvalidaError("Operación rechazada: la guía ya fue ENTREGADA.")

    def confirmar_entrega(self, guia: GuiaEnvioContext, documento_recibe: str) -> str:
        raise TransicionInvalidaError("Operación rechazada: el paquete ya había sido entregado previamente.")


ESTADOS_POR_NOMBRE: Dict[str, Type[EstadoGuia]] = {
    "ADMITIDO": EstadoAdmitido,
    "EN_TRANSITO": EstadoEnTransito,
    "BODEGA_DESTINO": EstadoBodegaDestino,
    "NOVEDAD": EstadoNovedad,
    "ENTREGADO": EstadoEntregado,
}
