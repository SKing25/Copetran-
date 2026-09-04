import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilidad genérica para combinar clases condicionales de Tailwind y
 * resolver conflictos de utilidades (ej. "px-2" vs "px-4"). Patrón estándar
 * clsx + tailwind-merge, independiente del dominio de Copetran.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
