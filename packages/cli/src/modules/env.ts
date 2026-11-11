import { existsSync } from 'node:fs'
import path from 'node:path'

import { readEnvFile } from '../config'
import type { Module } from '../types'

export const envModule: Module = {
  id: 'env',
  title: 'Env file',
  description:
    'Keys in the env file: required ones, groups by feature, and what .env.example lists.',
  docs: 'modules/env.mdx',
  check({ config, env, report }) {
    const envPath = path.join(config.root, config.envFile)
    const exampleName = config.env?.example ?? '.env.example'
    const examplePath = exampleName ? path.join(config.root, exampleName) : null

    if (!existsSync(envPath)) {
      const hint =
        examplePath && existsSync(examplePath)
          ? ` (cp ${exampleName} ${config.envFile})`
          : ''
      report.note(
        `${config.envFile} doesn't exist${hint}: only the process environment is read`,
      )
    }

    const required = config.env?.required ?? []
    const missingRequired = required.filter((key) => !env[key])
    if (required.length > 0) {
      if (missingRequired.length === 0) report.ok('required keys')
      else
        report.problem(`required keys not set: ${missingRequired.join(', ')}`)
    }

    for (const [group, keys] of Object.entries(config.env?.groups ?? {})) {
      const missing = keys.filter((key) => !env[key])
      if (missing.length === 0) report.ok(group)
      else report.note(`${group}: ${missing.join(', ')} not set`)
    }

    if (examplePath && existsSync(examplePath)) {
      const listed = Object.keys(readEnvFile(examplePath))
      const covered = new Set([
        ...required,
        ...Object.values(config.env?.groups ?? {}).flat(),
      ])
      const missing = listed.filter((key) => !covered.has(key) && !env[key])
      if (missing.length === 0)
        report.ok(`every key in ${exampleName} has a value`)
      else report.note(`in ${exampleName} but not set: ${missing.join(', ')}`)
    }
  },
}
