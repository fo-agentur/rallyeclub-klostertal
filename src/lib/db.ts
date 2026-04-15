/**
 * Unified async DB adapter.
 * - Cloudflare Workers: uses D1 via getCloudflareContext()
 * - Node.js local dev: uses node:sqlite wrapped in Promises
 */

// ─── Interface ────────────────────────────────────────────────────────────────

export type DBRow = Record<string, unknown>;

export interface DBAdapter {
  all<T extends DBRow = DBRow>(sql: string, params?: unknown[]): Promise<T[]>;
  first<T extends DBRow = DBRow>(sql: string, params?: unknown[]): Promise<T | null>;
  run(sql: string, params?: unknown[]): Promise<{ lastInsertRowid: number }>;
  exec(sql: string): Promise<void>;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _adapter: DBAdapter | null = null;

export async function getDb(): Promise<DBAdapter> {
  if (_adapter) return _adapter;
  _adapter = await createAdapter();
  return _adapter;
}

// ─── Auto-detect environment ──────────────────────────────────────────────────

async function createAdapter(): Promise<DBAdapter> {
  // Try Cloudflare D1 first
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext() as { env?: { DB?: unknown } } | undefined;
    if (ctx?.env?.DB) {
      return new D1Adapter(ctx.env.DB as import("@cloudflare/workers-types").D1Database);
    }
  } catch {
    // Not in Cloudflare — fall through to node:sqlite
  }

  // Node.js local dev
  const { DatabaseSync } = await import("node:sqlite");
  const fs = await import("node:fs");
  const path = await import("node:path");

  const DATA_DIR = path.join(process.cwd(), ".data");
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const DB_PATH = path.join(DATA_DIR, "rck.db");

  const sqliteDb = new DatabaseSync(DB_PATH, { enableForeignKeyConstraints: true });
  sqliteDb.exec("PRAGMA journal_mode = WAL");
  sqliteDb.exec(SCHEMA);

  return new NodeSQLiteAdapter(sqliteDb);
}

// ─── Node adapter ────────────────────────────────────────────────────────────

type NodeDb = import("node:sqlite").DatabaseSync;

class NodeSQLiteAdapter implements DBAdapter {
  constructor(private db: NodeDb) {}

  async all<T extends DBRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.db.prepare(sql).all(...(params as any[])) as T[];
  }

  async first<T extends DBRow>(sql: string, params: unknown[] = []): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.db.prepare(sql).get(...(params as any[])) as T) ?? null;
  }

  async run(sql: string, params: unknown[] = []): Promise<{ lastInsertRowid: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const info = this.db.prepare(sql).run(...(params as any[]));
    return { lastInsertRowid: Number(info.lastInsertRowid) };
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }
}

// ─── D1 adapter ───────────────────────────────────────────────────────────────

type D1Db = import("@cloudflare/workers-types").D1Database;

class D1Adapter implements DBAdapter {
  constructor(private db: D1Db) {}

  async all<T extends DBRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    const bound = params.length ? stmt.bind(...(params as Parameters<typeof stmt.bind>)) : stmt;
    const { results } = await bound.all<T>();
    return results;
  }

  async first<T extends DBRow>(sql: string, params: unknown[] = []): Promise<T | null> {
    const stmt = this.db.prepare(sql);
    const bound = params.length ? stmt.bind(...(params as Parameters<typeof stmt.bind>)) : stmt;
    return (await bound.first<T>()) ?? null;
  }

  async run(sql: string, params: unknown[] = []): Promise<{ lastInsertRowid: number }> {
    const stmt = this.db.prepare(sql);
    const bound = params.length ? stmt.bind(...(params as Parameters<typeof stmt.bind>)) : stmt;
    const result = await bound.run();
    return { lastInsertRowid: (result.meta as { last_row_id?: number })?.last_row_id ?? 0 };
  }

  async exec(sql: string): Promise<void> {
    await this.db.exec(sql);
  }
}

// ─── Schema ──────────────────────────────────────────────────────────────────

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    published_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    end_date TEXT,
    location TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_id INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id, sort_order);
`;

// ─── Entity types ─────────────────────────────────────────────────────────────

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

export type Event = {
  id: number;
  title: string;
  date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  created_at: string;
};

export type Album = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  date: string | null;
  created_at: string;
};

export type Photo = {
  id: number;
  album_id: number;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};
