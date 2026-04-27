"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { deleteMessage } from "@/lib/queries/messages";

async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/admin");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAuth();
  const id = Number(formData.get("id"));
  if (!id || !Number.isFinite(id)) redirect("/admin/messages");
  try {
    await deleteMessage(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Supabase nicht konfiguriert")) {
      redirect("/admin/messages?error=config");
    }
    redirect("/admin/messages?error=delete");
  }
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
