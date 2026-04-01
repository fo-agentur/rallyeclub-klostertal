import Image from 'next/image'
import type { SiteContent } from '@/lib/schemas/site-content'

export function HighlightsSection({ site }: { site: SiteContent }) {
  if (!site.highlights.length) {
    return null
  }
  const [feature, ...rest] = site.highlights

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
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.42em] text-rally-orange/90">Saison &amp; Formate</p>
              <h2 id="headline-events" className="font-display clip-reveal mt-2 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Highlights
              </h2>
            </div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-white/35">Klostertal</p>
          </div>
          <p id="events-intro" className="relative z-10 mt-5 max-w-2xl text-base leading-relaxed text-rally-muted sm:text-lg">
            Von der Strecke bis zum Festsaal — das sind die Stationen, die unseren Kalender prägen.
          </p>
        </header>

        <div className="highlight-grid-wrap">
          <div
            id="highlight-grid"
            className="highlight-grid mt-12 grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 sm:gap-5 md:mt-14 md:grid-cols-12"
          >
            {feature ? (
              <article
                className="group highlight-card highlight-card--feature md:col-span-7 md:row-span-2 min-h-[320px] md:min-h-[420px]"
                data-highlight-tilt
                data-highlight-card
              >
                <div className="highlight-card-inner">
                  <div className="highlight-card__media">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.alt}
                      className="highlight-card__img"
                      width={800}
                      height={600}
                      loading="lazy"
                    />
                  </div>
                  <div className="highlight-card__scrim" aria-hidden />
                  <span className="highlight-card__frame" aria-hidden />
                  <div className="highlight-card__body highlight-card__body--feature">
                    {feature.eyebrow ? <span className="highlight-card__eyebrow">{feature.eyebrow}</span> : null}
                    <span className="highlight-card__tag">{feature.tag}</span>
                    <h3 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">{feature.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">{feature.description}</p>
                  </div>
                </div>
              </article>
            ) : null}
            {rest.map((h, i) => (
              <article
                key={`${h.title}-${i}`}
                className="group highlight-card md:col-span-5 min-h-[200px]"
                data-highlight-tilt
                data-highlight-card
              >
                <div className="highlight-card-inner">
                  <div className="highlight-card__media">
                    <Image src={h.imageSrc} alt={h.alt} className="highlight-card__img" width={800} height={600} loading="lazy" />
                  </div>
                  <div className="highlight-card__scrim" aria-hidden />
                  <span className="highlight-card__idx" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="highlight-card__frame" aria-hidden />
                  <div className="highlight-card__body min-h-[11rem] sm:min-h-[12rem]">
                    <span className="highlight-card__tag">{h.tag}</span>
                    <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/78">{h.description}</p>
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
