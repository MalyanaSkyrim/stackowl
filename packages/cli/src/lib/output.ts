/** One line per check, the same everywhere: ✓ fine, ! worth a look, ✖ must be fixed, + a change. */
import pc from 'picocolors'

import type { Reporter } from '../types'

export type Line = {
  kind: 'ok' | 'note' | 'problem' | 'heading' | 'change'
  text: string
}

export function createReporter(
  options: { apply: boolean; quiet?: boolean } = { apply: false },
): Reporter & { lines: Line[] } {
  const lines: Line[] = []
  let problems = 0
  const print = (line: Line, formatted: string) => {
    lines.push(line)
    if (!options.quiet) console.log(formatted)
  }
  return {
    lines,
    get problems() {
      return problems
    },
    ok: (text) => print({ kind: 'ok', text }, `  ${pc.green('✓')} ${text}`),
    note: (text) =>
      print({ kind: 'note', text }, `  ${pc.yellow('!')} ${text}`),
    problem: (text) => {
      problems++
      print({ kind: 'problem', text }, `  ${pc.red('✖')} ${text}`)
    },
    heading: (text) => print({ kind: 'heading', text }, `\n${pc.bold(text)}`),
    async change(text, run) {
      if (!options.apply) {
        print(
          { kind: 'change', text: `${text} (dry run)` },
          `  ${pc.cyan('+')} ${text} ${pc.dim('(dry run)')}`,
        )
        return true
      }
      const done = await run()
      if (done) print({ kind: 'change', text }, `  ${pc.cyan('+')} ${text}`)
      else {
        problems++
        print(
          { kind: 'problem', text: `${text}: failed` },
          `  ${pc.red('✖')} ${text}: failed`,
        )
      }
      return done
    },
  }
}

export class CliError extends Error {}

/** Stops the command with a message; the entry point prints it and exits with 1. */
export function fail(message: string): never {
  throw new CliError(message)
}
