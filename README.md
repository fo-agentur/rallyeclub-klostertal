# Rallyeclub Klostertal — Webseite (v3)

Öffentliche Vereinsseite mit schlankem Admin-Panel. Stack: **Next.js 15** (App Router) +
**Tailwind** + **Supabase** (Postgres + Storage für Uploads). Optional lokal: **`npm run seed`**
nutzt weiterhin **SQLite** (`node:sqlite`) nur für den Import aus `scripts/data/`.

## Lokal starten

```bash
npm install
cp .env.example .env.local
# .env.local: ADMIN_PASSWORD_HASH, AUTH_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm run dev             # → http://localhost:3000
```

**Supabase einrichten:** SQL aus [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) im **Supabase SQL Editor** ausführen (Tabellen, View `album_list`, Storage-Bucket `uploads`). Keys: **Project Settings → API** (`service_role` nur serverseitig).

Admin: `http://localhost:3000/admin` — Passwort wie in `.env` gehasht (`npm run hash-password`).

## Scripts

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server (Hot Reload) |
| `npm run build` | Production-Build (nur Next.js — für **Cloudflare** `cf:build` nutzen) |
| `npm run cf:build` | OpenNext + Next.js — erzeugt `.open-next/` für Cloudflare Workers |
| `npm run cf:deploy` | Lokal: `cf:build` + Deploy (Wrangler) |
| `npm run start` | Production-Server (nach Build) |
| `npm run scrape` | Bilder + Posts von alter Joomla-Seite ziehen |
| `npm run seed` | Optional: lokale SQLite `.data/rck.db` + Seeds (nur Import-Workflow) |
| `npm run hash-password` | neues Admin-Passwort hashen (bcrypt) |

## Projektstruktur

```
src/
├── app/              → Routen (öffentlich + /admin)
├── lib/
│   ├── db.ts         → Typen (+ SQLite-SCHEMA nur für npm run seed)
│   ├── supabase/     → Server-Client (service role)
│   ├── auth.ts       → Cookie-Session (HMAC) + bcrypt
│   ├── upload.ts     → Supabase Storage oder public/uploads (ohne Supabase-Env)
│   └── queries/      → posts, events, albums (Supabase)
├── components/
└── content/          → statische Vereinsseiten

supabase/migrations/  → Postgres-Schema für Supabase SQL Editor
```

## Admin

- **Beiträge** — News mit Markdown + Titelbild  
- **Galerie** — Alben mit Fotos (Supabase Storage wenn konfiguriert)  
- **Termine** — Veranstaltungen  
- **Logout**

## Cloudflare Workers (Git-Build)

| Schritt | Befehl |
|--------|--------|
| **Build command** | `npm run cf:build` |
| **Deploy command** | `npx wrangler deploy` |

**Secrets im Worker:** Exakt diese **Namen** (Groß/Klein wie hier), jeweils als **Secret** oder Variable:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (vollständiger Name, nicht abgekürzt)
- `ADMIN_PASSWORD_HASH`
- `AUTH_SECRET`

Werte wie in `.env.local`. OpenNext kopiert nicht alle Bindings nach `process.env`; der Code liest zusätzlich den Worker-`env`-Context aus.

Ohne gültige Supabase-Variablen schlagen Seiten mit Datenbankzugriff fehl — **Logs** unter Workers → Observability prüfen.

## Docker (optional, ohne Supabase)

```bash
docker compose up -d --build
```

Nutzt lokale SQLite + `public/uploads` (siehe `Dockerfile`).

## Environment-Variablen

| Variable | Zweck |
|---|---|
| `ADMIN_PASSWORD_HASH` | bcrypt-Hash des Admin-Passworts |
| `AUTH_SECRET` | Zufallsstring (≥32 Byte) für Cookie-HMAC |
| `SUPABASE_URL` | Projekt-URL (`https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Nur Server** — niemals `NEXT_PUBLIC_` |

## Lizenz / Inhalte

Alle Inhalte (Bilder, Texte, News, Galerie) gehören dem Rallyeclub Klostertal.
Der Code ist für den Vereinsgebrauch; keine öffentliche Lizenz.
