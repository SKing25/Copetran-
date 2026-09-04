import { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Bus, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

const TITULO_POR_ROL: Record<string, string> = {
  CLIENTE: 'Portal Cliente',
  CAJERO: 'Taquilla',
  OPERARIO: 'Bodega y Mensajería',
};

/**
 * Shell compartido de los tres dashboards: sidebar fijo + topbar + contenido
 * vía <Outlet />. No conoce lógica de negocio — solo envuelve lo que
 * DashboardRouter decida renderizar según el rol.
 */
export function DashboardLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!usuario) return <Navigate to="/login" replace />;

  function handleLogout() {
    logout();
    navigate('/');
  }

  const inicial = usuario!.nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-copetran-500" aria-hidden />
            <span className="text-lg font-bold">Copetran</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copetran-600 text-sm font-semibold">
              {inicial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{usuario.nombre}</p>
              <p className="text-xs text-slate-400">{usuario.rol}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-slate-900">{TITULO_POR_ROL[usuario.rol] ?? 'Copetran'}</h1>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
