"""
Suite Integral de Pruebas Unitarias y de Integración API — Copetran S.A.
Verifica Chain of Responsibility, Patrón State, validaciones de entrada (HTTP 400),
existencia en DAO (HTTP 404), bloqueos de estado (HTTP 409), rechazos de cadena (HTTP 422)
y convivencia con los patrones creacionales en una sola aplicación ejecutable.
"""

import os
import sys
import unittest

RUTA_BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if RUTA_BASE not in sys.path:
    sys.path.insert(0, RUTA_BASE)

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
from servidor_api import app


class TestPatronesComportamiento(unittest.TestCase):

    def setUp(self) -> None:
        self.ctrl = MensajeriaController()
        self.client = app.test_client()

    # -------------------------------------------------------------------------
    # 1. Pruebas del Patrón Chain of Responsibility
    # -------------------------------------------------------------------------
    def test_01_chain_rechaza_remitente_igual_o_sin_cobertura(self) -> None:
        sol_igual = SolicitudAdmisionGuia(
            "Ana Gómez", "ana gómez", "Bogotá", "Bucaramanga", "Calle 1", CategoriaMercancia.GENERAL, 4.0
        )
        res_igual = self.ctrl.admitir_guia(sol_igual)
        self.assertFalse(res_igual["aprobado"])
        self.assertEqual(res_igual["eslabon_rechazo"], "Datos y Cobertura")

        sol_cobertura = SolicitudAdmisionGuia(
            "Ana Gómez", "Luis Ríos", "Bogotá", "Leticia", "Calle 1", CategoriaMercancia.GENERAL, 4.0
        )
        res_cob = self.ctrl.admitir_guia(sol_cobertura)
        self.assertFalse(res_cob["aprobado"])
        self.assertEqual(res_cob["eslabon_rechazo"], "Datos y Cobertura")
        self.assertEqual(len(res_cob["trazabilidad"]), 1)  # Corta sin ejecutar eslabones 2 ni 3

    def test_02_chain_rechaza_sobrepeso_cubicaje_y_peso_cero(self) -> None:
        # Peso real 5 kg, pero volumen 100x80x80 / 5000 = 128 kg > 35 kg FRAGIL
        sol = SolicitudAdmisionGuia(
            "Ana", "Luis", "Bogotá", "Bucaramanga", "Calle 1",
            CategoriaMercancia.FRAGIL, 5.0, largo_cm=100, ancho_cm=80, alto_cm=80,
        )
        res = self.ctrl.admitir_guia(sol)
        self.assertFalse(res["aprobado"])
        self.assertEqual(res["eslabon_rechazo"], "Peso y Cubicaje")
        self.assertEqual(len(res["trazabilidad"]), 2)  # Eslabón 1 aprobó, Eslabón 2 detuvo

    def test_03_chain_liquida_exactamente_cubicaje_recargo_y_poliza(self) -> None:
        # 40x30x30 / 5000 = 7.20 kg (> 4.5 kg real)
        # Base: 7.20 * 3500 = $25,200 | Recargo FRAGIL 20%: $5,040 | Póliza 1.5% de $3,500,000: $52,500 -> $82,740
        sol = SolicitudAdmisionGuia(
            "Carlos Ruiz", "María López", "Bogotá", "Bucaramanga", "Agencia Centro",
            CategoriaMercancia.FRAGIL, 4.5, largo_cm=40, ancho_cm=30, alto_cm=30,
            valor_declarado=3_500_000, tiene_poliza_extra=True, paga_inmediato=True, canal_venta="TAQUILLA",
        )
        res = self.ctrl.admitir_guia(sol)
        self.assertTrue(res["aprobado"])
        self.assertAlmostEqual(res["peso_facturable_kg"], 7.20)
        self.assertEqual(res["costo_flete"], 82_740.0)
        self.assertTrue(str(res["numero_factura"]).startswith("FAC-POS-"))
        self.assertEqual(res["estado_actual"], "ADMITIDO")

    # -------------------------------------------------------------------------
    # 2. Pruebas del Patrón State (Delegación Polimórfica Pura e Invariantes)
    # -------------------------------------------------------------------------
    def test_04_state_ciclo_completo_y_resolucion_polimorfica_novedad(self) -> None:
        sol = SolicitudAdmisionGuia(
            "Ana", "Luis", "Bogotá", "Bucaramanga", "Calle 1",
            CategoriaMercancia.VALORES, 3.0, valor_declarado=3_000_000, tiene_poliza_extra=True,
        )
        res = self.ctrl.admitir_guia(sol)
        guia = res["codigo_barras"]

        # Bloqueos en EstadoAdmitido
        with self.assertRaises(TransicionInvalidaError):
            self.ctrl.cambiar_estado_guia(guia, "ENTREGADO")
        with self.assertRaises(TransicionInvalidaError):
            self.ctrl.cambiar_estado_guia(guia, "BODEGA_DESTINO")

        # Avance a EN_TRANSITO y bloqueo de entrega directa
        self.ctrl.cambiar_estado_guia(guia, "EN_TRANSITO")
        with self.assertRaises(TransicionInvalidaError):
            self.ctrl.cambiar_estado_guia(guia, "ENTREGADO")

        # Retención en NOVEDAD y bloqueo de entrega directa
        self.ctrl.cambiar_estado_guia(guia, "NOVEDAD", "Cierre vial en Pescadero")
        with self.assertRaises(TransicionInvalidaError):
            self.ctrl.cambiar_estado_guia(guia, "ENTREGADO")

        # Resolución polimórfica desde EstadoNovedad hacia EN_TRANSITO y luego BODEGA_DESTINO
        self.ctrl.cambiar_estado_guia(guia, "EN_TRANSITO", "Vía habilitada")
        self.ctrl.cambiar_estado_guia(guia, "BODEGA_DESTINO")

        # Cierre en ENTREGADO e inmutabilidad posterior
        final = self.ctrl.cambiar_estado_guia(guia, "ENTREGADO", "Luis Pérez - CC 1098445")
        self.assertEqual(final["estado_actual"], "ENTREGADO")

        for intento_ilegal in ("ADMITIDO", "EN_TRANSITO", "BODEGA_DESTINO", "NOVEDAD", "ENTREGADO"):
            with self.assertRaises(TransicionInvalidaError):
                self.ctrl.cambiar_estado_guia(guia, intento_ilegal)

    def test_05_state_exige_firma_y_detecta_guia_inexistente(self) -> None:
        with self.assertRaises(GuiaNoEncontradaError):
            self.ctrl.cambiar_estado_guia("GU-INEXISTENTE", "EN_TRANSITO")

        sol = SolicitudAdmisionGuia(
            "Pedro", "Juan", "Medellín", "Cali", "Bodega Sur", CategoriaMercancia.GENERAL, 2.0
        )
        codigo = self.ctrl.admitir_guia(sol)["codigo_barras"]
        self.ctrl.cambiar_estado_guia(codigo, "EN_TRANSITO")
        self.ctrl.cambiar_estado_guia(codigo, "BODEGA_DESTINO")

        # Confirmar entrega directa con cadena en blanco debe fallar
        contexto = self.ctrl.dao.buscar_por_codigo(codigo)
        assert contexto is not None
        with self.assertRaises(TransicionInvalidaError):
            contexto.confirmar_entrega("   ")

    # -------------------------------------------------------------------------
    # 3. Pruebas de Validación de Datos y Códigos HTTP del Servidor API
    # -------------------------------------------------------------------------
    def test_06_validacion_rechaza_payloads_corruptos_con_error_especifico(self) -> None:
        with self.assertRaises(DatosSolicitudInvalidosError):
            construir_solicitud_admision({"categoria": "EXPLOSIVOS", "peso_real_kg": 2})

        with self.assertRaises(DatosSolicitudInvalidosError):
            construir_solicitud_admision({"categoria": "GENERAL", "peso_real_kg": True})

        with self.assertRaises(DatosSolicitudInvalidosError):
            construir_solicitud_admision({"categoria": "GENERAL", "peso_real_kg": 4, "largo_cm": -10})

        with self.assertRaises(DatosSolicitudInvalidosError):
            validar_peticion_transicion({"codigo_barras": "GU-00001", "nuevo_estado": "PERDIDO"})

    def test_07_api_http_codigos_200_400_404_409_422_y_convivencia_creacionales(self) -> None:
        # 1) Health check
        resp_health = self.client.get("/api/health")
        self.assertEqual(resp_health.status_code, 200)

        # 2) HTTP 400 cuando los datos son estructuralmente inválidos
        resp_400 = self.client.post("/api/comportamiento/admitir", json={
            "remitente": "Carlos",
            "destinatario": "Marta",
            "categoria": "INEXISTENTE",
            "peso_real_kg": 5,
        })
        self.assertEqual(resp_400.status_code, 400)
        self.assertTrue(resp_400.get_json()["error_validacion_entrada"])

        # 3) HTTP 422 cuando Chain of Responsibility rechaza por regla de negocio
        resp_422 = self.client.post("/api/comportamiento/admitir", json={
            "remitente": "Carlos",
            "destinatario": "Marta",
            "ciudad_origen": "Bogotá",
            "ciudad_destino": "Leticia",
            "categoria": "GENERAL",
            "peso_real_kg": 5,
        })
        self.assertEqual(resp_422.status_code, 422)
        self.assertEqual(resp_422.get_json()["eslabon_rechazo"], "Datos y Cobertura")

        # 4) HTTP 200 al admitir guía válida y verificación en GET /api/comportamiento/guias
        resp_200 = self.client.post("/api/comportamiento/admitir", json={
            "remitente": "Carlos Ruiz",
            "destinatario": "Marta Díaz",
            "ciudad_origen": "Bogotá",
            "ciudad_destino": "Bucaramanga",
            "categoria": "FRAGIL",
            "peso_real_kg": 6.0,
            "largo_cm": 30,
            "ancho_cm": 30,
            "alto_cm": 20,
            "valor_declarado": 800000,
            "tiene_poliza_extra": False,
            "paga_inmediato": True,
            "canal_venta": "TAQUILLA",
        })
        self.assertEqual(resp_200.status_code, 200)
        codigo = resp_200.get_json()["codigo_barras"]

        resp_list = self.client.get("/api/comportamiento/guias")
        self.assertEqual(resp_list.status_code, 200)
        self.assertTrue(any(g["codigo_barras"] == codigo for g in resp_list.get_json()["guias"]))

        # 5) HTTP 404 si se solicita transición de una guía inexistente (sin bandera semilla)
        resp_404 = self.client.post("/api/comportamiento/estado", json={
            "codigo_barras": "GU-999999",
            "nuevo_estado": "EN_TRANSITO",
        })
        self.assertEqual(resp_404.status_code, 404)
        self.assertFalse(resp_404.get_json()["bloqueado_por_state"])

        # 6) HTTP 409 cuando el Patrón State bloquea una transición ilegal
        resp_409 = self.client.post("/api/comportamiento/estado", json={
            "codigo_barras": codigo,
            "nuevo_estado": "ENTREGADO",
        })
        self.assertEqual(resp_409.status_code, 409)
        self.assertTrue(resp_409.get_json()["bloqueado_por_state"])

        # 7) HTTP 200 en módulo creacional unificado
        resp_creacional = self.client.post("/api/creacionales/vender-tiquete", json={
            "numero_silla": 12,
            "nombre_pasajero": "Santiago Rodríguez",
            "documento": "1098765432",
            "codigo_descuento": "ESTUDIANTE",
            "canal": "WEB",
            "metodo_pago": "TARJETA_CREDITO",
        })
        self.assertEqual(resp_creacional.status_code, 200)
        self.assertTrue(resp_creacional.get_json()["exitoso"])


if __name__ == "__main__":
    unittest.main()
