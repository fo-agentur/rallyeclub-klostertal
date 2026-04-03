import type { SiteContent } from '@/lib/schemas/site-content'
import type { TermineItem } from '@/lib/schemas/termine'
import { TermineCalendar } from '@/components/sections/TermineCalendar'

export function TermineSection({ site, termine }: { site: SiteContent; termine: TermineItem[] }) {
  return (
    <section id="termine" className="termine-zone termine-zone--calm relative scroll-mt-20 border-t border-white/10 py-20 sm:py-24 lg:py-28">
      <div className="termine-zone__glow" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="headline-termine" className="font-display clip-reveal text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Termine
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-white/55">{site.seasonLabel}</p>
            <a
              href="#termine-kalender"
              data-lenis-scroll
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/95 backdrop-blur-sm transition hover:border-white/35 hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Kalenderansicht
            </a>
          </div>
        </div>
        <p id="termine-intro" className="mt-6 max-w-3xl text-lg leading-relaxed text-rally-muted">
          {site.termineIntro}{' '}
          <strong className="text-white">Rückfragen:</strong>{' '}
          <a
            className="text-white/90 underline decoration-white/25 underline-offset-4 transition hover:text-white"
            href={`mailto:${site.contactEmail}`}
          >
            {site.contactEmail}
          </a>
          .
        </p>

        <div className="termine-overview mt-10 px-4 py-5 sm:px-6" role="region" aria-label="Termine Kurzübersicht">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">Auf einen Blick</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {site.termineOverviewCards.map((card) => (
              <div key={card.title} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{card.windowLabel}</p>
                <p className="mt-1 font-display text-sm font-bold tabular-nums text-white">{card.windowValue}</p>
                <p className="mt-2 font-display text-base font-bold text-white">{card.title}</p>
                <p className="mt-0.5 text-xs text-rally-muted">{card.subtitle}</p>
                <span
                  className={
                    card.badgeTone === 'accent'
                      ? 'mt-2 inline-flex rounded-full border border-rally-accent/30 bg-rally-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90'
                      : 'mt-2 inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/85'
                  }
                >
                  {card.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div id="termine-track" className="relative mt-12 md:pl-16">
          <div className="termine-line hidden md:block" aria-hidden>
            <div className="termine-line__progress" id="termine-line-progress" />
            <div className="termine-line__pulse" />
          </div>
          <div className="space-y-5 md:space-y-6">
            {termine.map((t, idx) => (
              <article key={t.id} className="termine-card" data-termine-card>
                <span className="termine-card__dot hidden md:block" aria-hidden />
                <div className="relative grid gap-5 p-6 sm:p-8 md:grid-cols-12 md:items-center md:gap-6">
                  <div className="md:col-span-1 md:flex md:justify-center">
                    <span className="termine-card__idx block leading-none">{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="md:col-span-6">
                    <span
                      className={
                        (t.category ?? '').toLowerCase().includes('slalom')
                          ? 'inline-flex rounded-full border border-rally-accent/35 bg-rally-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90'
                          : 'inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/85'
                      }
                    >
                      {t.category ?? 'Event'}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-bold text-white sm:text-2xl">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-rally-muted sm:text-base">{t.location}</p>
                    {t.description ? <p className="mt-1 text-sm text-rally-muted/90">{t.description}</p> : null}
                  </div>
                  <div className="border-t border-white/10 pt-4 md:col-span-5 md:border-l md:border-t-0 md:pl-8 md:pt-0 md:text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Zeitfenster</span>
                    <div className="font-display text-xl font-semibold tabular-nums text-white sm:text-2xl">{t.dateStr}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <TermineCalendar termine={termine} />
      </div>
    </section>
  )
}
