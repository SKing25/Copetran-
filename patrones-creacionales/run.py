"""
Ejecutable Principal — Copetran (Arquitectura MVC / Tres Capas)
Demostración de los 5 Patrones Creacionales en el Proceso de Venta de Pasajes
"""

import sys
import os

# Asegurar que el directorio raíz esté en el PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from copetran.model.entities import (
    Pasajero, Ruta, Bus, Conductor, TipoTarifa, CanalVenta
)
from copetran.controller.venta_controller import VentaTiqueteController
from copetran.view.consola_view import ConsolaView


def ejecutar_demostracion():
    ConsolaView.banner("COPETRAN — SISTEMA INTEGRAL DE TRANSPORTE Y PASAJES\nDEMOSTRACIÓN DE PATRONES CREACIONALES (MVC)")

    controller = VentaTiqueteController()

    # Datos base para la simulación
    ruta_bog_buc = Ruta(
        id_ruta="RUT-001",
        origen="Bogotá D.C. (Terminal Salitre)",
        destino="Bucaramanga (Terminal Central)",
        distancia_km=398.0,
        tarifa_base=80000.0  # COP
    )

    bus_paradiso = Bus(
        placa="COP-742",
        modelo="Marcopolo Paradiso 1800 DD (Doble Piso)",
        capacidad_total=60,
        pisos=2
    )

    conductor_1 = Conductor(
        id_conductor="COND-101",
        nombre_completo="Carlos Arturo Mantilla",
        numero_licencia="C2-91823741",
        es_relevo=False
    )

    conductor_2 = Conductor(
        id_conductor="COND-102",
        nombre_completo="Javier Enrique Peña",
        numero_licencia="C2-73849120",
        es_relevo=True
    )

    # ==========================================================================
    # 1. DEMOSTRACIÓN: PATRÓN BUILDER
    # ==========================================================================
    ConsolaView.titulo_seccion(
        1, "BUILDER",
        "Construcción secuencial de un objeto complejo 'ViajeProgramado' con ruta, bus, conductores y 60 asientos."
    )

    viaje_1 = controller.programar_viaje_builder(
        codigo="VIAJE-BOG-BUC-0800",
        ruta=ruta_bog_buc,
        bus=bus_paradiso,
        c_principal=conductor_1,
        c_relevo=conductor_2,
        fecha="2026-10-01",
        hora="08:00 AM"
    )

    ConsolaView.exito("Viaje ensamblado exitosamente por el Director 'OperarioRutasDirector' y 'ViajeProgramadoBuilderImpl'.")
    ConsolaView.info("Código", viaje_1.codigo_viaje)
    ConsolaView.info("ID Único", viaje_1.id_viaje)
    ConsolaView.info("Ruta", f"{viaje_1.ruta.origen} -> {viaje_1.ruta.destino} ({viaje_1.ruta.distancia_km} km)")
    ConsolaView.info("Bus Asignado", f"{viaje_1.bus.placa} ({viaje_1.bus.modelo})")
    ConsolaView.info("Tripulación Doble", f"Principal: {viaje_1.conductor_principal.nombre_completo} | Relevo: {viaje_1.conductor_relevo.nombre_completo}")
    ConsolaView.info("Matriz de Asientos", f"{len(viaje_1.sillas)} sillas configuradas (12 VIP Cama Piso 1 / 48 Confort Piso 2)")
    ConsolaView.mostrar_mapa_sillas(viaje_1)

    # ==========================================================================
    # 2. DEMOSTRACIÓN: PATRÓN PROTOTYPE
    # ==========================================================================
    ConsolaView.titulo_seccion(
        2, "PROTOTYPE",
        "Clonación de plantillas de viaje regulares mediante el PrototypeManager 'CatalogoPlantillasViaje'."
    )

    # Registro en el PrototypeManager
    controller.guardar_plantilla_viaje("PLANTILLA_BOG_BUC_DIURNA", viaje_1)
    ConsolaView.exito("Viaje 'VIAJE-BOG-BUC-0800' registrado en 'CatalogoPlantillasViaje' bajo la clave 'PLANTILLA_BOG_BUC_DIURNA'.")

    # Clonación para la semana siguiente
    viaje_clonado = controller.clonar_viaje_semanal(
        clave="PLANTILLA_BOG_BUC_DIURNA",
        nueva_fecha="2026-10-08",
        nueva_hora="08:00 AM"
    )
    ConsolaView.exito("Copia profunda (deep copy) de la plantilla generada instantáneamente para la siguiente semana.")
    ConsolaView.info("Nuevo Código", viaje_clonado.codigo_viaje)
    ConsolaView.info("Nuevo ID", viaje_clonado.id_viaje)
    ConsolaView.info("Nueva Fecha", f"{viaje_clonado.fecha_salida} a las {viaje_clonado.hora_salida}")
    ConsolaView.info("Sillas Clonadas", f"{len(viaje_clonado.sillas)} sillas clonadas con estado reiniciado a DISPONIBLE.")

    # ==========================================================================
    # 3. DEMOSTRACIÓN: PATRÓN SINGLETON
    # ==========================================================================
    ConsolaView.titulo_seccion(
        3, "SINGLETON",
        "Gestión atómica de concurrencia y temporizadores de bloqueo (RF03) con 'GestorBloqueoSillas' y 'SecuenciadorTiquetes'."
    )

    silla_a_bloquear = 5  # Silla VIP Piso 1
    pasajero_1 = Pasajero(
        numero_documento="1098765432",
        tipo_documento="CC",
        nombre_completo="Nathalia Gómez Rueda",
        edad=28,
        email="nathalia.gomez@gmail.com"
    )

    # Bloqueo exitoso
    bloqueo_ok = controller.bloquear_silla(
        id_viaje=viaje_1.id_viaje,
        numero_silla=silla_a_bloquear,
        usuario=pasajero_1.nombre_completo,
        canal=CanalVenta.WEB
    )
    ConsolaView.exito(f"Silla #{silla_a_bloquear} bloqueada en memoria por 'GestorBloqueoSillas' por 180 segundos para {pasajero_1.nombre_completo}.")

    # Intento de colisión concurrente (Doble venta simulada)
    ConsolaView.advertencia("Simulando que otro cliente intenta comprar simultáneamente la misma silla desde TAQUILLA...")
    bloqueo_fallido = controller.bloquear_silla(
        id_viaje=viaje_1.id_viaje,
        numero_silla=silla_a_bloquear,
        usuario="Pedro Pablo Taquillero",
        canal=CanalVenta.TAQUILLA
    )

    if not bloqueo_fallido:
        ConsolaView.exito("Singleton bloqueó con éxito la colisión concurrente: La silla se encuentra protegida contra doble venta.")
    else:
        ConsolaView.error("Fallo de concurrencia: Silla duplicada.")

    # Secuenciador correlativo Singleton
    seq1 = controller.secuenciador_tiquetes.siguiente_consecutivo("TK-DEMO")
    seq2 = controller.secuenciador_tiquetes.siguiente_consecutivo("TK-DEMO")
    ConsolaView.info("Secuenciador Correlativo Atómico", f"Emisión correlativa garantizada: {seq1} -> {seq2}")

    # ==========================================================================
    # 4. DEMOSTRACIÓN: PATRÓN FACTORY METHOD
    # ==========================================================================
    ConsolaView.titulo_seccion(
        4, "FACTORY METHOD",
        "Fábrica de Tarifas de Pasajeros con validación estricta de requisitos legales y descuentos."
    )

    pasajero_adulto = Pasajero("63291842", "CC", "Rosalba Gutiérrez de Rodríguez", 67)
    pasajero_estudiante = Pasajero("101928374", "TI", "Nicolás Andrés Pérez", 20, tiene_carne_estudiantil=True)
    pasajero_nino = Pasajero("1092837192", "RC", "Samuel Díaz García", 8)
    pasajero_joven_sin_soporte = Pasajero("109823471", "CC", "Sebastián Castro", 24, tiene_carne_estudiantil=False)

    tarifa_base_vip = 100000.0  # Precio base de silla VIP Piso 1

    # Cotizaciones
    v_plena = controller.cotizar_pasaje(TipoTarifa.PLENA, pasajero_1, viaje_1.id_viaje, 1)
    v_adulto = controller.cotizar_pasaje(TipoTarifa.ADULTO_MAYOR, pasajero_adulto, viaje_1.id_viaje, 1)
    v_estud = controller.cotizar_pasaje(TipoTarifa.ESTUDIANTE, pasajero_estudiante, viaje_1.id_viaje, 1)
    v_infante = controller.cotizar_pasaje(TipoTarifa.INFANTE, pasajero_nino, viaje_1.id_viaje, 1)

    ConsolaView.info("Tarifa Plena (100%)", f"${v_plena:,.2f} COP (Sin descuentos)")
    ConsolaView.info("Tarifa Adulto Mayor (25% Dcto)", f"${v_adulto:,.2f} COP (Edad validada: {pasajero_adulto.edad} años)")
    ConsolaView.info("Tarifa Estudiante (20% Dcto)", f"${v_estud:,.2f} COP (Carné estudiantil validado)")
    ConsolaView.info("Tarifa Infante (50% Dcto)", f"${v_infante:,.2f} COP (Edad validada: {pasajero_nino.edad} años)")

    # Prueba de control de excepciones (Validación de soporte)
    try:
        controller.cotizar_pasaje(TipoTarifa.ESTUDIANTE, pasajero_joven_sin_soporte, viaje_1.id_viaje, 1)
    except ValueError as e:
        ConsolaView.exito(f"Factory Method validó y rechazó beneficio no acreditado: '{e}'")

    # ==========================================================================
    # 5. DEMOSTRACIÓN: PATRÓN ABSTRACT FACTORY
    # ==========================================================================
    ConsolaView.titulo_seccion(
        5, "ABSTRACT FACTORY",
        "Creación de familias completas de componentes coherentes según el canal comercial de venta."
    )

    # Venta 1: Canal WEB
    ConsolaView.info("Ejecutando Venta Canal", "WEB / APP DIGITAL")
    res_web = controller.ejecutar_venta_integral(
        id_viaje=viaje_1.id_viaje,
        numero_silla=silla_a_bloquear,  # Ya bloqueada previamente por este usuario
        pasajero=pasajero_1,
        tipo_tarifa=TipoTarifa.PLENA,
        canal=CanalVenta.WEB,
        datos_pago={"tarjeta_token": "tok_visa_4242", "banco": "Bancolombia PSE"}
    )
    ConsolaView.mostrar_tiquete_emitido(res_web["tiquete"], res_web["factura"], res_web)

    # Venta 2: Canal TAQUILLA (Presencial con datáfono y tirilla POS)
    ConsolaView.info("Ejecutando Venta Canal", "TAQUILLA TERMINAL (Presencial)")
    silla_taquilla = 2
    res_taq = controller.ejecutar_venta_integral(
        id_viaje=viaje_1.id_viaje,
        numero_silla=silla_taquilla,
        pasajero=pasajero_adulto,
        tipo_tarifa=TipoTarifa.ADULTO_MAYOR,
        canal=CanalVenta.TAQUILLA,
        datos_pago={"datáfono_id": "POS-TERM-04", "tipo": "DEBITO"}
    )
    ConsolaView.mostrar_tiquete_emitido(res_taq["tiquete"], res_taq["factura"], res_taq)

    # Venta 3: Canal AGENCIA ALIADA (B2B con voucher y notificación API)
    ConsolaView.info("Ejecutando Venta Canal", "AGENCIA ALIADA B2B (Corporativo)")
    silla_agencia = 15  # Piso 2 Confort
    res_b2b = controller.ejecutar_venta_integral(
        id_viaje=viaje_1.id_viaje,
        numero_silla=silla_agencia,
        pasajero=pasajero_estudiante,
        tipo_tarifa=TipoTarifa.ESTUDIANTE,
        canal=CanalVenta.AGENCIA_ALIADA,
        datos_pago={"voucher_corporativo": "VOUCH-AVIANCA-9921", "linea_credito": "CRED-CORP-482"}
    )
    ConsolaView.mostrar_tiquete_emitido(res_b2b["tiquete"], res_b2b["factura"], res_b2b)

    # ==========================================================================
    # 6. DEMOSTRACIÓN: REPROGRAMACIÓN DE TIQUETE ABIERTO (PROCESO G / PROTOTYPE)
    # ==========================================================================
    ConsolaView.titulo_seccion(
        6, "REPROGRAMACIÓN DE TIQUETE ABIERTO",
        "Clonación de un tiquete en estado ABIERTO para reasignar fecha y silla aplicando penalidad (Proceso G)."
    )

    # El pasajero de taquilla solicita cambiar a Tiquete Abierto
    id_tiquete_orig = res_taq["tiquete"].id_tiquete
    controller.habilitar_tiquete_abierto(id_tiquete_orig)
    ConsolaView.exito(f"Tiquete {res_taq['tiquete'].numero_tiquete} habilitado como TIQUETE ABIERTO (Vigencia 3 meses).")

    # Reprogramación al viaje clonado de la semana siguiente
    nueva_silla_reprog = 3  # Silla VIP en el viaje clonado
    tiquete_reprogramado = controller.reprogramar_tiquete_abierto(
        id_tiquete_abierto=id_tiquete_orig,
        nuevo_id_viaje=viaje_clonado.id_viaje,
        nuevo_numero_silla=nueva_silla_reprog,
        penalidad=15000.0  # Penalidad de reprogramación Copetran
    )

    ConsolaView.exito("Tiquete reprogramado con éxito mediante clonación del Prototipo.")
    ConsolaView.info("Nuevo Tiquete ID", tiquete_reprogramado.id_tiquete)
    ConsolaView.info("Nuevo Viaje", viaje_clonado.codigo_viaje)
    ConsolaView.info("Nueva Silla", f"#{tiquete_reprogramado.silla.numero} ({tiquete_reprogramado.silla.clase.value})")
    ConsolaView.info("Total Pagado (con penalidad)", f"${tiquete_reprogramado.valor_pagado:,.2f} COP")
    ConsolaView.info("QR Reprogramación", tiquete_reprogramado.codigo_qr)

    ConsolaView.banner("DEMOSTRACIÓN FINALIZADA CON ÉXITO — TODOS LOS PATRONES OPERATIVOS")


if __name__ == "__main__":
    ejecutar_demostracion()
