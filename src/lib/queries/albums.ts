import { getDb, type Album, type Photo } from "../db";
import { slugify } from "../utils";

export type AlbumWithCount = Album & { photo_count: number };

export function listAlbums(): AlbumWithCount[] {
  return getDb()
    .prepare(
      `SELECT a.*, COUNT(p.id) as photo_count
       FROM albums a
       LEFT JOIN photos p ON p.album_id = a.id
       GROUP BY a.id
       ORDER BY a.date DESC, a.created_at DESC`
    )
    .all() as AlbumWithCount[];
}

export function getAlbumBySlug(slug: string): Album | null {
  return (getDb().prepare("SELECT * FROM albums WHERE slug = ?").get(slug) as Album) ?? null;
}

export function getAlbumById(id: number): Album | null {
  return (getDb().prepare("SELECT * FROM albums WHERE id = ?").get(id) as Album) ?? null;
}

export function getAlbumPhotos(albumId: number): Photo[] {
  return getDb()
    .prepare("SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC")
    .all(albumId) as Photo[];
}

export type AlbumInput = {
  title: string;
  description?: string | null;
  cover_image?: string | null;
  date?: string | null;
  slug?: string;
};

export function createAlbum(input: AlbumInput): number {
  const db = getDb();
  const slug = input.slug || ensureUniqueSlug(slugify(input.title));
  const info = db
    .prepare(
      `INSERT INTO albums (slug, title, description, cover_image, date)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      slug,
      input.title,
      input.description ?? null,
      input.cover_image ?? null,
      input.date ?? null
    );
  return Number(info.lastInsertRowid);
}

export function updateAlbum(id: number, input: AlbumInput): void {
  const db = getDb();
  db.prepare(
    `UPDATE albums
     SET title = ?, description = ?, cover_image = ?, date = ?
     WHERE id = ?`
  ).run(
    input.title,
    input.description ?? null,
    input.cover_image ?? null,
    input.date ?? null,
    id
  );
}

export function deleteAlbum(id: number): void {
  getDb().prepare("DELETE FROM albums WHERE id = ?").run(id);
}

export function addPhoto(albumId: number, url: string, caption?: string): number {
  const db = getDb();
  const max = db
    .prepare("SELECT MAX(sort_order) as m FROM photos WHERE album_id = ?")
    .get(albumId) as { m: number | null };
  const sortOrder = (max?.m ?? 0) + 1;
  const info = db
    .prepare(
      `INSERT INTO photos (album_id, url, caption, sort_order)
       VALUES (?, ?, ?, ?)`
    )
    .run(albumId, url, caption ?? null, sortOrder);

  // If the album has no cover, set this photo as cover
  const album = getAlbumById(albumId);
  if (album && !album.cover_image) {
    db.prepare("UPDATE albums SET cover_image = ? WHERE id = ?").run(url, albumId);
  }
  return Number(info.lastInsertRowid);
}

export function deletePhoto(photoId: number): void {
  getDb().prepare("DELETE FROM photos WHERE id = ?").run(photoId);
}

function ensureUniqueSlug(base: string): string {
  const db = getDb();
  let slug = base;
  let n = 2;
  while (db.prepare("SELECT 1 FROM albums WHERE slug = ?").get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
