import { getDb, type Event } from "../db";

export function listEvents(): Event[] {
  return getDb()
    .prepare("SELECT * FROM events ORDER BY date ASC")
    .all() as Event[];
}

export function listUpcomingEvents(limit?: number): Event[] {
  const today = new Date().toISOString().slice(0, 10);
  const db = getDb();
  const stmt = limit
    ? db.prepare("SELECT * FROM events WHERE date >= ? ORDER BY date ASC LIMIT ?")
    : db.prepare("SELECT * FROM events WHERE date >= ? ORDER BY date ASC");
  return (limit ? stmt.all(today, limit) : stmt.all(today)) as Event[];
}

export function listPastEvents(): Event[] {
  const today = new Date().toISOString().slice(0, 10);
  return getDb()
    .prepare("SELECT * FROM events WHERE date < ? ORDER BY date DESC")
    .all(today) as Event[];
}

export function getEventById(id: number): Event | null {
  return (getDb().prepare("SELECT * FROM events WHERE id = ?").get(id) as Event) ?? null;
}

export type EventInput = {
  title: string;
  date: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
};

export function createEvent(input: EventInput): number {
  const info = getDb()
    .prepare(
      `INSERT INTO events (title, date, end_date, location, description)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      input.title,
      input.date,
      input.end_date ?? null,
      input.location ?? null,
      input.description ?? null
    );
  return Number(info.lastInsertRowid);
}

export function updateEvent(id: number, input: EventInput): void {
  getDb()
    .prepare(
      `UPDATE events
       SET title = ?, date = ?, end_date = ?, location = ?, description = ?
       WHERE id = ?`
    )
    .run(
      input.title,
      input.date,
      input.end_date ?? null,
      input.location ?? null,
      input.description ?? null,
      id
    );
}

export function deleteEvent(id: number): void {
  getDb().prepare("DELETE FROM events WHERE id = ?").run(id);
}
