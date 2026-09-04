type ClassValue = string | number | null | undefined | false | Record<string, boolean>;

/**
 * Utilidad genérica para combinar clases condicionales de Tailwind,
 * equivalente ligero a clsx/cn (sin dependencia externa).
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else {
      for (const [key, condition] of Object.entries(input)) {
        if (condition) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}
