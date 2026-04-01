---
name: scroll-road-scrollbuddy
description: Scroll-driven Mini-Auto auf einer kurvigen SVG-Strecke (spielig, klare Fahrtrichtung). Nutzt GSAP MotionPathPlugin + ScrollTrigger; kompatibel mit Lenis. Für Rallyeclub-Klostertal Seite — ersetzt den alten statischen SVG-Scroll-Begleiter.
---

# Scroll-Road Scrollbuddy (Rallyeclub Klostertal)

## Zielbild

- Beim **Scrollen** folgt ein **kleines Auto** (Draufsicht oder leicht isometrisch) einer **sichtbaren Straße**.
- Die Straße darf **Kurven**, leichte **S-Kurven** und **Wechsel der Richtung** haben — damit wirkt es **verspielt** und „man sieht wohin es geht“.
- Scroll **runter** = Progress entlang der Strecke (0 % → 100 % der Seitenlänge oder eines definierten Abschnitts).
- **Kein** reines vertikales `translateY` auf ein statisches SVG; die Bewegung läuft auf einem **Pfad**.

## Technische Basis (verpflichtend)

1. **GSAP** mit **ScrollTrigger** (bereits im Projekt).
2. **MotionPathPlugin** (`gsap.registerPlugin(MotionPathPlugin, ScrollTrigger)`), laden von CDN:
   - `https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/MotionPathPlugin.min.js`
3. **SVG-Pfad** (`<path id="...">`) als **Fahrspur-Mittellinie** (oder separater unsichtbarer Pfad nur für die Physik, sichtbare Straße mit `stroke` parallel dazu).
4. Animation des Auto-Elements:

```javascript
gsap.to('#scroll-car', {
  motionPath: {
    path: '#route-path',
    align: '#route-path',
    alignOrigin: [0.5, 0.5],
    autoRotate: true,
  },
  ease: 'none',
  scrollTrigger: {
    trigger: document.body, // oder ein Wrapper
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
  },
});
```

5. `autoRotate: true` sorgt dafür, dass das Auto **in Fahrtrichtung** zeigt (wichtig für Kurven).

## Lenis (Projekt hat smooth scroll)

- ScrollTrigger **muss** mit dem gleichen `scrollerProxy` laufen wie Lenis (bereits in `index.html`).
- Nach `ScrollTrigger.refresh()` bei Layoutänderungen (z. B. wenn Termine-Tabelle nachlädt).

## Gestaltung Straße

- **Ein** `viewBox`-fester SVG-Block (fix rechts oder in einer Spalte), z. B. `width: 120–180px`, `height: 100vh` oder `min-height` mit `overflow: visible`.
- Pfad in **SVG-Koordinaten** zeichnen: mehrere `C` / `Q` Segmente für Kurven, ggf. geschlossene Form für „Rundkurs“ nur wenn gewünscht.
- Sichtbare Straße: **Asphalt** (`stroke` breit, dunkelgrau), **Randlinien** (weiß), **Mittelmarkierung** (gelb, gestrichelt).
- Optional: **Gras** links/rechts als Hintergrund-Rechtecke.

## Auto

- Kompaktes **Gruppe oder Symbol** (`<g id="scroll-car">`), Mittelpunkt für `alignOrigin` passend wählen.
- `pointer-events: none` auf dem gesamten Scrollbuddy-Container.

## Barrierefreiheit

- `aria-hidden="true"` auf dem dekorativen SVG-Block.
- Bei `prefers-reduced-motion: reduce`: **kein** Pfad-Scroll — nur statisches Bild oder Auto ausblenden.

## Nicht tun

- Kein reines vertikales Scroll ohne Pfadbindung (wirkt schnell billig).
- Kein Auto ohne `autoRotate` wenn Kurven geplant sind.

## Referenz-Skills (global installiert)

- `gsap-scrolltrigger` — ScrollTrigger, scrub, pinning.
- `scroll-experience` — Narrative Scroll-Erlebnisse, Rhythmus.

## Umsetzung im Repo

- Datei: `index.html` (Skripte + SVG), ggf. späteres Auslagern in `js/scroll-buddy.js`.
- Altes `#scroll-buddy` mit `translateY` durch diese Architektur **ersetzen**, wenn umgesetzt.
