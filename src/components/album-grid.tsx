import Image from "next/image";
import Link from "next/link";
import type { AlbumWithCount } from "@/lib/queries/albums";
import { formatDate } from "@/lib/utils";

export function AlbumGrid({ albums }: { albums: AlbumWithCount[] }) {
  if (albums.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500">
        Noch keine Alben veröffentlicht.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {albums.map((album) => (
        <Link
          key={album.id}
          href={`/galerie/${album.slug}`}
          className="group relative block overflow-hidden bg-ink"
        >
          <div className="relative aspect-[4/3]">
            {album.cover_image ? (
              <Image
                src={album.cover_image}
                alt={album.title}
                fill
                className="object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-ink text-racing">
                <span className="font-display text-5xl tracking-widest opacity-60">RCK</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-baseline gap-3">
              {album.date && (
                <span className="text-xs font-semibold uppercase tracking-widest text-racing">
                  {formatDate(album.date, "yyyy")}
                </span>
              )}
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {album.photo_count} {album.photo_count === 1 ? "Foto" : "Fotos"}
              </span>
            </div>
            <h3 className="mt-2 text-xl font-semibold leading-tight text-white group-hover:text-racing">
              {album.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
