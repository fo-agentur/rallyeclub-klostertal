/**
 * Parse primary-key style values from FormData / URL params.
 * Defense in depth next to parameterized SQL — rejects junk before it hits the DB.
 */

export function parseOptionalFormPk(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n =
    typeof raw === "string"
      ? Number(raw)
      : typeof raw === "number"
        ? raw
        : Number.NaN;
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

/** Same rules as `parseOptionalFormPk`; named for call-sites where the id must be present. */
export const parseRequiredFormPk = parseOptionalFormPk;
