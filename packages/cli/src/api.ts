/**
 * What a project imports from `stackowl`: helpers to write a typed config and your own modules.
 *
 *   import { defineConfig, defineModule } from 'stackowl'
 */
import type { Config, Module } from './types'

export type {
  Config,
  Context,
  EnvConfig,
  GcpConfig,
  GithubConfig,
  GithubVariable,
  Module,
  Reporter,
  ResolvedConfig,
  Tool,
} from './types'

/** Types your `stackowl.config.ts`; returns the config unchanged. */
export const defineConfig = (config: Config): Config => config

/** Types one of your own modules; returns it unchanged. */
export const defineModule = (module: Module): Module => module

export { run, has } from './lib/run'
export { ghList, ghNames, ghVariables } from './lib/github'
export { builtInModules } from './modules'
