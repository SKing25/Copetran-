"""
Capa de Controlador — Copetran (MVC / Tres Capas)
Módulo: VentaTiqueteController

Orquesta el proceso de venta de pasajes integrando coordinadamente los 5 patrones creacionales:
1. Singleton: Bloqueo concurrente temporal de sillas (RF03) y secuenciador unívoco de tiquetes.
2. Builder: Ensamblaje paso a paso de despachos de viaje en buses de dos pisos.
3. Prototype: Clonación profunda de plantillas de viaje y reprogramación de tiquetes abiertos.
4. Abstract Factory: Familias de componentes por canal (Taquilla, Web y Agencia Aliada).
5. Factory Method: Liquidación de tarifas con descuentos validados (Adulto Mayor, Estudiante, etc.).
"""

from typing import Dict, List, Optional, Any
import uuid
from datetime import datetime

from copetran.model.entities import (
    Pasajero, Silla, Ruta, Conductor, Bus, Factura, Tiquete,
    TipoTarifa, CanalVenta, EstadoTiquete
)
from copetran.model.patterns.singleton import GestorBloqueoSillas, SecuenciadorTiquetes
from copetran.model.patterns.factory_method import FabricaTarifa, FabricaTarifaImpl
from copetran.model.patterns.abstract_factory import (
    FabricaCanalVenta, FabricaTaquilla, FabricaWeb, FabricaAgenciaAliada
)
from copetran.model.patterns.builder import (
    ViajeProgramado, ViajeProgramadoBuilderImpl, OperarioRutasDirector
)
from copetran.model.patterns.prototype import (
    CatalogoPlantillasViaje, TiqueteAbiertoPrototipo
)


