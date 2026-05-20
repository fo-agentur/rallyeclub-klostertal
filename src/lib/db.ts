/**
 * Entity-Typen. Die Persistenz läuft über Postgres
 * (siehe `lib/pg.ts` und `lib/queries/*`).
 */

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

export type Event = {
  id: number;
  title: string;
  date: string;
  end_date: string | null;
  location: string | null;
  description: string | null;
  created_at: string;
};

export type Album = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  date: string | null;
  created_at: string;
};

export type Photo = {
  id: number;
  album_id: number;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type Person = {
  id: number;
  name: string;
  role: string | null;
  group_label: string;
  car: string | null;
  photo: string | null;
  driver_photo: string | null;
  is_driver: boolean;
  sort_order: number;
  created_at: string;
};

export type Sponsor = {
  id: number;
  name: string;
  tagline: string | null;
  website: string | null;
  logo: string | null;
  sort_order: number;
  created_at: string;
};

export type PageContent = {
  slug: string;
  title: string;
  body: string;
  updated_at: string;
};
