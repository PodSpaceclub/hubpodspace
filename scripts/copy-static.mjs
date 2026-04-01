/**
 * Copies .next/static/ to public/_next/static/ after build.
 * This allows Hostinger's Nginx to serve static files directly
 * from the filesystem instead of proxying to Node.js,
 * preventing random CSS/JS loading failures.
 */

import { cp, rm, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const cwd = process.cwd()
const src = join(cwd, '.next', 'static')
const destParent = join(cwd, 'public', '_next')
const dest = join(destParent, 'static')

try {
  if (!existsSync(src)) {
    console.warn('⚠ .next/static not found, skipping copy.')
    process.exit(0)
  }

  if (existsSync(destParent)) {
    await rm(destParent, { recursive: true, force: true })
  }

  await mkdir(destParent, { recursive: true })
  await cp(src, dest, { recursive: true })

  console.log('✓ Static files copied to public/_next/static/')
} catch (err) {
  console.error('✗ Failed to copy static files:', err.message)
  // Non-fatal: don't fail the build
  process.exit(0)
}
