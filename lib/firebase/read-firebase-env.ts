/**
 * Resolve Firebase-related env vars with readable primary names and legacy fallbacks.
 * Comments in .env.example describe each value (German).
 */

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  for (const v of values) {
    const t = v?.trim()
    if (t) return t
  }
  return undefined
}

/** Client-side Web SDK (NEXT_PUBLIC_* — exposed to the browser). */
export function readFirebaseWebClientEnv() {
  return {
    apiKey: firstNonEmpty(
      process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY,
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    ),
    authDomain: firstNonEmpty(
      process.env.NEXT_PUBLIC_FIREBASE_WEB_AUTH_DOMAIN,
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    ),
    projectId: firstNonEmpty(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: firstNonEmpty(
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_URL,
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    ),
    messagingSenderId: firstNonEmpty(
      process.env.NEXT_PUBLIC_FIREBASE_FCM_SENDER_ID,
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    ),
    appId: firstNonEmpty(
      process.env.NEXT_PUBLIC_FIREBASE_WEB_APP_ID,
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    ),
  }
}

/** Server-only: full service account JSON string (Admin SDK). */
export function readFirebaseAdminServiceAccountJson(): string | undefined {
  return firstNonEmpty(
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON,
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  )
}
