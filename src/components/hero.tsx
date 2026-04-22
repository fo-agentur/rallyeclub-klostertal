import Link from "next/link";

const STATS = [
  { value: "1988", label: "Gegründet" },
  { value: "30+", label: "Slalom-Ausgaben" },
  { value: "VBG", label: "Vorarlberg" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[88vh] flex-col overflow-hidden bg-ink text-white">
      {/* Red radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 12% 48%, rgba(225,6,0,0.11) 0%, transparent 65%)",
        }}
        aria-hidden
      />
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
        aria-hidden
      />
      {/* Large decorative display text */}
      <div
        className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none overflow-hidden"
        aria-hidden
      >
        <span className="font-display text-[clamp(10rem,28vw,22rem)] leading-none tracking-widest text-white/[0.025]">
          RCK
        </span>
      </div>

      {/* Main content */}
      <div className="container-wide relative z-10 flex flex-1 flex-col justify-center py-32 lg:py-44">
        <div className="max-w-5xl">
          <div className="mb-8 flex items-center gap-3">
            <span className="block h-px w-10 bg-racing" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-racing">
              Seit 1988 · Vorarlberg
            </span>
          </div>

          <h1 className="font-display text-[clamp(4rem,11vw,9.5rem)] leading-[0.88] tracking-wider">
            <span className="block text-white">Motorsport</span>
            <span className="block text-racing">aus dem</span>
            <span className="block text-white">Klostertal.</span>
          </h1>

          <p className="mt-10 max-w-[480px] text-[15px] leading-relaxed text-neutral-400 md:text-base">
            Der Rallyeclub Klostertal organisiert den Autoslalom in St.&nbsp;Gallenkirch,
            Clubausfahrten und Kartrennen — ehrlicher Motorsport auf Vereinsbasis mit Leidenschaft
            für Kurven, Zeiten und das Fahrerlager.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/veranstaltungen" className="btn-primary">
              Nächste Termine
            </Link>
            <Link
              href="/galerie"
              className="inline-flex items-center gap-2 border border-white/25 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white/80 transition hover:border-white/60 hover:text-white"
            >
              Galerie →
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 border-t border-white/[0.08] bg-white/[0.04]">
        <div className="container-wide grid grid-cols-3 py-6 md:py-8">
          {STATS.map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-1 px-4 ${
                i > 0 ? "border-l border-white/[0.08]" : ""
              }`}
            >
              <span className="font-display text-3xl tracking-wider text-white md:text-4xl">
                {value}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-racing/50 to-transparent" />
    </section>
  );
}
