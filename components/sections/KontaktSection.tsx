import type { SiteContent } from '@/lib/schemas/site-content'
import { mapEmbedSrcFromSearchUrl } from '@/lib/map-embed'
import { KontaktForm } from '@/components/client/KontaktForm'

export function KontaktSection({ site }: { site: SiteContent }) {
  const embed = mapEmbedSrcFromSearchUrl(site.mapSearchUrl)
  const fbDisplay = site.social.facebookUrl.replace(/^https?:\/\/(www\.)?/, '')

  return (
    <section id="kontakt" className="relative scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="headline-kontakt" className="font-display clip-reveal text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Kontakt
        </h2>
        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div id="kontakt-map-block" className="flex flex-col gap-6">
            <div className="space-y-4 text-lg">
              <p>
                <span className="text-rally-muted">E-Mail:</span>
                <br />
                <a
                  className="min-h-[44px] inline-flex items-center font-medium text-white underline decoration-rally-accent/50 underline-offset-4 hover:text-rally-orange"
                  href={`mailto:${site.contactEmail}`}
                >
                  {site.contactEmail}
                </a>
              </p>
              <p>
                <span className="text-rally-muted">Facebook:</span>
                <br />
                <a
                  className="min-h-[44px] inline-flex items-center break-all font-medium text-white underline decoration-rally-accent/50 underline-offset-4 hover:text-rally-orange"
                  href={site.social.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {fbDisplay}
                </a>
              </p>
              {site.social.instagramUrl ? (
                <p>
                  <span className="text-rally-muted">Instagram:</span>
                  <br />
                  <a
                    className="min-h-[44px] inline-flex items-center break-all font-medium text-white underline decoration-rally-accent/50 underline-offset-4 hover:text-rally-orange"
                    href={site.social.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {site.social.instagramUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </p>
              ) : null}
              {site.social.youtubeUrl ? (
                <p>
                  <span className="text-rally-muted">YouTube:</span>
                  <br />
                  <a
                    className="min-h-[44px] inline-flex items-center break-all font-medium text-white underline decoration-rally-accent/50 underline-offset-4 hover:text-rally-orange"
                    href={site.social.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {site.social.youtubeUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </p>
              ) : null}
            </div>
            <div>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-rally-orange/90">Standort</p>
              <p className="mt-2 text-sm text-rally-muted">Klostertal, Vorarlberg — interaktive Karte (Google Maps).</p>
              <div className="map-embed mt-4 overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.6)]">
                <iframe
                  title="Google Maps — Klostertal, Vorarlberg"
                  className="h-72 min-h-[280px] w-full border-0 sm:h-80"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={embed}
                />
              </div>
              <a
                className="mt-3 inline-flex min-h-[44px] items-center text-sm font-medium text-rally-orange underline decoration-white/20 underline-offset-4 transition hover:text-white"
                href={site.mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Größere Karte in Google Maps öffnen
              </a>
            </div>
          </div>
          <KontaktForm />
        </div>
      </div>
    </section>
  )
}
