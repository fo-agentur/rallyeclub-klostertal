import Image from "next/image";
import Link from "next/link";

const STATS = [
  { value: "1988", label: "Gegründet" },
  { value: "30+", label: "Slalom-Ausgaben" },
  { value: "VBG", label: "Vorarlberg" },
];

const HERO_SHOTS = [
  "/images/headers/hero-hq-1.png",
  "/images/headers/hero-hq-2.png",
  "/images/headers/hero-hq-3.png",
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[92vh] flex-col overflow-hidden bg-ink text-white">
      <Image
        src="/images/headers/hero-hq-1.png"
        alt="Autoslalom des Rallyeclub Klostertal in St. Gallenkirch"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.88)_0%,rgba(10,10,10,0.72)_42%,rgba(10,10,10,0.38)_68%,rgba(10,10,10,0.6)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(225,6,0,0.28),transparent_32%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.12),transparent_22%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        aria-hidden
      />

      <div className="container-wide relative z-10 grid flex-1 items-end gap-12 py-24 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:py-32">
        <div className="max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="block h-px w-10 bg-racing" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78">
              Seit 1988 · St. Gallenkirch · Vorarlberg
            </span>
          </div>

          <h1 className="font-display text-[clamp(4.2rem,10vw,9.5rem)] leading-[0.86] tracking-[0.04em] text-white drop-shadow-[0_10px_32px_rgba(0,0,0,0.45)]">
            <span className="block">Motorsport</span>
            <span className="block text-racing">mit Haltung.</span>
            <span className="block">Aus dem Klostertal.</span>
          </h1>

          <p className="mt-8 max-w-[600px] text-base leading-relaxed text-white/78 md:text-lg">
            Der Rallyeclub Klostertal organisiert den traditionellen Autoslalom in
            St.&nbsp;Gallenkirch, Clubausfahrten und Motorsport-Events mit echter Nähe zur
            Szene — bodenständig, schnell und mit Leidenschaft fürs Fahrerlager.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/veranstaltungen" className="btn-primary">
              Termine ansehen
            </Link>
            <Link
              href="/galerie"
              className="inline-flex items-center gap-2 border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:border-white/70 hover:bg-white/10"
            >
              Bilder aus dem Club →
            </Link>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="grid gap-3">
            {HERO_SHOTS.map((src, index) => (
              <div
                key={src}
                className="group relative overflow-hidden border border-white/15 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.28)]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={src}
                    alt={`Motorsport-Motiv ${index + 1} des Rallyeclub Klostertal`}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="360px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-racing">
                      Clubmoment {index + 1}
                    </div>
                    <div className="mt-1 text-sm font-medium text-white/88">
                      Autoslalom & Vereinsleben im Klostertal
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-black/35 backdrop-blur-sm">
        <div className="container-wide grid grid-cols-3 py-6 md:py-8">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-1 px-4 ${
                i > 0 ? "border-l border-white/10" : ""
              }`}
            >
              <span className="font-display text-3xl tracking-wider text-white md:text-4xl">
                {value}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-racing/60 to-transparent" />
    </section>
  );
}
