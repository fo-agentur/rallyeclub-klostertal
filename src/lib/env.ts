import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Read env vars on Cloudflare Workers + Node.
 * OpenNext copies only `typeof === "string"` from `env` into `process.env`; some bindings need a direct read.
 */
export function getEnv(key: string): string | undefined {
  const fromProcess = process.env[key];
  if (fromProcess !== undefined && fromProcess !== "") return fromProcess;

  try {
    const { env } = getCloudflareContext();
    const raw = (env as Record<string, unknown>)[key];
    return unwrapBinding(raw);
  } catch {
    return undefined;
  }
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
