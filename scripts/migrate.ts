/**
 * Spielt alle SQL-Files aus db/migrations/ in lexikografischer Reihenfolge ein.
 * Idempotent (CREATE TABLE IF NOT EXISTS …).
 *
 * Voraussetzung: DATABASE_URL gesetzt (lokal: .env.local, prod: Coolify ENV).
 * Ausführen: `npm run migrate`
 */
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL nicht gesetzt.");
    process.exit(1);
  }

  const dir = path.join(process.cwd(), "db", "migrations");
  if (!fs.existsSync(dir)) {
    console.error(`Migrationsordner fehlt: ${dir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("Keine Migrationen gefunden.");
    return;
  }

  const ssl = /sslmode=require/i.test(url) ? { rejectUnauthorized: false } : undefined;
  const pool = new Pool({ connectionString: url, ssl });

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`⇢ ${file}`);
      await pool.query(sql);
    }
    console.log("\n✓ Alle Migrationen eingespielt.");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
