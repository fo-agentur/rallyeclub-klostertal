# Rallyeclub Klostertal — Webseite (v3)

Öffentliche Vereinsseite mit schlankem Admin-Panel. Stack: **Next.js 15** (App Router) +
**Tailwind** + **SQLite** (`node:sqlite`) + **lokales Filesystem**. Keine externen Services,
100% selbst-hostbar.

## Lokal starten

```bash
npm install
cp .env.example .env    # Passwort-Hash + AUTH_SECRET anpassen
npm run seed            # DB anlegen + Inhalte importieren
npm run dev             # → http://localhost:3000
```

Admin: `http://localhost:3000/admin`
Default-Passwort: `rallyeclub2026` (sofort ändern mit `npm run hash-password`)

## Scripts

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server (Hot Reload) |
| `npm run build` | Production-Build (nur Next.js — für **Cloudflare** unten `cf:build` nutzen) |
| `npm run cf:build` | OpenNext + Next.js — erzeugt `.open-next/` für Cloudflare Workers |
| `npm run cf:deploy` | Lokal: `cf:build` + Deploy (Wrangler) |
| `npm run start` | Production-Server (nach Build) |
| `npm run scrape` | Bilder + Posts von alter Joomla-Seite ziehen |
| `npm run seed` | DB initialisieren + Seeds aus `scripts/data/` importieren |
| `npm run hash-password` | neues Admin-Passwort hashen (bcrypt) |

## Projektstruktur

```
src/
├── app/
│   ├── (public)      → /, /news, /veranstaltungen, /galerie,
│   │                    /mitglieder, /fahrer, /reglement,
│   │                    /kontakt, /impressum
│   └── admin/        → /admin, /admin/dashboard,
│                        /admin/beitraege, /admin/galerie,
│                        /admin/termine
├── lib/
│   ├── db.ts         → SQLite (node:sqlite) + Migrations
│   ├── auth.ts       → Cookie-Session (HMAC) + bcrypt
│   ├── upload.ts     → Bild-Upload + sharp-Resize
│   └── queries/      → posts, events, albums
├── components/       → SiteHeader, SiteFooter, Hero, Cards …
└── content/          → Mitglieder, Fahrer, Reglement (statisch)

public/
├── hero/, mitglieder/, fahrer/, sponsors/   → von Altseite übernommen
└── uploads/          → vom Admin hochgeladene Bilder (Volume)

.data/rck.db           → SQLite-Datei (Volume)
```

## Admin

Vier Bereiche, mehr nicht:

- **Beiträge** — News mit Markdown-Body + Titelbild
- **Galerie** — Alben mit Multi-Foto-Upload
- **Termine** — Veranstaltungen
- **Logout**

Login läuft über ein bcrypt-gehashtes Passwort in `.env` (`ADMIN_PASSWORD_HASH`). Session
wird in einem HTTP-only-Cookie mit HMAC-SHA256-Signatur abgelegt (14 Tage).

## Passwort ändern

```bash
npm run hash-password 'neuesPasswort123'
# Ausgabe in .env als ADMIN_PASSWORD_HASH einfügen und Server neu starten.
```

## Cloudflare Workers (Dashboard-Build)

Wenn du das Repo per **Git-Integration** in Cloudflare verbindest, darf der Build **nicht** nur `npm run build` sein — sonst fehlt das OpenNext-Bundle und `wrangler deploy` meldet: *Could not find compiled Open Next config*.

Im Worker unter **Settings → Builds** (bzw. Build-Konfiguration):

| Schritt | Befehl |
|--------|--------|
| **Build command** | `npm run cf:build` |
| **Deploy command** | `npx wrangler deploy` |

`npm run build` führt nur `next build` aus; `npm run cf:build` ruft `opennextjs-cloudflare build` auf und legt u. a. `.open-next/worker.js` an (siehe `wrangler.jsonc` → `main`).

**D1:** In `wrangler.jsonc` muss dieselbe D1-Instanz wie im Cloudflare-Konto existieren (`database_id`). Eine **leere** D1 verhindert den Deploy normalerweise nicht — danach Migration/Seed auf die **remote** D1 ausführen (`npm run seed:d1` o. ä.), sonst sind Tabellen leer.

**Secrets:** `ADMIN_PASSWORD_HASH` und `AUTH_SECRET` unter Worker **Settings → Variables and Secrets** als **Secrets** setzen (wie lokal in `.env`).

**500 Internal Server Error** nach dem Deploy: Die Startseite fragt D1 ab (`posts`, `events`, `albums`). Ohne Tabellen schlagen die Queries fehl. Lokal eingeloggt (`npx wrangler login`), dann **Schema auf die remote D1** anwenden:

```bash
npx wrangler d1 execute rallyeclub-klostertal-db --file=scripts/d1-migration.sql --remote
```

Optional Demo-/Import-Daten (generiert `d1-seed.sql` und führt sie aus):

```bash
npm run seed:d1
```

Wenn es weiterhin knallt: **Workers → Observability / Logs** (oder „Real-time Logs“) öffnen — dort steht die echte Fehlermeldung (z. B. „no such table“).

## Docker (für Droplet-Deployment)

```bash
docker compose up -d --build
```

Zwei Volumes bleiben persistent:

- `./.data` → SQLite-Datenbank
- `./public/uploads` → Vom Admin hochgeladene Bilder

Backup:

```bash
tar czf rck-backup-$(date +%F).tgz .data public/uploads
```

## Environment-Variablen

| Variable | Zweck |
|---|---|
| `ADMIN_PASSWORD_HASH` | bcrypt-Hash des Admin-Passworts |
| `AUTH_SECRET` | Zufallsstring (≥32 Byte) für Cookie-HMAC |

Beide **müssen** in Produktion gesetzt werden.

## Lizenz / Inhalte

Alle Inhalte (Bilder, Texte, News, Galerie) gehören dem Rallyeclub Klostertal.
Der Code ist für den Vereinsgebrauch; keine öffentliche Lizenz.
