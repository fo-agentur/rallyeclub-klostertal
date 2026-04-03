import Image from 'next/image'
import type { SiteContent } from '@/lib/schemas/site-content'
import { HeroTitleSplit } from '@/components/sections/HeroTitleSplit'

export function HeroSection({ site }: { site: SiteContent }) {
  const { heroSlides, heroTagline, social } = site

  return (
    <section id="hero" className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden">
      <div id="hero-slides" className="absolute inset-0" role="img" aria-label="Impressionen Rallyeclub Klostertal — Slideshow">
        {heroSlides.map((slide, i) => (
          <div
            key={`${slide.imageSrc}-${i}`}
            className={`hero-slide ${i === 0 ? 'is-active' : ''}`}
            style={{ backgroundImage: `url('${slide.imageSrc}')` }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/88 via-black/42 to-black/[0.93]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_65%_at_50%_22%,rgba(185,28,28,0.12),transparent_58%)]"
        aria-hidden
      />
      <div className="hero-noise pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-soft-light" aria-hidden />
      <div className="hero-inner relative z-10 flex max-w-4xl flex-col items-center px-4 pb-[env(safe-area-inset-bottom,0px)] pt-[max(5.5rem,calc(4.5rem+env(safe-area-inset-top,0px)))] text-center sm:px-6 sm:pt-28">
        <Image
          src="/images/schriftzug_transparent_kl.png"
          alt=""
          width={400}
          height={120}
          className="mb-8 w-full max-w-[min(400px,90vw)] object-contain drop-shadow-[0_8px_40px_rgba(0,0,0,0.65)]"
          priority
        />
        <h1 className="hero-glow-text font-display text-[clamp(1.65rem,6.5vw+0.5rem,6rem)] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          <HeroTitleSplit />
        </h1>
        <p id="hero-sub" className="mt-6 max-w-xl text-base font-medium text-white/85 sm:text-lg md:text-xl">
          {heroTagline}
        </p>
        <div className="mt-10 flex w-full max-w-lg flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <a
            href="#termine"
            data-lenis-scroll
            className="glow-pulse inline-flex min-h-[48px] min-w-[44px] flex-1 items-center justify-center rounded-full bg-rally-accent px-8 py-3 text-base font-semibold text-white shadow-lg shadow-black/25 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-initial"
          >
            Zu den Terminen
          </a>
          <a
            href={social.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] min-w-[44px] flex-1 items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[#1877F2]/80 hover:bg-[#1877F2]/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2] sm:flex-initial sm:px-7"
          >
            <Image
              src="/images/icons/Facebook_logo.png"
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px] shrink-0 opacity-95"
            />
            {social.heroFacebookButtonLabel ?? 'Fotos & News auf Facebook'}
          </a>
        </div>
      </div>
      <div
        className="scroll-indicator absolute bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] left-1/2 z-10 -translate-x-1/2 sm:bottom-8"
        aria-hidden
      >
        <div className="scroll-arrow flex flex-col items-center gap-1 text-white/70">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}
