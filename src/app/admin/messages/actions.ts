"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { parseRequiredFormPk } from "@/lib/form-parse";
import { deleteMessage } from "@/lib/queries/messages";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = parseRequiredFormPk(formData.get("id"));
  if (!id) redirect("/admin/messages");
  try {
    await deleteMessage(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Datenbank nicht konfiguriert")) {
      redirect("/admin/messages?error=config");
    }
    redirect("/admin/messages?error=delete");
  }
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
