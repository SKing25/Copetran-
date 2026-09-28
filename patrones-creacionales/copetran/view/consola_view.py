"""
Capa de Vista — Copetran (MVC / Tres Capas)
Módulo: ConsolaView

Proporciona la interfaz visual por consola para presentar los resultados de negocio,
formatear boletos, pases de abordaje, facturas y demostrar la ejecución de cada patrón.
"""

import sys
from typing import Dict, Any, List
from copetran.model.entities import Tiquete, Factura, Silla
from copetran.model.patterns.builder import ViajeProgramado


class ConsolaView:
    """Vista de Consola con formateo estético y trazabilidad clara."""

    AZUL = "\033[94m"
    VERDE = "\033[92m"
    AMARILLO = "\033[93m"
    ROJO = "\033[91m"
    CIAN = "\033[96m"
    NEGRITA = "\033[1m"
    RESET = "\033[0m"

    @classmethod
    def banner(cls, texto: str):
        print(f"\n{cls.AZUL}{cls.NEGRITA}{'=' * 80}")
        print(f" {texto.center(78)} ")
        print(f"{'=' * 80}{cls.RESET}\n")

    @classmethod
    def titulo_seccion(cls, numero: int, patron: str, descripcion: str):
        print(f"\n{cls.CIAN}{cls.NEGRITA}>>> PATRÓN {numero}: {patron.upper()} <<<")
        print(f"    {descripcion}{cls.RESET}")
        print(f"{cls.CIAN}{'-' * 80}{cls.RESET}")

    @classmethod
    def exito(cls, mensaje: str):
        print(f"  {cls.VERDE}[✓ ÉXITO]{cls.RESET} {mensaje}")

    @classmethod
    def advertencia(cls, mensaje: str):
        print(f"  {cls.AMARILLO}[⚠ AVISO]{cls.RESET} {mensaje}")

    @classmethod
    def error(cls, mensaje: str):
        print(f"  {cls.ROJO}[✗ ERROR]{cls.RESET} {mensaje}")

    @classmethod
    def info(cls, clave: str, valor: Any):
        print(f"  • {cls.NEGRITA}{clave}:{cls.RESET} {valor}")

    @classmethod
    def mostrar_tiquete_emitido(cls, tiquete: Tiquete, factura: Factura, detalles: Dict[str, Any]):
        """Renderiza una tarjeta gráfica en texto del tiquete formal emitido."""
        print(f"\n  {cls.AZUL}┌────────────────────────────────────────────────────────────────────────┐")
        print(f"  │                  COPETRAN — PASE DE ABORDAJE OFICIAL                   │")
        print(f"  ├────────────────────────────────────────────────────────────────────────┤")
        print(f"  │ Tiquete No: {tiquete.numero_tiquete:<18} │ Canal Venta: {tiquete.canal.value:<22} │")
        print(f"  │ Pasajero:   {tiquete.pasajero.nombre_completo:<18} │ Doc: {tiquete.pasajero.tipo_documento} {tiquete.pasajero.numero_documento:<18} │")
        print(f"  │ Silla:      #{tiquete.silla.numero:<17} │ Clase: {tiquete.silla.clase.value:<28} │")
        print(f"  │ Tarifa:     {detalles.get('tarifa_aplicada', ''):<48}   │")
        print(f"  │ Valor Pago: ${tiquete.valor_pagado:,.2f} COP{'':<16} │ Factura: {factura.numero_factura:<26} │")
        if factura.cufe:
            print(f"  │ CUFE DIAN:  {factura.cufe[:36]}...                         │")
        if tiquete.codigo_qr:
            print(f"  │ QR Digital: [{tiquete.codigo_qr}]                                        │")
        print(f"  ├────────────────────────────────────────────────────────────────────────┤")
        print(f"  │ Mensaje: {detalles.get('notificacion', '')[:60]:<60}│")
        print(f"  └────────────────────────────────────────────────────────────────────────┘{cls.RESET}\n")

    @classmethod
    def mostrar_mapa_sillas(cls, viaje: ViajeProgramado):
        """Muestra un resumen visual de la matriz de asientos de dos pisos."""
        print(f"\n  {cls.NEGRITA}Matriz de Asientos del Bus [{viaje.bus.placa if viaje.bus else 'N/A'}] - 2 Pisos:{cls.RESET}")
        piso1 = [s for s in viaje.sillas if s.piso == 1]
        piso2 = [s for s in viaje.sillas if s.piso == 2]

        print(f"    • Piso 1 (VIP Cama - 12 sillas):")
        cadena_p1 = "      "
        for s in piso1:
            color = cls.VERDE if s.estado.value == "DISPONIBLE" else cls.ROJO if s.estado.value == "PAGADO" else cls.AMARILLO
            cadena_p1 += f"{color}[S{s.numero:02d}:{s.estado.value[:3]}]{cls.RESET} "
        print(cadena_p1)

        print(f"    • Piso 2 (Confort Estándar - 48 sillas, primeras 16 mostradas):")
        cadena_p2 = "      "
        for s in piso2[:16]:
            color = cls.VERDE if s.estado.value == "DISPONIBLE" else cls.ROJO if s.estado.value == "PAGADO" else cls.AMARILLO
            cadena_p2 += f"{color}[S{s.numero:02d}:{s.estado.value[:3]}]{cls.RESET} "
        print(cadena_p2 + " ... [resto disponibles]\n")
