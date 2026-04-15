import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listAlbums } from "@/lib/queries/albums";
import { formatDate } from "@/lib/utils";
import { deleteAlbumAction } from "./actions";

export default async function AdminAlbumsPage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const albums = await listAlbums();

  return (
    <div className="section">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
            >
              ← Dashboard
            </Link>
            <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
              Galerie
            </h1>
          </div>
          <Link href="/admin/galerie/neu" className="btn-primary">
            + Neu
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {albums.length === 0 && (
            <div className="col-span-full border border-neutral-200 bg-white p-8 text-sm text-neutral-500">
              Noch keine Alben.
            </div>
          )}
          {albums.map((a) => (
            <div key={a.id} className="border border-neutral-200 bg-white">
              <div className="relative aspect-video bg-neutral-100">
                {a.cover_image ? (
                  <Image
                    src={a.cover_image}
                    alt={a.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    kein Coverbild
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="font-display text-lg tracking-wider text-ink">{a.title}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {a.date ? formatDate(a.date) : "ohne Datum"} · {a.photo_count} Fotos
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/admin/galerie/${a.id}`}
                    className="btn-outline !px-4 !py-2 text-xs"
                  >
                    Bearbeiten
                  </Link>
                  <form action={deleteAlbumAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button
                      type="submit"
                      className="border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 transition hover:border-racing hover:text-racing"
                    >
                      Löschen
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
