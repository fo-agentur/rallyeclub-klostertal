"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { upsertPage } from "@/lib/queries/pages";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

const schema = z.object({
  slug: z.string().min(2).max(80),
  title: z.string().min(2, "Titel fehlt").max(160),
  body: z.string().min(10, "Inhalt fehlt"),
});

export type PageFormState =
  | { status: "idle" }
  | { status: "error"; error: string };

export async function savePageAction(
  _prev: PageFormState,
  formData: FormData,
): Promise<PageFormState> {
  await requireAuth();

  const parsed = schema.safeParse({
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
  });

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Eingabe ungültig" };
  }

  await upsertPage(parsed.data);
  revalidatePath(`/${parsed.data.slug}`);
  revalidatePath("/admin/texte");
  redirect("/admin/texte");
}
