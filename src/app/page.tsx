import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/hero";
import { SponsorStrip } from "@/components/sponsor-strip";
import { PostCard } from "@/components/post-card";
import { EventList } from "@/components/event-list";
import { SectionHeader } from "@/components/section-header";
import { listPosts } from "@/lib/queries/posts";
import { listUpcomingEvents } from "@/lib/queries/events";
import { listAlbums } from "@/lib/queries/albums";

const CLUB_STATS = [
  { value: "1988", label: "Gründungsjahr" },
  { value: "30+", label: "Slalom-Ausgaben" },
  { value: "VBG", label: "Region" },
  { value: "100%", label: "Leidenschaft" },
];

export default async function HomePage() {
  const [posts, upcoming, allAlbums] = await Promise.all([
    listPosts(3),
    listUpcomingEvents(3),
    listAlbums(),
  ]);
  const albums = allAlbums.slice(0, 3);

  return (
    <>
      <Hero />

      {/* About — stat strip + intro text */}
      <section className="section border-b border-neutral-100">
        <div className="container-wide">
          {/* Stat strip */}
          <div className="mb-16 grid grid-cols-2 gap-px bg-neutral-200 sm:grid-cols-4 md:mb-20">
            {CLUB_STATS.map(({ value, label }) => (
              <div key={label} className="bg-white px-6 py-8 text-center">
                <div className="font-display text-4xl tracking-wider text-ink md:text-5xl">
                  {value}
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* 2-col intro */}
          <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
            <div>
              <div className="eyebrow">Der Club</div>
              <h2 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
                Wer wir sind
              </h2>
            </div>
            <div className="space-y-5 text-base leading-relaxed text-neutral-700 md:text-lg">
              <p>
                Der <strong>Rallyeclub Klostertal</strong> vereint Motorsport-Begeisterte aus
                Vorarlberg und dem Klostertal. Seit Jahrzehnten organisieren wir den traditionellen{" "}
                <strong>Autoslalom in St.&nbsp;Gallenkirch</strong>, Kartrennen und gesellige
                Clubevents.
              </p>
              <p>
                Unser Verein steht für ehrlichen Breiten-Motorsport: faire Wertung, saubere
                Kurvenführung und ein offenes Fahrerlager, in dem sich jeder willkommen fühlt — vom
                Neueinsteiger bis zum routinierten Slalom-Piloten.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/mitglieder" className="btn-outline">
                  Zum Vorstand
                </Link>
                <Link href="/reglement" className="btn-ghost">
                  Reglement ansehen →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="section bg-neutral-50">
        <div className="container-wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Veranstaltungen"
              title="Nächste Termine"
              description="Slalom, Kartrennen, Jahreshauptversammlung — was als Nächstes ansteht."
            />
            <Link href="/veranstaltungen" className="btn-ghost self-start md:self-end">
              Alle Termine →
            </Link>
          </div>
          <div className="mt-12">
            <EventList
              events={upcoming}
              emptyLabel="Aktuell sind keine kommenden Termine eingetragen."
            />
          </div>
        </div>
      </section>

      {/* News — featured + sidebar layout */}
      <section className="section">
        <div className="container-wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="News"
              title="Aus dem Fahrerlager"
              description="Berichte, Ergebnisse und Neuigkeiten aus dem Vereinsleben."
            />
            <Link href="/news" className="btn-ghost self-start md:self-end">
              Alle News →
            </Link>
          </div>
          <div className="mt-12">
            {posts.length === 0 ? (
              <p className="text-neutral-500">Aktuell keine Beiträge vorhanden.</p>
            ) : posts.length === 1 ? (
              <div className="max-w-lg">
                <PostCard post={posts[0]} featured />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <PostCard post={posts[0]} featured />
                </div>
                <div className="flex flex-col gap-6 lg:col-span-2">
                  {posts.slice(1).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery teaser — asymmetric grid */}
      <section className="section bg-ink text-white">
        <div className="container-wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="eyebrow">Galerie</div>
              <h2 className="mt-3 font-display text-4xl tracking-wider text-white md:text-5xl">
                Impressionen
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-neutral-400 md:text-base">
                Fotos vom Slalom, den Clubausfahrten und den geselligen Abenden des Rallyeclub
                Klostertal.
              </p>
            </div>
            <Link
              href="/galerie"
              className="self-start border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white/80 transition hover:border-white/60 hover:text-white md:self-end"
            >
              Alle Alben →
            </Link>
          </div>

          {/* Galerie-Teaser, abhängig von verfügbarer Anzahl */}
          {albums.length > 2 ? (
            <div className="mt-12 grid gap-3 lg:grid-cols-3 lg:[grid-template-rows:260px_260px]">
              <Link
                href={`/galerie/${albums[0].slug}`}
                className="group relative block aspect-[4/3] overflow-hidden lg:col-span-2 lg:row-span-2 lg:aspect-auto"
              >
                {albums[0].cover_image && (
                  <Image
                    src={albums[0].cover_image}
                    alt={albums[0].title}
                    fill
                    className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                    sizes="(min-width: 1024px) 66vw, 100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                    {albums[0].photo_count} Fotos
                  </div>
                  <h3 className="mt-1 text-2xl font-semibold text-white transition group-hover:text-racing md:text-3xl">
                    {albums[0].title}
                  </h3>
                </div>
              </Link>

              {albums.slice(1, 3).map((album) => (
                <Link
                  key={album.id}
                  href={`/galerie/${album.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden lg:aspect-auto"
                >
                  {album.cover_image && (
                    <Image
                      src={album.cover_image}
                      alt={album.title}
                      fill
                      className="object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-85"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                      {album.photo_count} Fotos
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-white transition group-hover:text-racing">
                      {album.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : albums.length === 2 ? (
            <div className="mt-12 grid gap-3 md:grid-cols-2">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/galerie/${album.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden"
                >
                  {album.cover_image && (
                    <Image
                      src={album.cover_image}
                      alt={album.title}
                      fill
                      className="object-cover opacity-65 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                      {album.photo_count} Fotos
                    </div>
                    <h3 className="mt-1 text-xl font-semibold text-white transition group-hover:text-racing">
                      {album.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : albums.length === 1 ? (
            <div className="mt-12">
              <Link
                href={`/galerie/${albums[0].slug}`}
                className="group relative block aspect-[16/9] overflow-hidden"
              >
                {albums[0].cover_image && (
                  <Image
                    src={albums[0].cover_image}
                    alt={albums[0].title}
                    fill
                    className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                    sizes="100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                    {albums[0].photo_count} Fotos
                  </div>
                  <h3 className="mt-1 text-2xl font-semibold text-white transition group-hover:text-racing md:text-3xl">
                    {albums[0].title}
                  </h3>
                </div>
              </Link>
            </div>
          ) : (
            <div className="mt-12 border border-white/10 bg-white/[0.03] px-6 py-8 text-sm text-neutral-400">
              Aktuell sind noch keine Galerie-Alben veröffentlicht.
            </div>
          )}
        </div>
      </section>

      {/* Sponsors */}
      <section className="border-y border-neutral-200 bg-white py-14">
        <div className="container-wide">
          <div className="flex flex-col items-center gap-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Mit Unterstützung von
            </div>
            <SponsorStrip />
          </div>
        </div>
      </section>
    </>
  );
}
