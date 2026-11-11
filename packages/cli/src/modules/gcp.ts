import path from 'node:path'

import { readEnvFile } from '../config'
import { has, run } from '../lib/run'
import type { Context, GcpConfig, Module, ResolvedConfig } from '../types'

export const defaultSecretId = (name: string, environment: string) =>
  `${name}_${environment.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`

export function gcpProject(
  config: ResolvedConfig,
  env: Context['env'],
): string | undefined {
  const gcp = config.gcp ?? {}
  return gcp.project || env[gcp.projectEnv ?? 'GCP_PROJECT_ID']
}

export function secretNames(gcp: GcpConfig) {
  return {
    required: gcp.secrets?.required ?? [],
    optional: gcp.secrets?.optional ?? [],
  }
}

/** A thin wrapper around `gcloud … --project=<project>`. */
export function gcloudFor(project: string) {
  const gcloud = (args: string[], input?: string) =>
    run('gcloud', [...args, `--project=${project}`], { input })
  return {
    /** The secret's latest value; null when the secret or any version is missing. */
    latest(secret: string): string | null {
      const result = gcloud([
        'secrets',
        'versions',
        'access',
        'latest',
        `--secret=${secret}`,
      ])
      return result.ok ? result.stdout : null
    },
    exists: (secret: string) =>
      gcloud(['secrets', 'describe', secret, '--format=value(name)']).ok,
    create: (secret: string) =>
      gcloud(['secrets', 'create', secret, '--replication-policy=automatic'])
        .ok,
    addVersion: (secret: string, value: string) =>
      gcloud(['secrets', 'versions', 'add', secret, '--data-file=-'], value).ok,
  }
}

function ready(ctx: Context): string | null {
  const project = gcpProject(ctx.config, ctx.env)
  if (!project) {
    ctx.report.note(
      `${ctx.config.gcp?.projectEnv ?? 'GCP_PROJECT_ID'} is not set: Google Cloud skipped`,
    )
    return null
  }
  if (!has('gcloud')) {
    ctx.report.note(
      'gcloud is not installed (https://cloud.google.com/sdk/docs/install): Google Cloud skipped',
    )
    return null
  }
  return project
}

/**
 * Gives every secret of one environment its value from `.env.<environment>`. Dry run unless
 * `ctx.apply`. Values are compared, never printed. Shared with `setupwise secrets set`.
 */
export async function setSecrets(
  ctx: Context,
  environment: string,
  quiet = false,
): Promise<void> {
  const { config, report } = ctx
  const gcp = config.gcp ?? {}
  const project = quiet ? gcpProject(config, ctx.env) : ready(ctx)
  if (!project) return
  const g = gcloudFor(project)
  const idOf = gcp.secretId ?? defaultSecretId
  const valuesFile = path.join(config.root, `.env.${environment}`)
  const values = readEnvFile(valuesFile)
  const relative = path.relative(config.root, valuesFile)

  report.note(`project ${project}, values from ${relative}`)
  if (Object.keys(values).length === 0)
    report.note(`${relative} is missing or empty: only checking what is set`)

  const setValue = async (name: string, value: string) => {
    const secret = idOf(name, environment)
    const wanted = value.trim()
    if (g.latest(secret) === wanted) {
      report.ok(`${secret} is up to date`)
      return
    }
    if (!g.exists(secret)) {
      if (gcp.createMissing === false) {
        report.problem(
          `${secret} doesn't exist: create it in your infrastructure code first`,
        )
        return
      }
      const created = await report.change(`create ${secret}`, () =>
        g.create(secret),
      )
      if (!created) return
    }
    await report.change(`add a new version of ${secret}`, () =>
      g.addVersion(secret, wanted),
    )
  }

  const { required, optional } = secretNames(gcp)
  report.heading(`Required (${environment})`)
  if (required.length === 0) report.note('no secrets in gcp.secrets.required')
  for (const name of required) {
    const value = values[name]
    const secret = idOf(name, environment)
    if (value) await setValue(name, value)
    else {
      const latest = g.latest(secret)
      if (latest === null)
        report.problem(`${secret} has no value: add ${name} to ${relative}`)
      else if (gcp.placeholder && latest === gcp.placeholder)
        report.problem(
          `${secret} still holds the placeholder: add ${name} to ${relative}`,
        )
      else
        report.ok(
          `${secret} has a value (${name} not in ${relative}, left as it is)`,
        )
    }
  }

  if (optional.length > 0) {
    report.heading(`Optional (${environment})`)
    for (const name of optional) {
      const value = values[name]
      if (value) await setValue(name, value)
      else if (g.latest(idOf(name, environment)) === null)
        report.note(`${idOf(name, environment)} has no value`)
      else report.ok(`${idOf(name, environment)} has a value`)
    }
  }
}

export const gcpModule: Module = {
  id: 'gcp',
  title: 'Google Cloud',
  description:
    'Secret Manager values per environment: none missing, none left on a placeholder.',
  docs: 'modules/gcp.mdx',
  enabled: (config) => Boolean(config.gcp),
  check(ctx) {
    const { config, report } = ctx
    const gcp = config.gcp ?? {}
    const project = ready(ctx)
    if (!project) return
    const g = gcloudFor(project)
    const idOf = gcp.secretId ?? defaultSecretId
    const { required, optional } = secretNames(gcp)

    for (const environment of config.environments) {
      const empty: string[] = []
      const placeholders: string[] = []
      for (const name of required) {
        const secret = idOf(name, environment)
        const latest = g.latest(secret)
        if (latest === null) empty.push(secret)
        else if (gcp.placeholder && latest === gcp.placeholder)
          placeholders.push(secret)
      }
      const emptyOptional = optional
        .map((name) => idOf(name, environment))
        .filter((secret) => g.latest(secret) === null)

      if (empty.length === 0 && placeholders.length === 0)
        report.ok(`${environment}: every required secret has a value`)
      if (placeholders.length > 0)
        report.problem(
          `${environment}: still the placeholder in ${placeholders.join(', ')} (setupwise secrets set ${environment})`,
        )
      if (empty.length > 0)
        report.problem(
          `${environment}: no value (or no access) in ${empty.join(', ')} (setupwise secrets set ${environment})`,
        )
      if (emptyOptional.length > 0)
        report.note(
          `${environment}: optional secrets with no value: ${emptyOptional.join(', ')}`,
        )
    }
  },
  async setup(ctx) {
    if (!ready(ctx)) return
    for (const environment of ctx.config.environments)
      await setSecrets(ctx, environment, true)
  },
}
