# setupwise

Check and set up everything a project needs outside its code: tools on each machine, keys in the env file, GitHub variables and secrets, and cloud secret values. One typed config, one command.

```sh
npx setupwise init      # writes setupwise.config.ts
npx setupwise doctor    # checks everything, changes nothing
npx setupwise setup     # what it would set up (add --apply to do it)
```

## Commands

| Command                                 | What it does                                                |
| --------------------------------------- | ----------------------------------------------------------- |
| `setupwise init [--yes] [--force]`      | Writes `setupwise.config.ts` from a few questions           |
| `setupwise doctor [module...] [--json]` | Runs every check; exits with 1 when something must be fixed |
| `setupwise setup [module...] [--apply]` | Runs every setup step; a dry run without `--apply`          |
| `setupwise secrets set <env> [--apply]` | Gives Google Secret Manager values from `.env.<env>`        |
| `setupwise github vars [--apply]`       | Sets GitHub repository variables from the env file          |
| `setupwise modules`                     | Lists the modules and whether this project uses them        |

## Config

```ts
import { defineConfig } from 'setupwise'

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

Your own services plug in as modules (`defineModule`). See the docs for the full reference.

## License

MIT
