"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export type LoginState = { status: "idle" } | { status: "error"; error: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const pw = String(formData.get("password") ?? "");
  if (!pw) return { status: "error", error: "Passwort fehlt" };

  const ok = await verifyPassword(pw);
  if (!ok) return { status: "error", error: "Falsches Passwort" };

  await createSession();
  redirect("/admin/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}
