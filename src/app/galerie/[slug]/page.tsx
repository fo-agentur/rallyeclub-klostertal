import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbumBySlug, getAlbumPhotos, listAlbums } from "@/lib/queries/albums";
import { AlbumLightbox } from "@/components/album-lightbox";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Album nicht gefunden" };
  return { title: album.title, description: album.description ?? undefined };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();
  const photos = await getAlbumPhotos(album.id);

  return (
    <article>
      <div className="bg-ink text-white">
        <div className="container-wide py-20 md:py-28">
          <Link
            href="/galerie"
            className="text-xs font-semibold uppercase tracking-widest text-racing hover:underline"
          >
            ← Galerie
          </Link>
          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <h1 className="font-display text-4xl leading-tight tracking-wider md:text-6xl">
              {album.title}
            </h1>
            <span className="text-xs font-semibold uppercase tracking-widest text-racing">
              {photos.length} Fotos
            </span>
          </div>
          {album.date && (
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {formatDate(album.date)}
            </p>
          )}
          {album.description && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-300">
              {album.description}
            </p>
          )}
        </div>
      </div>

      <div className="section">
        <div className="container-wide">
          <AlbumLightbox
            photos={photos.map((p) => ({
              id: p.id,
              url: p.url,
              caption: p.caption,
            }))}
          />
        </div>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    return (await listAlbums()).map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}
