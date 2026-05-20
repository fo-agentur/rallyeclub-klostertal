"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
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

type SeedPerson = {
  name: string;
  role?: string | null;
  group_label: string;
  car?: string | null;
  photo?: string | null;
  driver_photo?: string | null;
  is_driver?: boolean;
  sort_order?: number;
};

type SeedSponsor = {
  name: string;
  tagline?: string | null;
  website?: string | null;
  logo?: string | null;
  sort_order?: number;
};

type SeedPage = {
  slug: string;
  title: string;
  body: string;
};

export type ImportLegacyState =
  | { status: "idle" }
  | {
      status: "success";
      uploaded: number;
      posts: number;
      albums: number;
      photos: number;
      events: number;
      people: number;
      sponsors: number;
      pages: number;
      skipped: number;
    }
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
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}

function s3KeyFor(localPath: string): string {
  // localPath examples:
  //   /uploads/galerie/<album>/<file>  ->  legacy/galerie/<album>/<file>
  //   /images/<file>                   ->  legacy/posts/<file>
  //   /pdf/<file>                      ->  legacy/pdf/<file>
  if (localPath.startsWith("/uploads/")) {
    return `legacy/${localPath.replace(/^\/uploads\//, "")}`;
  }
  if (localPath.startsWith("/images/")) {
    return `legacy/posts/${localPath.replace(/^\/images\//, "")}`;
  }
  if (localPath.startsWith("/pdf/")) {
    return `legacy/pdf/${localPath.replace(/^\/pdf\//, "")}`;
  }
  if (localPath.startsWith("/mitglieder/")) {
    return `legacy/mitglieder/${localPath.replace(/^\/mitglieder\//, "")}`;
  }
  if (localPath.startsWith("/fahrer/")) {
    return `legacy/fahrer/${localPath.replace(/^\/fahrer\//, "")}`;
  }
  if (localPath.startsWith("/sponsors/")) {
    return `legacy/sponsors/${localPath.replace(/^\/sponsors\//, "")}`;
  }
  return `legacy${localPath.startsWith("/") ? "" : "/"}${localPath}`;
}

/**
 * Probe several filename variants — old Joomla often stored files literally with
 * URL-escapes in the name (e.g. `Vorank%C3%BCndigung.jpg`) while Markdown links
 * may already use the decoded form (`Vorankündigung.jpg`).
 */
async function readPublicFile(relPath: string): Promise<{ buf: Buffer; abs: string } | null> {
  const stripped = relPath.replace(/^\/+/, "");
  const candidates = new Set<string>([stripped]);
  try {
    candidates.add(decodeURIComponent(stripped));
  } catch {
    /* malformed escape */
  }
  candidates.add(encodeURI(stripped));
  for (const rel of candidates) {
    const abs = path.join(process.cwd(), "public", rel);
    try {
      const buf = await fs.readFile(abs);
      return { buf, abs };
    } catch {
      // try next
    }
  }
  return null;
}

async function uploadLocal(
  localPath: string,
  cache: Map<string, string>,
  log: string[],
): Promise<string | null> {
  if (cache.has(localPath)) return cache.get(localPath)!;
  const cleanPath = localPath.split("?")[0].split("#")[0];
  const found = await readPublicFile(cleanPath);
  if (!found) {
    log.push(`SKIP missing file: ${cleanPath}`);
    return null;
  }
  const key = s3KeyFor(cleanPath);
  const publicUrl = await putObject(key, found.buf, contentTypeFor(found.abs));
  cache.set(localPath, publicUrl);
  log.push(`UP ${cleanPath} -> ${key}`);
  return publicUrl;
}

const LEGACY_PATH_RE = /\/(?:images|pdf|uploads)\/[^\s)"'<>]+/g;

/** Collect every legacy asset path (`/images/...`, `/pdf/...`, `/uploads/...`) referenced in a text. */
function extractLegacyPaths(text: string | null | undefined): string[] {
  if (!text) return [];
  return Array.from(text.matchAll(LEGACY_PATH_RE)).map((m) => m[0]);
}

/** Replace every occurrence of `oldPath` with `newUrl` in the given text. */
function replaceAllPaths(text: string, oldPath: string, newUrl: string): string {
  return text.split(oldPath).join(newUrl);
}

/**
 * Reduce Markdown to a plain-text excerpt:
 *   - drop image syntax `![alt](src)` entirely
 *   - flatten link syntax `[label](url)` to just `label`
 *   - strip leftover `*` `_` `#` markers and collapse whitespace
 * If nothing readable remains (e.g. the excerpt was just an image), returns null.
 */
