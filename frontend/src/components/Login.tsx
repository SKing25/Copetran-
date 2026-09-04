import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Rol } from '@/types/copetran';
import { Card, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

const ROLES: { rol: Rol; etiqueta: string; descripcion: string }[] = [
  { rol: 'CLIENTE', etiqueta: 'Cliente', descripcion: 'Compra tiquetes de pasajeros (Proceso A)' },
  { rol: 'CAJERO', etiqueta: 'Cajero de Agencia', descripcion: 'Vende tiquetes en taquilla (Proceso A)' },
  { rol: 'OPERARIO', etiqueta: 'Operario de Bodega', descripcion: 'Admite guías de envío (Proceso C)' },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol>('CLIENTE');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    login({ nombre: nombre.trim(), rol: rolSeleccionado });
    navigate('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardTitle>Copetran — Iniciar sesión</CardTitle>
        <p className="mt-1 text-sm text-slate-500">
          Roles del sistema documentados en el parcial primer corte (Sección 1).
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Laura Gómez"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-copetran-500 focus:outline-none focus:ring-1 focus:ring-copetran-500"
              required
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700">Rol</span>
            <div className="mt-2 space-y-2">
              {ROLES.map(({ rol, etiqueta, descripcion }) => (
                <button
                  key={rol}
                  type="button"
                  onClick={() => setRolSeleccionado(rol)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-left text-sm transition',
                    rolSeleccionado === rol
                      ? 'border-copetran-500 bg-copetran-50 ring-1 ring-copetran-500'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <span className="font-medium text-slate-900">{etiqueta}</span>
                  <span className="block text-xs text-slate-500">{descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-copetran-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-copetran-700"
          >
            Entrar
          </button>
        </form>
      </Card>
    </div>
  );
}
