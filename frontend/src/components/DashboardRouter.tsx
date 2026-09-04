import { useAuth } from '@/context/AuthContext';
import { ClienteDashboard } from '@/dashboards/ClienteDashboard';
import { CajeroDashboard } from '@/dashboards/CajeroDashboard';
import { OperarioDashboard } from '@/dashboards/OperarioDashboard';

/**
 * Decide qué dashboard renderizar según el rol autenticado. Se monta como
 * ruta índice dentro de <DashboardLayout /> (que aporta el shell: sidebar,
 * topbar). Cada dashboard es independiente y solo conoce su propio proceso
 * de negocio.
 */
export function DashboardRouter() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  if (usuario.rol === 'CLIENTE') return <ClienteDashboard />;
  if (usuario.rol === 'CAJERO') return <CajeroDashboard />;
  if (usuario.rol === 'OPERARIO') return <OperarioDashboard />;
  return null;
}
