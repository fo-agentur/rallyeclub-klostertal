import { isDatabaseConfigured, query } from "../pg";
import type { Person } from "../db";

type PersonRow = {
  id: number;
  name: string;
  role: string | null;
  group_label: string;
  car: string | null;
  photo: string | null;
  driver_photo: string | null;
  is_driver: boolean;
  sort_order: number;
  created_at: string | Date;
};

function mapPerson(row: PersonRow): Person {
  return {
    id: Number(row.id),
    name: row.name,
    role: row.role,
    group_label: row.group_label,
    car: row.car,
    photo: row.photo,
    driver_photo: row.driver_photo,
    is_driver: Boolean(row.is_driver),
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

function isMissingTable(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && String((e as { code: string }).code) === "42P01";
}

export type PersonInput = {
  name: string;
  role?: string | null;
  group_label: string;
  car?: string | null;
  photo?: string | null;
  driver_photo?: string | null;
  is_driver?: boolean;
  sort_order?: number;
};

export async function listPeople(): Promise<Person[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const { rows } = await query<PersonRow>(
      `SELECT * FROM people
         ORDER BY group_label ASC, sort_order ASC, name ASC`,
    );
    return rows.map(mapPerson);
  } catch (e) {
    if (isMissingTable(e)) return [];
    throw e;
  }
}

export async function listDrivers(): Promise<Person[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const { rows } = await query<PersonRow>(
      `SELECT * FROM people
         WHERE is_driver = true
         ORDER BY sort_order ASC, name ASC`,
    );
    return rows.map(mapPerson);
  } catch (e) {
    if (isMissingTable(e)) return [];
    throw e;
  }
}

export async function getPersonById(id: number): Promise<Person | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const { rows } = await query<PersonRow>("SELECT * FROM people WHERE id = $1 LIMIT 1", [id]);
    return rows[0] ? mapPerson(rows[0]) : null;
  } catch (e) {
    if (isMissingTable(e)) return null;
    throw e;
  }
}

export async function createPerson(input: PersonInput): Promise<number> {
  const { rows } = await query<{ id: number }>(
    `INSERT INTO people (name, role, group_label, car, photo, driver_photo, is_driver, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.name,
      input.role ?? null,
      input.group_label,
      input.car ?? null,
      input.photo ?? null,
      input.driver_photo ?? null,
      input.is_driver ?? false,
      input.sort_order ?? 0,
    ],
  );
  return Number(rows[0].id);
}

export async function updatePerson(id: number, input: PersonInput): Promise<void> {
  await query(
    `UPDATE people
       SET name = $1,
           role = $2,
           group_label = $3,
           car = $4,
           photo = $5,
           driver_photo = $6,
           is_driver = $7,
           sort_order = $8
     WHERE id = $9`,
    [
      input.name,
      input.role ?? null,
      input.group_label,
      input.car ?? null,
      input.photo ?? null,
      input.driver_photo ?? null,
      input.is_driver ?? false,
      input.sort_order ?? 0,
      id,
    ],
  );
}

export async function deletePerson(id: number): Promise<void> {
  await query("DELETE FROM people WHERE id = $1", [id]);
}
