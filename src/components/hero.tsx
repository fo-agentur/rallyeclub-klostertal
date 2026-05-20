import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] flex-col overflow-hidden bg-ink text-white">
      <Image
        src="/images/headers/hero-hq-1.png"
        alt="Autoslalom des Rallyeclub Klostertal in St. Gallenkirch"
        fill
        priority
        className="object-cover object-center motion-safe:scale-[1.02] motion-safe:animate-hero-zoom"
        sizes="100vw"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, rgba(225,36,28,.34) 0%, rgba(10,10,10,.22) 40%, rgba(10,10,10,.88) 100%), linear-gradient(180deg, rgba(10,10,10,.25) 0%, rgba(10,10,10,.15) 40%, rgba(10,10,10,.78) 100%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "repeating-linear-gradient(115deg,rgba(255,255,255,.04) 0 1px,transparent 1px 42px)",
        }}
        aria-hidden
      />

      <div className="container-wide relative z-10 flex flex-1 flex-col justify-center py-24 md:py-28">
        <div className="max-w-4xl animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-4 rounded-full border border-white/15 bg-white/6 px-4 py-2 backdrop-blur-sm">
            <span className="h-[2px] w-8 bg-racing" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-racing-100">
              Rallyeclub Klostertal · seit 1988 · Vorarlberg
            </span>
          </div>

          <h1
            className="max-w-5xl font-display text-[clamp(48px,8vw,112px)] uppercase leading-[0.92] tracking-wide text-white"
            style={{ textShadow: "0 8px 40px rgba(0,0,0,.35)" }}
          >
            <span className="block">Der Club für</span>
            <em className="mt-1 block not-italic text-racing">Motorsport im Klostertal.</em>
          </h1>

          <p className="mt-6 max-w-[640px] text-base leading-relaxed text-white/82 md:text-lg">
            Autoslalom, Clubleben und echte Leidenschaft für Motorsport. Hier findest du
            Termine, News, Bilder und alles Wichtige rund um den Rallyeclub Klostertal —
            klar, schnell und ohne Umwege.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/veranstaltungen" className="btn-primary">
              Nächste Termine ansehen
            </Link>
            <Link href="/kontakt" className="btn-outline-inverse">
              Mitglied werden & Kontakt
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-black/28 backdrop-blur-sm">
        <div className="container-wide grid gap-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72 md:grid-cols-3 md:items-center">
          <span>↘ Tradition seit 1988</span>
          <div className="flex items-center justify-start gap-2 md:justify-center">
            <span className="h-1.5 w-7 rounded bg-racing" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
          <span className="md:text-right">Slalom · Rallye · Clubleben</span>
        </div>
      </div>
    </section>
  );
}
