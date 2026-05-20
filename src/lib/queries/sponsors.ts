import { isDatabaseConfigured, query } from "../pg";
import type { Sponsor } from "../db";

type SponsorRow = {
  id: number;
  name: string;
  tagline: string | null;
  website: string | null;
  logo: string | null;
  sort_order: number;
  created_at: string | Date;
};

function mapSponsor(row: SponsorRow): Sponsor {
  return {
    id: Number(row.id),
    name: row.name,
    tagline: row.tagline,
    website: row.website,
    logo: row.logo,
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

function isMissingTable(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && String((e as { code: string }).code) === "42P01";
}

export type SponsorInput = {
  name: string;
  tagline?: string | null;
  website?: string | null;
  logo?: string | null;
  sort_order?: number;
};

export async function listSponsors(): Promise<Sponsor[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const { rows } = await query<SponsorRow>(
      "SELECT * FROM sponsors ORDER BY sort_order ASC, name ASC",
    );
    return rows.map(mapSponsor);
  } catch (e) {
    if (isMissingTable(e)) return [];
    throw e;
  }
}

export async function getSponsorById(id: number): Promise<Sponsor | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const { rows } = await query<SponsorRow>("SELECT * FROM sponsors WHERE id = $1 LIMIT 1", [id]);
    return rows[0] ? mapSponsor(rows[0]) : null;
  } catch (e) {
    if (isMissingTable(e)) return null;
    throw e;
  }
}

export async function createSponsor(input: SponsorInput): Promise<number> {
  const { rows } = await query<{ id: number }>(
    `INSERT INTO sponsors (name, tagline, website, logo, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      input.name,
      input.tagline ?? null,
      input.website ?? null,
      input.logo ?? null,
      input.sort_order ?? 0,
    ],
  );
  return Number(rows[0].id);
}

export async function updateSponsor(id: number, input: SponsorInput): Promise<void> {
  await query(
    `UPDATE sponsors
       SET name = $1,
           tagline = $2,
           website = $3,
           logo = $4,
           sort_order = $5
     WHERE id = $6`,
    [
      input.name,
      input.tagline ?? null,
      input.website ?? null,
      input.logo ?? null,
      input.sort_order ?? 0,
      id,
    ],
  );
}

export async function deleteSponsor(id: number): Promise<void> {
  await query("DELETE FROM sponsors WHERE id = $1", [id]);
}
