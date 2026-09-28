"""
Patrones Creacionales — Copetran
"""
from copetran.model.patterns.singleton import GestorBloqueoSillas, SecuenciadorTiquetes, BloqueoInfo
from copetran.model.patterns.factory_method import (
    Tarifa, TarifaPlena, TarifaAdultoMayor, TarifaEstudiante, TarifaInfante,
    FabricaTarifa, FabricaTarifaImpl
)
from copetran.model.patterns.abstract_factory import (
    FabricaCanalVenta, FabricaTaquilla, FabricaWeb, FabricaAgenciaAliada,
    BloqueoSillaComponent, ProcesadorPago, EmisorFactura, NotificadorPasajero
)
from copetran.model.patterns.builder import (
    ViajeProgramado, ViajeBuilder, ViajeProgramadoBuilderImpl, OperarioRutasDirector
)
from copetran.model.patterns.prototype import (
    PrototipoClonable, ViajePlantillaClonable, TiqueteAbiertoPrototipo, CatalogoPlantillasViaje
)
