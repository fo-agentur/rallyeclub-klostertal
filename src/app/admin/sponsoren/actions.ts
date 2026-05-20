"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { parseOptionalFormPk, parseRequiredFormPk } from "@/lib/form-parse";
import { deleteUpload, saveImage } from "@/lib/upload";
import {
  createSponsor,
  deleteSponsor,
  getSponsorById,
  updateSponsor,
} from "@/lib/queries/sponsors";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

const schema = z.object({
  name: z.string().min(2, "Name fehlt").max(160),
  tagline: z.string().max(160).optional(),
  website: z.string().max(300).optional(),
  sort_order: z.number().int().min(0).max(9999),
});

export type SponsorFormState =
  | { status: "idle" }
  | { status: "error"; error: string };

export async function saveSponsorAction(
  _prev: SponsorFormState,
  formData: FormData,
): Promise<SponsorFormState> {
  await requireAuth();

  const id = parseOptionalFormPk(formData.get("id"));
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    sort_order: Number(String(formData.get("sort_order") ?? "0").trim() || 0),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Eingabe ungültig" };
  }

  const existing = id ? await getSponsorById(id) : null;
  let logo = existing?.logo ?? null;
  const removeLogo = formData.get("remove_logo") === "1";
  const logoFile = formData.get("logo") as File | null;

  if (removeLogo && logo) {
    await deleteUpload(logo);
    logo = null;
  }

  if (logoFile && logoFile.size > 0) {
    if (logo) await deleteUpload(logo);
    logo = await saveImage(logoFile, "sponsors", { maxWidth: 900, quality: 90 });
  }

  const payload = {
    name: parsed.data.name,
    tagline: parsed.data.tagline || null,
    website: parsed.data.website || null,
    logo,
    sort_order: parsed.data.sort_order,
  };

  if (id && existing) {
    await updateSponsor(id, payload);
  } else {
    await createSponsor(payload);
  }

  revalidatePath("/");
  revalidatePath("/admin/sponsoren");
  redirect("/admin/sponsoren");
}

export async function deleteSponsorAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = parseRequiredFormPk(formData.get("id"));
  if (!id) return;
  const sponsor = await getSponsorById(id);
  if (sponsor?.logo) await deleteUpload(sponsor.logo);
  await deleteSponsor(id);
  revalidatePath("/");
  revalidatePath("/admin/sponsoren");
  redirect("/admin/sponsoren");
}
