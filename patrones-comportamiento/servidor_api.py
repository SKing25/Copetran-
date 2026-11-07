"""
Servidor API REST Integrador (Flask) — Copetran S.A.
Conecta el Frontend en React (Capa de Presentación MVC: frontend/) con los dos paquetes separados:
  1. ../patrones-creacionales  -> VentaTiqueteController (Proceso A: Pasajeros)
  2. ./mensajeria              -> MensajeriaController (Proceso C: Chain of Responsibility + State)
"""

import os
import sys
from flask import Flask, jsonify, request

RUTA_ACTUAL = os.path.dirname(os.path.abspath(__file__))
RUTA_CREACIONALES = os.path.abspath(os.path.join(RUTA_ACTUAL, "..", "patrones-creacionales"))
for ruta in (RUTA_ACTUAL, RUTA_CREACIONALES):
    if ruta not in sys.path:
        sys.path.insert(0, ruta)

from copetran.controller.venta_controller import VentaTiqueteController  # type: ignore
from copetran.model.entities import (  # type: ignore
    Bus,
    CanalVenta,
    Conductor,
    Pasajero,
    Ruta,
    TipoTarifa,
)
from mensajeria.controller.mensajeria_controller import MensajeriaController
from mensajeria.controller.validacion import (
    construir_solicitud_admision,
    validar_peticion_transicion,
)
from mensajeria.model.entities import CategoriaMercancia, SolicitudAdmisionGuia
from mensajeria.model.exceptions import (
    DatosSolicitudInvalidosError,
    GuiaNoEncontradaError,
    TransicionInvalidaError,
)

app = Flask(__name__)

# Instancias de controladores separados (Creacionales vs Comportamiento)
venta_controller = VentaTiqueteController()
mensajeria_controller = MensajeriaController()

# Inicializar un despacho base con Builder y Prototype en el módulo creacional
_ruta_base = Ruta("RUT-01", "Bogotá", "Bucaramanga", 398.0, 85000.0)
_bus_base = Bus("COP-742", "Marcopolo Paradiso DD", 60, 2)
_c1 = Conductor("C1", "Carlos Mantilla", "LIC-9912", False)
_c2 = Conductor("C2", "Javier Peña", "LIC-8821", True)
_viaje_inicial = venta_controller.programar_viaje_builder(
    "VIAJE-BOG-BUC-0800", _ruta_base, _bus_base, _c1, _c2, "2026-11-10", "08:00"
)
venta_controller.guardar_plantilla_viaje("PLANTILLA_BOG_BUC", _viaje_inicial)


@app.after_request
def habilitar_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "modulos_conectados": [
            "patrones-creacionales (Builder, Prototype, Singleton, Factory Method, Abstract Factory)",
            "patrones-comportamiento (Chain of Responsibility, State)",
        ],
    })


@app.route("/api/comportamiento/guias", methods=["GET"])
def api_listar_guias():
    """Expone las guías activas persistidas en el DAO para auditoría y sincronización."""
    guias = [
        {
            "id_guia": g.id_guia,
            "codigo_barras": g.codigo_barras,
            "remitente": g.solicitud.remitente,
            "destinatario": g.solicitud.destinatario,
            "ciudad_origen": g.solicitud.ciudad_origen,
            "ciudad_destino": g.solicitud.ciudad_destino,
            "categoria": g.solicitud.categoria.value,
            "peso_facturable_kg": g.solicitud.peso_facturable_kg,
            "valor_total": g.valor_total,
            "estado_actual": g.estado_actual.nombre_estado,
            "numero_factura": g.numero_factura,
            "cufe_dian": g.cufe_dian,
            "bitacora_state": g.bitacora,
        }
        for g in mensajeria_controller.listar_guias()
    ]
    return jsonify({"total": len(guias), "guias": guias}), 200


@app.route("/api/comportamiento/admitir", methods=["POST"])
def api_admitir_guia():
    """Valida entrada (400), ejecuta Chain of Responsibility (200 / 422) e inicia State."""
    datos = request.get_json(silent=True)
    try:
        solicitud = construir_solicitud_admision(datos)
        resultado = mensajeria_controller.admitir_guia(solicitud)
        codigo_http = 200 if resultado["aprobado"] else 422
        return jsonify(resultado), codigo_http
    except DatosSolicitudInvalidosError as err:
        return jsonify({
            "aprobado": False,
            "error_validacion_entrada": True,
            "motivo_rechazo": str(err),
            "trazabilidad": [f"[ERROR 400 - Entrada Inválida] {err}"],
        }), 400


