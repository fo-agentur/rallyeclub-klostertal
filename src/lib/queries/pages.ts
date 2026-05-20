import { isDatabaseConfigured, query } from "../pg";
import type { PageContent } from "../db";

type PageRow = {
  slug: string;
  title: string;
  body: string;
  updated_at: string | Date;
};

function mapPage(row: PageRow): PageContent {
  return {
    slug: row.slug,
    title: row.title,
    body: row.body,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function isMissingTable(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && String((e as { code: string }).code) === "42P01";
}

export type PageInput = {
  slug: string;
  title: string;
  body: string;
};

export async function listPages(): Promise<PageContent[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const { rows } = await query<PageRow>("SELECT * FROM pages ORDER BY slug ASC");
    return rows.map(mapPage);
  } catch (e) {
    if (isMissingTable(e)) return [];
    throw e;
  }
}

export async function getPageBySlug(slug: string): Promise<PageContent | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const { rows } = await query<PageRow>("SELECT * FROM pages WHERE slug = $1 LIMIT 1", [slug]);
    return rows[0] ? mapPage(rows[0]) : null;
  } catch (e) {
    if (isMissingTable(e)) return null;
    throw e;
  }
}

export async function upsertPage(input: PageInput): Promise<void> {
  await query(
    `INSERT INTO pages (slug, title, body, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title,
           body = EXCLUDED.body,
           updated_at = now()`,
    [input.slug, input.title, input.body],
  );
}
