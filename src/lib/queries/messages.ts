import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase/admin";

export type Message = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  body: string;
  created_at: string;
};

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone != null ? String(row.phone) : null,
    body: String(row.body),
    created_at: String(row.created_at),
  };
}

export async function listMessages(limit?: number): Promise<Message[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  let q = supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (limit != null) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => mapMessage(row as Record<string, unknown>));
}

export async function deleteMessage(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw error;
}
