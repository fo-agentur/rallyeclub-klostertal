import { getDb, type Event } from "../db";

export async function listEvents(): Promise<Event[]> {
  const db = await getDb();
  return db.all<Event>("SELECT * FROM events ORDER BY date ASC");
}

export async function listUpcomingEvents(limit?: number): Promise<Event[]> {
  const today = new Date().toISOString().slice(0, 10);
  const db = await getDb();
  return limit
    ? db.all<Event>("SELECT * FROM events WHERE date >= ? ORDER BY date ASC LIMIT ?", [today, limit])
    : db.all<Event>("SELECT * FROM events WHERE date >= ? ORDER BY date ASC", [today]);
}

export async function listPastEvents(): Promise<Event[]> {
  const today = new Date().toISOString().slice(0, 10);
  const db = await getDb();
  return db.all<Event>("SELECT * FROM events WHERE date < ? ORDER BY date DESC", [today]);
}

export async function getEventById(id: number): Promise<Event | null> {
  const db = await getDb();
  return db.first<Event>("SELECT * FROM events WHERE id = ?", [id]);
}

export type EventInput = {
  title: string;
  date: string;
  end_date?: string | null;
  location?: string | null;
  description?: string | null;
};

export async function createEvent(input: EventInput): Promise<number> {
  const db = await getDb();
  const { lastInsertRowid } = await db.run(
    `INSERT INTO events (title, date, end_date, location, description)
     VALUES (?, ?, ?, ?, ?)`,
    [input.title, input.date, input.end_date ?? null, input.location ?? null, input.description ?? null],
  );
  return lastInsertRowid;
}

export async function updateEvent(id: number, input: EventInput): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE events
     SET title = ?, date = ?, end_date = ?, location = ?, description = ?
     WHERE id = ?`,
    [input.title, input.date, input.end_date ?? null, input.location ?? null, input.description ?? null, id],
  );
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM events WHERE id = ?", [id]);
}
