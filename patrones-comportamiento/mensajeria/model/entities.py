"""
Entidades de Dominio de Mensajería y Encomiendas (Proceso C — ECU-02)
Alineadas con los tipos del frontend React (frontend/src/types/copetran.ts).
"""

from dataclasses import dataclass
from enum import Enum


class CategoriaMercancia(Enum):
    GENERAL = "GENERAL"
    PERECEDERA = "PERECEDERA"
    FRAGIL = "FRAGIL"
    VALORES = "VALORES"


@dataclass
class SolicitudAdmisionGuia:
    """Datos de entrada de una solicitud de recogida o admisión en bodega."""
    remitente: str
    destinatario: str
    ciudad_origen: str
    ciudad_destino: str
    direccion_recogida: str
    categoria: CategoriaMercancia
    peso_real_kg: float
    largo_cm: float = 0.0
    ancho_cm: float = 0.0
    alto_cm: float = 0.0
    valor_declarado: float = 500_000.0
    tiene_poliza_extra: bool = False
    paga_inmediato: bool = True
    canal_venta: str = "WEB"

    @property
    def peso_volumetrico_kg(self) -> float:
        """Peso volumétrico estándar (largo * ancho * alto / 5000)."""
        if self.largo_cm > 0 and self.ancho_cm > 0 and self.alto_cm > 0:
            return round((self.largo_cm * self.ancho_cm * self.alto_cm) / 5000.0, 2)
        return 0.0

    @property
    def peso_facturable_kg(self) -> float:
        """Se liquida y controla el mayor entre peso real y peso volumétrico."""
        return round(max(self.peso_real_kg, self.peso_volumetrico_kg), 2)
