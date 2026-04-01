# Rallye Club Klostertal — Webseite

> Erstellt von FO Agentur

## Setup

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Umgebungsvariablen

Kopiere `.env.example` zu `.env.local` und fülle die Werte aus. Namen sind bewusst lesbar (`NEXT_PUBLIC_FIREBASE_WEB_*`, `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON`); ältere Kurznamen aus `.env.example` funktionieren weiterhin als Fallback.

**Wichtig:** Service-Account-JSON nur in `.env.local` oder sicherem Secret-Store — nie ins Git. Wurde ein Schlüssel geleakt (Chat, Screenshot), in der Google Cloud Console unter dem Dienstkonto den **Schlüssel widerrufen** und einen **neuen** erzeugen.

## Admin (nicht verlinkt)

- URL-Pfad: `/rck-mgmt-k9x2wp4m` (Ordnername unter `app/` bei Bedarf ändern — nicht in der Navigation verlinken).
- Zugriff: Firebase Auth + Custom Claim `admin: true`.
- Claim setzen (einmalig, mit Service Account):

```bash
npm run set-admin-claim -- <USER_UID>
```

Optional dritter Parameter: Pfad zur Service-Account-JSON-Datei, falls weder `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` noch `FIREBASE_SERVICE_ACCOUNT_JSON` gesetzt ist.

## Firebase Rules

```bash
firebase deploy --only firestore:rules,storage
```

(`firebase.json` ist angelegt.) Nach Änderungen an `storage.rules` unbedingt deployen — dort ist u. a. **max. 2 MB pro Bild** und nur `image/*` für `cms/**` hinterlegt.

## CMS-Limits (Kosten / Speicher)

Im Admin gelten feste Obergrenzen (siehe `lib/cms-limits.ts`): Anzahl Hero-Slides, Team, Galerie, Club-Streifen, Highlights, Termine sowie **max. Bildgröße pro Upload**. Überschüssige Inhalte werden auf der **öffentlichen Seite abgeschnitten**, bis du im CMS reduzierst. **API-Keys und Service-Account-JSON gehören nur in `.env.local`**, niemals ins Repository.

## Struktur

- `app/(main)/` — öffentliche Startseite (App Router)
- `app/rck-mgmt-k9x2wp4m/` — Admin-UI
- `app/styles/` — ausgelagertes CSS (`base`, `cursor`, `sections`), eingebunden in `app/globals.css`
- `components/sections/` — Seiten-Sektionen
- `components/admin/` — Admin-Dashboard
- `lib/schemas/` — Zod-Schemas (Site-Content, Termine)
- `public/images/` — statische Medien
- `legacy/` — archivierte monolithische `index.html` (Referenz)

## Deployment

Next.js benötigt Node-Hosting (z. B. Vercel, Firebase App Hosting) oder einen passenden Hostinger-Plan mit Node. `npm run build` && `npm run start`.

## Projekt-Info

- **Kunde:** Rallye Club Klostertal
- **Website:** http://www.rallyeclub-klostertal.at
- **Techstack:** Next.js, Tailwind CSS, Firebase (Auth, Firestore, Storage), Hostinger (Zielhosting klären)
- **Branch-Strategie:** main = live, dev = Entwicklung
