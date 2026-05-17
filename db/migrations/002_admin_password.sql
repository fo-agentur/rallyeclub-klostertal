-- Stores bcrypt hash for admin login; overrides ADMIN_PASSWORD_HASH in env when a row exists.
CREATE TABLE IF NOT EXISTS admin_password (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
