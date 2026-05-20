/**
 * Befüllt die Postgres-Datenbank mit:
 *   - Beiträgen aus scripts/data/posts.json (Scrape-Output)
 *   - Alben + Fotos aus scripts/data/albums.json
 *   - Veranstaltungen (kommend + vergangen)
 *
 * Vorab:
 *   1) Migration einspielen — siehe db/migrations/001_init.sql
 *   2) DATABASE_URL in .env.local setzen
 *
 * Ausführen: `npm run seed`
 */
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "scripts", "data");

type SeedPost = {
  slug: string;
  title: string;
  date: string;
  cover: string | null;
  excerpt: string;
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

const CONTENT_OVERRIDES: Record<string, Partial<SeedPost>> = {
  "slalom-st-gallenkirch-vorankuendigung": {
    title: "Slalom St. Gallenkirch — Vorankündigung",
    excerpt:
      "Der Rallyeclub Klostertal kündigt den Autoslalom in St. Gallenkirch an. Details und Uhrzeit folgen rechtzeitig auf dieser Seite.",
    content: `## Autoslalom St. Gallenkirch

Der Rallyeclub Klostertal lädt alle Motorsportfreunde herzlich zum nächsten Autoslalom in St. Gallenkirch ein.

**Ort:** Parkplatz Valiserabahn, St. Gallenkirch
**Klassen:** Serie, Spezial, Junioren

Nähere Infos zu Nennung, Zeitplan und Ablauf folgen in Kürze. Auf Dein Kommen freut sich der Rallyeclub Klostertal.`,
  },
  kartfahren: {
    excerpt: "Gemeinsames Kartfahren des Rallyeclub Klostertal — alle Bilder und Runden-Highlights.",
    content: `## Kartfahren

Ein sportlicher Abend auf der Kartbahn mit den Mitgliedern des Rallyeclub Klostertal.

![Kartfahren](/images/Bericht-Kartfahren-Bild.png)`,
  },
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL nicht gesetzt — bitte in .env.local hinterlegen.");
    process.exit(1);
  }

  const postsPath = path.join(DATA_DIR, "posts.json");
  const albumsPath = path.join(DATA_DIR, "albums.json");
  if (!fs.existsSync(postsPath) || !fs.existsSync(albumsPath)) {
    console.error("Scrape-Output fehlt. Bitte zuerst `npm run scrape` ausführen.");
    process.exit(1);
  }

  const ssl = /sslmode=require/i.test(url) ? { rejectUnauthorized: false } : undefined;
  const pool = new Pool({ connectionString: url, ssl });
  const client = await pool.connect();

  try {
    const posts: SeedPost[] = JSON.parse(fs.readFileSync(postsPath, "utf8"));
    const albums: SeedAlbum[] = JSON.parse(fs.readFileSync(albumsPath, "utf8"));

    console.log("⇢ Seeding Postgres …");
    await client.query("BEGIN");

    await client.query("TRUNCATE photos, albums, posts, events RESTART IDENTITY CASCADE");

    let postCount = 0;
    for (const raw of posts) {
      const p = { ...raw, ...CONTENT_OVERRIDES[raw.slug] };
      await client.query(
        `INSERT INTO posts (slug, title, excerpt, content, cover_image, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p.slug ?? raw.slug,
          p.title ?? raw.title,
          p.excerpt ?? raw.excerpt ?? null,
          p.content ?? raw.content,
          p.cover ?? raw.cover ?? null,
          p.date ?? raw.date,
        ],
      );
      postCount++;
    }

    let photoCount = 0;
    for (const a of albums) {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO albums (slug, title, description, cover_image, date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [a.slug, a.title, a.description, a.cover_image, a.date],
      );
      const id = rows[0].id;
      for (let i = 0; i < a.photos.length; i++) {
        await client.query(
          `INSERT INTO photos (album_id, url, caption, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [id, a.photos[i], null, i],
        );
        photoCount++;
      }
    }

    const events = [
      { title: "Autoslalom St. Gallenkirch", date: "2026-05-10", end_date: null, location: "Parkplatz Valiserabahn, St. Gallenkirch", description: "Der traditionelle Autoslalom des Rallyeclub Klostertal. Klassen für Serie, Spezial und Junioren." },
      { title: "Jahreshauptversammlung 2026", date: "2026-03-21", end_date: null, location: "Vereinslokal, Frastanz", description: "Jahresrückblick, Kassabericht, Ehrungen und Ausblick auf die Saison 2026." },
      { title: "Kartfahren Clubausflug", date: "2026-06-13", end_date: null, location: "Kartbahn Nenzing", description: "Gemeinsamer Clubabend auf der Kartbahn." },
      { title: "Dreikönigsfest", date: "2026-01-06", end_date: null, location: "Vereinslokal", description: "Geselliges Beisammensein zum Saisonauftakt." },
      { title: "Autoslalom St. Gallenkirch 2017 (Archiv)", date: "2017-05-07", end_date: null, location: "Parkplatz Valiserabahn, St. Gallenkirch", description: "Archivierter Termin aus dem Jahr 2017." },
    ];
    for (const e of events) {
      await client.query(
        `INSERT INTO events (title, date, end_date, location, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [e.title, e.date, e.end_date, e.location, e.description],
      );
    }

    await client.query("COMMIT");
    console.log(`  ✓ ${postCount} Beiträge`);
    console.log(`  ✓ ${albums.length} Alben, ${photoCount} Fotos`);
    console.log(`  ✓ ${events.length} Veranstaltungen`);
    console.log("\n✓ Fertig.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
