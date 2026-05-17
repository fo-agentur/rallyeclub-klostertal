import { isDatabaseConfigured, query } from "../pg";
import type { Album, Photo } from "../db";
import { slugify } from "../utils";

type AlbumRow = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  date: string | null;
  created_at: string | Date;
};

type PhotoRow = {
  id: number;
  album_id: number;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string | Date;
};

function mapAlbum(row: AlbumRow): Album {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    description: row.description,
    cover_image: row.cover_image,
    date: row.date,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

function mapPhoto(row: PhotoRow): Photo {
  return {
    id: Number(row.id),
    album_id: Number(row.album_id),
    url: row.url,
    caption: row.caption,
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export type AlbumWithCount = Album & { photo_count: number };

export async function listAlbums(): Promise<AlbumWithCount[]> {
  if (!isDatabaseConfigured()) return [];
  const { rows } = await query<AlbumRow & { photo_count: string | number }>(
    `SELECT a.*,
            (SELECT COUNT(*)::int FROM photos p WHERE p.album_id = a.id) AS photo_count
       FROM albums a
       ORDER BY a.created_at DESC`,
  );
  return rows.map((row) => ({
    ...mapAlbum(row),
    photo_count: Number(row.photo_count ?? 0),
  }));
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  if (!isDatabaseConfigured()) return null;
  const { rows } = await query<AlbumRow>(
    "SELECT * FROM albums WHERE slug = $1 LIMIT 1",
    [slug],
  );
  return rows[0] ? mapAlbum(rows[0]) : null;
}

export async function getAlbumById(id: number): Promise<Album | null> {
  if (!isDatabaseConfigured()) return null;
  const { rows } = await query<AlbumRow>(
    "SELECT * FROM albums WHERE id = $1 LIMIT 1",
    [id],
  );
  return rows[0] ? mapAlbum(rows[0]) : null;
}

export async function getAlbumPhotos(albumId: number): Promise<Photo[]> {
  if (!isDatabaseConfigured()) return [];
  const { rows } = await query<PhotoRow>(
    `SELECT * FROM photos
       WHERE album_id = $1
       ORDER BY sort_order ASC, id ASC`,
    [albumId],
  );
  return rows.map(mapPhoto);
}

export type AlbumInput = {
  title: string;
  description?: string | null;
  cover_image?: string | null;
  date?: string | null;
  slug?: string;
};

export async function createAlbum(input: AlbumInput): Promise<number> {
  const slug = input.slug || (await ensureUniqueSlug(slugify(input.title)));
  const { rows } = await query<{ id: number }>(
    `INSERT INTO albums (slug, title, description, cover_image, date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      slug,
      input.title,
      input.description ?? null,
      input.cover_image ?? null,
      input.date ?? null,
    ],
  );
  return Number(rows[0].id);
}

export async function updateAlbum(id: number, input: AlbumInput): Promise<void> {
  if (input.slug !== undefined) {
    await query(
      `UPDATE albums
         SET title = $1, description = $2, cover_image = $3, date = $4, slug = $5
       WHERE id = $6`,
      [
        input.title,
        input.description ?? null,
        input.cover_image ?? null,
        input.date ?? null,
        input.slug,
        id,
      ],
    );
  } else {
    await query(
      `UPDATE albums
         SET title = $1, description = $2, cover_image = $3, date = $4
       WHERE id = $5`,
      [
        input.title,
        input.description ?? null,
        input.cover_image ?? null,
        input.date ?? null,
        id,
      ],
    );
  }
}

export async function deleteAlbum(id: number): Promise<void> {
  await query("DELETE FROM albums WHERE id = $1", [id]);
}

export async function addPhoto(albumId: number, url: string, caption?: string): Promise<number> {
  const { rows: maxRows } = await query<{ max: number | null }>(
    "SELECT MAX(sort_order) AS max FROM photos WHERE album_id = $1",
    [albumId],
  );
  const sortOrder = (Number(maxRows[0]?.max ?? 0) || 0) + 1;

  const { rows } = await query<{ id: number }>(
    `INSERT INTO photos (album_id, url, caption, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [albumId, url, caption ?? null, sortOrder],
  );
  const photoId = Number(rows[0].id);

  await query(
    `UPDATE albums SET cover_image = $1 WHERE id = $2 AND cover_image IS NULL`,
    [url, albumId],
  );

  return photoId;
}

export async function deletePhoto(photoId: number): Promise<void> {
  await query("DELETE FROM photos WHERE id = $1", [photoId]);
}

/** URL of a single photo row (for admin actions). */
export async function getPhotoUrlById(photoId: number): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const { rows } = await query<{ url: string }>(
    "SELECT url FROM photos WHERE id = $1 LIMIT 1",
    [photoId],
  );
  return rows[0]?.url ?? null;
}

/** First photo URL in album sort order (for cover fallback). */
export async function getFirstPhotoUrlForAlbum(albumId: number): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const { rows } = await query<{ url: string }>(
    `SELECT url FROM photos
       WHERE album_id = $1
       ORDER BY sort_order ASC, id ASC
       LIMIT 1`,
    [albumId],
  );
  return rows[0]?.url ?? null;
}

/** Set album cover image (or clear with null). */
export async function setAlbumCoverImage(albumId: number, url: string | null): Promise<void> {
  await query("UPDATE albums SET cover_image = $1 WHERE id = $2", [url, albumId]);
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (true) {
    const { rows } = await query<{ id: number }>(
      "SELECT id FROM albums WHERE slug = $1 LIMIT 1",
      [slug],
    );
    if (rows.length === 0) return slug;
    slug = `${base}-${n++}`;
  }
}
