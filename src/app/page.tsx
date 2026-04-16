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

      {/* Intro */}
      <section className="section border-b border-neutral-200">
        <div className="container-wide grid gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
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
            <EventList events={upcoming} emptyLabel="Aktuell sind keine kommenden Termine eingetragen." />
          </div>
        </div>
      </section>

      {/* News */}
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
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="section bg-ink text-white">
        <div className="container-wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="eyebrow">Galerie</div>
              <h2 className="mt-3 font-display text-4xl tracking-wider text-white md:text-5xl">
                Impressionen
              </h2>
              <p className="mt-4 text-base leading-relaxed text-neutral-400">
                Fotos vom Slalom, den Clubausfahrten und den geselligen Abenden des Rallyeclub
                Klostertal.
              </p>
            </div>
            <Link
              href="/galerie"
              className="self-start border border-white/30 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-white hover:text-ink md:self-end"
            >
              Alle Alben →
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
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
                    className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-racing">
                    {album.photo_count} Fotos
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-racing">
                    {album.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
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
