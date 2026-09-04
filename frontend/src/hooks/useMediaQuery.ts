import { useEffect, useState } from 'react';

/** Hook genérico: se suscribe a una media query CSS y retorna si coincide. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
