declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Auth
      ADMIN_PASSWORD_HASH?: string;
      AUTH_SECRET?: string;
      /** Force Secure session cookies when x-forwarded-proto is missing (default: only https via proxy) */
      COOKIE_SECURE?: string;
      // Postgres
      DATABASE_URL?: string;
      // S3 / MinIO
      S3_ENDPOINT?: string;
      S3_REGION?: string;
      S3_BUCKET?: string;
      S3_ACCESS_KEY_ID?: string;
      S3_SECRET_ACCESS_KEY?: string;
      S3_PUBLIC_URL?: string;
      S3_FORCE_PATH_STYLE?: string;
    }
  }
}

export {};
