import type { SiteContent } from '@/lib/schemas/site-content'

export function ImpressumSection({ site }: { site: SiteContent }) {
  return (
    <section id="impressum" className="border-t border-white/10 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-white">Impressum</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-rally-muted">
          <strong className="text-white">Rallyeclub Klostertal</strong>
          <br />
          Vorarlberg, Österreich
          <br />
          Kontakt:{' '}
          <a className="text-rally-orange underline" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
          <br />
          <span className="text-rally-muted/80">Vollständige Impressumsangaben folgen nach redaktioneller Freigabe.</span>
        </p>
      </div>
    </section>
  )
}
