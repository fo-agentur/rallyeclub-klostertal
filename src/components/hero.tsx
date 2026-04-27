import Link from "next/link";

export function Hero() {
  return (
    <section className="relative -mt-20 min-h-screen overflow-hidden text-white">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1920&q=80')",
        }}
        aria-hidden
      />

      {/* Diagonal red + dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgba(225,36,28,.48) 0%, rgba(10,10,10,.38) 50%, rgba(10,10,10,.88) 100%), linear-gradient(180deg, rgba(10,10,10,.45) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,.72) 100%)",
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
      <div className="container-wide relative flex min-h-screen flex-col justify-center pb-28 pt-28">
        <div className="animate-slide-up">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-[2px] w-10 bg-racing" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-racing-100">
              Rallyeclub Klostertal · seit 1979
            </span>
          </div>

          <h1
            className="font-display text-[clamp(64px,10vw,160px)] uppercase leading-[0.92] tracking-wide text-white"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,.4)" }}
          >
            Benzin im Blut.
            <br />
            <em className="not-italic text-racing">Berge im Herzen.</em>
          </h1>

          <p className="mt-7 max-w-[560px] text-[17px] leading-relaxed opacity-90">
            Motorsport aus dem Klostertal. Seit 1979 verbinden uns Leidenschaft
            für PS, Asphalt und Gemeinschaft.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/news" className="btn-primary">
              Aktuelle Berichte →
            </Link>
            <Link
              href="/mitglieder"
              className="inline-flex items-center gap-2 border border-white/50 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:border-white hover:bg-white/10"
            >
              Über den Verein
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
      <div className="container-wide absolute inset-x-0 bottom-8 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
        <span>↘ Saison 2026</span>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-6 rounded bg-racing" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
        <span>Scroll ↓</span>
      </div>
    </section>
  );
}
