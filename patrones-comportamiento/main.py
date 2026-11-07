"""
Punto de Entrada Principal — Módulo de Patrones de Comportamiento (Copetran S.A.)
Inicia el servidor REST integrador (Flask) conectado al frontend en React (frontend/),
o ejecuta la demostración trazable por consola si se invoca con --demo.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def iniciar() -> None:
    if "--demo" in sys.argv:
        from run_demo import main as ejecutar_demo

        ejecutar_demo()
        return

    from servidor_api import app

    print("Servidor Integrado Copetran (Creacionales + Comportamiento) activo en http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)


if __name__ == "__main__":
    iniciar()
