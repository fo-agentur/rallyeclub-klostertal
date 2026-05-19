"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { isAuthenticated } from "@/lib/auth";
import { isS3Configured, putObject } from "@/lib/s3";
import { isDatabaseConfigured, query } from "@/lib/pg";

type SeedPost = {
  slug: string;
  title: string;
  date: string;
  cover: string | null;
  excerpt: string | null;
  content: string;
};

type SeedAlbum = {
  slug: string;
  title: string;
  description: string | null;
  date: string | null;
  cover_image: string;
  photos: string[];
};

type SeedEvent = {
  title: string;
  date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
};

export type ImportLegacyState =
  | { status: "idle" }
  | { status: "success"; uploaded: number; posts: number; albums: number; photos: number; events: number; skipped: number }
  | { status: "error"; error: string };

const STATIC_EVENTS: SeedEvent[] = [
  { title: "Autoslalom St. Gallenkirch", date: "2026-05-10", end_date: null, location: "Parkplatz Valiserabahn, St. Gallenkirch", description: "Der traditionelle Autoslalom des Rallyeclub Klostertal. Klassen für Serie, Spezial und Junioren." },
  { title: "Jahreshauptversammlung 2026", date: "2026-03-21", end_date: null, location: "Vereinslokal, Frastanz", description: "Jahresrückblick, Kassabericht, Ehrungen und Ausblick auf die Saison 2026." },
  { title: "Kartfahren Clubausflug", date: "2026-06-13", end_date: null, location: "Kartbahn Nenzing", description: "Gemeinsamer Clubabend auf der Kartbahn." },
  { title: "Dreikönigsfest", date: "2026-01-06", end_date: null, location: "Vereinslokal", description: "Geselliges Beisammensein zum Saisonauftakt." },
  { title: "Autoslalom St. Gallenkirch 2017 (Archiv)", date: "2017-05-07", end_date: null, location: "Parkplatz Valiserabahn, St. Gallenkirch", description: "Archivierter Termin aus dem Jahr 2017." },
];

function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

function s3KeyFor(localPath: string): string {
  // localPath examples:
  //   /uploads/galerie/<album>/<file>  ->  legacy/galerie/<album>/<file>
  //   /images/<file>                   ->  legacy/posts/<file>
  //   /images/headers/<file>           ->  legacy/posts/headers/<file>
  if (localPath.startsWith("/uploads/")) {
    return `legacy/${localPath.replace(/^\/uploads\//, "")}`;
  }
  if (localPath.startsWith("/images/")) {
    return `legacy/posts/${localPath.replace(/^\/images\//, "")}`;
  }
  return `legacy${localPath.startsWith("/") ? "" : "/"}${localPath}`;
}

async function uploadLocal(
  localPath: string,
  cache: Map<string, string>,
  log: string[],
): Promise<string | null> {
  if (cache.has(localPath)) return cache.get(localPath)!;
  // Strip query/fragment defensively, decode URI-encoded path segments.
  const cleanPath = decodeURIComponent(localPath.split("?")[0].split("#")[0]);
  const absPath = path.join(process.cwd(), "public", cleanPath.replace(/^\/+/, ""));
  try {
    await fs.access(absPath);
  } catch {
    log.push(`SKIP missing file: ${cleanPath}`);
    return null;
  }
  const buf = await fs.readFile(absPath);
  const key = s3KeyFor(cleanPath);
  const publicUrl = await putObject(key, buf, contentTypeFor(absPath));
  cache.set(localPath, publicUrl);
  log.push(`UP ${cleanPath} -> ${key}`);
  return publicUrl;
}

export async function importLegacyAction(): Promise<ImportLegacyState> {
  if (!(await isAuthenticated())) return { status: "error", error: "Nicht angemeldet." };
  if (!isDatabaseConfigured()) return { status: "error", error: "DATABASE_URL fehlt." };
  if (!isS3Configured()) return { status: "error", error: "S3_* ENV nicht vollständig." };

  const dataDir = path.join(process.cwd(), "scripts", "data");
  let postsJson: SeedPost[];
  let albumsJson: SeedAlbum[];
  try {
    postsJson = JSON.parse(await fs.readFile(path.join(dataDir, "posts.json"), "utf8"));
    albumsJson = JSON.parse(await fs.readFile(path.join(dataDir, "albums.json"), "utf8"));
  } catch (e) {
    return {
      status: "error",
      error: `Daten-JSON nicht gefunden in ${dataDir} (${(e as Error).message}). Container neu bauen (.dockerignore prüfen).`,
    };
  }

  const log: string[] = [];
  const urlCache = new Map<string, string>();
  let skipped = 0;

  try {
    for (const p of postsJson) {
      if (!p.cover) continue;
      const url = await uploadLocal(p.cover, urlCache, log);
      if (!url) skipped++;
    }
    for (const a of albumsJson) {
      const cu = await uploadLocal(a.cover_image, urlCache, log);
      if (!cu) skipped++;
      for (const photo of a.photos) {
        const u = await uploadLocal(photo, urlCache, log);
        if (!u) skipped++;
      }
    }
  } catch (e) {
    return {
      status: "error",
      error: `Upload nach S3 fehlgeschlagen: ${(e as Error).message}. Hinweis: ${log.slice(-5).join(" | ")}`,
    };
  }

  try {
    await query("BEGIN");
    await query("TRUNCATE photos, albums, posts, events RESTART IDENTITY CASCADE");

    let postCount = 0;
    for (const p of postsJson) {
      const cover = p.cover ? (urlCache.get(p.cover) ?? null) : null;
      await query(
        `INSERT INTO posts (slug, title, excerpt, content, cover_image, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.slug, p.title, p.excerpt ?? null, p.content, cover, p.date],
      );
      postCount++;
    }

    let albumCount = 0;
    let photoCount = 0;
    for (const a of albumsJson) {
      const coverUrl = urlCache.get(a.cover_image) ?? null;
      const { rows } = await query<{ id: number }>(
        `INSERT INTO albums (slug, title, description, cover_image, date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [a.slug, a.title, a.description, coverUrl, a.date],
      );
      const albumId = Number(rows[0].id);
      albumCount++;
      for (let i = 0; i < a.photos.length; i++) {
        const photoUrl = urlCache.get(a.photos[i]);
        if (!photoUrl) continue;
        await query(
          `INSERT INTO photos (album_id, url, caption, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [albumId, photoUrl, null, i],
        );
        photoCount++;
      }
    }

    let eventCount = 0;
    for (const e of STATIC_EVENTS) {
      await query(
        `INSERT INTO events (title, date, end_date, location, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [e.title, e.date, e.end_date, e.location, e.description],
      );
      eventCount++;
    }

    await query("COMMIT");

    return {
      status: "success",
      uploaded: urlCache.size,
      posts: postCount,
      albums: albumCount,
      photos: photoCount,
      events: eventCount,
      skipped,
    };
  } catch (e) {
    try {
      await query("ROLLBACK");
    } catch {
      // ignore
    }
    return { status: "error", error: `DB-Schreibvorgang fehlgeschlagen: ${(e as Error).message}` };
  }
}
