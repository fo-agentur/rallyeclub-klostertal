"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { saveImage, deleteUpload } from "@/lib/upload";
import {
  addPhoto,
  createAlbum,
  deleteAlbum,
  deletePhoto,
  getAlbumById,
  getAlbumPhotos,
  getFirstPhotoUrlForAlbum,
  getPhotoUrlById,
  setAlbumCoverImage,
  updateAlbum,
} from "@/lib/queries/albums";
import { slugify } from "@/lib/utils";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

const schema = z.object({
  title: z.string().min(3, "Titel zu kurz").max(200),
  slug: z.string().max(200).optional(),
  date: z.string().optional(),
  description: z.string().max(2000).optional(),
});

export type AlbumFormState =
  | { status: "idle" }
  | { status: "error"; error: string };

export async function saveAlbumAction(
  _prev: AlbumFormState,
  formData: FormData,
): Promise<AlbumFormState> {
  await requireAuth();

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;

  const raw = {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Eingabe ungültig" };
  }

  const payload = {
    title: parsed.data.title,
    slug: parsed.data.slug ? slugify(parsed.data.slug) : undefined,
    date: parsed.data.date || null,
    description: parsed.data.description || null,
  };

  if (id && (await getAlbumById(id))) {
    await updateAlbum(id, payload);
    const album = await getAlbumById(id);
    revalidatePath("/galerie");
    if (album) revalidatePath(`/galerie/${album.slug}`);
    revalidatePath("/admin/galerie");
    redirect(`/admin/galerie/${id}`);
  } else {
    const newId = await createAlbum(payload);
    revalidatePath("/galerie");
    revalidatePath("/admin/galerie");
    redirect(`/admin/galerie/${newId}`);
  }
}

export async function deleteAlbumAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  const photos = await getAlbumPhotos(id);
  for (const p of photos) {
    await deleteUpload(p.url);
  }
  const album = await getAlbumById(id);
  if (album?.cover_image && !photos.some((p) => p.url === album.cover_image)) {
    await deleteUpload(album.cover_image);
  }
  await deleteAlbum(id);
  revalidatePath("/galerie");
  revalidatePath("/admin/galerie");
  redirect("/admin/galerie");
}

export async function uploadPhotosAction(formData: FormData): Promise<void> {
  await requireAuth();
  const albumId = Number(formData.get("album_id"));
  const album = await getAlbumById(albumId);
  if (!albumId || !album) return;

  const files = formData.getAll("photos") as File[];
  for (const f of files) {
    if (!f || !(f instanceof File) || f.size === 0) continue;
    const url = await saveImage(f, "galerie", { maxWidth: 1920 });
    await addPhoto(albumId, url);
  }

  revalidatePath(`/galerie/${album.slug}`);
  revalidatePath("/galerie");
  revalidatePath(`/admin/galerie/${albumId}`);
  redirect(`/admin/galerie/${albumId}`);
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const photoId = Number(formData.get("photo_id"));
  const albumId = Number(formData.get("album_id"));
  if (!photoId) return;

  const photoUrl = await getPhotoUrlById(photoId);
  if (photoUrl) {
    await deleteUpload(photoUrl);
    const album = await getAlbumById(albumId);
    if (album?.cover_image === photoUrl) {
      await setAlbumCoverImage(albumId, null);
    }
  }
  await deletePhoto(photoId);

  const album = await getAlbumById(albumId);
  if (album && !album.cover_image) {
    const next = await getFirstPhotoUrlForAlbum(albumId);
    if (next) {
      await setAlbumCoverImage(albumId, next);
    }
  }
  revalidatePath(`/galerie/${album?.slug ?? ""}`);
  revalidatePath("/galerie");
  revalidatePath(`/admin/galerie/${albumId}`);
  redirect(`/admin/galerie/${albumId}`);
}

export async function setCoverAction(formData: FormData): Promise<void> {
  await requireAuth();
  const photoId = Number(formData.get("photo_id"));
  const albumId = Number(formData.get("album_id"));
  if (!photoId || !albumId) return;

  const url = await getPhotoUrlById(photoId);
  if (!url) return;
  await setAlbumCoverImage(albumId, url);

  const album = await getAlbumById(albumId);
  revalidatePath(`/galerie/${album?.slug ?? ""}`);
  revalidatePath("/galerie");
  revalidatePath(`/admin/galerie/${albumId}`);
  redirect(`/admin/galerie/${albumId}`);
}
