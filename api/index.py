"""
Punto de Entrada Serverless para Vercel — Copetran S.A.
Permite a Vercel ejecutar el backend Flask de Python como Serverless Function
resolviendo las rutas hacia patrones-comportamiento y patrones-creacionales.
"""

import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUTA_COMPORTAMIENTO = os.path.join(BASE_DIR, "patrones-comportamiento")
RUTA_CREACIONALES = os.path.join(BASE_DIR, "patrones-creacionales")

for ruta in (RUTA_COMPORTAMIENTO, RUTA_CREACIONALES):
    if ruta not in sys.path:
        sys.path.insert(0, ruta)

# Importar la aplicación Flask integrada
from servidor_api import app

# Vercel Serverless Python busca automáticamente la variable 'app'
if __name__ == "__main__":
    app.run()
