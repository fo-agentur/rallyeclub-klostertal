/**
 * Befüllt die SQLite-DB mit:
 *   - Beiträgen aus scripts/data/posts.json (Scrape-Output)
 *   - Alben + Fotos aus scripts/data/albums.json
 *   - Veranstaltungen (kommend + vergangen)
 *
 * Ausführen: `npm run seed`
 *
 * Kann wiederholt laufen: `DELETE FROM <table>` → `INSERT`. Uploads und
 * gescrapte Bilder unter public/ werden nicht angetastet.
 */
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../src/lib/db";

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

// Manuelle Overrides für vom Spam kompromittierte Legacy-Posts.
// Die alte Joomla-Seite wurde mit Casino-SEO-Text unterwandert — diese Posts
// werden mit sauberem, aus dem Titel rekonstruiertem Text ersetzt.
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

function upsertPosts(posts: SeedPost[]) {
  const db = getDb();
  db.exec("DELETE FROM posts");
  const stmt = db.prepare(
    `INSERT INTO posts (slug, title, excerpt, content, cover_image, published_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  let count = 0;
  for (const raw of posts) {
    const p = { ...raw, ...CONTENT_OVERRIDES[raw.slug] };
    stmt.run(
      p.slug ?? raw.slug,
      p.title ?? raw.title,
      p.excerpt ?? raw.excerpt ?? null,
      p.content ?? raw.content,
      p.cover ?? raw.cover ?? null,
      p.date ?? raw.date
    );
    count++;
  }
  return count;
}

function upsertAlbums(albums: SeedAlbum[]) {
  const db = getDb();
  db.exec("DELETE FROM photos");
  db.exec("DELETE FROM albums");
  const albStmt = db.prepare(
    `INSERT INTO albums (slug, title, description, cover_image, date)
     VALUES (?, ?, ?, ?, ?)`
  );
  const photoStmt = db.prepare(
    `INSERT INTO photos (album_id, url, caption, sort_order)
     VALUES (?, ?, ?, ?)`
  );
  let photoCount = 0;
  for (const a of albums) {
    const info = albStmt.run(a.slug, a.title, a.description, a.cover_image, a.date);
    const id = Number(info.lastInsertRowid);
    a.photos.forEach((url, i) => {
      photoStmt.run(id, url, null, i);
      photoCount++;
    });
  }
  return { albums: albums.length, photos: photoCount };
}

function upsertEvents() {
  const db = getDb();
  db.exec("DELETE FROM events");
  const stmt = db.prepare(
    `INSERT INTO events (title, date, end_date, location, description)
     VALUES (?, ?, ?, ?, ?)`
  );
  const items: Array<{
    title: string;
    date: string;
    end_date: string | null;
    location: string | null;
    description: string | null;
  }> = [
    {
      title: "Autoslalom St. Gallenkirch",
      date: "2026-05-10",
      end_date: null,
      location: "Parkplatz Valiserabahn, St. Gallenkirch",
      description:
        "Der traditionelle Autoslalom des Rallyeclub Klostertal. Klassen für Serie, Spezial und Junioren. Nennung vor Ort.",
    },
    {
      title: "Jahreshauptversammlung 2026",
      date: "2026-03-21",
      end_date: null,
      location: "Vereinslokal, Frastanz",
      description:
        "Jahresrückblick, Kassabericht, Ehrungen und Ausblick auf die Saison 2026. Alle Mitglieder sind herzlich eingeladen.",
    },
    {
      title: "Kartfahren Clubausflug",
      date: "2026-06-13",
      end_date: null,
      location: "Kartbahn Nenzing",
      description: "Gemeinsamer Clubabend auf der Kartbahn. Spaß, Zeitenjagd und Grillen im Anschluss.",
    },
    {
      title: "Dreikönigsfest",
      date: "2026-01-06",
      end_date: null,
      location: "Vereinslokal",
      description: "Geselliges Beisammensein mit Mitgliedern und Freunden zum Saisonauftakt.",
    },
    {
      title: "Autoslalom St. Gallenkirch 2017 (Archiv)",
      date: "2017-05-07",
      end_date: null,
      location: "Parkplatz Valiserabahn, St. Gallenkirch",
      description: "Archivierter Termin aus dem Jahr 2017.",
    },
  ];
  for (const e of items) {
    stmt.run(e.title, e.date, e.end_date, e.location, e.description);
  }
  return items.length;
}

function main() {
  const postsPath = path.join(DATA_DIR, "posts.json");
  const albumsPath = path.join(DATA_DIR, "albums.json");

  if (!fs.existsSync(postsPath) || !fs.existsSync(albumsPath)) {
    console.error(
      "Scrape-Output fehlt. Bitte zuerst `npm run scrape` ausführen — erzeugt scripts/data/posts.json + albums.json."
    );
    process.exit(1);
  }

  const posts: SeedPost[] = JSON.parse(fs.readFileSync(postsPath, "utf8"));
  const albums: SeedAlbum[] = JSON.parse(fs.readFileSync(albumsPath, "utf8"));

  console.log("⇢ Seeding DB …");
  const postCount = upsertPosts(posts);
  const { albums: albCount, photos: photoCount } = upsertAlbums(albums);
  const eventCount = upsertEvents();

  console.log(`  ✓ ${postCount} Beiträge`);
  console.log(`  ✓ ${albCount} Alben, ${photoCount} Fotos`);
  console.log(`  ✓ ${eventCount} Veranstaltungen`);
  console.log("\n✓ Fertig. DB liegt in .data/rck.db");
}

main();
