import { fail } from '../lib/output'
import type { Module, ResolvedConfig } from '../types'
import { envModule } from './env'
import { gcpModule } from './gcp'
import { githubModule } from './github'
import { toolsModule } from './tools'

/** The built-in modules, in the order they run. */
export const builtInModules: Module[] = [
  toolsModule,
  envModule,
  githubModule,
  gcpModule,
]

/** The modules this project uses: built-in ones that apply, then the config's own. */
export function projectModules(config: ResolvedConfig): Module[] {
  const modules = [...builtInModules, ...(config.modules ?? [])]
  const seen = new Set<string>()
  for (const module of modules) {
    if (seen.has(module.id)) fail(`Two modules have the id "${module.id}".`)
    seen.add(module.id)
  }
  return modules.filter((module) => module.enabled?.(config) ?? true)
}

/** The modules named on the command line, in run order; all of them when none is named. */
export function selectModules(config: ResolvedConfig, ids: string[]): Module[] {
  const modules = projectModules(config)
  if (ids.length === 0) return modules
  const known = new Map(modules.map((module) => [module.id, module]))
  const unknown = ids.filter((id) => !known.has(id))
  if (unknown.length > 0)
    fail(
      `Unknown or disabled module: ${unknown.join(', ')}. This project has: ${[...known.keys()].join(', ')}.`,
    )
  return modules.filter((module) => ids.includes(module.id))
}

export { envModule, gcpModule, githubModule, toolsModule }
