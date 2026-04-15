import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getAlbumById, getAlbumPhotos } from "@/lib/queries/albums";
import { AlbumForm } from "../album-form";
import { PhotoUpload } from "./photo-upload";
import { deletePhotoAction, setCoverAction } from "../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditAlbumPage({ params }: Props) {
  if (!(await isAuthenticated())) redirect("/admin");
  const { id } = await params;
  const albumId = Number(id);
  const album = await getAlbumById(albumId);
  if (!album) notFound();
  const photos = await getAlbumPhotos(albumId);

  return (
    <div className="section">
      <div className="container-wide">
        <Link
          href="/admin/galerie"
          className="text-xs font-semibold uppercase tracking-widest text-neutral-500 hover:text-ink"
        >
          ← Galerie
        </Link>
        <h1 className="mt-3 font-display text-4xl tracking-wider text-ink md:text-5xl">
          Album bearbeiten
        </h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-2xl tracking-wider text-ink">Details</h2>
            <div className="mt-6">
              <AlbumForm
                initial={{
                  id: album.id,
                  title: album.title,
                  slug: album.slug,
                  date: album.date?.slice(0, 10) ?? "",
                  description: album.description,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl tracking-wider text-ink">
                Fotos <span className="text-neutral-400">({photos.length})</span>
              </h2>
            </div>

            <div className="mt-6">
              <PhotoUpload albumId={album.id} />
            </div>

            {photos.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                {photos.map((p) => {
                  const isCover = album.cover_image === p.url;
                  return (
                    <div
                      key={p.id}
                      className="group relative aspect-square overflow-hidden border border-neutral-200 bg-neutral-100"
                    >
                      <Image
                        src={p.url}
                        alt={p.caption ?? ""}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 33vw, 50vw"
                      />
                      {isCover && (
                        <span className="absolute left-2 top-2 bg-racing px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                        {!isCover && (
                          <form action={setCoverAction}>
                            <input type="hidden" name="photo_id" value={p.id} />
                            <input type="hidden" name="album_id" value={album.id} />
                            <button
                              type="submit"
                              className="bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink hover:bg-white"
                            >
                              Als Cover
                            </button>
                          </form>
                        )}
                        <form action={deletePhotoAction} className="ml-auto">
                          <input type="hidden" name="photo_id" value={p.id} />
                          <input type="hidden" name="album_id" value={album.id} />
                          <button
                            type="submit"
                            className="bg-racing px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white hover:bg-racing-600"
                          >
                            Löschen
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
