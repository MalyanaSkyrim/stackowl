/** Runs the command-line tools the modules drive (gh, gcloud…). */
import { spawnSync } from 'node:child_process'

export type RunResult = { ok: boolean; stdout: string; stderr: string }

/**
 * Runs a command and returns its output; never throws. `input` is written to its stdin, which
 * is how secret values are passed, so they never appear in a process list or a log.
 */
export function run(
  command: string,
  args: readonly string[],
  options: { input?: string; cwd?: string } = {},
): RunResult {
  // On Windows many CLIs are `.cmd` files (gcloud, pnpm, npx), which only start through the
  // shell; every argument is quoted for cmd.exe so spaces and symbols pass through unchanged.
  const windows = process.platform === 'win32'
  const result = spawnSync(windows ? quoteForCmd(command) : command, windows ? args.map(quoteForCmd) : args, {
    encoding: 'utf8',
    input: options.input,
    cwd: options.cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: windows,
  })
  return {
    ok: result.status === 0,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
  }
}

const found = new Map<string, boolean>()

/** Whether a command is on PATH. */
export function has(command: string): boolean {
  if (!/^[\w.-]+$/.test(command)) return false
  let result = found.get(command)
  if (result === undefined) {
    result =
      process.platform === 'win32'
        ? run('where', [command]).ok
        : run('sh', ['-c', `command -v ${command}`]).ok
    found.set(command, result)
  }
  return result
}

/** An argument as cmd.exe reads it: quoted when it has spaces or symbols, inner quotes doubled. */
export function quoteForCmd(value: string): string {
  return /^[\w./:=@-]+$/.test(value) ? value : `"${value.replace(/"/g, '""')}"`
}
