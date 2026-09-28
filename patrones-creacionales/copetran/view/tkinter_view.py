"""
Capa de Vista Gráfica Simplificada — Copetran (MVC / Tres Capas)
Módulo: TkinterView (Interfaz Gráfica Sencilla y Unificada)

Implementa una vista visual limpia, intuitiva y directa en una sola ventana:
- Selección de viaje ensamblado con Builder.
- Clonación directa de viajes con Prototype.
- Mapa de asientos visual con estados (Disponible, Bloqueada RF03, Pagada).
- Bloqueo temporal atómico y prueba de colisión concurrente (Singleton).
- Cotización y validación de tarifas con descuentos legales (Factory Method).
- Emisión diferenciada por canal comercial: Taquilla, Web, Agencia (Abstract Factory).
- Visualización inmediata del tiquete oficial y comprobante tributario.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import time
from typing import Dict, Any, Optional

from copetran.controller.venta_controller import VentaTiqueteController
from copetran.model.entities import (
    Pasajero, Silla, Ruta, Bus, Conductor, TipoTarifa, CanalVenta, EstadoTiquete, Tiquete
)
from copetran.model.patterns.singleton import GestorBloqueoSillas


class CopetranTkinterView(tk.Tk):
    """
    Vista Gráfica Simplificada en Tkinter (Arquitectura MVC).
    Interactúa exclusivamente a través del Controlador VentaTiqueteController.
    """

    COLOR_BARRA = "#0B2545"        # Azul Copetran
    COLOR_FONDO = "#F1F5F9"        # Fondo suave
    COLOR_DISPONIBLE = "#10B981"   # Verde
    COLOR_BLOQUEADO = "#F59E0B"    # Naranja (Singleton RF03)
    COLOR_PAGADO = "#EF4444"       # Rojo
    COLOR_SELECCION = "#2563EB"    # Azul vibrante

    def __init__(self, controller: Optional[VentaTiqueteController] = None):
        super().__init__()
        self.title("COPETRAN S.A. — Sistema de Venta de Pasajes (MVC / Patrones Creacionales)")
        self.geometry("980x720")
        self.minsize(920, 660)
        self.configure(bg=self.COLOR_FONDO)

        # Controlador (MVC)
        self.controller = controller or VentaTiqueteController()

        # Estado local
        self.viaje_actual_id: Optional[str] = None
        self.silla_seleccionada: Optional[int] = None
        self.botones_sillas: Dict[int, tk.Button] = {}

        self._inicializar_datos()
        self._construir_interfaz()
        self._actualizar_reloj_bloqueo()

    def _inicializar_datos(self):
        """Inicializa despachos base con el patrón Builder si no existen."""
        if not self.controller.listar_viajes():
            ruta1 = Ruta("RUT-01", "Bogotá D.C. (Salitre)", "Bucaramanga (Central)", 398.0, 100000.0)
            bus1 = Bus("COP-742", "Marcopolo Paradiso DD (2 Pisos)", 60, 2)
            c1 = Conductor("C1", "Carlos Arturo Mantilla", "LIC-9912", False)
            c2 = Conductor("C2", "Javier Enrique Peña", "LIC-8821", True)

            v1 = self.controller.programar_viaje_builder(
                codigo="VIAJE-BOG-BUC-0800", ruta=ruta1, bus=bus1,
                c_principal=c1, c_relevo=c2, fecha="2026-10-01", hora="08:00 AM"
            )
            self.controller.guardar_plantilla_viaje("PLANTILLA_BOG_BUC", v1)
            self.viaje_actual_id = v1.id_viaje
        else:
            self.viaje_actual_id = self.controller.listar_viajes()[0].id_viaje

    def _construir_interfaz(self):
        # 1. Encabezado
        cabecera = tk.Frame(self, bg=self.COLOR_BARRA, height=55)
        cabecera.pack(fill=tk.X, side=tk.TOP)

        tk.Label(
            cabecera, text="COPETRAN S.A.  |  Venta y Emisión de Tiquetes",
            font=("Helvetica", 14, "bold"), fg="#FFFFFF", bg=self.COLOR_BARRA
        ).pack(side=tk.LEFT, padx=15, pady=12)

        tk.Label(
            cabecera, text="Arquitectura MVC — 5 Patrones Creacionales",
            font=("Helvetica", 10), fg="#93C5FD", bg=self.COLOR_BARRA
        ).pack(side=tk.RIGHT, padx=15, pady=12)

        # 2. Contenedor Principal (2 Columnas)
        contenedor = tk.Frame(self, bg=self.COLOR_FONDO)
        contenedor.pack(fill=tk.BOTH, expand=True, padx=12, pady=8)

        # --- COLUMNA IZQUIERDA: VIAJE Y MAPA DE SILLAS ---
        col_izq = tk.LabelFrame(contenedor, text=" 1. Selección de Viaje y Asiento (Builder & Singleton) ", bg="#FFFFFF", font=("Helvetica", 10, "bold"), fg="#0F172A")
        col_izq.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 6), pady=4)

        # Selector de viaje
        f_sel_viaje = tk.Frame(col_izq, bg="#FFFFFF")
        f_sel_viaje.pack(fill=tk.X, padx=10, pady=6)

        tk.Label(f_sel_viaje, text="Viaje:", font=("Helvetica", 9, "bold"), bg="#FFFFFF").pack(side=tk.LEFT, padx=4)
        self.cb_viajes = ttk.Combobox(f_sel_viaje, state="readonly", width=34)
        self.cb_viajes.pack(side=tk.LEFT, padx=4)
        self.cb_viajes.bind("<<ComboboxSelected>>", self._on_cambiar_viaje)

        btn_clonar = tk.Button(
            f_sel_viaje, text="📑 Clonar (Prototype)", font=("Helvetica", 8, "bold"),
            bg="#0284C7", fg="#FFFFFF", relief=tk.FLAT, padx=6, pady=2, command=self._accion_clonar_viaje
        )
        btn_clonar.pack(side=tk.LEFT, padx=6)

        # Detalle del viaje
        self.lbl_detalle_viaje = tk.Label(
            col_izq, text="Ruta: Bogotá -> Bucaramanga | Bus: COP-742 (2 Pisos - 60 Asientos)",
            font=("Helvetica", 8, "italic"), bg="#F8FAFC", fg="#475569", relief=tk.GROOVE, padx=8, pady=4
        )
        self.lbl_detalle_viaje.pack(fill=tk.X, padx=10, pady=2)

        # Leyenda simple
        f_ley = tk.Frame(col_izq, bg="#FFFFFF")
        f_ley.pack(fill=tk.X, padx=10, pady=4)
        for t, c in [("Disponible", self.COLOR_DISPONIBLE), ("Bloqueada (RF03)", self.COLOR_BLOQUEADO), ("Pagada", self.COLOR_PAGADO)]:
            tk.Label(f_ley, text=f"■ {t}", fg=c, bg="#FFFFFF", font=("Helvetica", 8, "bold")).pack(side=tk.LEFT, padx=8)

        # Contenedor de Sillas
        canvas_sillas = tk.Canvas(col_izq, bg="#F8FAFC", highlightthickness=0)
        scroll_sillas = ttk.Scrollbar(col_izq, orient="vertical", command=canvas_sillas.yview)
        self.f_grid_sillas = tk.Frame(canvas_sillas, bg="#F8FAFC")

        self.f_grid_sillas.bind("<Configure>", lambda e: canvas_sillas.configure(scrollregion=canvas_sillas.bbox("all")))
        canvas_sillas.create_window((0, 0), window=self.f_grid_sillas, anchor="nw")
        canvas_sillas.configure(yscrollcommand=scroll_sillas.set)

        canvas_sillas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(10, 0), pady=4)
        scroll_sillas.pack(side=tk.RIGHT, fill=tk.Y, pady=4)

        # --- COLUMNA DERECHA: FORMULARIO Y VENTA ---
        col_der = tk.LabelFrame(contenedor, text=" 2. Pasajero, Tarifas y Venta (Factory Method & Abstract Factory) ", bg="#FFFFFF", font=("Helvetica", 10, "bold"), fg="#0F172A")
        col_der.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(6, 0), pady=4)

        # Silla seleccionada
        self.lbl_silla_activa = tk.Label(
            col_der, text="Ninguna silla seleccionada",
            font=("Helvetica", 9, "bold"), bg="#EFF6FF", fg="#1D4ED8", padx=8, pady=4, relief=tk.GROOVE
        )
        self.lbl_silla_activa.pack(fill=tk.X, padx=10, pady=5)

        # Formulario Pasajero
        f_pas = tk.Frame(col_der, bg="#FFFFFF")
        f_pas.pack(fill=tk.X, padx=10, pady=4)

        tk.Label(f_pas, text="Nombre:", bg="#FFFFFF", font=("Helvetica", 9)).grid(row=0, column=0, sticky="w", pady=2)
        self.ent_nombre = ttk.Entry(f_pas, width=24)
        self.ent_nombre.grid(row=0, column=1, sticky="w", padx=6, pady=2)
        self.ent_nombre.insert(0, "Nathalia Gómez")

        tk.Label(f_pas, text="Documento:", bg="#FFFFFF", font=("Helvetica", 9)).grid(row=1, column=0, sticky="w", pady=2)
        self.ent_doc = ttk.Entry(f_pas, width=24)
        self.ent_doc.grid(row=1, column=1, sticky="w", padx=6, pady=2)
        self.ent_doc.insert(0, "CC 1098765432")

        tk.Label(f_pas, text="Edad:", bg="#FFFFFF", font=("Helvetica", 9)).grid(row=2, column=0, sticky="w", pady=2)
        self.ent_edad = ttk.Entry(f_pas, width=10)
        self.ent_edad.grid(row=2, column=1, sticky="w", padx=6, pady=2)
        self.ent_edad.insert(0, "28")

        self.var_carne = tk.BooleanVar(value=False)
        self.chk_carne = tk.Checkbutton(
            f_pas, text="Carné Estudiantil Vigente", variable=self.var_carne,
            bg="#FFFFFF", activebackground="#FFFFFF", font=("Helvetica", 9), command=self._actualizar_calculo_tarifa
        )
        self.chk_carne.grid(row=3, column=0, columnspan=2, sticky="w", pady=2)

        # Tarifa (Factory Method)
        f_tar = tk.LabelFrame(col_der, text=" Tipo de Tarifa (Factory Method) ", bg="#FFFFFF", font=("Helvetica", 9, "bold"))
        f_tar.pack(fill=tk.X, padx=10, pady=4)

        self.var_tarifa = tk.StringVar(value=TipoTarifa.PLENA.value)
        tarifas = [
            (TipoTarifa.PLENA.value, "Plena (100% valor base)"),
            (TipoTarifa.ADULTO_MAYOR.value, "Adulto Mayor (25% dcto, edad >= 60)"),
            (TipoTarifa.ESTUDIANTE.value, "Estudiante (20% dcto con carné)"),
            (TipoTarifa.INFANTE.value, "Infante (50% dcto, edad <= 12)")
        ]
        for val, desc in tarifas:
            rb = tk.Radiobutton(
                f_tar, text=desc, value=val, variable=self.var_tarifa,
                bg="#FFFFFF", activebackground="#FFFFFF", font=("Helvetica", 8),
                command=self._actualizar_calculo_tarifa
            )
            rb.pack(anchor="w", padx=6, pady=1)

        # Canal Comercial (Abstract Factory)
        f_can = tk.LabelFrame(col_der, text=" Canal de Venta (Abstract Factory) ", bg="#FFFFFF", font=("Helvetica", 9, "bold"))
        f_can.pack(fill=tk.X, padx=10, pady=4)

        self.var_canal = tk.StringVar(value=CanalVenta.WEB.value)
        canales = [
            (CanalVenta.WEB.value, "🌐 Web / App (PSE + Factura CUFE DIAN + QR Digital)"),
            (CanalVenta.TAQUILLA.value, "🏢 Taquilla (Datáfono + Factura Tirilla POS + Impreso)"),
            (CanalVenta.AGENCIA_ALIADA.value, "🤝 Agencia B2B (Voucher + Factura Lote + Webhook API)")
        ]
        for cval, cdesc in canales:
            rb = tk.Radiobutton(
                f_can, text=cdesc, value=cval, variable=self.var_canal,
                bg="#FFFFFF", activebackground="#FFFFFF", font=("Helvetica", 8)
            )
            rb.pack(anchor="w", padx=6, pady=1)

        # Total Liquidado
        self.lbl_total = tk.Label(
            col_der, text="Total a Pagar: $0 COP",
            font=("Helvetica", 11, "bold"), fg=self.COLOR_BARRA, bg="#F1F5F9", pady=4
        )
        self.lbl_total.pack(fill=tk.X, padx=10, pady=3)

        # Botones de Acción
        f_btn = tk.Frame(col_der, bg="#FFFFFF")
        f_btn.pack(fill=tk.X, padx=10, pady=5)

        btn_bloq = tk.Button(
            f_btn, text="🔒 Bloquear Silla (RF03)", font=("Helvetica", 9, "bold"),
            bg=self.COLOR_BLOQUEADO, fg="#FFFFFF", relief=tk.FLAT, padx=8, pady=5,
            command=self._accion_bloquear_silla
        )
        btn_bloq.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)

        btn_comp = tk.Button(
            f_btn, text="💳 Emitir Tiquete Oficial", font=("Helvetica", 9, "bold"),
            bg=self.COLOR_DISPONIBLE, fg="#FFFFFF", relief=tk.FLAT, padx=8, pady=5,
            command=self._accion_emitir_tiquete
        )
        btn_comp.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)

        # Botones auxiliares de patrones
        f_btn_aux = tk.Frame(col_der, bg="#FFFFFF")
        f_btn_aux.pack(fill=tk.X, padx=10, pady=2)

        btn_colision = tk.Button(
            f_btn_aux, text="⚡ Probar Colisión Concurrente (Singleton)", font=("Helvetica", 8),
            bg="#E2E8F0", fg="#1E293B", relief=tk.FLAT, pady=3, command=self._accion_simular_colision
        )
        btn_colision.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)

        btn_reprog = tk.Button(
            f_btn_aux, text="🔄 Reprogramar Tiquete (Prototype)", font=("Helvetica", 8),
            bg="#E2E8F0", fg="#1E293B", relief=tk.FLAT, pady=3, command=self._accion_reprogramar_tiquete
        )
        btn_reprog.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=2)

        # 3. Área Inferior: Detalle del Tiquete Emitido
        f_recibo = tk.LabelFrame(self, text=" Comprobante y Salida de Negocio Oficial ", bg="#FFFFFF", font=("Helvetica", 9, "bold"), fg="#0F172A")
        f_recibo.pack(fill=tk.BOTH, expand=True, padx=12, pady=(0, 8))

        self.txt_recibo = tk.Text(f_recibo, height=7, font=("DejaVu Sans Mono", 8), bg="#F8FAFC", fg="#1E293B", wrap=tk.WORD, relief=tk.FLAT)
        self.txt_recibo.pack(fill=tk.BOTH, expand=True, padx=8, pady=4)
        self.txt_recibo.insert(tk.END, "Seleccione un viaje y una silla para cotizar o emitir tiquetes oficiales.")
        self.txt_recibo.config(state=tk.DISABLED)

        self._cargar_lista_viajes()

    def _cargar_lista_viajes(self):
        viajes = self.controller.listar_viajes()
        vals = [f"{v.codigo_viaje} — {v.ruta.origen.split()[0]} a {v.ruta.destino.split()[0]} ({v.fecha_salida})" for v in viajes]
        self.cb_viajes["values"] = vals
        if vals:
            self.cb_viajes.current(0)
            self._renderizar_sillas(viajes[0])

    def _on_cambiar_viaje(self, event=None):
        idx = self.cb_viajes.current()
        viajes = self.controller.listar_viajes()
        if 0 <= idx < len(viajes):
            viaje = viajes[idx]
            self.viaje_actual_id = viaje.id_viaje
            self.silla_seleccionada = None
            self.lbl_detalle_viaje.config(
                text=f"Ruta: {viaje.ruta.origen} -> {viaje.ruta.destino} | Salida: {viaje.fecha_salida} {viaje.hora_salida}"
            )
            self.lbl_silla_activa.config(text="Ninguna silla seleccionada")
            self._renderizar_sillas(viaje)
            self._actualizar_calculo_tarifa()

    def _renderizar_sillas(self, viaje):
        for w in self.f_grid_sillas.winfo_children():
            w.destroy()
        self.botones_sillas.clear()

        gestor = GestorBloqueoSillas.get_instance()

        # Piso 1 (12 sillas VIP Cama)
        tk.Label(self.f_grid_sillas, text="Piso 1: VIP Cama (12 Asientos)", font=("Helvetica", 8, "bold"), fg="#4338CA", bg="#F8FAFC").pack(anchor="w", padx=4, pady=2)
        f_p1 = tk.Frame(self.f_grid_sillas, bg="#F8FAFC")
        f_p1.pack(anchor="w", padx=4)

        # Piso 2 (48 sillas Confort)
        tk.Label(self.f_grid_sillas, text="Piso 2: Confort Estándar (48 Asientos)", font=("Helvetica", 8, "bold"), fg="#0284C7", bg="#F8FAFC").pack(anchor="w", padx=4, pady=(6, 2))
        f_p2 = tk.Frame(self.f_grid_sillas, bg="#F8FAFC")
        f_p2.pack(anchor="w", padx=4)

        for s in viaje.sillas:
            parent = f_p1 if s.piso == 1 else f_p2
            row = (s.numero - 1) // 4 if s.piso == 1 else (s.numero - 13) // 4
            col = (s.numero - 1) % 4
            col_pos = col if col < 2 else col + 1  # Pasillo central

            bloq = gestor.esta_bloqueada(viaje.id_viaje, s.numero)
            if s.estado == EstadoTiquete.PAGADO:
                bg = self.COLOR_PAGADO
                txt = f"S{s.numero:02d}\nPAG"
            elif bloq or s.estado == EstadoTiquete.BLOQUEADO:
                bg = self.COLOR_BLOQUEADO
                info = gestor.obtener_info_bloqueo(viaje.id_viaje, s.numero)
                seg = info.segundos_restantes if info else 180
                txt = f"S{s.numero:02d}\n{seg}s"
            else:
                bg = self.COLOR_DISPONIBLE
                txt = f"S{s.numero:02d}\nDIS"

            btn = tk.Button(
                parent, text=txt, font=("Helvetica", 7, "bold"), bg=bg, fg="#FFFFFF",
                width=4, height=2, relief=tk.RAISED,
                command=lambda num=s.numero: self._seleccionar_silla(num)
            )
            btn.grid(row=row, column=col_pos, padx=2, pady=2)
            self.botones_sillas[s.numero] = btn

    def _seleccionar_silla(self, numero: int):
        viaje = self.controller.obtener_viaje(self.viaje_actual_id)
        if not viaje:
            return
        silla = viaje.obtener_silla(numero)
        if not silla:
            return

        if silla.estado == EstadoTiquete.PAGADO:
            messagebox.showwarning("Silla Ocupada", f"La silla #{numero} ya ha sido vendida.")
            return

        gestor = GestorBloqueoSillas.get_instance()
        if gestor.esta_bloqueada(viaje.id_viaje, numero):
            info = gestor.obtener_info_bloqueo(viaje.id_viaje, numero)
            if info and info.usuario != self.ent_nombre.get().strip():
                messagebox.showwarning(
                    "Silla Retenida (Singleton RF03)",
                    f"La silla #{numero} está bloqueada por '{info.usuario}'.\n"
                    f"Tiempo restante: {info.segundos_restantes}s."
                )
                return

        self.silla_seleccionada = numero
        self.lbl_silla_activa.config(
            text=f"✓ Silla Seleccionada: #{numero} | Piso {silla.piso} ({silla.clase.value}) | Tarifa Base: ${silla.precio_base:,.2f}"
        )
        self._actualizar_calculo_tarifa()

    def _actualizar_calculo_tarifa(self):
        if not self.silla_seleccionada or not self.viaje_actual_id:
            self.lbl_total.config(text="Total a Pagar: $0 COP")
            return

        try:
            edad = int(self.ent_edad.get().strip() or "25")
        except ValueError:
            edad = 25

        p = Pasajero("0", "CC", self.ent_nombre.get().strip(), edad, self.var_carne.get())
        tipo = TipoTarifa(self.var_tarifa.get())

        try:
            monto = self.controller.cotizar_pasaje(tipo, p, self.viaje_actual_id, self.silla_seleccionada)
            self.lbl_total.config(text=f"Total a Pagar: ${monto:,.2f} COP")
        except ValueError as err:
            self.lbl_total.config(text=f"Tarifa no aplicable: {err}")

    def _accion_bloquear_silla(self):
        if not self.silla_seleccionada:
            messagebox.showwarning("Atención", "Seleccione una silla disponible primero.")
            return

        usuario = self.ent_nombre.get().strip() or "Usuario Web"
        canal = CanalVenta(self.var_canal.get())

        exito = self.controller.bloquear_silla(self.viaje_actual_id, self.silla_seleccionada, usuario, canal)
        if exito:
            messagebox.showinfo(
                "Bloqueo Temporal Exitoso (Singleton RF03)",
                f"Silla #{self.silla_seleccionada} bloqueada por 180s para '{usuario}'.\n"
                f"Canal: {canal.value}. La exclusión mutua previene doble venta."
            )
            viaje = self.controller.obtener_viaje(self.viaje_actual_id)
            self._renderizar_sillas(viaje)
        else:
            messagebox.showerror("Colisión", "No fue posible bloquear la silla (ya está retenida).")

    def _accion_emitir_tiquete(self):
        if not self.silla_seleccionada:
            messagebox.showwarning("Atención", "Seleccione una silla antes de emitir.")
            return

        try:
            edad = int(self.ent_edad.get().strip())
        except ValueError:
            messagebox.showerror("Error", "La edad debe ser numérica.")
            return

        p = Pasajero(
            self.ent_doc.get().strip(), "CC", self.ent_nombre.get().strip(),
            edad, self.var_carne.get()
        )
        tipo = TipoTarifa(self.var_tarifa.get())
        canal = CanalVenta(self.var_canal.get())

        try:
            res = self.controller.ejecutar_venta_integral(
                id_viaje=self.viaje_actual_id,
                numero_silla=self.silla_seleccionada,
                pasajero=p,
                tipo_tarifa=tipo,
                canal=canal,
                datos_pago={"tarjeta": "1234", "banco": "PSE"}
            )
            viaje = self.controller.obtener_viaje(self.viaje_actual_id)
            self._renderizar_sillas(viaje)

            # Mostrar resultado en el cuadro inferior
            tk_obj = res["tiquete"]
            fac_obj = res["factura"]
            cufe_str = f" | CUFE DIAN: {fac_obj.cufe[:25]}..." if fac_obj.cufe else ""
            qr_str = f" | QR: [{tk_obj.codigo_qr}]" if tk_obj.codigo_qr else ""

            texto_recibo = (
                f"=========================== COPETRAN S.A. — TIQUETE EMITIDO ===========================\n"
                f"Tiquete Consecutivo: {tk_obj.numero_tiquete} (Singleton) | Canal: {tk_obj.canal.value} (Abstract Factory)\n"
                f"Pasajero: {tk_obj.pasajero.nombre_completo} ({tk_obj.pasajero.tipo_documento} {tk_obj.pasajero.numero_documento}) | Edad: {tk_obj.pasajero.edad} años\n"
                f"Silla: #{tk_obj.silla.numero} ({tk_obj.silla.clase.value}) | Tarifa: {tk_obj.tipo_tarifa.value} (Factory Method)\n"
                f"Total Pagado: ${tk_obj.valor_pagado:,.2f} COP | Factura: {fac_obj.numero_factura}{cufe_str}{qr_str}\n"
                f"Notificación: {res.get('notificacion', '')}\n"
                f"========================================================================================"
            )
            self.txt_recibo.config(state=tk.NORMAL)
            self.txt_recibo.delete("1.0", tk.END)
            self.txt_recibo.insert(tk.END, texto_recibo)
            self.txt_recibo.config(state=tk.DISABLED)

            messagebox.showinfo("Venta Exitosa", f"¡Tiquete {tk_obj.numero_tiquete} emitido exitosamente!")

        except Exception as e:
            messagebox.showerror("Validación de Negocio", str(e))

    def _accion_clonar_viaje(self):
        """Clona el viaje actual para la siguiente semana usando Prototype."""
        viaje = self.controller.obtener_viaje(self.viaje_actual_id)
        if not viaje:
            return

        clave = f"PLANTILLA_{viaje.codigo_viaje}"
        self.controller.guardar_plantilla_viaje(clave, viaje)

        clon = self.controller.clonar_viaje_semanal(clave, "2026-10-08", "08:00 AM")
        self._cargar_lista_viajes()
        messagebox.showinfo(
            "Patrón Prototype",
            f"Viaje clonado exitosamente mediante Deep Copy.\n\n"
            f"• Nuevo Código: {clon.codigo_viaje}\n"
            f"• Nueva Fecha: {clon.fecha_salida}\n"
            f"• Sillas: 60 asientos clonados y restablecidos a DISPONIBLE."
        )

    def _accion_simular_colision(self):
        """Demuestra la exclusión mutua de Singleton simulando dos compras simultáneas."""
        if not self.viaje_actual_id:
            return
        # Bloquear silla 10 para Usuario A
        self.controller.bloquear_silla(self.viaje_actual_id, 10, "Usuario Web 01", CanalVenta.WEB)
        # Intento de Usuario B desde Taquilla
        exito_b = self.controller.bloquear_silla(self.viaje_actual_id, 10, "Cajero Taquilla", CanalVenta.TAQUILLA)

        viaje = self.controller.obtener_viaje(self.viaje_actual_id)
        self._renderizar_sillas(viaje)

        if not exito_b:
            messagebox.showinfo(
                "Patrón Singleton (RF03)",
                "¡COLISIÓN CONCURRENTE EVITADA!\n\n"
                "La silla #10 ya estaba bloqueada para 'Usuario Web 01'.\n"
                "El Singleton GestorBloqueoSillas rechazó el intento de Taquilla.\n"
                "Protección activa contra doble venta simultánea."
            )

    def _accion_reprogramar_tiquete(self):
        """Demuestra el Proceso G usando Prototype para clonar un tiquete abierto."""
        viajes = self.controller.listar_viajes()
        if not viajes:
            return
        v = viajes[0]
        # Crear tiquete abierto base
        tk_base = Tiquete(
            id_tiquete="ORIG-001", numero_tiquete="TK-TAQ-00001",
            id_viaje=v.id_viaje, silla=v.sillas[0],
            pasajero=Pasajero("101", "CC", "Rosalba Gutiérrez", 65),
            tipo_tarifa=TipoTarifa.ADULTO_MAYOR, valor_pagado=75000.0,
            estado=EstadoTiquete.ABIERTO, canal=CanalVenta.TAQUILLA
        )
        self.controller.registrar_tiquete_abierto(tk_base)

        try:
            res = self.controller.reprogramar_tiquete_abierto(
                "TK-TAQ-00001", v.id_viaje, 3, penalidad=15000.0
            )
            messagebox.showinfo(
                "Patrón Prototype (Proceso G)",
                f"Tiquete Abierto reprogramado mediante clonación:\n\n"
                f"• Pasajero: {res['pasajero']}\n"
                f"• Nueva Silla: #{res['silla']}\n"
                f"• Total con Penalidad: ${res['total_con_penalidad']:,.2f} COP\n"
                f"• QR: {res['codigo_qr']}"
            )
            self._renderizar_sillas(v)
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def _actualizar_reloj_bloqueo(self):
        """Actualiza los segundos restantes de las sillas bloqueadas cada segundo."""
        if self.viaje_actual_id and self.botones_sillas:
            gestor = GestorBloqueoSillas.get_instance()
            for num, btn in list(self.botones_sillas.items()):
                info = gestor.obtener_info_bloqueo(self.viaje_actual_id, num)
                if info:
                    if info.ha_expirado:
                        btn.config(text=f"S{num:02d}\nDIS", bg=self.COLOR_DISPONIBLE)
                    else:
                        btn.config(text=f"S{num:02d}\n{info.segundos_restantes}s", bg=self.COLOR_BLOQUEADO)
        self.after(1000, self._actualizar_reloj_bloqueo)


def iniciar_gui():
    app = CopetranTkinterView()
    app.mainloop()


if __name__ == '__main__':
    iniciar_gui()
