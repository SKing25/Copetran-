import { useState } from 'react';
import { Bus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CompanyLogoProps {
  className?: string;
  variant?: 'square' | 'horizontal';
  alt?: string;
}

/**
 * Componente oficial de logotipo de Copetran.
 * Soporta variante cuadrada (icono oficial con galgo blanco sobre fondo azul)
 * y variante horizontal (logo corporativo completo para barras de navegación).
 */
export function CompanyLogo({ className, variant = 'square', alt = 'Copetran' }: CompanyLogoProps) {
  const [logoFallido, setLogoFallido] = useState(false);

  const src = variant === 'horizontal' ? '/assets/copetran-horizontal.png' : '/assets/copetran-square.png';

  if (variant === 'horizontal') {
    return (
      <div className={cn('flex items-center', className)}>
        {!logoFallido ? (
          <img
            src={src}
            alt={alt}
            className="h-9 w-auto object-contain"
            onError={() => setLogoFallido(true)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-copetran-500" />
            <span className="text-lg font-black tracking-wider text-white">COPETRAN</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-copetran-600 shadow-sm',
        className,
      )}
    >
      {!logoFallido ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setLogoFallido(true)}
        />
      ) : (
        <Bus className="h-5 w-5 text-white" aria-hidden />
      )}
    </div>
  );
}
