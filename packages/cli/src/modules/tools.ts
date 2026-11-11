import { has } from '../lib/run'
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
}
