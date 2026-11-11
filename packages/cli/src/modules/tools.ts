import { has, run } from '../lib/run'
import type { Module, Tool } from '../types'

/** `20`, `22.11` or `>=22.11.0` → [major, minor]. */
export function parseMinimum(version: string): [number, number] {
  const [major = 0, minor = 0] = version
    .replace(/^[^\d]*/, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0)
  return [major, minor]
}

export function satisfies(current: string, minimum: string): boolean {
  const [major, minor] = parseMinimum(current)
  const [needMajor, needMinor] = parseMinimum(minimum)
  return major > needMajor || (major === needMajor && minor >= needMinor)
}

const normalize = (tool: Tool) =>
  typeof tool === 'string' ? { command: tool } : tool

/** Package managers `setup tools` may run an `install` hint with. */
const INSTALLERS = ['brew', 'winget', 'corepack', 'npm']

/** The install command to run for a tool, when its hint is one (`brew install opentofu`). */
export function installCommand(install: string | undefined): string[] | null {
  if (!install) return null
  const parts = install.trim().split(/\s+/)
  const [command] = parts
  if (!command || !INSTALLERS.includes(command) || !has(command)) return null
  return parts
}

export const toolsModule: Module = {
  id: 'tools',
  title: 'Tools',
  description: 'Node.js version and the command-line tools the project uses.',
  docs: 'modules/tools.mdx',
  check({ config, report }) {
    const node = process.versions.node
    if (!config.node) report.ok(`Node ${node}`)
    else if (satisfies(node, config.node)) report.ok(`Node ${node}`)
    else report.problem(`Node ${node}: ${config.node} or newer is needed`)

    for (const tool of (config.tools ?? []).map(normalize)) {
      if (tool.platform && tool.platform !== process.platform) continue
      if (has(tool.command)) {
        report.ok(tool.command)
        continue
      }
      const details = [
        tool.why && `needed for ${tool.why}`,
        tool.install && `install: ${tool.install}`,
      ]
        .filter(Boolean)
        .join('; ')
      const text = `${tool.command} is not installed${details ? `: ${details}` : ''}`
      if (tool.required) report.problem(text)
      else report.note(text)
    }
  },
  async setup({ config, report }) {
    let missing = 0
    for (const tool of (config.tools ?? []).map(normalize)) {
      if (tool.platform && tool.platform !== process.platform) continue
      if (has(tool.command)) continue
      missing++
      const command = installCommand(tool.install)
      if (!command) {
        report.note(
          `${tool.command} is not installed${tool.install ? `: ${tool.install}` : ''} (by hand)`,
        )
        continue
      }
      await report.change(`install ${tool.command} (${command.join(' ')})`, () => {
        const [bin, ...args] = command
        return run(bin!, args).ok
      })
    }
    if (missing === 0) report.ok('every tool is installed')
  },
}
