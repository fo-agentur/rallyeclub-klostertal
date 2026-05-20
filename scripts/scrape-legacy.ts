/**
 * Lädt alle Inhalte (Bilder + Beitragstexte) von der alten Joomla-Seite
 * www.rallyeclub-klostertal.at und legt sie als strukturierte JSON + Bilder
 * im Repo ab. Die Seite hat ein nicht-vertrauenswürdiges TLS-Zertifikat und
 * verweist auf Casino-SEO-Spam — beides wird ignoriert.
 *
 * Ausgabe:
 *   public/hero/*.png
 *   public/mitglieder/*.jpg
 *   public/fahrer/*.jpg
 *   public/sponsors/*
 *   public/logo.png
 *   public/uploads/galerie/<album-slug>/*.jpg
 *   scripts/data/posts.json
 *   scripts/data/albums.json
 */
import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import { URL } from "node:url";

const BASE = "http://www.rallyeclub-klostertal.at";
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "scripts", "data");

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const agent = u.protocol === "https:" ? httpsAgent : httpAgent;
    const req = lib.get(
      url,
      {
        agent,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchBuffer(new URL(res.headers.location, url).toString()).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout")));
  });
}

async function fetchText(url: string): Promise<string> {
  const buf = await fetchBuffer(url);
  return buf.toString("utf8");
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function download(url: string, dest: string): Promise<boolean> {
  try {
    const buf = await fetchBuffer(url);
    await ensureDir(path.dirname(dest));
    await fs.writeFile(dest, buf);
    console.log(`  ✓ ${path.relative(ROOT, dest)} (${(buf.length / 1024).toFixed(0)} kB)`);
    return true;
  } catch (err) {
    console.warn(`  ✗ ${url} — ${(err as Error).message}`);
    return false;
  }
}

async function downloadMany(
  items: Array<{ url: string; dest: string }>,
  concurrency = 6
): Promise<void> {
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      const { url, dest } = items[idx];
      await download(url, dest);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
}

// ---- Statische Bild-Listen (aus dem HTML extrahiert) ----

const HERO_IMAGES = ["1.png", "2.png", "3.png", "4.png"];

const MEMBER_IMAGES: Array<{ file: string; name: string }> = [
  { file: "ObmannChristophSchuler.jpg", name: "Christoph Schuler" },
  { file: "christianbreus.jpg", name: "Christian Breuss" },
  { file: "armingassner.jpg", name: "Armin Gassner" },
  { file: "fritzkogler.jpg", name: "Fritz Kogler" },
  { file: "AdrianImthurn.jpg", name: "Adrian Imthurn" },
  { file: "GerdLampert.jpg", name: "Gerd Lampert" },
  { file: "martinazoegernitz.JPG", name: "Martina Zögernitz" },
  { file: "manuelschuler.jpg", name: "Manuel Schuler" },
  { file: "herbertschuler.jpg", name: "Herbert Schuler" },
  { file: "ObmannStellvertreterJoeDorner.jpg", name: "Joe Dorner" },
  { file: "DieterBettinazzi.jpg", name: "Dieter Bettinazzi" },
  { file: "GuenterMatt.jpg", name: "Günter Matt" },
  { file: "JohannaMauracher.jpg", name: "Johanna Matt" },
  { file: "ManfredFischer.jpg", name: "Manfred Fischer" },
  { file: "MarcoSchmid.jpg", name: "Marco Schmid" },
  { file: "MikeKorpics.jpg", name: "Mike Korpics" },
  { file: "NorbertMatt.JPG", name: "Norbert Matt" },
  { file: "SarahMatt.jpg", name: "Sarah Matt" },
  { file: "WolfgangOspelt.jpg", name: "Wolfgang Ospelt" },
  { file: "RainerNeusiedler.jpg", name: "Rainer Neusiedler" },
  { file: "MelanieSchnetzer.jpg", name: "Melanie Schnetzer" },
  { file: "TobiasSohler.JPG", name: "Tobias Sohler" },
  { file: "DanielZimmermann.jpg", name: "Daniel Zimmermann" },
  { file: "andreaschuler.JPG", name: "Andrea Schuler" },
];

const DRIVER_IMAGES = ["zimmermann.jpg", "taumberger.jpg", "ChristianBreuss.jpg", "SPORTRATGernotKogler.jpg"];

const SPONSOR_IMAGES = ["motorfreizeittrends.JPG", "kogler_autopflege.PNG"];

// ---- Galerie-Alben ----
// Das alte Gallery-WD-Plugin lädt Album-Inhalte per AJAX. Die Alben-Metadaten
// und Thumbnails haben wir aus dem statischen HTML der gallerie.html + Post-
// Seiten extrahiert. Für Alben mit nur einem Thumb wird dieses als Cover
// verwendet; der Admin kann im UI weitere Fotos nachladen.

type SeedAlbum = {
  slug: string;
  title: string;
  description: string | null;
  date: string | null;
  photos: Array<{ src: string; dest: string; caption?: string }>;
};

function enc(p: string): string {
  return encodeURI(p).replace(/#/g, "%23");
}

const ALBUMS: SeedAlbum[] = [
  {
    slug: "jahreshauptversammlung-2016",
    title: "Jahreshauptversammlung 2016",
    description: "Impressionen der Jahreshauptversammlung 2016 des Rallyeclub Klostertal.",
    date: "2016-03-18",
    photos: [
      "JHV2.JPG",
      "JHV3.JPG",
      "JHV4 (1).JPG",
    ].map((f) => ({
      src: `${BASE}/media/com_gallery_wd/uploads/${enc("thumb/" + f)}`,
      dest: `public/uploads/galerie/jahreshauptversammlung-2016/${f.replace(/\s+/g, "_")}`,
    })),
  },
  {
    slug: "autoslalom-roethis-ostermontag-2015",
    title: "Autoslalom Röthis — Ostermontag 2015",
    description: "Fotos vom Autoslalom am Ostermontag 2015 in Röthis.",
    date: "2015-04-06",
    photos: [
      "IMG-20150407-WA0008.jpg",
      "IMG-20150407-WA0018.jpg",
      "IMG-20150407-WA0034.jpg",
      "IMG-20150407-WA0035.jpg",
      "IMG-20150410-WA0000.jpg",
      "IMG-20150410-WA0001.jpg",
    ].map((f) => ({
      src: `${BASE}/media/com_gallery_wd/uploads/${enc("Autoslalom_roethis_ostermontag/thumb/" + f)}`,
      dest: `public/uploads/galerie/autoslalom-roethis-ostermontag-2015/${f}`,
    })),
  },
  {
    slug: "autoslalom-st-gallenkirch-2015",
    title: "Autoslalom St. Gallenkirch 2015",
    description: "Impressionen vom Autoslalom St. Gallenkirch am 5. Mai 2015.",
    date: "2015-05-05",
    photos: [
      "2015-05-05 15.09.00.jpg",
      "2015-05-05 15.09.13.jpg",
      "2015-05-05 15.09.27.jpg",
    ].map((f) => ({
      src: `${BASE}/media/com_gallery_wd/uploads/${enc("Autoslalom_st.Gallenkirch/thumb/" + f)}`,
      dest: `public/uploads/galerie/autoslalom-st-gallenkirch-2015/${f.replace(/\s+/g, "_")}`,
    })),
  },
  {
    slug: "bowlen-im-strike-bludenz-2016",
    title: "Bowlen im Strike Bludenz",
    description: "Gemütlicher Abend im Strike Bludenz im März 2016.",
    date: "2016-03-05",
    photos: Array.from({ length: 24 }, (_, i) => {
      const f = `Bowlen_${String(i + 1).padStart(2, "0")}.jpg`;
      return {
        src: `${BASE}/media/com_gallery_wd/uploads/${enc("Bowlen März 2016/thumb/" + f)}`,
        dest: `public/uploads/galerie/bowlen-im-strike-bludenz-2016/${f}`,
      };
    }),
  },
  {
    slug: "jahreshauptversammlung-2013",
    title: "Jahreshauptversammlung 2013",
    description: "Rückblick auf die Jahreshauptversammlung 2013.",
    date: "2013-03-22",
    photos: ["SAM_2195.JPG", "SAM_2196.JPG", "SAM_2197.JPG", "SAM_2198.JPG"].map((f) => ({
      src: `${BASE}/media/com_gallery_wd/uploads/${enc("JHV2013/thumb/" + f)}`,
      dest: `public/uploads/galerie/jahreshauptversammlung-2013/${f}`,
    })),
  },
  {
    slug: "dreikoenigsfest-2013",
    title: "Dreikönigsfest 2013",
    description: "Impressionen vom Dreikönigsfest 2013.",
    date: "2013-01-06",
    photos: ["SAM_0895.JPG", "SAM_0896.JPG", "SAM_0897.JPG"].map((f) => ({
      src: `${BASE}/media/com_gallery_wd/uploads/${enc("3koengisfest 2013/thumb/" + f)}`,
      dest: `public/uploads/galerie/dreikoenigsfest-2013/${f}`,
    })),
  },
  {
    slug: "gala-abend-2016",
    title: "Gala Abend 2016",
    description: "Der Gala-Abend des Rallyeclub Klostertal, November 2016.",
    date: "2016-11-27",
    photos: Array.from({ length: 14 }, (_, i) => {
      const n = String(i + 4).padStart(4, "0");
      const f = `IMG-20161127-WA${n}.jpg`;
      return {
        src: `${BASE}/media/com_gallery_wd/uploads/${enc("Gala Abend/thumb/" + f)}`,
        dest: `public/uploads/galerie/gala-abend-2016/${f}`,
      };
    }),
  },
];

// ---- Beiträge (Slugs auf alter Seite) ----

type LegacyPost = {
  legacySlug: string;
  slug: string;
  title: string;
  date: string;
  cover: string | null;
};

const LEGACY_POSTS: LegacyPost[] = [
  {
    legacySlug: "25-jahreshauptversammlung-2019",
    slug: "jahreshauptversammlung-2019",
    title: "Jahreshauptversammlung 2019",
    date: "2019-03-22",
    cover: null,
  },
  {
    legacySlug: "24-autoslaloom-st-gallenkirch-07-mai-2017",
    slug: "autoslalom-st-gallenkirch-mai-2017",
    title: "Autoslalom St. Gallenkirch · 07. Mai 2017",
    date: "2017-05-07",
    cover: "/images/Autoslalom.jpg",
  },
  {
    legacySlug: "20-autoslalom-st-gallenkirch-3",
    slug: "autoslalom-st-gallenkirch-2017-rueckblick",
    title: "Autoslalom St. Gallenkirch 2017",
    date: "2017-05-08",
    cover: "/images/Autoslalom.jpg",
  },
  {
    legacySlug: "23-slalom-st-gallenkirch",
    slug: "slalom-st-gallenkirch-vorankuendigung",
    title: "Slalom St. Gallenkirch — Vorankündigung",
    date: "2017-04-01",
    cover: "/images/Vorank%C3%BCndigung.jpg",
  },
  {
    legacySlug: "17-kartfahren",
    slug: "kartfahren",
    title: "Kartfahren",
    date: "2016-06-10",
    cover: "/images/Bericht-Kartfahren-Bild.png",
  },
  {
    legacySlug: "16-st-gallenkirch-2016-ergebnisse-gesamt",
    slug: "st-gallenkirch-2016-ergebnisse-gesamt",
    title: "St. Gallenkirch 2016 · Ergebnisse Gesamt",
    date: "2016-05-10",
    cover: null,
  },
  {
    legacySlug: "15-autoslalom-st-gallenkirch-2016",
    slug: "autoslalom-st-gallenkirch-2016",
    title: "Autoslalom St. Gallenkirch 2016",
    date: "2016-05-08",
    cover: null,
  },
  {
    legacySlug: "9-autoslalom-st-gallenkirch",
    slug: "autoslalom-st-gallenkirch-ersatztermin-latschau",
    title: "Autoslalom St. Gallenkirch — Ersatztermin Latschau",
    date: "2014-06-15",
    cover: null,
  },
  {
    legacySlug: "12-resultate-st-gallenkirch-2015",
    slug: "resultate-st-gallenkirch-2015",
    title: "Resultate St. Gallenkirch 2015",
    date: "2015-05-10",
    cover: null,
  },
];

// ---- Artikeltext aus HTML extrahieren ----

function decodeHtml(s: string): string {
  return s
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

type ExtractedArticle = {
  markdown: string;
  images: string[];
  pdfs: string[];
};

function extractArticle(html: string): ExtractedArticle | null {
  const start = html.indexOf('<article class="item-page">');
  if (start < 0) return null;
  const end = html.indexOf("</article>", start);
  if (end < 0) return null;
  let body = html.slice(start, end);

  // <hgroup>…</hgroup> raus (Breadcrumb/Titel)
  body = body.replace(/<hgroup>[\s\S]*?<\/hgroup>/i, "");

  // Bilder im Body sammeln
  const images: string[] = [];
  const imgRe = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let im: RegExpExecArray | null;
  while ((im = imgRe.exec(body)) !== null) {
    const src = im[1];
    if (!/facebook_logo|youtube1|ajax_loader/i.test(src)) {
      images.push(src.startsWith("http") ? src : `${BASE}${src.startsWith("/") ? "" : "/"}${src}`);
    }
  }

  // Google-Docs-Viewer iframes entpacken → echte PDF-URL
  const pdfs: string[] = [];
  const iframeRe = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let ifr: RegExpExecArray | null;
  while ((ifr = iframeRe.exec(body)) !== null) {
    const src = ifr[1];
    const m = src.match(/[?&]url=([^&]+)/);
    if (m) {
      let real = decodeURIComponent(m[1]);
      if (!/^https?:/i.test(real)) {
        if (/^www\./i.test(real)) real = `http://${real}`;
        else if (real.startsWith("/")) real = `${BASE}${real}`;
        else real = `${BASE}/${real}`;
      }
      if (/\.pdf($|\?)/i.test(real)) pdfs.push(real);
    }
  }

  // Block-Elemente → Markdown-Zeilen
  const lines: string[] = [];
  const blockRe = /<(p|h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(body)) !== null) {
    const tag = m[1].toLowerCase();
    let inner = m[2];
    inner = inner
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
      .replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**")
      .replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
      .replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*")
      .replace(/<[^>]+>/g, "");
    inner = decodeHtml(inner).replace(/[ \t]+\n/g, "\n").trim();
    if (!inner) continue;
    if (tag.startsWith("h")) {
      const level = Math.min(parseInt(tag[1], 10) + 1, 6);
      lines.push(`${"#".repeat(level)} ${inner}`);
    } else {
      lines.push(inner);
    }
  }

  return {
    markdown: lines.join("\n\n").trim(),
    images,
    pdfs,
  };
}

function extractExcerpt(markdown: string, maxLen = 180): string {
  const firstPara = markdown.split(/\n\n/)[0] ?? "";
  const plain = firstPara.replace(/[*#_`]/g, "").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen - 1) + "…" : plain;
}

// ---- Haupt-Flow ----

async function main() {
  console.log("⇣ Scraping legacy site…\n");
  await ensureDir(DATA_DIR);

  console.log("• Hero");
  await downloadMany(
    HERO_IMAGES.map((f) => ({ url: `${BASE}/images/headers/${f}`, dest: path.join(ROOT, "public/hero", f) }))
  );

  console.log("• Logo");
  await download(`${BASE}/images/schriftzug_transparent_kl.png`, path.join(ROOT, "public", "logo.png"));

  console.log("• Mitglieder");
  await downloadMany(
    MEMBER_IMAGES.map(({ file }) => ({
      url: `${BASE}/images/mitglieder/${file}`,
      dest: path.join(ROOT, "public/mitglieder", file),
    }))
  );

  console.log("• Fahrer");
  await downloadMany(
    DRIVER_IMAGES.map((f) => ({ url: `${BASE}/images/neue_mitglieder/${f}`, dest: path.join(ROOT, "public/fahrer", f) }))
  );

  console.log("• Sponsoren");
  await downloadMany(
    SPONSOR_IMAGES.map((f) => ({ url: `${BASE}/images/banners/${f}`, dest: path.join(ROOT, "public/sponsors", f) }))
  );

  console.log("• Post-Cover-Bilder");
  const covers = LEGACY_POSTS.filter((p) => p.cover).map((p) => ({
    url: `${BASE}${p.cover!}`,
    dest: path.join(ROOT, "public", p.cover!.replace(/^\//, "")),
  }));
  await downloadMany(covers);

  console.log("• Galerie-Alben");
  for (const album of ALBUMS) {
    console.log(`  – ${album.title} (${album.photos.length} Bilder)`);
    await downloadMany(
      album.photos.map((p) => ({ url: p.src, dest: path.join(ROOT, p.dest) })),
      4
    );
  }

  console.log("• Beiträge laden");
  const postsOut: Array<{
    slug: string;
    title: string;
    date: string;
    cover: string | null;
    excerpt: string;
    content: string;
  }> = [];
  for (const p of LEGACY_POSTS) {
    try {
      const html = await fetchText(`${BASE}/index.php/${p.legacySlug}`);
      const extracted = extractArticle(html);
      if (!extracted) {
        console.warn(`  ✗ ${p.slug}: kein Artikel-Element gefunden`);
        continue;
      }

      const mdParts: string[] = [];
      if (extracted.markdown) mdParts.push(extracted.markdown);

      // PDFs lokal ablegen und verlinken
      for (const pdfUrl of extracted.pdfs) {
        const name = path.basename(new URL(pdfUrl).pathname);
        const localPath = path.join(ROOT, "public", "pdf", name);
        const ok = await download(pdfUrl, localPath);
        if (ok) mdParts.push(`**[Ergebnisse als PDF herunterladen](/pdf/${name})**`);
      }

      // Inline-Bilder (falls der Beitrag textarm ist)
      if (!extracted.markdown && extracted.images.length) {
        for (const imgUrl of extracted.images) {
          const rel = imgUrl.replace(BASE, "");
          mdParts.push(`![](${rel})`);
        }
      }

      const md = mdParts.join("\n\n").trim();
      if (!md) {
        console.warn(`  ✗ ${p.slug}: Inhalt leer (nur Social-Widgets)`);
        continue;
      }
      const excerpt = extractExcerpt(md);
      postsOut.push({
        slug: p.slug,
        title: p.title,
        date: p.date,
        cover: p.cover,
        excerpt,
        content: md,
      });
      console.log(`  ✓ ${p.slug} (${md.length} chars)`);
    } catch (err) {
      console.warn(`  ✗ ${p.slug}: ${(err as Error).message}`);
    }
  }

  await fs.writeFile(
    path.join(DATA_DIR, "posts.json"),
    JSON.stringify(postsOut, null, 2),
    "utf8"
  );
  console.log(`\n⇢ posts.json: ${postsOut.length} Beiträge`);

  // Albums-Metadata (photos nach Download filtern, die tatsächlich existieren)
  const albumsOut = [];
  for (const album of ALBUMS) {
    const existing: string[] = [];
    for (const photo of album.photos) {
      try {
        await fs.access(path.join(ROOT, photo.dest));
        existing.push("/" + photo.dest.replace(/^public\//, "").replace(/\\/g, "/"));
      } catch {
        // Datei nicht geladen — ignorieren
      }
    }
    if (existing.length === 0) {
      console.warn(`  ! ${album.slug}: keine Bilder geladen`);
      continue;
    }
    albumsOut.push({
      slug: album.slug,
      title: album.title,
      description: album.description,
      date: album.date,
      cover_image: existing[0],
      photos: existing,
    });
  }
  await fs.writeFile(
    path.join(DATA_DIR, "albums.json"),
    JSON.stringify(albumsOut, null, 2),
    "utf8"
  );
  console.log(`⇢ albums.json: ${albumsOut.length} Alben\n`);
  console.log("✓ Fertig.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
