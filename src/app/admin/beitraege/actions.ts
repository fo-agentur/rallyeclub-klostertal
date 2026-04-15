"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { saveImage, deleteUpload } from "@/lib/upload";
import {
  createPost,
  deletePost,
  getPostById,
  updatePost,
} from "@/lib/queries/posts";
import { slugify } from "@/lib/utils";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

const schema = z.object({
  title: z.string().min(3, "Titel zu kurz").max(200),
  slug: z.string().max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(5, "Inhalt fehlt"),
  published_at: z.string().min(8, "Datum fehlt"),
});

export type PostFormState =
  | { status: "idle" }
  | { status: "error"; error: string };

export async function savePostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAuth();

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;

  const raw = {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? "").trim(),
    published_at: String(formData.get("published_at") ?? "").trim(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Eingabe ungültig" };
  }

  const removeCover = formData.get("remove_cover") === "1";
  const coverFile = formData.get("cover") as File | null;

  let coverPath: string | null = null;
  const existing = id ? await getPostById(id) : null;

  if (existing) {
    coverPath = existing.cover_image;
  }

  if (removeCover && coverPath) {
    await deleteUpload(coverPath);
    coverPath = null;
  }

  if (coverFile && coverFile.size > 0) {
    if (coverPath) await deleteUpload(coverPath);
    coverPath = await saveImage(coverFile, "posts", { maxWidth: 1600 });
  }

  const payload = {
    title: parsed.data.title,
    slug: parsed.data.slug ? slugify(parsed.data.slug) : undefined,
    excerpt: parsed.data.excerpt || null,
    content: parsed.data.content,
    cover_image: coverPath,
    published_at: parsed.data.published_at,
  };

  if (id && existing) {
    await updatePost(id, payload);
  } else {
    await createPost(payload);
  }

  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/beitraege");
  redirect("/admin/beitraege");
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  const p = await getPostById(id);
  if (p?.cover_image) await deleteUpload(p.cover_image);
  await deletePost(id);
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/beitraege");
  redirect("/admin/beitraege");
}
