"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { isAuthenticated, verifyPassword } from "@/lib/auth";
import { upsertAdminPasswordHash } from "@/lib/queries/admin-password";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Aktuelles Passwort fehlt"),
    newPassword: z.string().min(8, "Neues Passwort: mindestens 8 Zeichen"),
    confirmPassword: z.string().min(1, "Bitte Passwort wiederholen"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Neues Passwort und Wiederholung stimmen nicht überein",
    path: ["confirmPassword"],
  });

export type ChangePasswordState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; error: string };

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  if (!(await isAuthenticated())) {
    return { status: "error", error: "Nicht angemeldet." };
  }

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0] ?? parsed.error.issues[0]?.message;
    return { status: "error", error: first ?? "Ungültige Eingabe" };
  }

  const { currentPassword, newPassword } = parsed.data;

  const ok = await verifyPassword(currentPassword);
  if (!ok) return { status: "error", error: "Aktuelles Passwort ist falsch." };

  const hash = await bcrypt.hash(newPassword, 12);
  try {
    await upsertAdminPasswordHash(hash);
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "42P01") {
      return {
        status: "error",
        error:
          'Tabelle "admin_password" fehlt. Bitte Migration db/migrations/002_admin_password.sql einspielen (npm run migrate).',
      };
    }
    throw e;
  }

  return {
    status: "success",
    message: "Passwort wurde geändert. Beim nächsten Login bitte das neue Passwort verwenden.",
  };
}
