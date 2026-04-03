import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const nextDir = path.join(root, '.next')

try {
  fs.rmSync(nextDir, { recursive: true, force: true })
  console.log('Removed .next — start with: npm run dev')
} catch (e) {
  console.error('Could not remove .next (stop the dev server first, then retry).', e)
  process.exit(1)
}
