import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

let _client: SupabaseClient | null = null;

/** True when server can talk to Supabase (Vercel: set env in Project Settings). */
export function isSupabaseConfigured(): boolean {
  return !!(getEnv("SUPABASE_URL") && getEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

/** Server-only Supabase client (service role). Do not import from client components. */
export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const url = getEnv("SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — set in .env.local, Vercel env, or Cloudflare Worker secrets.",
    );
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
