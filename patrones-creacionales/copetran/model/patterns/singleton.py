"""
Patrón Singleton — Copetran (Proceso de Venta de Pasajes)
Capa de Modelo / Patrones Creacionales

Implementa:
1. GestorBloqueoSillas: Árbitro centralizado y thread-safe de concurrencia de sillas.
   Retiene la silla durante 180 segundos (3 minutos) cumpliendo con RF03 para evitar
   la doble venta simultánea entre Taquilla, Web y App Móvil.
2. SecuenciadorTiquetes: Generador unívoco de consecutivos oficiales de tiquete.
"""

import threading
import time
from typing import Dict, Tuple, Optional, List
from dataclasses import dataclass
from copetran.model.entities import CanalVenta


@dataclass
class BloqueoInfo:
    """Información de bloqueo temporal de una silla."""
    id_viaje: str
    numero_silla: int
    usuario: str
    canal: CanalVenta
    timestamp_bloqueo: float
    ttl_segundos: int = 180

    @property
    def ha_expirado(self) -> bool:
        return (time.time() - self.timestamp_bloqueo) > self.ttl_segundos

    @property
    def segundos_restantes(self) -> int:
        restante = int(self.ttl_segundos - (time.time() - self.timestamp_bloqueo))
        return max(0, restante)


class GestorBloqueoSillas:
    """
    Singleton que gestiona el bloqueo atómico y temporal de sillas en memoria.
    Garantiza que una misma silla no pueda ser vendida por dos canales en simultáneo.
    """
    _instance: Optional["GestorBloqueoSillas"] = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(GestorBloqueoSillas, cls).__new__(cls)
                cls._instance._bloqueos: Dict[Tuple[str, int], BloqueoInfo] = {}
                cls._instance._internal_lock = threading.Lock()
        return cls._instance

    @classmethod
    def get_instance(cls) -> "GestorBloqueoSillas":
        """Punto de acceso global al Singleton."""
        if cls._instance is None:
            return cls()
        return cls._instance

    def bloquear_silla(self, id_viaje: str, numero_silla: int, usuario: str,
                       canal: CanalVenta = CanalVenta.TAQUILLA, ttl_segundos: int = 180) -> bool:
        """
        Bloquea temporalmente una silla para un viaje por un tiempo TTL (por defecto 180s / 3 min).
        Retorna True si el bloqueo fue exitoso, o False si ya estaba bloqueada.
        """
        clave = (id_viaje, numero_silla)
        with self._internal_lock:
            if clave in self._bloqueos:
                bloqueo_existente = self._bloqueos[clave]
                if not bloqueo_existente.ha_expirado:
                    if bloqueo_existente.usuario == usuario:
                        # El mismo usuario confirma o renueva su propio bloqueo activo
                        bloqueo_existente.timestamp_bloqueo = time.time()
                        return True
                    # Silla actualmente bloqueada por otro usuario o canal
                    return False
                # Si expiró, se sobreescribe el bloqueo
            self._bloqueos[clave] = BloqueoInfo(
                id_viaje=id_viaje,
                numero_silla=numero_silla,
                usuario=usuario,
                canal=canal,
                timestamp_bloqueo=time.time(),
                ttl_segundos=ttl_segundos
            )
            return True

    def liberar_silla(self, id_viaje: str, numero_silla: int) -> bool:
        """Libera la silla para que quede disponible nuevamente en el inventario."""
        clave = (id_viaje, numero_silla)
        with self._internal_lock:
            if clave in self._bloqueos:
                del self._bloqueos[clave]
                return True
            return False

    def esta_bloqueada(self, id_viaje: str, numero_silla: int) -> bool:
        """Verifica si la silla está bloqueada y con tiempo vigente."""
        clave = (id_viaje, numero_silla)
        with self._internal_lock:
            if clave in self._bloqueos:
                bloqueo = self._bloqueos[clave]
                if not bloqueo.ha_expirado:
                    return True
                # Si expiró, limpiar
                del self._bloqueos[clave]
            return False

    def obtener_info_bloqueo(self, id_viaje: str, numero_silla: int) -> Optional[BloqueoInfo]:
        """Obtiene detalles del bloqueo si está vigente."""
        clave = (id_viaje, numero_silla)
        with self._internal_lock:
            if clave in self._bloqueos:
                bloqueo = self._bloqueos[clave]
                if not bloqueo.ha_expirado:
                    return bloqueo
                del self._bloqueos[clave]
            return None

    def limpiar_expiradas(self) -> int:
        """Limpia todos los bloqueos expirados."""
        with self._internal_lock:
            claves_a_borrar = [k for k, v in self._bloqueos.items() if v.ha_expirado]
            for k in claves_a_borrar:
                del self._bloqueos[k]
            return len(claves_a_borrar)

    def reiniciar(self):
        """Reinicia el estado en memoria (para pruebas unitarias)."""
        with self._internal_lock:
            self._bloqueos.clear()


class SecuenciadorTiquetes:
    """
    Singleton que garantiza la numeración correlativa estricta y sin saltos
    de tiquetes de viaje para cumplimiento tributario DIAN y auditoría.
    """
    _instance: Optional["SecuenciadorTiquetes"] = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SecuenciadorTiquetes, cls).__new__(cls)
                cls._instance._contadores: Dict[str, int] = {}
                cls._instance._internal_lock = threading.Lock()
        return cls._instance

    @classmethod
    def get_instance(cls) -> "SecuenciadorTiquetes":
        if cls._instance is None:
            return cls()
        return cls._instance

    def siguiente_consecutivo(self, prefijo: str = "TK-BOG") -> str:
        """Genera el siguiente número de tiquete con formato unívoco (ej. TK-BOG-0001)."""
        with self._internal_lock:
            actual = self._contadores.get(prefijo, 0) + 1
            self._contadores[prefijo] = actual
            return f"{prefijo}-{actual:05d}"

    def reiniciar(self):
        with self._internal_lock:
            self._contadores.clear()
