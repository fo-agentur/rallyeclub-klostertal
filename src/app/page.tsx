import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { SponsorStrip } from "@/components/sponsor-strip";
import { EventList } from "@/components/event-list";
import { listPosts } from "@/lib/queries/posts";
import { listUpcomingEvents } from "@/lib/queries/events";
import { listAlbums } from "@/lib/queries/albums";
import { DRIVERS } from "@/content/drivers";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [posts, upcoming, allAlbums] = await Promise.all([
    listPosts(3),
    listUpcomingEvents(3),
    listAlbums(),
  ]);
  const albums = allAlbums.slice(0, 6);
  const leadPost = posts[0] ?? null;
  const smallPosts = posts.slice(1, 3);

  return (
    <>
      <Hero />

      {/* ── STATS STRIP ─────────────────────────────────────────── */}
      <section className="bg-ink py-14 text-white">
        <div className="container-wide">
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-y-0">
            {[
              { num: "1979", lbl: "Gegründet" },
              { num: "47", lbl: "Mitglieder" },
              { num: "14", lbl: "Aktive Fahrer" },
              { num: "∞", lbl: "PS-Liebe" },
            ].map((s, i) => (
              <div
                key={s.lbl}
                className="flex flex-col gap-1 border-l border-white/10 pl-7 first:border-l-0 first:pl-0"
              >
                <span className="font-display text-[72px] leading-[0.9] text-racing">
                  {s.num}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {s.lbl}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIAGONAL STRIPE ─────────────────────────────────────── */}
      <div className="diag-stripe" aria-hidden />

      {/* ── NEWS ────────────────────────────────────────────────── */}
      <section className="section">
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
              <Link
                href={`/news/${leadPost.slug}`}
                className="group relative cursor-pointer"
              >
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
              <div className="flex flex-col gap-6 lg:col-span-2 lg:flex-none lg:contents">
                {smallPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    className="group cursor-pointer"
                  >
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
                      <p className="mt-2 text-sm leading-relaxed text-neutral-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Noch keine Berichte vorhanden.</p>
          )}
        </div>
      </section>

      {/* ── UPCOMING EVENTS ─────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="section border-y border-neutral-200 bg-neutral-50">
          <div className="container-wide">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="sec-kicker">Kalender</div>
                <h2 className="sec-title">
                  Nächste <em className="not-italic text-racing">Termine</em>
                </h2>
              </div>
              <Link href="/veranstaltungen" className="btn-ghost self-start md:self-end">
                Alle Termine →
              </Link>
            </div>
            <div className="mt-10">
              <EventList events={upcoming} emptyLabel="" />
            </div>
          </div>
        </section>
      )}

      {/* ── AKTIVE FAHRER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f0ebe1] py-28">
        {/* Red diagonal clip at top */}
        <div
          className="absolute inset-x-0 top-0 h-14 bg-racing"
          style={{ clipPath: "polygon(0 0,100% 0,100% 100%,0 35%)" }}
          aria-hidden
        />
        <div className="absolute inset-x-0 top-8 h-1.5 bg-ink" aria-hidden />

        <div className="container-wide relative">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="sec-kicker">Crew</div>
              <h2 className="sec-title">
                Aktive <em className="not-italic text-racing">Fahrer</em>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-600 md:text-right">
              Slalom, Rallye und Bergrennen — unsere Fahrer auf Asphalt.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-7">
            {DRIVERS.map((driver, i) => (
              <div
                key={driver.name}
                className="group cursor-pointer border-2 border-ink bg-white p-2 transition duration-200 hover:z-10 hover:scale-105 hover:shadow-xl"
                style={{ transform: `rotate(${i % 2 === 0 ? "-1.5deg" : "1.5deg"})` }}
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-200">
                  {driver.photo ? (
                    <Image
                      src={driver.photo}
                      alt={driver.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-neutral-300">
                      <span className="font-display text-2xl text-neutral-500">?</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center font-display text-lg uppercase tracking-wide leading-tight">
                  {driver.name}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/fahrer" className="btn-primary">
              Alle Fahrer &amp; Mitglieder →
            </Link>
          </div>
        </div>
      </section>

      {/* ── GALLERY + SOCIAL ────────────────────────────────────── */}
      <section className="section">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
            {/* Gallery */}
            <div>
              <div className="sec-kicker">Bilder &amp; Videos</div>
              <h2 className="sec-title mb-8">Galerie</h2>

              {albums.length > 0 ? (
                <div className="grid grid-cols-4 auto-rows-[130px] gap-2">
                  {albums.slice(0, 7).map((album, i) => (
                    <Link
                      key={album.id}
                      href={`/galerie/${album.slug}`}
                      className={`group relative overflow-hidden bg-neutral-200 ${i === 0 || i === 5 ? "row-span-2" : ""}`}
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
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 auto-rows-[130px] gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`bg-neutral-200 ${i === 0 || i === 5 ? "row-span-2" : ""}`}
                    />
                  ))}
                </div>
              )}

              <Link href="/galerie" className="btn-ghost mt-6 inline-flex">
                Komplette Galerie →
              </Link>
            </div>

            {/* Social wall */}
            <div>
              <div className="sec-kicker">@rallyeclub_klostertal</div>
              <h2 className="sec-title mb-8">Social Wall</h2>

              <div className="grid grid-cols-2 gap-2">
                {[
                  "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80",
                  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=400&q=80",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden bg-neutral-200"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="200px"
                    />
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-ink">
                      IG
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://www.instagram.com/rallyeclub_klostertal"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-5 inline-flex"
              >
                Auf Instagram folgen →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT + MAP ───────────────────────────────────────── */}
      <section className="bg-ink py-28 text-white">
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 lg:items-center">
            {/* Text */}
            <div>
              <div className="sec-kicker" style={{ color: "var(--racing-color,#E10600)" }}>
                <span className="text-racing">Komm vorbei</span>
              </div>
              <h2 className="font-display text-[clamp(56px,8vw,120px)] uppercase leading-[0.92]">
                Lust auf
                <br />
                <em className="not-italic text-racing">Motorsport?</em>
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
