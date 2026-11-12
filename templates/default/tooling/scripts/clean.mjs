#!/usr/bin/env node
/**
 * Deletes build output and installed packages everywhere in the repo (`pnpm clean`), or the
 * folders given as arguments (`node tooling/scripts/clean.mjs generated`). Cross-platform.
 */
import { readdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const given = process.argv.slice(2)
if (given.length > 0) {
  for (const folder of given) rmSync(folder, { recursive: true, force: true })
  process.exit(0)
}

const NAMES = new Set(['node_modules', 'build', '.next', '.turbo', 'dist', 'generated', '.source', 'out'])
const SKIP = new Set(['.git', 'ios', 'android'])
function sweep(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (NAMES.has(entry.name)) rmSync(full, { recursive: true, force: true })
    else sweep(full)
  }
}
sweep(process.cwd())
console.log('Cleaned. Run pnpm install to start again.')
