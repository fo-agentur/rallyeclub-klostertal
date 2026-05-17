import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { getEnv } from "./env";

let _pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return !!getEnv("DATABASE_URL");
}

/**
 * Server-only Postgres-Pool. Singleton, damit Next.js HMR keine
 * Connection-Leaks erzeugt.
 *
 * `DATABASE_URL` Format:
 *   postgres://user:pass@host:5432/db?sslmode=disable
 *
 * Coolify-intern (gleiches Docker-Netz) braucht kein SSL.
 * Externe Verbindungen: `?sslmode=require` anhängen.
 */
export function getPool(): Pool {
  if (_pool) return _pool;
  const url = getEnv("DATABASE_URL");
  if (!url) {
    throw new Error(
      "DATABASE_URL ist nicht gesetzt. In Coolify als ENV setzen, lokal in .env.local.",
    );
  }
  const ssl = /sslmode=require/i.test(url)
    ? { rejectUnauthorized: false }
    : undefined;
  _pool = new Pool({
    connectionString: url,
    ssl,
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  _pool.on("error", (err) => {
    console.error("[pg] idle client error", err);
  });
  return _pool;
}

/** Bequeme Wrapper-Funktion für parametrisierte Queries. */
export async function query<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: ReadonlyArray<unknown>,
): Promise<QueryResult<Row>> {
  const pool = getPool();
  return pool.query<Row>(text, values as unknown[] | undefined);
}
