"""
Demostración por Consola — Patrones de Comportamiento (Copetran S.A.)
Ejecuta de forma aislada y trazable Chain of Responsibility y State en Python.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mensajeria.controller.mensajeria_controller import MensajeriaController
from mensajeria.model.entities import CategoriaMercancia, SolicitudAdmisionGuia
from mensajeria.model.exceptions import TransicionInvalidaError


def main() -> None:
    ctrl = MensajeriaController()
    print("=" * 78)
    print("  COPETRAN S.A. — MÓDULO DE MENSAJERÍA (CHAIN OF RESPONSIBILITY + STATE)")
    print("=" * 78)

    casos = [
        (
            "Caso 1A: Ruta sin cobertura",
            SolicitudAdmisionGuia(
                "Carlos Gómez", "Ana Torres", "Bogotá", "Leticia", "Cra 15 # 85-20",
                CategoriaMercancia.GENERAL, 5.0
            ),
        ),
        (
            "Caso 1B: Sobrepeso en carga perecedera (máx 25 kg)",
            SolicitudAdmisionGuia(
                "Lácteos Andinos", "Supermercado Norte", "Bogotá", "Bucaramanga", "Av. 68 # 22-10",
                CategoriaMercancia.PERECEDERA, 31.0
            ),
        ),
        (
            "Caso 1C: Alto valor sin póliza extra",
            SolicitudAdmisionGuia(
                "TecnoImport S.A.", "Clínica Chicamocha", "Bogotá", "Bucaramanga", "Calle 10 # 30-15",
                CategoriaMercancia.FRAGIL, 4.5, 40, 30, 30,
                valor_declarado=3_500_000, tiene_poliza_extra=False, canal_venta="TAQUILLA",
            ),
        ),
        (
            "Caso 1D: Solicitud válida completa (Aprueba toda la cadena)",
            SolicitudAdmisionGuia(
                "TecnoImport S.A.", "Clínica Chicamocha", "Bogotá", "Bucaramanga", "Calle 10 # 30-15",
                CategoriaMercancia.FRAGIL, 4.5, 40, 30, 30,
                valor_declarado=3_500_000, tiene_poliza_extra=True, canal_venta="TAQUILLA",
            ),
        ),
    ]

    codigo_aprobado = ""
    print("\n>>> 1. PRUEBA DE CHAIN OF RESPONSIBILITY <<<")
    for titulo, sol in casos:
        print(f"\n[{titulo}]")
        res = ctrl.admitir_guia(sol)
        for paso in res["trazabilidad"]:
            print(f"   -> {paso}")
        if res["aprobado"]:
            codigo_aprobado = res["codigo_barras"]
            print(
                f"   [ADMITIDA] Guía {codigo_aprobado} | Flete ${res['costo_flete']:,.0f} COP | "
                f"Factura {res['numero_factura']} | Estado: {res['estado_actual']}"
            )

    print(f"\n>>> 2. PRUEBA DE PATRÓN STATE SOBRE LA GUÍA {codigo_aprobado} <<<")
    secuencia = [
        ("Intento inválido: entregar estando en ADMITIDO", "ENTREGADO", ""),
        ("Despacho hacia ruta nacional", "EN_TRANSITO", ""),
        ("Retención por novedad en carretera", "NOVEDAD", "Cierre vial en Pescadero"),
        ("Intento bloqueado: entregar estando en NOVEDAD", "ENTREGADO", ""),
        ("Resolver novedad y retomar tránsito", "EN_TRANSITO", "Paso habilitado"),
        ("Recepción en bodega destino", "BODEGA_DESTINO", ""),
        ("Entrega final con firma y cédula", "ENTREGADO", "Laura Méndez - CC 1098445120"),
        ("Intento rechazado: reportar novedad tras ENTREGADO", "NOVEDAD", "Reclamo extemporáneo"),
    ]

    for desc, destino, detalle in secuencia:
        print(f"\n* {desc}:")
        try:
            r = ctrl.cambiar_estado_guia(codigo_aprobado, destino, detalle)
            print(f"   [OK] {r['mensaje']} | Nuevo estado: {r['estado_actual']}")
        except TransicionInvalidaError as err:
            print(f"   [BLOQUEADO POR STATE] {err}")


if __name__ == "__main__":
    main()
