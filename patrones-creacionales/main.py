"""
Punto de Entrada Principal (Main) — Copetran S.A.
Lanza la aplicación con la Interfaz Gráfica Tkinter (Arquitectura MVC).
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from copetran.view.tkinter_view import iniciar_gui

if __name__ == '__main__':
    iniciar_gui()
