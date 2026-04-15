declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL?: string;
      SUPABASE_SERVICE_ROLE_KEY?: string;
    }
  }

  namespace CloudflareEnv {
    interface Env {
      ASSETS: Fetcher;
      WORKER_SELF_REFERENCE: Fetcher;
    }
  }
}

export {};
