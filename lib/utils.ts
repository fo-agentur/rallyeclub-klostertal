/**
 * shadcn-kompatible `cn`-Hilfsfunktion (minimal, ohne tailwind-merge).
 * In einem echten shadcn-Projekt: `npx shadcn@latest init` ersetzt dies durch
 * clsx + tailwind-merge (siehe https://ui.shadcn.com/docs/installation).
 */
export type ClassValue = string | number | boolean | undefined | null | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const x of inputs) {
    if (!x) continue;
    if (typeof x === 'string' || typeof x === 'number') out.push(String(x));
    else if (typeof x === 'object')
      Object.entries(x).forEach(function ([k, v]) {
        if (v) out.push(k);
      });
  }
  return out.join(' ');
}
