<p align="center"><img src="https://raw.githubusercontent.com/MalyanaSkyrim/stackowl/main/.github/logo.svg" width="72" alt="" /></p>

<h1 align="center">StackOwl</h1>

Start a full app from nothing, and keep everything it needs outside its code in check.

```sh
npx stackowl create my-app   # website, API, iPhone app, docs, infra and CI, running locally
npx stackowl doctor          # checks tools, keys, GitHub and cloud secrets; changes nothing
npx stackowl setup           # what it would set up (add --apply to do it)
```

`create` copies the starter (Next.js website, Fastify + tRPC API with email, Apple and Google sign-in, Expo iPhone app, Fumadocs docs, Storybook, Prisma, OpenTofu for Google Cloud, GitHub Actions), renames everything for your app, writes `.env` with local secrets, installs, starts the local database and seeds a demo user. Or `--from github:you/your-template`.

## Commands

| Command                                 | What it does                                                |
| --------------------------------------- | ----------------------------------------------------------- |
| `stackowl init [--yes] [--force]`      | Writes `stackowl.config.ts` from a few questions           |
| `stackowl doctor [module...] [--json]` | Runs every check; exits with 1 when something must be fixed |
| `stackowl setup [module...] [--apply]` | Runs every setup step; a dry run without `--apply`          |
| `stackowl secrets set <env> [--apply]` | Gives Google Secret Manager values from `.env.<env>`        |
| `stackowl github vars [--apply]`       | Sets GitHub repository variables from the env file          |
| `stackowl modules`                     | Lists the modules and whether this project uses them        |

## Config

```ts
import { defineConfig } from 'stackowl'

export default defineConfig({
  name: 'my-app',
  environments: ['staging', 'production'],
  node: '20',
  tools: [{ command: 'docker', why: 'the local database' }],
  env: {
    required: ['DATABASE_URL'],
    groups: { 'Sign-in': ['GOOGLE_CLIENT_ID'] },
  },
  github: {
    variables: { API_URL_STAGING: { why: 'the API staging builds call' } },
    environmentSecrets: { production: ['DEPLOY_KEY'] },
    labels: ['migration'],
  },
  gcp: {
    secrets: { required: ['DATABASE_URL', 'AUTH_SECRET'] },
  },
})
```

## Rules every command follows

- Dry run first: nothing changes without `--apply`.
- Safe to run again: what is already right is skipped.
- Values are never printed: secrets are compared, and passed to CLIs on stdin.
- Output marks: `✓` fine, `!` worth a look, `✖` must be fixed, `+` a change.

Your own services plug in as modules (`defineModule`). Docs: https://malyanaskyrim.github.io/stackowl/

## License

MIT
