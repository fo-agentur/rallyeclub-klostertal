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
  if (!id) return;
  await deleteMessage(id);
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
