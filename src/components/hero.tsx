import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="hero-motorsport-bg absolute inset-0" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-ink" aria-hidden />

      <div className="container-wide relative py-28 md:py-36 lg:py-48">
        <div className="max-w-3xl animate-slide-up">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-[2px] w-16 bg-racing" />
            <span className="text-xs font-semibold uppercase tracking-widest text-racing">
              Seit 1988 · Vorarlberg
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] tracking-wider text-white md:text-7xl lg:text-8xl">
            Motorsport
            <br />
            <span className="text-racing">aus dem Klostertal</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-neutral-300 md:text-lg">
            Der Rallyeclub Klostertal organisiert den traditionellen Autoslalom in
            St.&nbsp;Gallenkirch, Clubausfahrten und Kartrennen. Seriöser Motorsport auf
            Vereinsbasis — mit Leidenschaft für Kurven, Zeiten und gute Abende im Fahrerlager.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/veranstaltungen" className="btn-primary">
              Nächste Termine
            </Link>
            <Link
              href="/galerie"
              className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-white hover:text-ink"
            >
              Zur Galerie
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-racing" />
    </section>
  );
}
