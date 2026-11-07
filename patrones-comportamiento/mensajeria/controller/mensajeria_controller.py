"""
Controlador de Mensajería y Encomiendas (Capa de Control MVC / Lógica de Negocio).
Orquesta los dos patrones de comportamiento implementados (Chain of Responsibility y State)
y se integra por importación limpia (sin duplicar carpetas) con patrones-creacionales.
"""

import os
import sys
from typing import Any, Dict, List, Optional

# Importación modular limpia desde la carpeta hermana ../patrones-creacionales (sin copiar archivos)
RUTA_CREACIONALES = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "patrones-creacionales")
)
if os.path.isdir(RUTA_CREACIONALES) and RUTA_CREACIONALES not in sys.path:
    sys.path.insert(0, RUTA_CREACIONALES)

from copetran.model.patterns.singleton import SecuenciadorTiquetes  # type: ignore
from copetran.model.patterns.abstract_factory import (  # type: ignore
    FabricaAgenciaAliada,
    FabricaTaquilla,
    FabricaWeb,
)

from mensajeria.model.entities import SolicitudAdmisionGuia
from mensajeria.model.exceptions import DatosSolicitudInvalidosError, GuiaNoEncontradaError
from mensajeria.model.patterns.chain_of_responsibility import (
    LiquidadorTarifaYPolizaHandler,
    ResultadoValidacionCadena,
    ValidadorDatosYCoberturaHandler,
    ValidadorPesoYCubicajeHandler,
)
from mensajeria.model.patterns.state import ESTADOS_POR_NOMBRE, GuiaEnvioContext
from mensajeria.model.repository import GuiaEnvioMemoriaDAO, IGuiaEnvioDAO


class MensajeriaController:
    """
    Controlador del Proceso C (Mensajería y Transporte de Paquetes).
    Conecta el Frontend React (Vista) con los patrones de comportamiento y el DAO.
    """

    def __init__(self, dao: Optional[IGuiaEnvioDAO] = None) -> None:
        self.dao: IGuiaEnvioDAO = dao or GuiaEnvioMemoriaDAO()
        self._contador_id = 5000

        # Conexión limpia con Singleton y Abstract Factory de patrones-creacionales
        self.secuenciador = SecuenciadorTiquetes.get_instance()
        self._fabricas_canal = {
            "TAQUILLA": FabricaTaquilla(),
            "WEB": FabricaWeb(),
            "APP": FabricaWeb(),
            "AGENCIA_ALIADA": FabricaAgenciaAliada(),
        }

        # Construcción de la Cadena de Responsabilidad (Chain of Responsibility)
        eslabon_datos = ValidadorDatosYCoberturaHandler()
        eslabon_peso = ValidadorPesoYCubicajeHandler()
        eslabon_tarifa = LiquidadorTarifaYPolizaHandler()
        eslabon_datos.enlazar_siguiente(eslabon_peso).enlazar_siguiente(eslabon_tarifa)
        self._cadena_admision = eslabon_datos

    def admitir_guia(self, solicitud: SolicitudAdmisionGuia) -> Dict[str, Any]:
        """Ejecuta Chain of Responsibility; si aprueba, factura e inicia el Contexto de State."""
        resultado = ResultadoValidacionCadena()
        self._cadena_admision.validar(solicitud, resultado)

        if not resultado.aprobado:
            return {
                "aprobado": False,
                "eslabon_rechazo": resultado.eslabon_rechazo,
                "motivo_rechazo": resultado.motivo_rechazo,
                "trazabilidad": resultado.trazabilidad,
            }

        numero_factura = None
        cufe = None
        if solicitud.paga_inmediato:
            fabrica = self._fabricas_canal.get(solicitud.canal_venta.upper(), FabricaWeb())
            factura = fabrica.crear_emisor_factura().emitir(
                resultado.costo_flete,
                {"remitente": solicitud.remitente, "destinatario": solicitud.destinatario},
            )
            numero_factura = factura.numero_factura
            cufe = factura.cufe

        self._contador_id += 1
        codigo_barras = self.secuenciador.siguiente_consecutivo(prefijo="GU")

        guia = GuiaEnvioContext(
            id_guia=self._contador_id,
            codigo_barras=codigo_barras,
            solicitud=solicitud,
            valor_total=resultado.costo_flete,
            numero_factura=numero_factura,
            cufe_dian=cufe,
        )
        self.dao.guardar(guia)

        return {
            "aprobado": True,
            "id_guia": guia.id_guia,
            "codigo_barras": guia.codigo_barras,
            "peso_facturable_kg": resultado.peso_facturable_kg,
            "costo_flete": resultado.costo_flete,
            "estado_actual": guia.estado_actual.nombre_estado,
            "numero_factura": numero_factura,
            "cufe_dian": cufe,
            "trazabilidad": resultado.trazabilidad,
            "bitacora_state": guia.bitacora,
        }

    def sincronizar_guia_existente(
        self,
        codigo_barras: str,
        estado_inicial: str,
        solicitud: SolicitudAdmisionGuia,
        valor_total: float,
    ) -> GuiaEnvioContext:
        """Registra bajo demanda una guía semilla del frontend React si aún no está en memoria."""
        existente = self.dao.buscar_por_codigo(codigo_barras)
        if existente:
            return existente

        estado_norm = estado_inicial.strip().upper()
        if estado_norm not in ESTADOS_POR_NOMBRE:
            raise DatosSolicitudInvalidosError(f"Estado semilla '{estado_inicial}' no válido.")

        self._contador_id += 1
        guia = GuiaEnvioContext(self._contador_id, codigo_barras, solicitud, valor_total)
        guia.cambiar_estado(ESTADOS_POR_NOMBRE[estado_norm]())
        self.dao.guardar(guia)
        return guia

    def cambiar_estado_guia(
        self,
        codigo_barras: str,
        nuevo_estado: str,
        detalle: str = "",
    ) -> Dict[str, Any]:
        """Delega polimórficamente la transición solicitada al objeto EstadoGuia activo (Patrón State)."""
        guia = self.dao.buscar_por_codigo(codigo_barras)
        if not guia:
            raise GuiaNoEncontradaError(f"No existe la guía '{codigo_barras}' en el repositorio.")

        estado_anterior = guia.estado_actual.nombre_estado
        mensaje = guia.solicitar_transicion(nuevo_estado.strip().upper(), detalle)

        return {
            "exitoso": True,
            "codigo_barras": guia.codigo_barras,
            "estado_anterior": estado_anterior,
            "estado_actual": guia.estado_actual.nombre_estado,
            "mensaje": mensaje,
            "bitacora_state": guia.bitacora,
        }

    def listar_guias(self) -> List[GuiaEnvioContext]:
        return self.dao.listar_todas()
