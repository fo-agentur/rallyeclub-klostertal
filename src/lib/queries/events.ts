import { isDatabaseConfigured, query } from "../pg";
import type { Event } from "../db";

type EventRow = {
  id: number;
  title: string;
  date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  created_at: string | Date;
};

function mapEvent(row: EventRow): Event {
  return {
    id: Number(row.id),
    title: row.title,
    date: row.date,
    end_date: row.end_date,
    location: row.location,
    description: row.description,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function listEvents(): Promise<Event[]> {
  if (!isDatabaseConfigured()) return [];
  const { rows } = await query<EventRow>(
    "SELECT * FROM events ORDER BY date ASC",
  );
  return rows.map(mapEvent);
}

export async function listUpcomingEvents(limit?: number): Promise<Event[]> {
  if (!isDatabaseConfigured()) return [];
  const today = new Date().toISOString().slice(0, 10);
  const sql = limit != null
    ? "SELECT * FROM events WHERE date >= $1 ORDER BY date ASC LIMIT $2"
    : "SELECT * FROM events WHERE date >= $1 ORDER BY date ASC";
  const { rows } = await query<EventRow>(
    sql,
    limit != null ? [today, limit] : [today],
  );
  return rows.map(mapEvent);
}

export async function listPastEvents(): Promise<Event[]> {
  if (!isDatabaseConfigured()) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { rows } = await query<EventRow>(
    "SELECT * FROM events WHERE date < $1 ORDER BY date DESC",
    [today],
  );
  return rows.map(mapEvent);
}

export async function getEventById(id: number): Promise<Event | null> {
  if (!isDatabaseConfigured()) return null;
  const { rows } = await query<EventRow>(
    "SELECT * FROM events WHERE id = $1 LIMIT 1",
    [id],
  );
  return rows[0] ? mapEvent(rows[0]) : null;
}

export type EventInput = {
  title: string;
  date: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
};

export async function createEvent(input: EventInput): Promise<number> {
  const { rows } = await query<{ id: number }>(
    `INSERT INTO events (title, date, end_date, location, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      input.title,
      input.date,
      input.end_date ?? null,
      input.location ?? null,
      input.description ?? null,
    ],
  );
  return Number(rows[0].id);
}

export async function updateEvent(id: number, input: EventInput): Promise<void> {
  await query(
    `UPDATE events
       SET title = $1, date = $2, end_date = $3, location = $4, description = $5
     WHERE id = $6`,
    [
      input.title,
      input.date,
      input.end_date ?? null,
      input.location ?? null,
      input.description ?? null,
      id,
    ],
  );
}

export async function deleteEvent(id: number): Promise<void> {
  await query("DELETE FROM events WHERE id = $1", [id]);
}
