/**
 * Copies the starter (templates/default) into this package as `template/` before `npm pack` or
 * `npm publish`. npm drops `.gitignore` and `.npmrc` from packages, so they are stored as
 * `_dot_gitignore` and `_dot_npmrc`; `setupwise create` renames them back.
 */
import { cpSync, existsSync, readdirSync, renameSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = path.resolve(here, '../../../templates/default')
const target = path.resolve(here, '../template')
const SKIP = new Set(['node_modules', '.next', '.turbo', '.source', 'dist', 'build', 'generated', '.env'])
const PACKED = { '.gitignore': '_dot_gitignore', '.npmrc': '_dot_npmrc' }

if (!existsSync(source)) throw new Error(`No template at ${source}`)
rmSync(target, { recursive: true, force: true })
cpSync(source, target, {
  recursive: true,
  filter: (file) => !SKIP.has(path.basename(file)) && !path.basename(file).endsWith('pnpm-lock.yaml'),
})

const rename = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) rename(full)
    else if (PACKED[entry.name]) renameSync(full, path.join(dir, PACKED[entry.name]))
  }
}
rename(target)
console.log(`template copied to ${path.relative(process.cwd(), target)}`)
