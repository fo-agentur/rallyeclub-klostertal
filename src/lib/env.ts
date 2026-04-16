import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read env vars on Cloudflare Workers + Node.
 * Prefer Worker `env` from `getCloudflareContext()` — OpenNext only copies `typeof === "string"`
 * bindings into `process.env`, so secrets or non-string bindings must be read from context.
 */
export function getEnv(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    const fromContext = unwrapBinding((env as Record<string, unknown>)[key]);
    if (fromContext !== undefined && fromContext !== "") return fromContext;
  } catch {
    // No Cloudflare request context (e.g. local `next dev` without proxy, or SSG edge case).
  }

  const fromProcess = process.env[key];
  if (fromProcess !== undefined && fromProcess !== "") return fromProcess;
  return undefined;
}

function unwrapBinding(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // Workers Secret / misc: best-effort string coercion
  if (typeof v === "object") {
    const any = v as { toString?: () => string; value?: string };
    if (typeof any.value === "string") return any.value;
    const s = String(v);
    if (s && s !== "[object Object]") return s;
  }
  return undefined;
}
