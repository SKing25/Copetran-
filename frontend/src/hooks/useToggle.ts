import { useCallback, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

/** Hook genérico para alternar un booleano (ej. abrir/cerrar sidebar, modal). */
export function useToggle(initial = false): [boolean, () => void, Dispatch<SetStateAction<boolean>>] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}