function stripMarkdownToText(input: string | null | undefined): string | null {
  if (!input) return null;
  let t = input;
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // images out
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // links to label
  t = t.replace(/[`*_>#~]+/g, ""); // common markup markers
  t = t.replace(/\s+/g, " ").trim();
  return t.length > 0 ? t : null;
}

/** Pull the first markdown image url out of a text, or null. */
function firstMarkdownImageUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return m ? m[1] : null;
}

export async function importLegacyAction(): Promise<ImportLegacyState> {
  if (!(await isAuthenticated())) return { status: "error", error: "Nicht angemeldet." };
  if (!isDatabaseConfigured()) return { status: "error", error: "DATABASE_URL fehlt." };
  if (!isS3Configured()) return { status: "error", error: "S3_* ENV nicht vollständig." };

  const dataDir = path.join(process.cwd(), "scripts", "data");
  let postsJson: SeedPost[];
  let albumsJson: SeedAlbum[];
  let peopleJson: SeedPerson[];
  let sponsorsJson: SeedSponsor[];
  let pagesJson: SeedPage[];
  try {
    postsJson = JSON.parse(await fs.readFile(path.join(dataDir, "posts.json"), "utf8"));
    albumsJson = JSON.parse(await fs.readFile(path.join(dataDir, "albums.json"), "utf8"));
    peopleJson = JSON.parse(await fs.readFile(path.join(dataDir, "people.json"), "utf8"));
    sponsorsJson = JSON.parse(await fs.readFile(path.join(dataDir, "sponsors.json"), "utf8"));
    pagesJson = JSON.parse(await fs.readFile(path.join(dataDir, "pages.json"), "utf8"));
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
    // Step 1: collect every legacy asset referenced anywhere — covers, excerpts,
    // inline markdown in content (`/images/...`, `/pdf/...`, `/uploads/...`).
    const allPaths = new Set<string>();
    for (const p of postsJson) {
      if (p.cover) allPaths.add(p.cover);
      for (const ref of extractLegacyPaths(p.excerpt)) allPaths.add(ref);
      for (const ref of extractLegacyPaths(p.content)) allPaths.add(ref);
    }
    for (const a of albumsJson) {
      allPaths.add(a.cover_image);
      for (const photo of a.photos) allPaths.add(photo);
    }
    for (const person of peopleJson) {
      if (person.photo) allPaths.add(person.photo);
      if (person.driver_photo) allPaths.add(person.driver_photo);
    }
    for (const sponsor of sponsorsJson) {
      if (sponsor.logo) allPaths.add(sponsor.logo);
    }

    for (const ref of allPaths) {
      const url = await uploadLocal(ref, urlCache, log);
      if (!url) skipped++;
    }
  } catch (e) {
    return {
      status: "error",
      error: `Upload nach S3 fehlgeschlagen: ${(e as Error).message}. Hinweis: ${log.slice(-5).join(" | ")}`,
    };
  }

  try {
    await query("BEGIN");
    await query("TRUNCATE photos, albums, posts, events, people, sponsors, pages RESTART IDENTITY CASCADE");

    let postCount = 0;
    for (const p of postsJson) {
      // Rewrite every legacy path inside the markdown body to its MinIO URL.
      let content = p.content;
      for (const ref of extractLegacyPaths(content)) {
        const u = urlCache.get(ref);
        if (u) content = replaceAllPaths(content, ref, u);
      }

      // Excerpts come straight out of Joomla and sometimes are *just* a markdown
      // image — that renders as raw `![](...)` on the listing cards. Strip to
      // plain prose; if nothing's left fall back to null so the UI hides it.
      const excerpt = stripMarkdownToText(p.excerpt);

      // Cover priority: explicit cover -> first inline image in content -> null.
      let cover: string | null = null;
      if (p.cover) cover = urlCache.get(p.cover) ?? null;
      if (!cover) {
        const inlineFirst = firstMarkdownImageUrl(p.content);
        if (inlineFirst) cover = urlCache.get(inlineFirst) ?? null;
      }

      await query(
        `INSERT INTO posts (slug, title, excerpt, content, cover_image, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [p.slug, p.title, excerpt, content, cover, p.date],
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

    let peopleCount = 0;
    for (const person of peopleJson) {
      const photo = person.photo ? (urlCache.get(person.photo) ?? person.photo) : null;
      const driverPhoto = person.driver_photo
        ? (urlCache.get(person.driver_photo) ?? person.driver_photo)
        : null;
      await query(
        `INSERT INTO people (name, role, group_label, car, photo, driver_photo, is_driver, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          person.name,
          person.role ?? null,
          person.group_label,
          person.car ?? null,
          photo,
          driverPhoto,
          person.is_driver ?? false,
          person.sort_order ?? 0,
        ],
      );
      peopleCount++;
    }

    let sponsorCount = 0;
    for (const sponsor of sponsorsJson) {
      const logo = sponsor.logo ? (urlCache.get(sponsor.logo) ?? sponsor.logo) : null;
      await query(
        `INSERT INTO sponsors (name, tagline, website, logo, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          sponsor.name,
          sponsor.tagline ?? null,
          sponsor.website ?? null,
          logo,
          sponsor.sort_order ?? 0,
        ],
      );
      sponsorCount++;
    }

    let pageCount = 0;
    for (const page of pagesJson) {
      await query(
        `INSERT INTO pages (slug, title, body, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (slug) DO UPDATE
           SET title = EXCLUDED.title,
               body = EXCLUDED.body,
               updated_at = now()`,
        [page.slug, page.title, page.body],
      );
      pageCount++;
    }

    await query("COMMIT");

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath("/galerie");
    revalidatePath("/veranstaltungen");
    revalidatePath("/mitglieder");
    revalidatePath("/fahrer");
    revalidatePath("/reglement");
    revalidatePath("/admin/dashboard");

    return {
      status: "success",
      uploaded: urlCache.size,
      posts: postCount,
      albums: albumCount,
      photos: photoCount,
      events: eventCount,
      people: peopleCount,
      sponsors: sponsorCount,
      pages: pageCount,
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
