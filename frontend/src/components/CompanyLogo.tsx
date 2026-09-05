import { useState } from 'react';
import { Bus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CompanyLogoProps {
  className?: string;
}

/**
 * Caja contenedora del logo de la empresa. Intenta cargar
 * /assets/logo-copetran.png; si no existe (404) o falla, degrada a un
 * fallback de texto elegante (ícono + nombre), sin romper el layout.
 */
export function CompanyLogo({ className }: CompanyLogoProps) {
  const [logoFallido, setLogoFallido] = useState(false);

  return (
    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800', className)}>
      {!logoFallido ? (
        <img
          src="/assets/logo-copetran.png"
          alt="Copetran"
          className="h-full w-full object-contain"
          onError={() => setLogoFallido(true)}
        />
      ) : (
        <Bus className="h-5 w-5 text-copetran-500" aria-hidden />
      )}
    </div>
  );
}
