import Image from 'next/image'

export function SiteFooter({ facebookUrl }: { facebookUrl: string }) {
  return (
    <footer className="border-t border-white/10 bg-rally-card/50 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="flex flex-col gap-4">
          <Image
            src="/images/schriftzug_transparent_kl.png"
            alt="Rallyeclub Klostertal"
            width={180}
            height={36}
            className="h-8 w-auto max-w-[180px] object-contain opacity-90"
            loading="lazy"
          />
          <p className="text-sm text-rally-muted">© {new Date().getFullYear()} Rallyeclub Klostertal. Alle Rechte vorbehalten.</p>
          <p className="text-sm text-rally-muted">
            Made with <span className="text-rally-accent">♥</span> in Vorarlberg
          </p>
        </div>
        <nav aria-label="Footer Navigation" className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            ['#ueber-uns', 'Club'],
            ['#team', 'Team'],
            ['#termine', 'Termine'],
            ['#events', 'Highlights'],
            ['#medien', 'Galerie'],
            ['#mitmachen', 'Mitmachen'],
            ['#kontakt', 'Kontakt'],
            ['#impressum', 'Impressum'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              data-lenis-scroll
              className="min-h-[44px] inline-flex items-center text-sm font-medium text-white/90 hover:text-rally-orange"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-rally-orange hover:text-rally-orange"
            aria-label="Facebook"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M22 12a10 10 0 10-11.5 9.95v-7.05h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2.5h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7.05A10 10 0 0022 12z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
