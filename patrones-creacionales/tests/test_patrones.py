"""
Suite de Pruebas Unitarias Automatizadas — Copetran S.A.
Verificación de los 5 Patrones Creacionales y la Arquitectura MVC.
"""

import unittest
from copetran.model.entities import (
    Pasajero, Ruta, Bus, Conductor, TipoTarifa, CanalVenta, EstadoTiquete, ClaseSilla
)
from copetran.model.patterns.singleton import GestorBloqueoSillas, SecuenciadorTiquetes
from copetran.model.patterns.builder import (
    ViajeProgramadoBuilderImpl, OperarioRutasDirector
)
from copetran.model.patterns.prototype import (
    CatalogoPlantillasViaje, TiqueteAbiertoPrototipo
)
from copetran.model.patterns.factory_method import FabricaTarifaImpl
from copetran.model.patterns.abstract_factory import (
    FabricaWeb, FabricaTaquilla, FabricaAgenciaAliada
)
from copetran.controller.venta_controller import VentaTiqueteController


class TestPatronesCreacionales(unittest.TestCase):

    def setUp(self):
        self.controller = VentaTiqueteController()
        self.ruta = Ruta("RUT-01", "Bogotá D.C.", "Bucaramanga", 398.0, 100000.0)
        self.bus = Bus("COP-742", "Marcopolo Paradiso 1800 DD", 60, 2)
        self.cond1 = Conductor("COND-01", "Carlos Mantilla", "LIC-9912", es_relevo=False)
        self.cond2 = Conductor("COND-02", "Javier Peña", "LIC-8821", es_relevo=True)

    def test_01_builder_construccion_viaje(self):
        viaje = self.controller.programar_viaje_builder(
            "VIAJE-TEST-01", self.ruta, self.bus, self.cond1, self.cond2, "2026-10-01", "08:00 AM"
        )
        self.assertIsNotNone(viaje.id_viaje)
        self.assertEqual(len(viaje.sillas), 60)
        self.assertEqual(viaje.sillas[0].clase, ClaseSilla.VIP_PISO_1)
        self.assertEqual(viaje.sillas[12].clase, ClaseSilla.CONFORT_PISO_2)

    def test_02_prototype_clonacion_plantilla(self):
        viaje = self.controller.programar_viaje_builder(
            "VIAJE-TEST-02", self.ruta, self.bus, self.cond1, self.cond2, "2026-10-01", "08:00 AM"
        )
        self.controller.guardar_plantilla_viaje("PLANTILLA_TEST", viaje)
        clon = self.controller.clonar_viaje_semanal(
            "PLANTILLA_TEST", "2026-10-08", "08:00 AM"
        )
        self.assertNotEqual(viaje.id_viaje, clon.id_viaje)
        self.assertEqual(len(clon.sillas), 60)
        self.assertEqual(clon.sillas[0].estado, EstadoTiquete.DISPONIBLE)

    def test_03_singleton_bloqueo_concurrencia(self):
        gestor1 = GestorBloqueoSillas.get_instance()
        gestor2 = GestorBloqueoSillas.get_instance()
        self.assertIs(gestor1, gestor2)

        # Bloquear por usuario A
        res1 = gestor1.bloquear_silla("VIAJE-TEST", 10, "Usuario A", CanalVenta.WEB)
        self.assertTrue(res1)

        # Usuario B intenta bloquear la misma silla -> Rechazado
        res2 = gestor2.bloquear_silla("VIAJE-TEST", 10, "Usuario B", CanalVenta.TAQUILLA)
        self.assertFalse(res2)

        # Liberar silla
        gestor1.liberar_silla("VIAJE-TEST", 10)
        res3 = gestor2.bloquear_silla("VIAJE-TEST", 10, "Usuario B", CanalVenta.TAQUILLA)
        self.assertTrue(res3)

    def test_04_factory_method_descuentos_y_validaciones(self):
        fabrica = FabricaTarifaImpl()
        p_adulto = Pasajero("1", "CC", "Adulto", 65)
        tarifa_adulto = fabrica.crear_tarifa(TipoTarifa.ADULTO_MAYOR, p_adulto)
        self.assertEqual(tarifa_adulto.calcular_precio(100000.0), 75000.0)

        # Validación rechazo si no cumple edad
        p_joven = Pasajero("2", "CC", "Joven", 30)
        with self.assertRaises(ValueError):
            fabrica.crear_tarifa(TipoTarifa.ADULTO_MAYOR, p_joven)

    def test_05_abstract_factory_familias_coherentes(self):
        f_web = FabricaWeb()
        f_taq = FabricaTaquilla()
        f_b2b = FabricaAgenciaAliada()

        # Web: genera FacturaElectronicaCUFE
        self.assertEqual(f_web.crear_emisor_factura().__class__.__name__, "FacturaElectronicaCUFE")
        # Taquilla: genera FacturaTirillaPOS
        self.assertEqual(f_taq.crear_emisor_factura().__class__.__name__, "FacturaTirillaPOS")
        # B2B: genera FacturaLoteAgencia
        self.assertEqual(f_b2b.crear_emisor_factura().__class__.__name__, "FacturaLoteAgencia")

    def test_06_flujo_integral_mvc(self):
        viaje = self.controller.programar_viaje_builder(
            "VIAJE-TEST-06", self.ruta, self.bus, self.cond1, self.cond2, "2026-10-01", "10:00 AM"
        )
        p = Pasajero("101", "CC", "Santiago Rodríguez", 22)
        res = self.controller.ejecutar_venta_integral(
            id_viaje=viaje.id_viaje,
            numero_silla=1,
            pasajero=p,
            tipo_tarifa=TipoTarifa.PLENA,
            canal=CanalVenta.WEB,
            datos_pago={"tarjeta_token": "tok_visa_4242", "banco": "PSE"}
        )
        self.assertIsNotNone(res["tiquete"])
        self.assertEqual(res["tiquete"].silla.numero, 1)
        self.assertEqual(res["tiquete"].silla.estado, EstadoTiquete.PAGADO)


if __name__ == '__main__':
    unittest.main()
