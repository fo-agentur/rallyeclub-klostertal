import Image from 'next/image'
import type { SiteContent } from '@/lib/schemas/site-content'

export function UberUnsSection({ site }: { site: SiteContent }) {
  return (
    <section id="ueber-uns" className="club-zone relative scroll-mt-20 border-t border-white/[0.07] py-20 sm:py-24 lg:py-32">
      <div className="club-zone__mesh" aria-hidden />
      <div className="club-zone__aurora" aria-hidden />
      <div className="club-zone__gridlines" aria-hidden />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="club-hero">
          <div className="club-hero__mega font-display" aria-hidden>
            CLUB
          </div>
          <div className="club-hero__inner">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="headline-ueber" className="font-display clip-reveal text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Der Club
              </h2>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-rally-orange/90 sm:text-xs">Story · Klostertal</p>
            </div>
            <p id="club-intro" className="mt-5 max-w-2xl text-base leading-relaxed text-rally-muted sm:text-lg">
              Von der ersten Idee bis zur Startaufstellung: unsere Geschichte in vier Takten — und warum sich’s lohnt, reinzuschauen.
            </p>
          </div>
        </header>

        <blockquote id="club-pullquote" className="club-pullquote club-pullquote--cinema relative z-10 mt-12 max-w-4xl sm:mt-14">
          <p>
            Asphalt, Schotter, Adrenalin — und ein Team, das zusammenhält.
            <span className="text-rally-orange"> Das ist Rallyeclub Klostertal.</span>
          </p>
        </blockquote>

        <div className="club-visual-strip" aria-label="Impressionen aus Vereins-Chronik und Slalom-Terminen">
          <div className="club-visual-strip__track">
            {site.clubStripImages.map((img) => (
              <figure key={img.src}>
                <Image src={img.src} alt={img.alt} width={400} height={300} className="h-auto w-full object-cover" loading="lazy" />
              </figure>
            ))}
          </div>
          <p className="border-t border-white/[0.06] px-4 py-2.5 text-center text-[11px] text-rally-muted/90 sm:text-xs">
            Motive aus Slalom, Gala und Vereinsleben — dieselben Themen wie auf der früheren Website.
          </p>
        </div>

        <div id="club-main-grid" className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div id="club-timeline" className="relative pl-1">
            <div className="club-timeline__line" aria-hidden>
              <div className="club-timeline__fill" id="club-timeline-fill" />
            </div>
            <article className="club-step" data-club-step>
              <span className="club-step__dot" aria-hidden />
              <span className="club-step__idx" aria-hidden>
                01
              </span>
              <div className="club-step__body relative z-[1]">
                <span className="club-step__year">2008</span>
                <h3 className="club-step__title">Die Zündung</h3>
                <p>
                  Eine Handvoll Motorsportfans im <strong className="font-semibold text-white">Klostertal</strong> — keine großen
                  Budgets, sondern echte Leidenschaft fürs Fahren und fairen Wettkampf.
                </p>
              </div>
            </article>
            <article className="club-step" data-club-step>
              <span className="club-step__dot" aria-hidden />
              <span className="club-step__idx" aria-hidden>
                02
              </span>
              <div className="club-step__body relative z-[1]">
                <span className="club-step__year">Wachstum</span>
                <h3 className="club-step__title">Slalom &amp; Publikum</h3>
                <p>
                  <strong className="font-semibold text-white">Autoslaloms</strong>, erste feste Termine, volle Startfelder — der Club
                  wächst mit jeder Saison.
                </p>
              </div>
            </article>
            <article className="club-step" data-club-step>
              <span className="club-step__dot" aria-hidden />
              <span className="club-step__idx" aria-hidden>
                03
              </span>
              <div className="club-step__body relative z-[1]">
                <span className="club-step__year">Heute</span>
                <h3 className="club-step__title">Gemeinschaft</h3>
                <p>
                  Ehrenamt, Events und ein starkes Netzwerk — <span className="text-white">Rallyeclub Klostertal</span> steht für
                  Motorsport mit Herz.
                </p>
              </div>
            </article>
          </div>
          <div id="ueber-img-wrap" className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <Image
                src="/images/headers/1.png"
                alt="Vereinsimpression — Autoslalom"
                width={800}
                height={600}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
