import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Login } from './components/Login';
import { DashboardRouter } from './components/DashboardRouter';

function AppContent() {
  const { usuario } = useAuth();
  return usuario ? <DashboardRouter /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
