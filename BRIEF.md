# Projekt-Brief: Rallye Club Klostertal – V3 (Simpler Neustart)

> ⚠️ Dieses Dokument VOR dem ersten Commit ausfüllen. Kein Code ohne Brief.

---

## Kunde
- **Name:** Rallye Club Klostertal
- **Bestehende Website:** http://www.rallyeclub-klostertal.at
- **Kontakt:** (aus Geschäftlich/Kunden/Rallye-Club/)

---

## Warum V3?
- V1: Monolithisches HTML (zu unstrukturiert)
- V2: Next.js + Firebase CMS + Admin-Panel → zu komplex, Admin-Panel unübersichtlich / überwältigend
- V3: Gleiche Kernfunktionen, aber radikal aufgeräumtes Admin-Panel + saubere öffentliche Seite

---

## Referenz (öffentliche Seite)
- **rrcv.at** — als Orientierung für Stil und Komplexitätsniveau der öffentlichen Seite
- Was gefällt: ___
- Was soll anders sein: ___

---

## Was muss V3 können?

### Öffentliche Seite
- [ ] Informationen über den Club (Startseite)
- [ ] Veranstaltungskalender / Termine
- [ ] Galerie (Fotos)
- [ ] Beiträge / News
- [ ] Kontakt
- [ ] Impressum / Datenschutz
- [ ] Sonstiges: ___

### Admin-Panel (eingeloggt, versteckter Link)
- [x] Bilder / Galerie-Fotos hochladen & verwalten
- [x] Beiträge / News erstellen, bearbeiten, löschen
- [x] Termine hinzufügen & verwalten
- [ ] Sonstiges: ___

**Kern-Prinzip Admin:** Maximal 3-4 Bereiche. Jeder Bereich = eine einfache Liste + "Neu hinzufügen"-Button. Kein Dashboard mit 15 Kacheln, keine verschachtelten Menüs.

---

## Was muss V3 NICHT können?
- ❌ Keine Hero-Slideshow mit 10 Slides
- ❌ Kein verschachteltes Admin-Menü
- ❌ Keine Firebase Custom Claims / komplizierte Auth-Ebenen
- ❌ Keine Obergrenzen-Logik / CMS-Limits (war V2-Overkill)
- ❌ Kein Overengineering

---

## Technologie-Entscheidung

**Empfehlung: Next.js + Supabase**

| Was | Warum |
|-----|-------|
| Next.js | Ihr Team kennt es, App Router, einfaches Deployment auf Vercel |
| Supabase | Ersatz für Firebase — einfacheres Dashboard, PostgreSQL, Storage für Bilder, Auth out-of-the-box |
| Tailwind | Ihr Standard, bleibt |

Alternativen:
- [ ] Next.js + Supabase ← **empfohlen**
- [ ] Next.js + Uploadthing (nur für Bilder) + Markdown-Files (für Beiträge)
- [ ] Next.js + Firebase (bekannt, aber komplexer)

**Entscheidung:** ___

---

## Admin-Panel Struktur (V3 Ziel)

```
/admin                    ← Login
/admin/dashboard          ← 4 Kacheln: Beiträge | Galerie | Termine | Einstellungen
/admin/beitraege          ← Liste + Neu-Button
/admin/beitraege/neu      ← Formular: Titel, Text, Bild, Datum
/admin/galerie            ← Bildergalerie, Drag&Drop Upload
/admin/termine            ← Liste + Neu-Button: Datum, Name, Ort
```

Kein Klick-Chaos. Keine 15 Einstellungen auf einmal.

---

## Design
- Farbpalette: Schwarz / Weiß + Akzent: ___
- Schriften: ___
- Ton: Seriös, Motorsport, Vereins-Website

---

## Seiten-Struktur (öffentlich)
```
/ (Startseite — ruhig, klar, kein Overload)
/veranstaltungen
/galerie
/news
/kontakt
/impressum
```

---

## Offene Fragen vor Start
- [ ] Supabase oder Firebase? → Entscheidung treffen
- [ ] Hosting: Vercel (einfach) oder Hostinger?
- [ ] Login: Nur ein Admin-Account oder mehrere?
- [ ] Welche Inhalte aus V2 übernehmen (Fotos, Texte)?

---

## Deadlines
- Erster Entwurf: ___
- Abgabe: ___

---

*Stand: April 2026*
