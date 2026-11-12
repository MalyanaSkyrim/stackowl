#!/usr/bin/env node
/**
 * Runs one of the repo's bash scripts (infra/, tooling/) on macOS, Linux and Windows.
 * Windows has no bash of its own, but Git for Windows ships one: this finds it, so
 * `pnpm infra:init` works from PowerShell too.
 *
 *   node tooling/scripts/run-bash.mjs <script.sh> [args...]
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const [script, ...args] = process.argv.slice(2)
if (!script) {
  console.error('Usage: node tooling/scripts/run-bash.mjs <script.sh> [args...]')
  process.exit(1)
}

function findBash() {
  if (process.platform !== 'win32') return 'bash'
  const candidates = [
    process.env.GIT_BASH,
    path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Git', 'bin', 'bash.exe'),
    path.join(process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'Git', 'bin', 'bash.exe'),
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Git', 'bin', 'bash.exe'),
  ]
  const found = candidates.find((file) => file && existsSync(file))
  if (found) return found
  console.error(
    'This step needs bash, which comes with Git for Windows: https://git-scm.com/download/win\n' +
      'Install it (or set GIT_BASH to its bash.exe), then run the command again.',
  )
  process.exit(1)
}

const result = spawnSync(findBash(), [script, ...args], { stdio: 'inherit' })
process.exit(result.status ?? 1)
