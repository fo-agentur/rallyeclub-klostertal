import { getDb, type Album, type Photo } from "../db";
import { slugify } from "../utils";

export type AlbumWithCount = Album & { photo_count: number };

export async function listAlbums(): Promise<AlbumWithCount[]> {
  const db = await getDb();
  return db.all<AlbumWithCount>(
    `SELECT a.*, COUNT(p.id) as photo_count
     FROM albums a
     LEFT JOIN photos p ON p.album_id = a.id
     GROUP BY a.id
     ORDER BY a.date DESC, a.created_at DESC`,
  );
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const db = await getDb();
  return db.first<Album>("SELECT * FROM albums WHERE slug = ?", [slug]);
}

export async function getAlbumById(id: number): Promise<Album | null> {
  const db = await getDb();
  return db.first<Album>("SELECT * FROM albums WHERE id = ?", [id]);
}

export async function getAlbumPhotos(albumId: number): Promise<Photo[]> {
  const db = await getDb();
  return db.all<Photo>(
    "SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC",
    [albumId],
  );
}

export type AlbumInput = {
  title: string;
  description?: string | null;
  cover_image?: string | null;
  date?: string | null;
  slug?: string;
};

export async function createAlbum(input: AlbumInput): Promise<number> {
  const db = await getDb();
  const slug = input.slug || (await ensureUniqueSlug(db, slugify(input.title)));
  const { lastInsertRowid } = await db.run(
    `INSERT INTO albums (slug, title, description, cover_image, date)
     VALUES (?, ?, ?, ?, ?)`,
    [slug, input.title, input.description ?? null, input.cover_image ?? null, input.date ?? null],
  );
  return lastInsertRowid;
}

export async function updateAlbum(id: number, input: AlbumInput): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE albums SET title = ?, description = ?, cover_image = ?, date = ? WHERE id = ?`,
    [input.title, input.description ?? null, input.cover_image ?? null, input.date ?? null, id],
  );
}

export async function deleteAlbum(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM albums WHERE id = ?", [id]);
}

export async function addPhoto(albumId: number, url: string, caption?: string): Promise<number> {
  const db = await getDb();
  const maxRow = await db.first<{ m: number | null }>(
    "SELECT MAX(sort_order) as m FROM photos WHERE album_id = ?",
    [albumId],
  );
  const sortOrder = (maxRow?.m ?? 0) + 1;
  const { lastInsertRowid } = await db.run(
    `INSERT INTO photos (album_id, url, caption, sort_order) VALUES (?, ?, ?, ?)`,
    [albumId, url, caption ?? null, sortOrder],
  );
  // Set as cover if album has none
  const album = await getAlbumById(albumId);
  if (album && !album.cover_image) {
    await db.run("UPDATE albums SET cover_image = ? WHERE id = ?", [url, albumId]);
  }
  return lastInsertRowid;
}

export async function deletePhoto(photoId: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM photos WHERE id = ?", [photoId]);
}

type Db = Awaited<ReturnType<typeof getDb>>;

async function ensureUniqueSlug(db: Db, base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await db.first("SELECT 1 FROM albums WHERE slug = ?", [slug])) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
