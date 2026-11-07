"""
Validadores de Entrada en la Frontera de Control — Módulo de Mensajería (Copetran S.A.)
Garantiza integridad de tipos, rangos no negativos y catálogos permitidos antes de invocar
la lógica de dominio, diferenciando errores HTTP 400 (datos malformados) de rechazos de
reglas de negocio evaluadas por Chain of Responsibility (HTTP 422) o State (HTTP 409).
"""

import math
from typing import Any, Tuple

from mensajeria.model.entities import CategoriaMercancia, SolicitudAdmisionGuia
from mensajeria.model.exceptions import DatosSolicitudInvalidosError
from mensajeria.model.patterns.state import ESTADOS_POR_NOMBRE

CANALES_PERMITIDOS = {"TAQUILLA", "WEB", "APP", "AGENCIA_ALIADA"}


def _leer_numero(datos: dict, campo: str, por_defecto: float = 0.0, permitir_cero: bool = True) -> float:
    valor_crudo = datos.get(campo, por_defecto)
    if isinstance(valor_crudo, bool) or valor_crudo is None:
        raise DatosSolicitudInvalidosError(f"El campo '{campo}' debe ser un número válido.")
    try:
        numero = float(valor_crudo)
    except (TypeError, ValueError) as exc:
        raise DatosSolicitudInvalidosError(f"El campo '{campo}' tiene un formato numérico inválido.") from exc

    if not math.isfinite(numero):
        raise DatosSolicitudInvalidosError(f"El campo '{campo}' no admite valores infinitos o NaN.")
    if numero < 0 or (not permitir_cero and numero == 0):
        criterio = "mayor o igual a 0" if permitir_cero else "estrictamente mayor a 0"
        raise DatosSolicitudInvalidosError(f"El campo '{campo}' debe ser {criterio}.")
    return numero


def _leer_booleano(datos: dict, campo: str, por_defecto: bool) -> bool:
    valor = datos.get(campo, por_defecto)
    if isinstance(valor, bool):
        return valor
    raise DatosSolicitudInvalidosError(f"El campo '{campo}' debe ser un valor booleano (true/false).")


def construir_solicitud_admision(datos: Any) -> SolicitudAdmisionGuia:
    """Valida estructuralmente el payload JSON y construye SolicitudAdmisionGuia."""
    if not isinstance(datos, dict):
        raise DatosSolicitudInvalidosError("El cuerpo de la petición debe ser un objeto JSON válido.")

    categoria_raw = str(datos.get("categoria", "GENERAL")).strip().upper()
    try:
        categoria = CategoriaMercancia(categoria_raw)
    except ValueError as exc:
        permitidas = ", ".join(c.value for c in CategoriaMercancia)
        raise DatosSolicitudInvalidosError(
            f"Categoría '{categoria_raw}' inválida. Valores permitidos: {permitidas}."
        ) from exc

    canal_venta = str(datos.get("canal_venta", "WEB")).strip().upper()
    if canal_venta not in CANALES_PERMITIDOS:
        raise DatosSolicitudInvalidosError(
            f"Canal de venta '{canal_venta}' no reconocido. Permitidos: {', '.join(sorted(CANALES_PERMITIDOS))}."
        )

    # Nota: peso_real_kg == 0 o valor_declarado == 0 se permiten pasar con >= 0 hacia
    # Chain of Responsibility cuando son números válidos para que el eslabón respectivo
    # registre la traza de rechazo de negocio; valores negativos o corruptos fallan con 400.
    peso_real_kg = _leer_numero(datos, "peso_real_kg", por_defecto=0.0, permitir_cero=True)
    largo_cm = _leer_numero(datos, "largo_cm", por_defecto=0.0, permitir_cero=True)
    ancho_cm = _leer_numero(datos, "ancho_cm", por_defecto=0.0, permitir_cero=True)
    alto_cm = _leer_numero(datos, "alto_cm", por_defecto=0.0, permitir_cero=True)
    valor_declarado = _leer_numero(datos, "valor_declarado", por_defecto=500_000.0, permitir_cero=True)

    return SolicitudAdmisionGuia(
        remitente=str(datos.get("remitente", "")).strip(),
        destinatario=str(datos.get("destinatario", "")).strip(),
        ciudad_origen=str(datos.get("ciudad_origen", "Bogotá")).strip(),
        ciudad_destino=str(datos.get("ciudad_destino", "Bucaramanga")).strip(),
        direccion_recogida=str(datos.get("direccion_recogida", "Bodega Principal")).strip() or "Bodega Principal",
        categoria=categoria,
        peso_real_kg=peso_real_kg,
        largo_cm=largo_cm,
        ancho_cm=ancho_cm,
        alto_cm=alto_cm,
        valor_declarado=valor_declarado,
        tiene_poliza_extra=_leer_booleano(datos, "tiene_poliza_extra", False),
        paga_inmediato=_leer_booleano(datos, "paga_inmediato", True),
        canal_venta=canal_venta,
    )


def validar_peticion_transicion(datos: Any) -> Tuple[str, str, str]:
    """Valida estructuralmente una petición de cambio de estado antes de delegar en State."""
    if not isinstance(datos, dict):
        raise DatosSolicitudInvalidosError("El cuerpo de la petición debe ser un objeto JSON válido.")

    codigo_barras = str(datos.get("codigo_barras", "")).strip()
    if not codigo_barras:
        raise DatosSolicitudInvalidosError("Debe indicar un 'codigo_barras' no vacío.")

    nuevo_estado = str(datos.get("nuevo_estado", "")).strip().upper()
    if nuevo_estado not in ESTADOS_POR_NOMBRE:
        permitidos = ", ".join(ESTADOS_POR_NOMBRE.keys())
        raise DatosSolicitudInvalidosError(
            f"Estado destino '{nuevo_estado}' inválido. Estados válidos: {permitidos}."
        )

    detalle = str(datos.get("detalle", "")).strip()
    return codigo_barras, nuevo_estado, detalle

