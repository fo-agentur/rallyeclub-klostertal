"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import {
  createEvent,
  deleteEvent,
  getEventById,
  updateEvent,
} from "@/lib/queries/events";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

const schema = z.object({
  title: z.string().min(3, "Titel zu kurz").max(200),
  date: z.string().min(8, "Datum fehlt"),
  end_date: z.string().optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
});

export type EventFormState =
  | { status: "idle" }
  | { status: "error"; error: string };

export async function saveEventAction(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAuth();

  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;

  const raw = {
    title: String(formData.get("title") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    end_date: String(formData.get("end_date") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Eingabe ungültig" };
  }

  const payload = {
    title: parsed.data.title,
    date: parsed.data.date,
    end_date: parsed.data.end_date || null,
    location: parsed.data.location || null,
    description: parsed.data.description || null,
  };

  if (id && getEventById(id)) {
    updateEvent(id, payload);
  } else {
    createEvent(payload);
  }

  revalidatePath("/veranstaltungen");
  revalidatePath("/");
  revalidatePath("/admin/termine");
  redirect("/admin/termine");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id) return;
  deleteEvent(id);
  revalidatePath("/veranstaltungen");
  revalidatePath("/");
  revalidatePath("/admin/termine");
  redirect("/admin/termine");
}
