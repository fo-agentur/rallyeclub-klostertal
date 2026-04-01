/**
 * One-time bootstrap: grant Firebase Auth custom claim admin=true.
 *
 * Usage:
 *   npm run set-admin-claim -- <USER_UID>
 *
 * Reads credentials in this order:
 *   1) env FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_JSON
 *   2) .env.local in project root (same as Next.js)
 *   3) optional file path: npm run set-admin-claim -- <USER_UID> ./serviceAccount.json
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const uid = process.argv[2]
const keyPath = process.argv[3]

if (!uid) {
  console.error('Usage: npm run set-admin-claim -- <USER_UID> [path-to-service-account.json]')
  process.exit(1)
}

/** Parse FIREBASE_*_JSON from .env.local (single-line quoted JSON). */
function readServiceAccountFromEnvLocal() {
  const p = join(process.cwd(), '.env.local')
  if (!existsSync(p)) return null
  const text = readFileSync(p, 'utf8')
  for (const key of ['FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON', 'FIREBASE_SERVICE_ACCOUNT_JSON']) {
    const prefix = `${key}=`
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith(prefix)) continue
      let rest = line.slice(prefix.length).trim()
      if (rest.startsWith("'") && rest.endsWith("'") && rest.length >= 2) {
        return rest.slice(1, -1)
      }
      if (rest.startsWith('"') && rest.endsWith('"') && rest.length >= 2) {
        return rest
          .slice(1, -1)
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
      }
      return rest
    }
  }
  return null
}

let jsonRaw =
  process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON
if (!jsonRaw) {
  jsonRaw = readServiceAccountFromEnvLocal()
}
if (!jsonRaw && keyPath) {
  jsonRaw = readFileSync(keyPath, 'utf8')
}
if (!jsonRaw) {
  console.error(
    'Kein Service Account: Setze FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON, oder lege .env.local an, oder:\n' +
      '  npm run set-admin-claim -- <UID> ./pfad/zur-serviceAccount.json'
  )
  process.exit(1)
}

const cred = JSON.parse(jsonRaw)

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: cred.project_id,
      clientEmail: cred.client_email,
      privateKey: cred.private_key.replace(/\\n/g, '\n'),
    }),
  })
}

await getAuth().setCustomUserClaims(uid, { admin: true })
console.log('Custom claim admin:true set for uid:', uid)
