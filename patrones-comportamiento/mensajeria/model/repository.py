"""
Capa de Acceso a Datos (DAO / Repositorio) — Módulo de Mensajería.
Aísla el almacenamiento de las guías respecto de la lógica de negocio y la interfaz React.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from mensajeria.model.patterns.state import GuiaEnvioContext


class IGuiaEnvioDAO(ABC):
    """Contrato abstracto de acceso a datos para GuiaEnvioContext."""

    @abstractmethod
    def guardar(self, guia: GuiaEnvioContext) -> None:
        pass

    @abstractmethod
    def buscar_por_codigo(self, codigo_barras: str) -> Optional[GuiaEnvioContext]:
        pass

    @abstractmethod
    def listar_todas(self) -> List[GuiaEnvioContext]:
        pass


class GuiaEnvioMemoriaDAO(IGuiaEnvioDAO):
    """Implementación en memoria del DAO de Guías de Envío."""

    def __init__(self) -> None:
        self._almacen: Dict[str, GuiaEnvioContext] = {}

    def guardar(self, guia: GuiaEnvioContext) -> None:
        self._almacen[guia.codigo_barras] = guia

    def buscar_por_codigo(self, codigo_barras: str) -> Optional[GuiaEnvioContext]:
        return self._almacen.get(codigo_barras)

    def listar_todas(self) -> List[GuiaEnvioContext]:
        return list(self._almacen.values())
