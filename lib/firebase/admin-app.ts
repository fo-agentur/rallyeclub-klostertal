import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { readFirebaseAdminServiceAccountJson } from '@/lib/firebase/read-firebase-env'

/**
 * Server-side Firebase Admin. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON (or legacy
 * FIREBASE_SERVICE_ACCOUNT_JSON) to the full JSON of a service account key
 * (one line in .env.local).
 */
export function getFirebaseAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0] as App
  }
  const raw = readFirebaseAdminServiceAccountJson()
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
