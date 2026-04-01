/**
 * One-off: compact multiline FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON in .env.local to a single quoted line.
 * Usage: node scripts/normalize-env-service-account.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const envPath = path.join(root, '.env.local')
const s = fs.readFileSync(envPath, 'utf8')
const marker = 'FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON='
const i = s.indexOf(marker)
if (i === -1) {
  console.error('FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON= not found in .env.local')
  process.exit(1)
}
let j = i + marker.length
while (j < s.length && /[\s\r\n]/.test(s[j])) j++
if (s[j] !== '{') {
  console.error('Expected JSON object after FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON=')
  process.exit(1)
}
let depth = 0
const start = j
for (let k = j; k < s.length; k++) {
  const c = s[k]
  if (c === '{') depth++
  else if (c === '}') {
    depth--
    if (depth === 0) {
      const jsonStr = s.slice(start, k + 1)
      let obj
      try {
        obj = JSON.parse(jsonStr)
      } catch (e) {
        console.error('JSON parse failed:', e instanceof Error ? e.message : e)
        process.exit(1)
      }
      const compact = `${marker}'${JSON.stringify(obj)}'`
      const before = s.slice(0, i)
      const after = s.slice(k + 1)
      fs.writeFileSync(envPath, before + compact + after, 'utf8')
      console.log('OK: FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON is now one line.')
      process.exit(0)
    }
  }
}
console.error('Unclosed JSON object')
process.exit(1)
