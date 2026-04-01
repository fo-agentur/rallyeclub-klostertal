# Rallye Club Klostertal — Webseite

> Erstellt von FO Agentur

## Setup

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Umgebungsvariablen

Kopiere `.env.example` zu `.env.local` und fülle die Werte aus (Firebase Web-App + optional Service Account für SSR und Revalidate-API).

## Admin (nicht verlinkt)

- URL-Pfad: `/rck-mgmt-k9x2wp4m` (Ordnername unter `app/` bei Bedarf ändern — nicht in der Navigation verlinken).
- Zugriff: Firebase Auth + Custom Claim `admin: true`.
- Claim setzen (einmalig, mit Service Account):

```bash
npm run set-admin-claim -- <USER_UID>
```

Optional dritter Parameter: Pfad zur Service-Account-JSON-Datei, falls `FIREBASE_SERVICE_ACCOUNT_JSON` nicht gesetzt ist.

## Firebase Rules

```bash
firebase deploy --only firestore:rules,storage
```

(`firebase.json` ist angelegt.)

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
