CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  group_label TEXT NOT NULL DEFAULT 'Mitglieder',
  car TEXT,
  photo TEXT,
  driver_photo TEXT,
  is_driver BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  website TEXT,
  logo TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_people_group_sort ON people (group_label, sort_order, name);
CREATE INDEX IF NOT EXISTS idx_people_driver_sort ON people (is_driver, sort_order, name);
CREATE INDEX IF NOT EXISTS idx_sponsors_sort ON sponsors (sort_order, name);

CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
