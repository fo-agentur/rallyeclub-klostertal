import { getSupabaseAdmin, isSupabaseConfigured } from "../supabase/admin";
import type { Event } from "../db";

function mapEvent(row: Record<string, unknown>): Event {
  return {
    id: Number(row.id),
    title: String(row.title),
    date: String(row.date),
    end_date: row.end_date != null ? String(row.end_date) : null,
    location: row.location != null ? String(row.location) : null,
    description: row.description != null ? String(row.description) : null,
    created_at: String(row.created_at),
  };
}

export async function listEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapEvent(row as Record<string, unknown>));
}

export async function listUpcomingEvents(limit?: number): Promise<Event[]> {
  if (!isSupabaseConfigured()) return [];
  const today = new Date().toISOString().slice(0, 10);
  const supabase = getSupabaseAdmin();
  let q = supabase.from("events").select("*").gte("date", today).order("date", { ascending: true });
  if (limit != null) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => mapEvent(row as Record<string, unknown>));
}

export async function listPastEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured()) return [];
  const today = new Date().toISOString().slice(0, 10);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .lt("date", today)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapEvent(row as Record<string, unknown>));
}

export async function getEventById(id: number): Promise<Event | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapEvent(data as Record<string, unknown>);
}

export type EventInput = {
  title: string;
  date: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
};

export async function createEvent(input: EventInput): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      date: input.date,
      end_date: input.end_date ?? null,
      location: input.location ?? null,
      description: input.description ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return Number((data as { id: number }).id);
}

export async function updateEvent(id: number, input: EventInput): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("events")
    .update({
      title: input.title,
      date: input.date,
      end_date: input.end_date ?? null,
      location: input.location ?? null,
      description: input.description ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
