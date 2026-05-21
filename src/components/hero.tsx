"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/images/headers/hero-hq-1.png",
    alt: "Autoslalom des Rallyeclub Klostertal in St. Gallenkirch",
  },
  {
    src: "/images/headers/hero-hq-2.png",
    alt: "Rallyefahrzeug des Rallyeclub Klostertal im Einsatz",
  },
  {
    src: "/images/headers/hero-hq-3.png",
    alt: "Clubleben und Motorsport im Klostertal",
  },
];

const INTERVAL_MS = 6000;

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100svh-74px)] flex-col overflow-hidden bg-ink text-white lg:min-h-[calc(100svh-80px)]">
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover object-center transition-opacity duration-1000 ease-out motion-safe:animate-hero-zoom ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

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

      <div className="container-wide relative z-10 flex flex-1 flex-col justify-center py-16 md:py-24">
        <div className="max-w-4xl animate-fade-up">
          <div className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-white/15 bg-white/6 px-4 py-2 backdrop-blur-sm">
            <span className="h-[2px] w-8 shrink-0 bg-racing" />
            <span className="text-[10px] font-semibold uppercase leading-snug tracking-[0.18em] text-racing-100 sm:hidden">
              RCK · seit 1988
            </span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-racing-100 sm:inline">
              Rallyeclub Klostertal · seit 1988 · Vorarlberg
            </span>
          </div>

          <h1
            className="max-w-5xl font-display text-[clamp(40px,8vw,112px)] uppercase leading-[0.92] tracking-wide text-white"
            style={{ textShadow: "0 8px 40px rgba(0,0,0,.35)" }}
          >
            <span className="block">Der Club für</span>
            <em className="mt-1 block not-italic text-racing">Motorsport im Klostertal.</em>
          </h1>

          <p className="mt-5 max-w-[640px] text-sm leading-relaxed text-white/82 sm:text-base md:mt-6 md:text-lg">
            Autoslalom, Clubleben und echte Leidenschaft für Motorsport. Hier findest du
            Termine, News, Bilder und alles Wichtige rund um den Rallyeclub Klostertal —
            klar, schnell und ohne Umwege.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 md:mt-9">
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
        <div className="container-wide grid gap-3 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 sm:text-[11px] md:grid-cols-3 md:items-center">
          <span>↘ Tradition seit 1988</span>
          <div
            className="flex items-center justify-start gap-2 md:justify-center"
            role="tablist"
            aria-label="Hero-Bilder"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Bild ${i + 1} anzeigen`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded transition-all ${
                  i === index ? "w-7 bg-racing" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <span className="md:text-right">Slalom · Rallye · Clubleben</span>
        </div>
      </div>
    </section>
  );
}
