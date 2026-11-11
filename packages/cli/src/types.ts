/**
 * The shapes a project's `setupwise.config.ts` uses, and the module contract every check and
 * setup step follows.
 */

/** A command-line tool the project needs on the developer's machine. */
export type Tool =
  | string
  | {
      /** The command to look for on PATH, such as `docker`. */
      command: string
      /** What it is needed for, shown when it is missing. */
      why?: string
      /** How to install it, shown when it is missing. */
      install?: string
      /** Only check on this platform (`darwin`, `linux`, `win32`). */
      platform?: NodeJS.Platform
      /** A missing required tool is a problem (✖); otherwise only a note (!). */
      required?: boolean
    }

/** A repository variable `github vars` sets from the env file. */
export type GithubVariable = {
  /** What reads it, shown in the output. */
  why?: string
  /** The value when the env file doesn't set it. */
  fallback?: string
}

export type GithubConfig = {
  /** Repository variables (Actions → Variables), keyed by name. */
  variables?: Record<string, GithubVariable>
  /** Secrets each GitHub environment must hold, keyed by environment name. Only checked. */
  environmentSecrets?: Record<string, string[]>
  /** Repository secrets that must exist. Only checked. */
  secrets?: string[]
  /** Labels the workflows read; `setup github --apply` creates missing ones. */
  labels?: string[]
  /** Branches that must exist, such as `production`. Only checked. */
  branches?: string[]
}

export type GcpConfig = {
  /** The project id, or leave it out to read it from `projectEnv`. */
  project?: string
  /** The env variable holding the project id. Defaults to `GCP_PROJECT_ID`. */
  projectEnv?: string
  /** Secrets in Secret Manager, by the names your app reads. */
  secrets?: {
    /** The app can't start without these: a missing or placeholder value is a problem. */
    required?: string[]
    /** Reported when empty, never a problem. */
    optional?: string[]
  }
  /** The Secret Manager id for a name in an environment. Defaults to `NAME_ENVIRONMENT`. */
  secretId?: (name: string, environment: string) => string
  /** A value that means "never set", such as what your infrastructure code writes. */
  placeholder?: string
  /** Create a secret that doesn't exist yet when `secrets set --apply` has a value for it. */
  createMissing?: boolean
}

export type EnvConfig = {
  /** Keys grouped by what they unlock; a missing key only blocks its group (!). */
  groups?: Record<string, string[]>
  /** Keys without which nothing works: a missing one is a problem (✖). */
  required?: string[]
  /** Compare the env file with this example file and list keys it lacks. Defaults to `.env.example`. */
  example?: string | false
}

export type Config = {
  /** The project's name, shown in the output. */
  name?: string
  /** The env file the CLI reads, relative to the config. Defaults to `.env`. */
  envFile?: string
  /** Deploy environments. Defaults to `['staging', 'production']`. */
  environments?: string[]
  /** The minimum Node.js version, such as `20` or `22.11`. */
  node?: string
  tools?: Tool[]
  env?: EnvConfig
  github?: GithubConfig
  gcp?: GcpConfig
  /** Your own modules, run after the built-in ones. */
  modules?: Module[]
}

/** The config once defaults are filled in. */
export type ResolvedConfig = Config & {
  name: string
  envFile: string
  environments: string[]
  /** The folder holding the config file; every relative path starts here. */
  root: string
  /** The config file, or null when running without one. */
  file: string | null
}

/** Prints one line per check and counts problems. */
export type Reporter = {
  ok(text: string): void
  note(text: string): void
  problem(text: string): void
  heading(text: string): void
  /** In a dry run, says what it would do; with `--apply`, does it and says how it went. */
  change(text: string, run: () => boolean | Promise<boolean>): Promise<boolean>
  readonly problems: number
}

export type Context = {
  config: ResolvedConfig
  /** The env file's values, overridden by the process environment. */
  env: Record<string, string | undefined>
  report: Reporter
  /** True when changes should be made, false for a dry run. */
  apply: boolean
}

/**
 * A service the project depends on. Every module has a check (read only, run by `doctor`) and
 * may have a setup step (dry run unless `--apply`, safe to repeat, run by `setup`).
 */
export type Module = {
  /** Short id used on the command line: `setupwise doctor github`. */
  id: string
  /** The section heading in the output. */
  title: string
  /** One line on what it covers, shown by `setupwise modules`. */
  description?: string
  /** A link to the page explaining how to fix what it reports. */
  docs?: string
  /** Whether the module applies to this project. Defaults to always. */
  enabled?(config: ResolvedConfig): boolean
  check(ctx: Context): void | Promise<void>
  setup?(ctx: Context): void | Promise<void>
}
