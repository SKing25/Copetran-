import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { Login } from '@/components/Login';
import { DashboardRouter } from '@/components/DashboardRouter';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRouter />} />
          </Route>
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}
