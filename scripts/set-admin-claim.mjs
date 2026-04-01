/**
 * One-time bootstrap: grant Firebase Auth custom claim admin=true.
 *
 * Usage:
 *   set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON (or FIREBASE_SERVICE_ACCOUNT_JSON) to the JSON string of your service account key, then:
 *   npm run set-admin-claim -- <USER_UID>
 *
 * Or pass path to key file as second argument (reads file as UTF-8 JSON):
 *   npm run set-admin-claim -- <USER_UID> ./serviceAccount.json
 */
import { readFileSync } from 'node:fs'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const uid = process.argv[2]
const keyPath = process.argv[3]

if (!uid) {
  console.error('Usage: npm run set-admin-claim -- <USER_UID> [path-to-service-account.json]')
  process.exit(1)
}

let jsonRaw =
  process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON
if (!jsonRaw && keyPath) {
  jsonRaw = readFileSync(keyPath, 'utf8')
}
if (!jsonRaw) {
  console.error(
    'Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON (or FIREBASE_SERVICE_ACCOUNT_JSON) or pass path to service account JSON as third argument.'
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
