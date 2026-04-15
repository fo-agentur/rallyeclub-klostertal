import type { D1Database } from "@cloudflare/workers-types";

declare global {
  namespace CloudflareEnv {
    interface Env {
      DB: D1Database;
      ASSETS: Fetcher;
      WORKER_SELF_REFERENCE: Fetcher;
    }
  }
}
