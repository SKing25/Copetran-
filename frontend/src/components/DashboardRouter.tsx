import { useAuth } from '../context/AuthContext';
import { Layout } from './Layout';
import { ClienteDashboard } from '../dashboards/ClienteDashboard';
import { CajeroDashboard } from '../dashboards/CajeroDashboard';
import { OperarioDashboard } from '../dashboards/OperarioDashboard';

/**
 * Enruta al dashboard correspondiente según el rol autenticado. Patrón
 * genérico: un único punto de decisión por rol, cada dashboard es
 * independiente y solo conoce su propio proceso de negocio.
 */
export function DashboardRouter() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  return (
    <Layout>
      {usuario.rol === 'CLIENTE' && <ClienteDashboard />}
      {usuario.rol === 'CAJERO' && <CajeroDashboard />}
      {usuario.rol === 'OPERARIO' && <OperarioDashboard />}
    </Layout>
  );
}
