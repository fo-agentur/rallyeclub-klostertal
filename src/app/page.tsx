import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { SponsorStrip } from "@/components/sponsor-strip";
import { EventList } from "@/components/event-list";
import { listPosts } from "@/lib/queries/posts";
import { listUpcomingEvents } from "@/lib/queries/events";
import { listAlbums } from "@/lib/queries/albums";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [posts, upcoming, allAlbums] = await Promise.all([
    listPosts(3),
    listUpcomingEvents(3),
    listAlbums(),
  ]);
  const albums = allAlbums.slice(0, 7);
  const leadPost = posts[0] ?? null;
  const smallPosts = posts.slice(1, 3);

  return (
    <>
      <Hero />

      <section className="bg-ink py-14 text-white">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:gap-10">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <div className="sec-kicker !mb-4 text-racing-100 before:text-racing-100">Kurz gesagt</div>
              <h2 className="max-w-3xl font-display text-[clamp(34px,4vw,58px)] uppercase leading-[0.95] text-white">
                Eine klare Vereinsseite statt digitalem Overload.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76 md:text-base">
                Der Rallyeclub Klostertal steht für ehrlichen Motorsport, starke Veranstaltungen
                und eine lebendige Gemeinschaft. Auf dieser Seite findest du alles Relevante auf
                einen Blick: Termine, News, Galerie und Kontakt.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/news" className="btn-outline-inverse">Aktuelle News</Link>
                <Link href="/galerie" className="btn-outline-inverse">Zur Galerie</Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "1988", lbl: "Gegründet" },
                { num: "30+", lbl: "Slalom-Ausgaben" },
                { num: "VBG", lbl: "Standort" },
                { num: "100%", lbl: "Leidenschaft" },
              ].map((s, i) => (
                <div
                  key={s.lbl}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-racing/40 hover:bg-white/8"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <span className="font-display text-[46px] leading-[0.9] text-racing md:text-[56px]">
                    {s.num}
                  </span>
                  <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {s.lbl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DIAGONAL STRIPE ─────────────────────────────────────── */}
      <div className="diag-stripe" aria-hidden />

      <section className="section section-reveal">
        <div className="container-wide">
          <div className="sec-head">
            <div>
              <div className="sec-kicker">Latest</div>
              <h2 className="sec-title">
                News &amp; <em className="not-italic text-racing">Berichte</em>
              </h2>
            </div>
            <Link href="/news" className="btn-ghost self-end">
              Alle News →
            </Link>
          </div>

          {leadPost ? (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr_1fr]">
              {/* Lead card */}
              <Link href={`/news/${leadPost.slug}`} className="group relative cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden bg-ink">
                  {leadPost.cover_image ? (
                    <Image
                      src={leadPost.cover_image}
                      alt={leadPost.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 60vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-ink-muted">
                      <span className="font-display text-6xl tracking-widest text-racing/50">RCK</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <span className="inline-block rounded-full bg-racing px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                      Bericht · {formatDate(leadPost.published_at)}
                    </span>
                    <h3 className="mt-3 font-display text-[40px] uppercase leading-[0.95] group-hover:text-racing">
                      {leadPost.title}
                    </h3>
                    {leadPost.excerpt && (
                      <p className="mt-2 max-w-[520px] text-sm leading-relaxed opacity-85">
                        {leadPost.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              {/* Small cards */}
              {smallPosts.map((post) => (
                <Link key={post.id} href={`/news/${post.slug}`} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 20vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-ink-muted">
                        <span className="font-display text-4xl tracking-widest text-racing/50">RCK</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-racing">
                      {formatDate(post.published_at)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl uppercase leading-tight group-hover:text-racing">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Noch keine Berichte vorhanden.</p>
          )}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="section section-reveal border-y border-neutral-200 bg-neutral-50">
          <div className="container-wide">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_1.25fr] lg:items-start">
              <div>
                <div className="sec-kicker">Kalender</div>
                <h2 className="sec-title">
                  Nächste <em className="not-italic text-racing">Veranstaltungen</em>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-neutral-600 md:text-base">
                  Hier findest du die nächsten Termine, Rennen und Clubaktivitäten. Schnell
                  erfassbar, ohne lange suchen zu müssen.
                </p>
                <div className="mt-6">
                  <Link href="/veranstaltungen" className="btn-outline">
                    Alle Termine ansehen
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-neutral-200 bg-white p-3 shadow-[0_18px_50px_rgba(20,20,20,0.06)] md:p-4">
                <EventList events={upcoming} emptyLabel="" />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-reveal bg-white py-20 md:py-24">
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <div className="sec-kicker">Der Club</div>
              <h2 className="sec-title">
                Motorsport mit <em className="not-italic text-racing">Substanz</em>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-700">
                Der Rallyeclub Klostertal verbindet sportlichen Anspruch mit einem starken
                Vereinsleben. Im Mittelpunkt stehen der Autoslalom in St. Gallenkirch,
                gemeinsame Ausfahrten, Veranstaltungen und die Begeisterung für ehrlichen
                Motorsport in Vorarlberg.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-700">
                Statt unnötigem Schnickschnack soll diese Seite schnell zeigen, worum es geht:
                was als Nächstes ansteht, was im Club passiert und wie man mit uns in Kontakt
                kommt.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Veranstaltungen', text: 'Alle Rennen, Clubtermine und wichtige Daten auf einen Blick.', href: '/veranstaltungen' },
                { title: 'News', text: 'Berichte, Rückblicke und Neuigkeiten aus dem Vereinsleben.', href: '/news' },
                { title: 'Galerie', text: 'Bilder und Impressionen von Events, Fahrern und Momenten.', href: '/galerie' },
                { title: 'Mitmachen', text: 'Kontakt aufnehmen, Mitglied werden oder einfach vorbeischauen.', href: '/kontakt' },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="group rounded-[24px] border border-neutral-200 bg-neutral-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-racing/40 hover:bg-white hover:shadow-card">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-racing">RCK</div>
                  <h3 className="mt-3 font-display text-2xl uppercase leading-tight text-ink group-hover:text-racing">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-reveal">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="sec-kicker">Bilder &amp; Videos</div>
              <h2 className="sec-title mb-8">Galerie</h2>

              <div className="grid grid-cols-4 auto-rows-[130px] gap-2">
                {albums.length > 0
                  ? albums.map((album, i) => (
                      <Link
                        key={album.id}
                        href={`/galerie/${album.slug}`}
                        className={`group relative overflow-hidden bg-neutral-200 ${
                          i === 0 || i === 5 ? "row-span-2" : ""
                        }`}
                      >
                        {album.cover_image && (
                          <Image
                            src={album.cover_image}
                            alt={album.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="200px"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    ))
                  : Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-neutral-200 ${i === 0 || i === 5 ? "row-span-2" : ""}`}
                      />
                    ))}
              </div>

              <Link href="/galerie" className="btn-ghost mt-6 inline-flex">
                Komplette Galerie →
              </Link>
            </div>

            <div>
              <div className="sec-kicker">Gemeinschaft</div>
              <h2 className="sec-title mb-8">Clubleben</h2>

              <div className="rounded-[28px] border border-neutral-200 bg-[#f7f5f0] p-7">
                <p className="text-base leading-8 text-neutral-700">
                  Der Rallyeclub lebt nicht nur von Rennen, sondern von Menschen, die sich für
                  Motorsport begeistern. Stammtisch, Ausfahrten, Helfer, Fahrer und Freunde des
                  Clubs machen genau diese Mischung aus.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    '/images/Autoslalom.jpg',
                    '/images/Bericht-Kartfahren-Bild.png',
                    '/images/Vorankuendigung.jpg',
                    '/images/gallery/IMG-20150407-WA0034.jpg',
                  ].map((src, i) => (
                    <div key={i} className="group relative aspect-[5/4] overflow-hidden rounded-[18px] bg-neutral-200">
                      <Image
                        src={src}
                        alt="Impression aus dem Clubleben"
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="240px"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/fahrer" className="btn-outline">Aktive Fahrer</Link>
                  <Link href="/mitglieder" className="btn-outline">Mitglieder ansehen</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT + MAP ───────────────────────────────────────── */}
      <section className="bg-ink py-28 text-white">
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            {/* Text */}
            <div>
              <div className="sec-kicker">
                <span className="text-racing">Komm vorbei</span>
              </div>
              <h2 className="font-display text-[clamp(56px,8vw,120px)] uppercase leading-[0.92]">
                <span className="block">Lust auf</span>
                <em className="mt-1 block not-italic text-racing">Motorsport?</em>
              </h2>
              <p className="mt-5 max-w-[480px] text-base leading-relaxed text-neutral-400">
                Stammtisch jeden ersten Freitag im Monat im Vereinslokal. Einfach
                reinschneien — wir beißen nicht. Außer beim Reifenwechsel.
              </p>

              <div className="mt-8 flex flex-col gap-4 text-sm">
                {[
                  { lbl: "Adresse", val: "Amerdonastraße 22 · 6820 Frastanz, Vorarlberg" },
                  { lbl: "Email", val: "info@rallyeclub-klostertal.at" },
                  { lbl: "Stammtisch", val: "1. Freitag im Monat · 19:00" },
                ].map((row) => (
                  <div key={row.lbl} className="flex gap-4">
                    <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      {row.lbl}
                    </span>
                    <span className="text-neutral-300">{row.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/kontakt" className="btn-primary">
                  Mitglied werden
                </Link>
                <Link
                  href="/kontakt"
                  className="inline-flex items-center gap-2 border border-white/40 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:border-white hover:bg-white/10"
                >
                  Nachricht schreiben
                </Link>
              </div>
            </div>

            {/* Map */}
            <div className="relative aspect-[4/3] overflow-hidden border border-white/10">
              <iframe
                src="https://www.google.com/maps?q=Amerdonastra%C3%9Fe+22%2C+6820+Frastanz%2C+Austria&output=embed&z=14"
                className="h-full w-full border-0"
                style={{
                  filter: "invert(0.92) hue-rotate(180deg) saturate(0.6) contrast(0.95)",
                }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                title="Karte Rallyeclub Klostertal"
              />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Amerdonastra%C3%9Fe+22%2C+6820+Frastanz"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 bg-racing px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white shadow-xl transition hover:bg-racing-600"
              >
                In Google Maps öffnen →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPONSORS ────────────────────────────────────────────── */}
      <section className="border-y border-neutral-200 bg-white py-12">
        <div className="container-wide">
          <div className="flex flex-col items-center gap-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Mit Unterstützung von
            </div>
            <SponsorStrip />
          </div>
        </div>
      </section>
    </>
  );
}
