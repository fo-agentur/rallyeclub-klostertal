export function MitmachenSection() {
  return (
    <section id="mitmachen" className="relative scroll-mt-20 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="headline-mitmachen" className="font-display clip-reveal text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Werde Teil des Clubs
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">
          Du liebst Motorsport? Du willst dabei sein? Werde Mitglied im Rallyeclub Klostertal.
        </p>
        <div id="feature-cards" className="mt-14 grid gap-6 md:grid-cols-3">
          <article className="feature-card glass rounded-2xl p-8">
            <div className="text-3xl" aria-hidden>
              🏁
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-white">Wettkampf</h3>
            <p className="mt-2 text-rally-muted">Autoslaloms, Bergrennen und mehr — immer nah am Geschehen.</p>
          </article>
          <article className="feature-card glass rounded-2xl p-8">
            <div className="text-3xl" aria-hidden>
              🏆
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-white">Community</h3>
            <p className="mt-2 text-rally-muted">50+ Gleichgesinnte aus dem Klostertal.</p>
          </article>
          <article className="feature-card glass rounded-2xl p-8">
            <div className="text-3xl" aria-hidden>
              🎉
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-white">Gala Abend</h3>
            <p className="mt-2 text-rally-muted">Jährliche Feier mit Preisverleihung.</p>
          </article>
        </div>
        <div className="mt-14 flex justify-center">
          <a
            href="#kontakt"
            data-lenis-scroll
            className="glow-pulse inline-flex min-h-[48px] min-w-[44px] items-center justify-center rounded-full bg-gradient-to-r from-rally-accent to-rally-orange px-10 py-4 text-lg font-semibold text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Mitglied werden
          </a>
        </div>
      </div>
    </section>
  )
}
