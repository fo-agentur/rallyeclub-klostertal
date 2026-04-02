# Rallye Club Klostertal — Webseite

> Erstellt von FO Agentur

## Setup

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Umgebungsvariablen

Kopiere `.env.example` zu `.env.local` und fülle die Werte aus:

```bash
cp .env.example .env.local
```

## Deployment

Hosting über Hostinger. Push auf `main` deployt automatisch.

## Struktur

```
/app              → Pages & Routing (App Router)
/components
  /ui             → Wiederverwendbare UI-Komponenten (Buttons, Cards, etc.)
  /layout         → Layout-Komponenten (Header, Footer, Navigation)
  /sections       → Sektionen der Seite (Hero, About, Contact, etc.)
/lib              → Utility-Funktionen, Supabase Client, etc.
/types            → TypeScript Typen & Interfaces
/public/images    → Bilder & Medien
```

## Projekt-Info

- **Kunde:** Rallye Club Klostertal
- **Website:** http://www.rallyeclub-klostertal.at
- **Techstack:** Next.js, Tailwind CSS, Supabase, Hostinger
- **Preis:** 400 €
- **Branch-Strategie:** main = live, dev = Entwicklung
