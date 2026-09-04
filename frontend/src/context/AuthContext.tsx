import React, { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Rol } from '../types/copetran';

export interface Usuario {
  nombre: string;
  rol: Rol;
}

interface AuthContextValue {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useLocalStorage<Usuario | null>('copetran.usuario', null);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      login: (u: Usuario) => setUsuario(u),
      logout: () => setUsuario(null),
    }),
    [usuario, setUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  return ctx;
}
