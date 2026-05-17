import { Pool, type QueryConfig, type QueryResult, type QueryResultRow } from "pg";
import parse from "pg-connection-string";
import { getEnv } from "./env";

let _pool: Pool | null = null;

/**
 * Fail fast with a clear message when DATABASE_URL cannot be parsed.
 * `pg-connection-string` uses the WHATWG URL parser internally; invalid strings
 * surface as TypeError: Invalid URL with base `postgres://base` and redacted input.
 */
function assertParsableDatabaseUrl(connectionString: string): void {
  try {
    parse(connectionString);
  } catch {
    throw new Error(
      [
        "DATABASE_URL ist ungültig und kann nicht geparst werden.",
        "Häufig: Sonderzeichen im Passwort (oder Nutzername) — URL-encodieren, z. B. @ → %40, : → %3A, / → %2F, # → %23, Leerzeichen → %20.",
        "Erwartetes Muster: postgres://USER:PASS@HOST:5432/DBNAME",
        "Bei Docker/Coolify: sicherstellen, dass alle Variablen expandiert sind (kein wörtliches ${POSTGRES_USER} in der finalen URL).",
      ].join(" "),
    );
  }
}

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
  assertParsableDatabaseUrl(url);
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

/**
 * Tagged template for SQL: every `${value}` becomes a separate bound parameter ($1, $2, …).
 * Never concatenate user input into the literal parts of the template — only constants belong there.
 *
 * @example
 * await query(sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`)
 */
export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): QueryConfig {
  if (strings.length !== values.length + 1) {
    throw new Error("sql: template mismatch");
  }
  let text = strings[0] ?? "";
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}` + (strings[i + 1] ?? "");
  }
  return { text, values: [...values] };
}

/**
 * Parameterized queries only. Do not build SQL with string concatenation or template literals
 * that embed user input in the query text — use placeholders ($1, $2) or `sql` tagged template.
 */
export async function query<Row extends QueryResultRow = QueryResultRow>(
  config: QueryConfig,
): Promise<QueryResult<Row>>;
export async function query<Row extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: ReadonlyArray<unknown>,
): Promise<QueryResult<Row>>;
export async function query<Row extends QueryResultRow = QueryResultRow>(
  textOrConfig: string | QueryConfig,
  values?: ReadonlyArray<unknown>,
): Promise<QueryResult<Row>> {
  const pool = getPool();
  if (typeof textOrConfig === "string") {
    return pool.query<Row>(textOrConfig, values as unknown[] | undefined);
  }
  return pool.query<Row>(textOrConfig);
}
