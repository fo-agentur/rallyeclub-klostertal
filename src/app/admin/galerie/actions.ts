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
  updateAlbum,
} from "@/lib/queries/albums";
import { getDb } from "@/lib/db";
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

  if (id && getAlbumById(id)) {
    updateAlbum(id, payload);
    revalidatePath("/galerie");
    revalidatePath(`/galerie/${getAlbumById(id)!.slug}`);
    revalidatePath("/admin/galerie");
    redirect(`/admin/galerie/${id}`);
  } else {
    const newId = createAlbum(payload);
    revalidatePath("/galerie");
    revalidatePath("/admin/galerie");
    redirect(`/admin/galerie/${newId}`);
  }
}

export async function deleteAlbumAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  const photos = getAlbumPhotos(id);
  for (const p of photos) {
    await deleteUpload(p.url);
  }
  const album = getAlbumById(id);
  if (album?.cover_image && !photos.some((p) => p.url === album.cover_image)) {
    await deleteUpload(album.cover_image);
  }
  deleteAlbum(id);
  revalidatePath("/galerie");
  revalidatePath("/admin/galerie");
  redirect("/admin/galerie");
}

export async function uploadPhotosAction(formData: FormData): Promise<void> {
  await requireAuth();
  const albumId = Number(formData.get("album_id"));
  if (!albumId || !getAlbumById(albumId)) return;

  const files = formData.getAll("photos") as File[];
  for (const f of files) {
    if (!f || !(f instanceof File) || f.size === 0) continue;
    const url = await saveImage(f, "galerie", { maxWidth: 1920 });
    addPhoto(albumId, url);
  }

  revalidatePath(`/galerie/${getAlbumById(albumId)!.slug}`);
  revalidatePath("/galerie");
  revalidatePath(`/admin/galerie/${albumId}`);
  redirect(`/admin/galerie/${albumId}`);
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  await requireAuth();
  const photoId = Number(formData.get("photo_id"));
  const albumId = Number(formData.get("album_id"));
  if (!photoId) return;
  const db = getDb();
  const photo = db.prepare("SELECT url FROM photos WHERE id = ?").get(photoId) as
    | { url: string }
    | undefined;
  if (photo) {
    await deleteUpload(photo.url);
    const album = getAlbumById(albumId);
    if (album?.cover_image === photo.url) {
      db.prepare("UPDATE albums SET cover_image = NULL WHERE id = ?").run(albumId);
    }
  }
  deletePhoto(photoId);
  const album = getAlbumById(albumId);
  if (album && !album.cover_image) {
    const next = db
      .prepare("SELECT url FROM photos WHERE album_id = ? ORDER BY sort_order ASC LIMIT 1")
      .get(albumId) as { url: string } | undefined;
    if (next) {
      db.prepare("UPDATE albums SET cover_image = ? WHERE id = ?").run(next.url, albumId);
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
  const db = getDb();
  const photo = db.prepare("SELECT url FROM photos WHERE id = ?").get(photoId) as
    | { url: string }
    | undefined;
  if (!photo) return;
  db.prepare("UPDATE albums SET cover_image = ? WHERE id = ?").run(photo.url, albumId);
  const album = getAlbumById(albumId);
  revalidatePath(`/galerie/${album?.slug ?? ""}`);
  revalidatePath("/galerie");
  revalidatePath(`/admin/galerie/${albumId}`);
  redirect(`/admin/galerie/${albumId}`);
}
