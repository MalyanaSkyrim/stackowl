/** `secrets set <environment>` and `github vars`: one setup step on its own, dry run first. */
import pc from 'picocolors'

import { loadConfig, loadEnv } from '../config'
import { createReporter, fail } from '../lib/output'
import { has } from '../lib/run'
import { setSecrets } from '../modules/gcp'
import { syncVariables } from '../modules/github'
import type { Context } from '../types'

async function context(apply: boolean, configFile?: string): Promise<Context> {
  const config = await loadConfig({ file: configFile })
  return {
    config,
    env: loadEnv(config),
    report: createReporter({ apply }),
    apply,
  }
}

const dryRunHint = (apply: boolean) =>
  apply ? '' : pc.dim(' (dry run: add --apply to change)')

export async function secretsSet(
  environment: string | undefined,
  options: { apply: boolean; configFile?: string },
): Promise<number> {
  const ctx = await context(options.apply, options.configFile)
  const { environments } = ctx.config
  if (!environment || !environments.includes(environment))
    fail(`Usage: stackowl secrets set <${environments.join('|')}> [--apply]`)
  if (!ctx.config.gcp)
    fail('No gcp section in stackowl.config: nothing to set.')
  console.log(pc.bold(`Secrets for ${environment}`) + dryRunHint(options.apply))
  await setSecrets(ctx, environment)
  if (options.apply)
    console.log(
      pc.dim(
        '\nServices read the latest versions when a new revision starts: redeploy to pick them up.',
      ),
    )
  return ctx.report.problems === 0 ? 0 : 1
}

export async function githubVars(options: {
  apply: boolean
  configFile?: string
}): Promise<number> {
  const ctx = await context(options.apply, options.configFile)
  if (!has('gh')) fail('gh is not installed: https://cli.github.com')
  console.log(pc.bold('Repository variables') + dryRunHint(options.apply))
  await syncVariables(ctx)
  return ctx.report.problems === 0 ? 0 : 1
}