@app.route("/api/comportamiento/estado", methods=["POST"])
def api_cambiar_estado_guia():
    """Valida entrada (400), verifica existencia (404) y delega transición a State (200 / 409)."""
    datos = request.get_json(silent=True)
    try:
        codigo_barras, nuevo_estado, detalle = validar_peticion_transicion(datos)

        # Sincronización explícita solo para guías semilla precargadas en la interfaz React
        if (
            isinstance(datos, dict)
            and bool(datos.get("sincronizar_semilla", False))
            and mensajeria_controller.dao.buscar_por_codigo(codigo_barras) is None
        ):
            categoria_seed = CategoriaMercancia(str(datos.get("categoria", "GENERAL")).upper())
            sol_seed = SolicitudAdmisionGuia(
                remitente=str(datos.get("remitente", "Remitente Registrado")),
                destinatario=str(datos.get("destinatario", "Destinatario Registrado")),
                ciudad_origen="Bogotá",
                ciudad_destino="Bucaramanga",
                direccion_recogida="Agencia Principal",
                categoria=categoria_seed,
                peso_real_kg=max(0.1, float(datos.get("peso_kg", 5.0))),
            )
            mensajeria_controller.sincronizar_guia_existente(
                codigo_barras,
                str(datos.get("estado_actual_ui", "ADMITIDO")),
                sol_seed,
                float(datos.get("valor_total", 25000.0)),
            )

        res = mensajeria_controller.cambiar_estado_guia(codigo_barras, nuevo_estado, detalle)
        return jsonify(res), 200
    except DatosSolicitudInvalidosError as err:
        return jsonify({
            "exitoso": False,
            "bloqueado_por_state": False,
            "codigo_barras": str((datos or {}).get("codigo_barras", "")),
            "mensaje": str(err),
        }), 400
    except GuiaNoEncontradaError as err:
        return jsonify({
            "exitoso": False,
            "bloqueado_por_state": False,
            "codigo_barras": str((datos or {}).get("codigo_barras", "")),
            "mensaje": str(err),
        }), 404
    except TransicionInvalidaError as err:
        return jsonify({
            "exitoso": False,
            "bloqueado_por_state": True,
            "codigo_barras": str((datos or {}).get("codigo_barras", "")),
            "mensaje": str(err),
        }), 409


@app.route("/api/creacionales/vender-tiquete", methods=["POST"])
def api_vender_tiquete_creacional():
    """Conecta el Módulo de Tiquetes React con los 5 Patrones Creacionales separados."""
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return jsonify({"exitoso": False, "mensaje": "El cuerpo debe ser un objeto JSON válido."}), 400

    try:
        numero_silla = max(1, min(60, int(datos.get("numero_silla", 1))))
        nombre = str(datos.get("nombre_pasajero", "Pasajero Copetran")).strip() or "Pasajero Copetran"
        documento = str(datos.get("documento", "1098000000")).strip() or "1098000000"
        descuento_codigo = str(datos.get("codigo_descuento", "")).strip().upper()
        canal_str = str(datos.get("canal", "WEB")).strip().upper()

        if descuento_codigo == "ADULTOMAYOR":
            tipo_tarifa, edad, carne = TipoTarifa.ADULTO_MAYOR, 65, False
        elif descuento_codigo == "ESTUDIANTE":
            tipo_tarifa, edad, carne = TipoTarifa.ESTUDIANTE, 21, True
        else:
            tipo_tarifa, edad, carne = TipoTarifa.PLENA, 30, False

        canal = CanalVenta.TAQUILLA if canal_str == "TAQUILLA" else CanalVenta.WEB
        pasajero = Pasajero(documento, "CC", nombre, edad, carne)

        # Si la silla ya se ocupó en una prueba previa, clonar viaje con Prototype
        silla_obj = _viaje_inicial.obtener_silla(numero_silla)
        id_viaje_uso = _viaje_inicial.id_viaje
        if silla_obj and silla_obj.estado.value == "PAGADO":
            clon = venta_controller.clonar_viaje_semanal("PLANTILLA_BOG_BUC", "2026-11-17", "08:00")
            id_viaje_uso = clon.id_viaje

        res = venta_controller.ejecutar_venta_integral(
            id_viaje=id_viaje_uso,
            numero_silla=numero_silla,
            pasajero=pasajero,
            tipo_tarifa=tipo_tarifa,
            canal=canal,
            datos_pago={"metodo": datos.get("metodo_pago", "TARJETA_CREDITO")},
        )
        return jsonify({
            "exitoso": True,
            "numero_tiquete_singleton": res["tiquete"].numero_tiquete,
            "tarifa_factory_method": res["tarifa_aplicada"],
            "factura_abstract_factory": res["factura"].numero_factura,
            "cufe_dian": res["factura"].cufe,
            "notificacion": res["notificacion"],
        }), 200
    except Exception as exc:
        return jsonify({"exitoso": False, "mensaje": str(exc)}), 400


if __name__ == "__main__":
    print("Servidor Integrado Copetran (Creacionales + Comportamiento) activo en http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
