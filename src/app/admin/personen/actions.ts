"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { parseOptionalFormPk, parseRequiredFormPk } from "@/lib/form-parse";
import { deleteUpload, saveImage } from "@/lib/upload";
import {
  createPerson,
  deletePerson,
  getPersonById,
  updatePerson,
} from "@/lib/queries/people";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

const schema = z.object({
  name: z.string().min(2, "Name fehlt").max(160),
  role: z.string().max(160).optional(),
  group_label: z.string().min(2, "Gruppe fehlt").max(120),
  car: z.string().max(160).optional(),
  sort_order: z.number().int().min(0).max(9999),
});

export type PersonFormState =
  | { status: "idle" }
  | { status: "error"; error: string };

export async function savePersonAction(
  _prev: PersonFormState,
  formData: FormData,
): Promise<PersonFormState> {
  await requireAuth();

  const id = parseOptionalFormPk(formData.get("id"));
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    group_label: String(formData.get("group_label") ?? "").trim(),
    car: String(formData.get("car") ?? "").trim(),
    sort_order: Number(String(formData.get("sort_order") ?? "0").trim() || 0),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Eingabe ungültig" };
  }

  const existing = id ? await getPersonById(id) : null;
  let photo = existing?.photo ?? null;
  let driverPhoto = existing?.driver_photo ?? null;
  const removePhoto = formData.get("remove_photo") === "1";
  const removeDriverPhoto = formData.get("remove_driver_photo") === "1";
  const photoFile = formData.get("photo") as File | null;
  const driverPhotoFile = formData.get("driver_photo") as File | null;

  if (removePhoto && photo) {
    await deleteUpload(photo);
    photo = null;
  }

  if (photoFile && photoFile.size > 0) {
    if (photo) await deleteUpload(photo);
    photo = await saveImage(photoFile, "people", { maxWidth: 1200 });
  }

  if (removeDriverPhoto && driverPhoto) {
    await deleteUpload(driverPhoto);
    driverPhoto = null;
  }

  if (driverPhotoFile && driverPhotoFile.size > 0) {
    if (driverPhoto) await deleteUpload(driverPhoto);
    driverPhoto = await saveImage(driverPhotoFile, "people", { maxWidth: 1200 });
  }

  const payload = {
    name: parsed.data.name,
    role: parsed.data.role || null,
    group_label: parsed.data.group_label,
    car: parsed.data.car || null,
    photo,
    driver_photo: driverPhoto,
    is_driver: formData.get("is_driver") === "1",
    sort_order: parsed.data.sort_order,
  };

  if (id && existing) {
    await updatePerson(id, payload);
  } else {
    await createPerson(payload);
  }

  revalidatePath("/mitglieder");
  revalidatePath("/fahrer");
  revalidatePath("/");
  revalidatePath("/admin/personen");
  redirect("/admin/personen");
}

export async function deletePersonAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = parseRequiredFormPk(formData.get("id"));
  if (!id) return;
  const person = await getPersonById(id);
  if (person?.photo) await deleteUpload(person.photo);
  if (person?.driver_photo) await deleteUpload(person.driver_photo);
  await deletePerson(id);
  revalidatePath("/mitglieder");
  revalidatePath("/fahrer");
  revalidatePath("/");
  revalidatePath("/admin/personen");
  redirect("/admin/personen");
}
