import React from 'react';
import { useAuth } from '../context/AuthContext';

const TITULO_POR_ROL: Record<string, string> = {
  CLIENTE: 'Portal del Cliente',
  CAJERO: 'Taquilla — Cajero de Agencia',
  OPERARIO: 'Bodega — Operario',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-copetran-700">Copetran</p>
            <p className="text-xs text-slate-500">{usuario ? TITULO_POR_ROL[usuario.rol] : ''}</p>
          </div>
          {usuario && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                {usuario.nombre} · <span className="font-medium">{usuario.rol}</span>
              </span>
              <button
                onClick={logout}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
