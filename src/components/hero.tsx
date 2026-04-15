import Image from "next/image";
import Link from "next/link";

const HERO_IMAGES = [
  { src: "/hero/1.png", alt: "Autoslalom St. Gallenkirch" },
  { src: "/hero/2.png", alt: "Motorsport im Klostertal" },
  { src: "/hero/3.png", alt: "Rallyeclub Klostertal Event" },
  { src: "/hero/4.png", alt: "Rallyeclub Klostertal Fahrzeug" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 opacity-40">
        <div className="grid h-full grid-cols-2 md:grid-cols-4">
          {HERO_IMAGES.map((img) => (
            <div key={img.src} className="relative h-full">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 40%, rgba(10,10,10,0.95) 100%)",
        }}
      />

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
