"use server";

import { z } from "zod";
import { getDb } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2, "Bitte Namen angeben").max(120),
  email: z.string().email("Bitte gültige E-Mail angeben").max(200),
  phone: z.string().max(60).optional().or(z.literal("")),
  body: z.string().min(10, "Bitte etwas ausführlicher").max(4000),
});

export type ContactState =
  | { status: "idle" }
  | {
      status: "error";
      error: string;
      values?: { name?: string; email?: string; phone?: string; body?: string };
    }
  | { status: "success" };

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Eingabe ungültig",
      values: raw,
    };
  }

  try {
    const db = getDb();
    db.prepare(
      "INSERT INTO messages (name, email, phone, body) VALUES (?, ?, ?, ?)",
    ).run(parsed.data.name, parsed.data.email, parsed.data.phone || null, parsed.data.body);
  } catch (err) {
    console.error("contact save failed", err);
    return { status: "error", error: "Speichern fehlgeschlagen — bitte später erneut versuchen.", values: raw };
  }

  return { status: "success" };
}
