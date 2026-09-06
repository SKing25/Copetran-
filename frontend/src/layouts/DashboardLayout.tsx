import { useState } from 'react';
import { Navigate, Outlet, useNavigate, Link } from 'react-router-dom';
import { LogOut, Menu, X, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { cn } from '@/utils/cn';

/**
 * Shell compartido de la interfaz: sidebar fijo + topbar + contenido vía
 * <Outlet />. No conoce lógica de negocio — solo envuelve lo que
 * DashboardRouter (las pestañas del workspace) decida renderizar.
 */
export function DashboardLayout() {
  const { usuario, logout } = useAuth();
  const { restablecerDatosSemilla } = useData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

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
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white p-0.5 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img src="/assets/copetran-square.png" alt="Copetran" className="h-full w-full object-cover rounded-lg" />
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-white">COPETRAN</span>
              <span className="block text-[9px] uppercase font-bold text-amber-400 tracking-widest leading-none">
                Workspace
              </span>
            </div>
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
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/60 p-3 border border-slate-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-copetran-600 text-sm font-semibold">
              {inicial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{usuario.nombre}</p>
              <p className="text-xs text-slate-400">{usuario.rol}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 p-4 space-y-1">
          <button
            type="button"
            onClick={() => {
              restablecerDatosSemilla();
              setResetFeedback(true);
              setTimeout(() => setResetFeedback(false), 2500);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {resetFeedback ? '✓ Datos restablecidos' : 'Restablecer datos demo'}
          </button>

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
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-bold text-slate-900">Panel de Operación y Gestión</h1>
          </div>
          <Link
            to="/"
            className="text-xs font-bold text-copetran-600 hover:text-copetran-800 transition flex items-center gap-1"
          >
            Ver Portal de Inicio →
          </Link>
        </header>

        <main className="flex-1 bg-slate-100 px-4 py-6 lg:px-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
