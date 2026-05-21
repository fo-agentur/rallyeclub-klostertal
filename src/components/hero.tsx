"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
const RING_R = 18;
const RING_C = 2 * Math.PI * RING_R;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [speedlineKey, setSpeedlineKey] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // Auto-advance with smooth progress ring
  useEffect(() => {
    startRef.current = performance.now();
    setProgress(0);

    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / INTERVAL_MS);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIndex((i) => (i + 1) % SLIDES.length);
        setSpeedlineKey((k) => k + 1);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [index]);

  const goTo = (i: number) => {
    if (i === index) return;
    setIndex(i);
    setSpeedlineKey((k) => k + 1);
  };

  return (
    <section className="relative flex min-h-[calc(100svh-74px)] flex-col overflow-hidden bg-ink text-white lg:min-h-[calc(100svh-80px)]">
      {/* Slide images */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover object-center transition-opacity duration-[1200ms] ease-out motion-safe:animate-hero-zoom ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Speedlines triggered on slide change */}
      <div key={speedlineKey} className="pointer-events-none absolute inset-0 z-[5] motion-reduce:hidden">
        <div className="hero-speedline run" />
        <div className="hero-speedline hero-speedline-2 run" />
      </div>

      {/* Color & vignette overlays */}
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

      {/* Hero copy */}
      <div className="container-wide relative z-10 flex flex-1 flex-col justify-center py-16 md:py-24">
        <div className="max-w-4xl animate-fade-up">
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

      {/* Bottom info bar with speedo progress ring + dot indicators */}
      <div className="relative z-10 border-t border-white/10 bg-black/28 backdrop-blur-sm">
        <div className="container-wide grid gap-3 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72 sm:text-[11px] md:grid-cols-3 md:items-center">
          <span>↘ Tradition seit 1988</span>

          <div
            className="flex items-center justify-start gap-3 md:justify-center"
            role="tablist"
            aria-label="Hero-Bilder"
          >
            {/* Speedo progress ring */}
            <span className="relative inline-flex h-10 w-10 items-center justify-center motion-reduce:hidden">
              <svg
                viewBox="0 0 44 44"
                className="absolute inset-0 h-full w-full -rotate-90"
                aria-hidden
              >
                <circle cx="22" cy="22" r={RING_R} stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" />
                <circle
                  cx="22"
                  cy="22"
                  r={RING_R}
                  stroke="currentColor"
                  className="text-racing"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - progress)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 80ms linear" }}
                />
              </svg>
              <span className="font-display text-[11px] leading-none text-white/85">
                {String(index + 1).padStart(2, "0")}
              </span>
            </span>

            {/* Dot tabs */}
            <span className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Bild ${i + 1} anzeigen`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded transition-all duration-300 ${
                    i === index ? "w-7 bg-racing" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </span>
          </div>

          <span className="md:text-right">Slalom · Rallye · Clubleben</span>
        </div>
      </div>
    </section>
  );
}
