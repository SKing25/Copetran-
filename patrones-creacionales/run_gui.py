"""
Lanzador de la Interfaz Gráfica Tkinter — Copetran S.A.
Arquitectura MVC / Tres Capas (Corte 2 - Tarea 2)
"""

import sys
import os

# Asegurar que la ruta base esté en sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from copetran.view.tkinter_view import iniciar_gui

if __name__ == '__main__':
    print("Iniciando Interfaz Gráfica Tkinter de Copetran S.A. (MVC)...")
    iniciar_gui()
