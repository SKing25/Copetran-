"""
Patrón Abstract Factory — Copetran (Proceso de Venta de Pasajes)
Capa de Modelo / Patrones Creacionales

Crea familias coherentes de componentes de venta según el canal comercial:
- Taquilla Presencial (Datáfono POS, factura tirilla, pase impreso y bloqueo local).
- Portal Web / App (Pasarela online, factura electrónica CUFE, QR digital y bloqueo web).
- Agencia Aliada B2B (Voucher corporativo, factura por lote, API REST y cupo reservado).
"""

from abc import ABC, abstractmethod
import hashlib
import uuid
from typing import Dict, Any
from datetime import datetime
from copetran.model.entities import CanalVenta, Factura, Tiquete
from copetran.model.patterns.singleton import GestorBloqueoSillas


# ==============================================================================
# 1. PRODUCTOS ABSTRACTOS (4 interfaces de la familia)
# ==============================================================================

class BloqueoSillaComponent(ABC):
    """Componente de bloqueo según el canal."""
    @abstractmethod
    def ejecutar_bloqueo(self, id_viaje: str, numero_silla: int, usuario: str) -> bool:
        pass


class ProcesadorPago(ABC):
    """Componente de recepción y validación de pagos."""
    @abstractmethod
    def procesar(self, monto: float, datos_transaccion: Dict[str, Any]) -> Dict[str, Any]:
        pass


class EmisorFactura(ABC):
    """Componente de facturación contable y tributaria."""
    @abstractmethod
    def emitir(self, monto: float, datos_cliente: Dict[str, str]) -> Factura:
        pass


class NotificadorPasajero(ABC):
    """Componente de emisión de pase de abordaje y notificación."""
    @abstractmethod
    def entregar_comprobante(self, tiquete: Tiquete) -> str:
        pass


# ==============================================================================
# 2. PRODUCTOS CONCRETOS — FAMILIA TAQUILLA
# ==============================================================================

class BloqueoLocalTaquilla(BloqueoSillaComponent):
    def ejecutar_bloqueo(self, id_viaje: str, numero_silla: int, usuario: str) -> bool:
        gestor = GestorBloqueoSillas.get_instance()
        return gestor.bloquear_silla(id_viaje, numero_silla, usuario, canal=CanalVenta.TAQUILLA, ttl_segundos=180)


class PagoDatafonoPOS(ProcesadorPago):
    def procesar(self, monto: float, datos_transaccion: Dict[str, Any]) -> Dict[str, Any]:
        autorizacion = f"AUTH-POS-{uuid.uuid4().hex[:8].upper()}"
        return {
            "exitoso": True,
            "metodo": "DATAFONO_POS",
            "autorizacion": autorizacion,
            "monto": monto,
            "mensaje": "Transacción presencial con datáfono aprobada con chip/contactless."
        }


class FacturaTirillaPOS(EmisorFactura):
    def emitir(self, monto: float, datos_cliente: Dict[str, str]) -> Factura:
        num = f"FAC-POS-{uuid.uuid4().hex[:6].upper()}"
        return Factura(
            id_factura=str(uuid.uuid4()),
            numero_factura=num,
            monto_total=monto,
            canal=CanalVenta.TAQUILLA,
            cufe=None,  # Factura tirilla POS física en ventanilla
            fecha_emision=datetime.now(),
            estado="IMPRESA_POS"
        )


class NotificadorImpreso(NotificadorPasajero):
    def entregar_comprobante(self, tiquete: Tiquete) -> str:
        return (
            f"[IMPRESORA TÉRMICA TERMINAL] Boleto físico emitido para {tiquete.pasajero.nombre_completo}. "
            f"Silla {tiquete.silla.numero} ({tiquete.silla.clase.value}). Ticket: {tiquete.numero_tiquete}"
        )


# ==============================================================================
# 3. PRODUCTOS CONCRETOS — FAMILIA WEB / ONLINE
# ==============================================================================

class BloqueoDistribuidoRedis(BloqueoSillaComponent):
    def ejecutar_bloqueo(self, id_viaje: str, numero_silla: int, usuario: str) -> bool:
        # En producción conecta a Redis; aquí integra con el gestor atómico concurrente
        gestor = GestorBloqueoSillas.get_instance()
        return gestor.bloquear_silla(id_viaje, numero_silla, usuario, canal=CanalVenta.WEB, ttl_segundos=180)


class PagoPasarelaOnline(ProcesadorPago):
    def procesar(self, monto: float, datos_transaccion: Dict[str, Any]) -> Dict[str, Any]:
        ref_pago = f"PSE-{uuid.uuid4().hex[:10].upper()}"
        return {
            "exitoso": True,
            "metodo": "PASARELA_PSE_TARJETA",
            "autorizacion": ref_pago,
            "monto": monto,
            "mensaje": "Pago electrónico aprobado por pasarela bancaria en línea (PSE/Card)."
        }


