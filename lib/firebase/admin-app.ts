import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'

/**
 * Server-side Firebase Admin. Set FIREBASE_SERVICE_ACCOUNT_JSON to the full
 * JSON of a service account key (stringify as one line in .env.local).
 */
export function getFirebaseAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0] as App
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw || raw.trim() === '') {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as { project_id?: string; client_email?: string; private_key?: string }
    if (!parsed.client_email || !parsed.private_key) {
      return null
    }
    return initializeApp({
      credential: cert({
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key.replace(/\\n/g, '\n'),
      }),
    })
  } catch {
    return null
  }
}
