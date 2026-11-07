"""
Excepciones de Dominio — Módulo de Mensajería y Encomiendas (Copetran S.A.)
Permiten diferenciar errores estructurales de entrada (HTTP 400), recursos inexistentes
(HTTP 404) y transiciones de negocio bloqueadas por el Patrón State (HTTP 409).
"""


class MensajeriaError(Exception):
    """Excepción raíz del subsistema de mensajería y transporte de encomiendas."""


class DatosSolicitudInvalidosError(MensajeriaError, ValueError):
    """Se lanza cuando la petición contiene tipos inválidos, campos faltantes o valores corruptos."""


class GuiaNoEncontradaError(MensajeriaError, KeyError):
    """Se lanza cuando se consulta o transiciona un código de guía inexistente en el DAO."""


class TransicionInvalidaError(MensajeriaError, ValueError):
    """Se lanza cuando el objeto EstadoGuia actual bloquea polimórficamente una transición ilegal."""

