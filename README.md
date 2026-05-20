# Rallyeclub Klostertal — Webseite (v3)

Öffentliche Vereinsseite mit schlankem Admin-Panel.

**Stack:** Next.js 15 (App Router) · Tailwind · **PostgreSQL** · **MinIO/S3** für Bild-Uploads.
**Deploy:** Self-Hosted via **Coolify** (Docker Compose).

---

## Lokal starten

```bash
npm install
cp .env.example .env.local        # ADMIN_PASSWORD_HASH, AUTH_SECRET, DATABASE_URL, S3_*
docker compose up -d postgres minio minio-init   # nur Infra hochfahren
npm run migrate                   # Schema einspielen
npm run dev                       # → http://localhost:3000
```

Admin: `http://localhost:3000/admin` — Passwort wie in `.env.local` gehasht (`npm run hash-password <pw>`).

> Komplettes Stack lokal in Containern: `docker compose up -d --build` (inkl. `web`).

---

## Scripts

| Befehl                  | Zweck                                                     |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Dev-Server (Hot Reload)                                   |
| `npm run build`         | Production-Build (Next.js standalone)                     |
| `npm run start`         | Production-Server (nach Build)                            |
| `npm run migrate`       | SQL aus `db/migrations/` in Postgres einspielen           |
| `npm run scrape`        | Bilder + Posts von alter Joomla-Seite ziehen              |
| `npm run seed`          | DB mit Scrape-Output (+ Demo-Termine) befüllen            |
| `npm run hash-password` | Neues Admin-Passwort hashen (bcrypt)                      |

---

## Projektstruktur

```
src/
├── app/              → Routen (öffentlich + /admin)
├── lib/
│   ├── db.ts         → Entity-Typen
│   ├── pg.ts         → Postgres-Pool (Singleton)
│   ├── s3.ts         → S3/MinIO-Client + Upload-Helpers
│   ├── auth.ts       → Cookie-Session (HMAC) + bcrypt
│   ├── upload.ts     → Bild-Resize + Upload nach S3
│   └── queries/      → posts, events, albums, messages
├── components/
└── content/          → statische Vereinsseiten

db/migrations/        → Postgres-Schema (von `npm run migrate` eingespielt)
docker-compose.yml    → web + postgres + minio + minio-init (für Coolify)
```

---

## Admin

- **Beiträge** — News mit Markdown + Titelbild
- **Galerie** — Alben mit Fotos (MinIO/S3)
- **Termine** — Veranstaltungen
- **Nachrichten** — Kontaktformular-Eingang
- **Logout**

---

## Deploy auf Coolify

1. **Projekt anlegen** → *Resource* → *Docker Compose* → Git-Repo verbinden, Branch `main`, Compose-File `docker-compose.yml`.
2. **Environment Variables** im Coolify-UI setzen (Werte aus `.env.example`):

   | Variable                | Beispiel                                         |
   | ----------------------- | ------------------------------------------------ |
   | `ADMIN_PASSWORD_HASH`   | `$2a$12$…` (aus `npm run hash-password`)         |
   | `AUTH_SECRET`           | `openssl rand -base64 32`                        |
   | `POSTGRES_USER`         | `rck`                                            |
   | `POSTGRES_PASSWORD`     | starkes Passwort                                 |
   | `POSTGRES_DB`           | `rck`                                            |
   | `MINIO_ROOT_USER`       | `rck-admin`                                      |
   | `MINIO_ROOT_PASSWORD`   | starkes Passwort                                 |
   | `S3_BUCKET`             | `uploads`                                        |
   | `S3_PUBLIC_URL`         | `https://files.rallyeclub-klostertal.at/uploads` |

3. **Reverse-Proxy / Domains** in Coolify:
   - `web` → `https://rallyeclub-klostertal.at` (Port 3000)
   - `minio` → `https://files.rallyeclub-klostertal.at` (Port 9000) — **nur** dieser eine Host für öffentliche Bild-URLs; das MinIO-Console-Port (9001) sollte **nicht** öffentlich exponiert werden.
4. **Deploy** starten.
5. Einmalig Migration einspielen (über Coolify-Terminal im `web`-Container):
   ```bash
   npm run migrate
   ```
6. Login auf `/admin`. Bilder über das Admin-Panel hochladen — landen automatisch im MinIO-Bucket.

> `S3_PUBLIC_URL` muss exakt der öffentlich erreichbaren MinIO-URL inkl. Bucket-Pfad entsprechen, sonst sind hochgeladene Bilder im Frontend nicht ladbar.

---

## Environment-Variablen (Übersicht)

| Variable                                     | Zweck                                              |
| -------------------------------------------- | -------------------------------------------------- |
| `ADMIN_PASSWORD_HASH`                        | bcrypt-Hash des Admin-Passworts                    |
| `AUTH_SECRET`                                | HMAC-Secret für Session-Cookie                     |
| `DATABASE_URL`                               | Postgres-Connection (`postgres://…`)               |
| `S3_ENDPOINT`                                | MinIO/S3-Endpoint (compose-intern `http://minio:9000`) |
| `S3_BUCKET`                                  | Bucket-Name (`uploads`)                            |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`  | MinIO-Credentials                                  |
| `S3_PUBLIC_URL`                              | öffentlich erreichbare Basis-URL der Bilder        |
| `S3_REGION`                                  | optional, default `us-east-1`                      |
| `S3_FORCE_PATH_STYLE`                        | default `true` (Pflicht für MinIO)                 |

---

## Lizenz / Inhalte

Alle Inhalte (Bilder, Texte, News, Galerie) gehören dem Rallyeclub Klostertal.
Der Code ist für den Vereinsgebrauch; keine öffentliche Lizenz.