class VentaTiqueteController:
    """
    Controlador Principal del Proceso de Venta y Emisión de Tiquetes.
    Aplica el principio de inversión de dependencias y coordina las capas de Modelo y Vista.
    """

    def __init__(self):
        # 1. Singletons
        self.gestor_bloqueo = GestorBloqueoSillas.get_instance()
        self.secuenciador_tiquetes = SecuenciadorTiquetes.get_instance()

        # 2. Factory Method
        self.fabrica_tarifas: FabricaTarifa = FabricaTarifaImpl()

        # 3. Prototype Manager
        self.catalogo_plantillas = CatalogoPlantillasViaje.get_instance()

        # 4. Builder
        self.director_viajes = OperarioRutasDirector(ViajeProgramadoBuilderImpl())

        # 5. Abstract Factories por canal
        self._fabricas_canal: Dict[CanalVenta, FabricaCanalVenta] = {
            CanalVenta.TAQUILLA: FabricaTaquilla(),
            CanalVenta.WEB: FabricaWeb(),
            CanalVenta.AGENCIA_ALIADA: FabricaAgenciaAliada()
        }

        # Repositorio en memoria (Simulación de Capa de Persistencia / DAO)
        self._viajes: Dict[str, ViajeProgramado] = {}
        self._tiquetes: Dict[str, Tiquete] = {}
        self._tiquetes_abiertos: Dict[str, TiqueteAbiertoPrototipo] = {}

    # ==========================================================================
    # CASO DE USO 1: PROGRAMAR VIAJE (PATRÓN BUILDER)
    # ==========================================================================

    def programar_viaje_builder(self, codigo: str, ruta: Ruta, bus: Bus,
                                c_principal: Conductor, c_relevo: Conductor,
                                fecha: str, hora: str) -> ViajeProgramado:
        """
        Ensambla y registra un viaje programado completo utilizando el patrón Builder.
        """
        viaje = self.director_viajes.armar_despacho_completo(
            codigo=codigo,
            ruta=ruta,
            bus=bus,
            c_principal=c_principal,
            c_relevo=c_relevo,
            fecha=fecha,
            hora=hora
        )
        self._viajes[viaje.id_viaje] = viaje
        return viaje

    # ==========================================================================
    # CASO DE USO 2: CLONAR PLANTILLA DE VIAJE (PATRÓN PROTOTYPE)
    # ==========================================================================

    def guardar_plantilla_viaje(self, clave: str, viaje: ViajeProgramado):
        """Registra un viaje base como plantilla en el PrototypeManager."""
        self.catalogo_plantillas.registrar_plantilla(clave, viaje)

    def clonar_viaje_semanal(self, clave: str, nueva_fecha: str,
                             nueva_hora: Optional[str] = None) -> ViajeProgramado:
        """
        Clona un viaje desde el PrototypeManager, con copia profunda de sus 60 sillas.
        """
        viaje_clonado = self.catalogo_plantillas.obtener_clon(
            clave=clave,
            nueva_fecha=nueva_fecha,
            nueva_hora=nueva_hora
        )
        self._viajes[viaje_clonado.id_viaje] = viaje_clonado
        return viaje_clonado

    # ==========================================================================
    # CASO DE USO 3: BLOQUEO TEMPORAL DE SILLA (PATRÓN SINGLETON + ABSTRACT FACTORY)
    # ==========================================================================

    def bloquear_silla(self, id_viaje: str, numero_silla: int, usuario: str,
                       canal: CanalVenta) -> bool:
        """
        Aplica bloqueo temporal mediante el componente del canal provisto por la Abstract Factory,
        el cual delega al Singleton centralizado GestorBloqueoSillas (RF03).
        """
        viaje = self._viajes.get(id_viaje)
        if not viaje:
            raise KeyError(f"No existe el viaje con ID '{id_viaje}'.")

        silla = viaje.obtener_silla(numero_silla)
        if not silla:
            raise ValueError(f"La silla #{numero_silla} no existe en este vehículo.")

        if silla.estado == EstadoTiquete.PAGADO:
            return False

        fabrica_canal = self._fabricas_canal[canal]
        componente_bloqueo = fabrica_canal.crear_bloqueo()
        exito = componente_bloqueo.ejecutar_bloqueo(id_viaje, numero_silla, usuario)

        if exito:
            silla.estado = EstadoTiquete.BLOQUEADO

        return exito

    def liberar_silla(self, id_viaje: str, numero_silla: int) -> bool:
        """Libera la silla en el Singleton y actualiza el estado."""
        viaje = self._viajes.get(id_viaje)
        if viaje:
            silla = viaje.obtener_silla(numero_silla)
            if silla and silla.estado == EstadoTiquete.BLOQUEADO:
                silla.estado = EstadoTiquete.DISPONIBLE
        return self.gestor_bloqueo.liberar_silla(id_viaje, numero_silla)

    # ==========================================================================
    # CASO DE USO 4: COTIZAR TARIFA (PATRÓN FACTORY METHOD)
    # ==========================================================================

    def cotizar_pasaje(self, tipo_tarifa: TipoTarifa, pasajero: Pasajero,
                       id_viaje: str, numero_silla: int) -> float:
        """
        Calcula el valor del pasaje según la tarifa creada por el Factory Method.
        """
        viaje = self._viajes.get(id_viaje)
        if not viaje:
            raise KeyError(f"No existe el viaje con ID '{id_viaje}'.")

        silla = viaje.obtener_silla(numero_silla)
        if not silla:
            raise ValueError(f"La silla #{numero_silla} no existe.")

        return self.fabrica_tarifas.cotizar_pasaje(
            tipo=tipo_tarifa,
            pasajero=pasajero,
            precio_base=silla.precio_base
        )

    # ==========================================================================
    # CASO DE USO 5: PROCESO INTEGRAL DE VENTA (INTEGRACIÓN 5 PATRONES)
    # ==========================================================================

    def ejecutar_venta_integral(self, id_viaje: str, numero_silla: int,
                                pasajero: Pasajero, tipo_tarifa: TipoTarifa,
                                canal: CanalVenta, datos_pago: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flujo de venta completo que integra armónicamente los 5 patrones:
        1. Bloqueo temporal atómico (Singleton / Abstract Factory)
        2. Creación y validación de tarifa (Factory Method)
        3. Cobro por pasarela o datáfono (Abstract Factory)
        4. Facturación tirilla o electrónica CUFE DIAN (Abstract Factory)
        5. Emisión de tiquete con consecutivo nacional correlativo (Singleton)
        6. Notificación impresa o digital con QR (Abstract Factory)
        """
        viaje = self._viajes.get(id_viaje)
        if not viaje:
            raise KeyError(f"Viaje '{id_viaje}' no encontrado.")

        silla = viaje.obtener_silla(numero_silla)
        if not silla:
            raise ValueError(f"Silla #{numero_silla} no encontrada.")

        # 1. Asegurar bloqueo temporal concurrente
        bloqueado = self.bloquear_silla(id_viaje, numero_silla, pasajero.nombre_completo, canal)
        if not bloqueado:
            info = self.gestor_bloqueo.obtener_info_bloqueo(id_viaje, numero_silla)
            usuario_bloqueador = info.usuario if info else "otro cliente"
            raise PermissionError(
                f"La silla #{numero_silla} se encuentra temporalmente bloqueada por {usuario_bloqueador}."
            )

        # 2. Factory Method: Instanciar y validar tarifa con soporte
        tarifa_obj = self.fabrica_tarifas.crear_tarifa(tipo_tarifa, pasajero)
        monto_final = tarifa_obj.calcular_precio(silla.precio_base)

        # 3. Abstract Factory del Canal
        fabrica_canal = self._fabricas_canal[canal]
        procesador_pago = fabrica_canal.crear_procesador_pago()
        emisor_factura = fabrica_canal.crear_emisor_factura()
        notificador = fabrica_canal.crear_notificador()

        # 4. Procesar Pago
        resultado_pago = procesador_pago.procesar(monto_final, datos_pago)
        if not resultado_pago.get("exitoso", False):
            self.liberar_silla(id_viaje, numero_silla)
            raise RuntimeError(f"Fallo en el pago: {resultado_pago.get('mensaje')}")

        # 5. Emitir Factura
        factura = emisor_factura.emitir(monto_final, {
            "documento": pasajero.numero_documento,
            "nombre": pasajero.nombre_completo
        })

        # 6. Singleton: Obtener número correlativo de tiquete
        prefijo_canal = "TK-TAQ" if canal == CanalVenta.TAQUILLA else "TK-WEB" if canal == CanalVenta.WEB else "TK-B2B"
        numero_tiquete = self.secuenciador_tiquetes.siguiente_consecutivo(prefijo=prefijo_canal)

        # 7. Crear el Tiquete formal
        tiquete = Tiquete(
            id_tiquete=str(uuid.uuid4()),
            numero_tiquete=numero_tiquete,
            id_viaje=id_viaje,
            silla=silla,
            pasajero=pasajero,
            tipo_tarifa=tipo_tarifa,
            valor_pagado=monto_final,
            estado=EstadoTiquete.PAGADO,
            canal=canal,
            factura=factura
        )

        # Marcar la silla como vendida y liberar bloqueo temporal
        silla.estado = EstadoTiquete.PAGADO
        self.gestor_bloqueo.liberar_silla(id_viaje, numero_silla)
        self._tiquetes[tiquete.id_tiquete] = tiquete

        # 8. Notificar / Emitir pase de abordaje
        mensaje_notificacion = notificador.entregar_comprobante(tiquete)

        return {
            "tiquete": tiquete,
            "factura": factura,
            "pago": resultado_pago,
            "tarifa_aplicada": tarifa_obj.get_descripcion(),
            "descuento_porcentaje": tarifa_obj.get_porcentaje_descuento() * 100,
            "notificacion": mensaje_notificacion
        }

    # ==========================================================================
    # CASO DE USO 6: REPROGRAMAR TIQUETE ABIERTO (PATRÓN PROTOTYPE)
    # ==========================================================================

    def habilitar_tiquete_abierto(self, id_tiquete: str) -> str:
        """Pone un tiquete en estado ABIERTO y lo registra en el prototipo."""
        tiquete = self._tiquetes.get(id_tiquete)
        if not tiquete:
            raise KeyError(f"Tiquete '{id_tiquete}' no encontrado.")

        tiquete.estado = EstadoTiquete.ABIERTO
        prototipo = TiqueteAbiertoPrototipo(tiquete)
        self._tiquetes_abiertos[tiquete.id_tiquete] = prototipo
        return tiquete.id_tiquete

    def reprogramar_tiquete_abierto(self, id_tiquete_abierto: str,
                                    nuevo_id_viaje: str, nuevo_numero_silla: int,
                                    penalidad: float = 15000.0) -> Tiquete:
        """
        Clona el tiquete abierto base y lo reasigna a un nuevo viaje y silla.
        """
        prototipo = self._tiquetes_abiertos.get(id_tiquete_abierto)
        if not prototipo:
            raise KeyError("No se encontró el tiquete abierto para reprogramación.")

        nuevo_viaje = self._viajes.get(nuevo_id_viaje)
        if not nuevo_viaje:
            raise KeyError(f"Nuevo viaje '{nuevo_id_viaje}' no existe.")

        nueva_silla = nuevo_viaje.obtener_silla(nuevo_numero_silla)
        if not nueva_silla or nueva_silla.estado != EstadoTiquete.DISPONIBLE:
            raise ValueError(f"La nueva silla #{nuevo_numero_silla} no está disponible.")

        # Clonar mediante Prototype
        tiquete_reprogramado = prototipo.clonar(
            nuevo_id_viaje=nuevo_id_viaje,
            nueva_silla=nueva_silla,
            penalidad=penalidad
        )

        nueva_silla.estado = EstadoTiquete.PAGADO
        self._tiquetes[tiquete_reprogramado.id_tiquete] = tiquete_reprogramado
        return tiquete_reprogramado

    # ==========================================================================
    # CONSULTAS DE APOYO PARA LA VISTA
    # ==========================================================================

    def listar_viajes(self) -> List[ViajeProgramado]:
        return list(self._viajes.values())

    def obtener_viaje(self, id_viaje: str) -> Optional[ViajeProgramado]:
        return self._viajes.get(id_viaje)

    def obtener_tiquete(self, id_tiquete: str) -> Optional[Tiquete]:
        return self._tiquetes.get(id_tiquete)
