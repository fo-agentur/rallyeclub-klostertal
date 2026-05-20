import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import crypto from "node:crypto";
import { getEnv } from "@/lib/env";
import { getAdminPasswordHashFromDb } from "@/lib/queries/admin-password";

const COOKIE_NAME = "rck_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

/** Browsers omit Secure cookies on plain HTTP — use forwarded proto from Traefik/Coolify. */
async function cookieSecureFlag(): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return false;
  const h = await headers();
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (proto === "https") return true;
  if (proto === "http") return false;
  return process.env.COOKIE_SECURE === "true";
}

function getSecret(): string {
  const s = getEnv("AUTH_SECRET");
  if (!s) throw new Error("AUTH_SECRET not set in environment");
  return s;
}

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${mac}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  return value;
}

/** Effective bcrypt hash: DB row wins over ADMIN_PASSWORD_HASH env (bootstrap). */
export async function getEffectiveAdminPasswordHash(): Promise<string | undefined> {
  const fromDb = await getAdminPasswordHashFromDb();
  if (fromDb) return fromDb;
  return getEnv("ADMIN_PASSWORD_HASH");
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await getEffectiveAdminPasswordHash();
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function createSession(): Promise<void> {
  const token = sign(`admin.${Date.now()}`);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await cookieSecureFlag(),
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  return verify(raw) !== null;
}
