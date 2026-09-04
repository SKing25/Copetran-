import { useEffect, useState } from 'react';

/**
 * Hook genérico para sincronizar un valor de estado con localStorage.
 * Patrón reutilizable independiente del dominio (no contiene lógica de
 * negocio de Copetran).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage no disponible (modo privado, cuota excedida, etc.)
    }
  }, [key, value]);

  return [value, setValue] as const;
}
