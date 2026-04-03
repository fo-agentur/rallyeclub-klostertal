import Image from 'next/image'
import type { SiteContent } from '@/lib/schemas/site-content'

export function HighlightsSection({ site }: { site: SiteContent }) {
  if (!site.highlights.length) {
    return null
  }

  return (
    <section id="events" className="events-zone relative scroll-mt-20 border-t border-white/10 py-20 sm:py-24 lg:py-28">
      <div className="events-zone__mesh" aria-hidden />
      <div className="events-zone__aurora" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="events-highlight-hero relative">
          <div className="events-highlight-hero__mega font-display" aria-hidden>
            HIGHLIGHTS
          </div>
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.42em] text-white/55">
                Saison &amp; Formate
              </p>
              <h2 id="headline-events" className="font-display clip-reveal mt-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Highlights
              </h2>
            </div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-white/35">Klostertal</p>
          </div>
          <p id="events-intro" className="relative z-10 mt-5 max-w-2xl text-base leading-relaxed text-rally-muted sm:text-lg">
            Von der Strecke bis zum Festsaal — die Formate, die unseren Kalender prägen.
          </p>
        </header>

        <div className="highlight-grid-wrap highlight-grid-wrap--compact">
          <div
            id="highlight-grid"
            className="highlight-grid highlight-grid--compact mt-10 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
          >
            {site.highlights.map((h, i) => (
              <article
                key={`${h.title}-${i}`}
                className="group highlight-card highlight-card--compact min-h-[220px] sm:min-h-[240px]"
                data-highlight-tilt
                data-highlight-card
              >
                <div className="highlight-card-inner">
                  <div className="highlight-card__media">
                    <Image
                      src={h.imageSrc}
                      alt={h.alt}
                      className="highlight-card__img"
                      width={560}
                      height={420}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                    />
                  </div>
                  <div className="highlight-card__scrim" aria-hidden />
                  <span className="highlight-card__idx" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="highlight-card__frame" aria-hidden />
                  <div className="highlight-card__body highlight-card__body--compact">
                    {h.eyebrow && h.variant === 'feature' ? (
                      <span className="highlight-card__eyebrow">{h.eyebrow}</span>
                    ) : null}
                    <span className="highlight-card__tag">{h.tag}</span>
                    <h3 className="font-display text-lg font-bold leading-snug text-white sm:text-xl">{h.title}</h3>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-white/75">{h.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
