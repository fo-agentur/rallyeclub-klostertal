import { isDatabaseConfigured, query } from "../pg";

export type Message = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  body: string;
  created_at: string;
};

type MessageRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  body: string;
  created_at: string | Date;
};

function mapMessage(row: MessageRow): Message {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    body: row.body,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function listMessages(limit?: number): Promise<Message[]> {
  if (!isDatabaseConfigured()) return [];
  const sql = limit != null
    ? "SELECT * FROM messages ORDER BY created_at DESC LIMIT $1"
    : "SELECT * FROM messages ORDER BY created_at DESC";
  const { rows } = await query<MessageRow>(sql, limit != null ? [limit] : undefined);
  return rows.map(mapMessage);
}

export type MessageInput = {
  name: string;
  email: string;
  phone?: string | null;
  body: string;
};

export async function createMessage(input: MessageInput): Promise<number> {
  if (!isDatabaseConfigured()) throw new Error("Datenbank nicht konfiguriert");
  const { rows } = await query<{ id: number }>(
    `INSERT INTO messages (name, email, phone, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [input.name, input.email, input.phone ?? null, input.body],
  );
  return Number(rows[0].id);
}

export async function deleteMessage(id: number): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("Datenbank nicht konfiguriert");
  await query("DELETE FROM messages WHERE id = $1", [id]);
}
