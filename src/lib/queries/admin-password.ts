import { isDatabaseConfigured, query } from "@/lib/pg";

/**
 * Hash from DB if table+row exist; null → caller falls back to ADMIN_PASSWORD_HASH env.
 */
export async function getAdminPasswordHashFromDb(): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const { rows } = await query<{ password_hash: string }>(
      "SELECT password_hash FROM admin_password WHERE id = 1 LIMIT 1",
    );
    return rows[0]?.password_hash ?? null;
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "42P01") return null;
    throw e;
  }
}

export async function upsertAdminPasswordHash(passwordHash: string): Promise<void> {
  await query(
    `INSERT INTO admin_password (id, password_hash, updated_at)
     VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, updated_at = now()`,
    [passwordHash],
  );
}
