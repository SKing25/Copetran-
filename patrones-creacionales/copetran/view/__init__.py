"""
Capa de Vista — Copetran (MVC / Tres Capas)
Interfaz de presentación:
- TkinterView: Interfaz gráfica de usuario moderna (GUI) nativa.
- ConsolaView: Interfaz de presentación por terminal.
"""

from copetran.view.consola_view import ConsolaView
from copetran.view.tkinter_view import CopetranTkinterView, iniciar_gui

__all__ = [
    "ConsolaView",
    "CopetranTkinterView",
    "iniciar_gui",
]
