import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col overflow-hidden bg-ink text-white">
      {/* Background photo — lokale Club-Aufnahmen */}
      <Image
        src="/images/headers/hero-hq-1.png"
        alt="Autoslalom des Rallyeclub Klostertal in St. Gallenkirch"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Diagonal red + dark overlay (Speedway V2) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(225,36,28,.45) 0%, rgba(10,10,10,.35) 50%, rgba(10,10,10,.85) 100%), linear-gradient(180deg, rgba(10,10,10,.4) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,.7) 100%)",
        }}
        aria-hidden
      />

      {/* Speed lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(115deg,rgba(255,255,255,.04) 0 1px,transparent 1px 36px)",
        }}
        aria-hidden
      />

      {/* Main content */}
      <div className="container-wide relative z-10 flex flex-1 flex-col justify-center py-24">
        <div className="animate-slide-up max-w-4xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-[2px] w-10 bg-racing" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-racing-100">
              Rallyeclub Klostertal · seit 1988 · Vorarlberg
            </span>
          </div>

          <h1
            className="font-display text-[clamp(64px,10vw,160px)] uppercase leading-[0.92] tracking-wide text-white"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,.4)" }}
          >
            Motorsport
            <br />
            <em className="not-italic text-racing">mit Haltung.</em>
          </h1>

          <p className="mt-7 max-w-[560px] text-base leading-relaxed text-white/85 md:text-lg">
            Der Rallyeclub Klostertal organisiert den traditionellen Autoslalom in
            St.&nbsp;Gallenkirch, Clubausfahrten und Motorsport-Events — bodenständig,
            schnell und mit Leidenschaft fürs Fahrerlager.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/veranstaltungen" className="btn-primary">
              Termine ansehen
            </Link>
            <Link
              href="/galerie"
              className="inline-flex items-center gap-2 border border-white/40 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:border-white hover:bg-white/10"
            >
              Bilder aus dem Club →
            </Link>
          </div>
        </div>
      </div>

      {/* Slider arrows */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-6">
        <button
          type="button"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-xl text-white transition hover:border-racing hover:bg-racing"
          aria-label="Vorheriges Bild"
        >
          ‹
        </button>
        <button
          type="button"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-xl text-white transition hover:border-racing hover:bg-racing"
          aria-label="Nächstes Bild"
        >
          ›
        </button>
      </div>

      {/* Meta bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container-wide flex items-center justify-between py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          <span>↘ Saison 2026</span>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-6 rounded bg-racing" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
          <span>Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