class FacturaElectronicaCUFE(EmisorFactura):
    def emitir(self, monto: float, datos_cliente: Dict[str, str]) -> Factura:
        num = f"FE-WEB-{uuid.uuid4().hex[:6].upper()}"
        # Generación simulada de CUFE (SHA-256) cumpliendo con norma DIAN (RF04)
        semilla_cufe = f"{num}|{monto}|{datetime.now().isoformat()}|COPETRAN_NIT_890201214"
        cufe_hash = hashlib.sha256(semilla_cufe.encode('utf-8')).hexdigest()

        return Factura(
            id_factura=str(uuid.uuid4()),
            numero_factura=num,
            monto_total=monto,
            canal=CanalVenta.WEB,
            cufe=cufe_hash,
            fecha_emision=datetime.now(),
            estado="VALIDADA_DIAN"
        )


class NotificadorEmailQR(NotificadorPasajero):
    def entregar_comprobante(self, tiquete: Tiquete) -> str:
        qr_code = f"QR-{hashlib.md5(tiquete.numero_tiquete.encode('utf-8')).hexdigest()[:12].upper()}"
        tiquete.codigo_qr = qr_code
        email = tiquete.pasajero.email or "pasajero@copetran.com.co"
        return (
            f"[EMAIL / APP DIGITAL] Pase de abordaje electrónico enviado a {email}. "
            f"Código QR generado: [{qr_code}] con verificación CUFE DIAN."
        )


# ==============================================================================
# 4. PRODUCTOS CONCRETOS — FAMILIA AGENCIA ALIADA (B2B)
# ==============================================================================

class BloqueoCupoMayorista(BloqueoSillaComponent):
    def ejecutar_bloqueo(self, id_viaje: str, numero_silla: int, usuario: str) -> bool:
        gestor = GestorBloqueoSillas.get_instance()
        return gestor.bloquear_silla(id_viaje, numero_silla, f"AGENCIA:{usuario}", canal=CanalVenta.AGENCIA_ALIADA, ttl_segundos=300)


class PagoVoucherB2B(ProcesadorPago):
    def procesar(self, monto: float, datos_transaccion: Dict[str, Any]) -> Dict[str, Any]:
        voucher_id = f"VOUCHER-B2B-{uuid.uuid4().hex[:8].upper()}"
        return {
            "exitoso": True,
            "metodo": "CREDITO_AGENCIA_B2B",
            "autorizacion": voucher_id,
            "monto": monto,
            "mensaje": "Cargado a línea de crédito corporativa de agencia aliada con voucher."
        }


class FacturaLoteAgencia(EmisorFactura):
    def emitir(self, monto: float, datos_cliente: Dict[str, str]) -> Factura:
        num = f"FAC-B2B-{uuid.uuid4().hex[:6].upper()}"
        return Factura(
            id_factura=str(uuid.uuid4()),
            numero_factura=num,
            monto_total=monto,
            canal=CanalVenta.AGENCIA_ALIADA,
            cufe=None,
            fecha_emision=datetime.now(),
            estado="CONSOLIDADA_LOTE"
        )


class NotificadorAPIIntegracion(NotificadorPasajero):
    def entregar_comprobante(self, tiquete: Tiquete) -> str:
        return (
            f"[API REST B2B] Webhook disparado a la agencia aliada. "
            f"Payload con tiquete {tiquete.numero_tiquete} confirmado exitosamente."
        )


# ==============================================================================
# 5. FÁBRICA ABSTRACTA Y FÁBRICAS CONCRETAS
# ==============================================================================

class FabricaCanalVenta(ABC):
    """
    Fábrica Abstracta: Declara métodos para instanciar cada uno de los 4 productos
    de la familia de venta.
    """
    @abstractmethod
    def crear_bloqueo(self) -> BloqueoSillaComponent:
        pass

    @abstractmethod
    def crear_procesador_pago(self) -> ProcesadorPago:
        pass

    @abstractmethod
    def crear_emisor_factura(self) -> EmisorFactura:
        pass

    @abstractmethod
    def crear_notificador(self) -> NotificadorPasajero:
        pass


class FabricaTaquilla(FabricaCanalVenta):
    """Fábrica Concreta para ventas presenciales en terminales."""
    def crear_bloqueo(self) -> BloqueoSillaComponent:
        return BloqueoLocalTaquilla()

    def crear_procesador_pago(self) -> ProcesadorPago:
        return PagoDatafonoPOS()

    def crear_emisor_factura(self) -> EmisorFactura:
        return FacturaTirillaPOS()

    def crear_notificador(self) -> NotificadorPasajero:
        return NotificadorImpreso()


class FabricaWeb(FabricaCanalVenta):
    """Fábrica Concreta para ventas digitales por portal web y app móvil."""
    def crear_bloqueo(self) -> BloqueoSillaComponent:
        return BloqueoDistribuidoRedis()

    def crear_procesador_pago(self) -> ProcesadorPago:
        return PagoPasarelaOnline()

    def crear_emisor_factura(self) -> EmisorFactura:
        return FacturaElectronicaCUFE()

    def crear_notificador(self) -> NotificadorPasajero:
        return NotificadorEmailQR()


class FabricaAgenciaAliada(FabricaCanalVenta):
    """Fábrica Concreta para agencias de viaje tercerizadas y canales B2B."""
    def crear_bloqueo(self) -> BloqueoSillaComponent:
        return BloqueoCupoMayorista()

    def crear_procesador_pago(self) -> ProcesadorPago:
        return PagoVoucherB2B()

    def crear_emisor_factura(self) -> EmisorFactura:
        return FacturaLoteAgencia()

    def crear_notificador(self) -> NotificadorPasajero:
        return NotificadorAPIIntegracion()
