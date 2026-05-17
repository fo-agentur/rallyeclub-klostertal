/**
 * Einheitlicher Zugriff auf Umgebungsvariablen.
 *
 * Bewusst dünn — Coolify (und `docker run`) injizieren ENV direkt in den
 * Prozess, daher reicht ein `process.env`-Lookup. Leere Strings werden wie
 * "nicht gesetzt" behandelt, damit halbleere Configs nicht still durchrutschen.
 */
export function getEnv(key: string): string | undefined {
  const v = process.env[key];
  if (v === undefined || v === "") return undefined;
  return v;
}

/** Wirft, wenn die Variable fehlt — für Boot-Zeit-Checks. */
export function requireEnv(key: string): string {
  const v = getEnv(key);
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}
