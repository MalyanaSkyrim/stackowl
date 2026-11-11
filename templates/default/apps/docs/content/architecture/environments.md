---
title: 'Running and deploying'
description: 'Run everything on your computer, the environment variables, and how each app is deployed.'
---

## Run it on your computer

You need Node.js 24.11 or newer, pnpm 10.10 (`corepack enable`), and Xcode on a Mac for the iPhone app. App locking only works on a real iPhone, not in the simulator.

```sh
pnpm install
cp .env.example .env

pnpm dev                    # web on :3003, Metro on :8083
```

| Address               | What                       |
| --------------------- | -------------------------- |
| http://localhost:3003 | Web app                    |
| http://localhost:6006 | Workshop (`pnpm workshop`) |

## Environment variables

Every app reads the single `.env` at the root of the repository. Each variable is declared once in `.env.example`; the web app checks its own in `env.ts`. When you add one, update both.

| Group                  | Variables                                                    |
| ---------------------- | ------------------------------------------------------------ |
| Mobile build           | `EXPO_PUBLIC_APP_NAME`, `APP_BUNDLE_ID`, `APPLE_TEAM_ID`     |
| Monitoring             | `EXPO_PUBLIC_SENTRY_DSN`                                     |
| Web                    | `NEXT_PUBLIC_META_PIXEL_ID`                                  |
| Infra                  | `GCP_PROJECT_ID`                                             |
| Tooling                | `TURBO_TOKEN`, `TURBO_TEAM`                                  |

## Setup scripts

Run from the repository root, with the values in the root `.env`. Each one is a dry run unless given `--apply`, and safe to run again.

| Command                                                | What it does                                                                                                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm doctor`                                          | Checks tools, root `.env` keys, GitHub (variables, signing secrets, labels, the production branch) and Google Cloud (placeholder secrets, placeholder images). Changes nothing. |
| `pnpm infra:init`                                      | First setup of Google Cloud with OpenTofu ([Infrastructure](infrastructure.md)).                                                                                                |
| `pnpm secrets:set <staging\|production>`               | Gives the API's secrets their values from `.env.staging` / `.env.production` ([Infrastructure](infrastructure.md)).                                                             |
| `pnpm github:vars`                                     | Sets the repository variables Deploy Mobile writes into the build ([Mobile deployment](../setup/6-apple.mdx)).                                                        |
| `pnpm mobile:signing`                                  | iOS signing: GitHub `production` environment, deploy key, signing secrets, App Store profiles ([Mobile deployment](../setup/6-apple.mdx)).                            |
| `pnpm mobile:deploy [staging\|production]`             | Builds the iPhone app on this Mac and uploads it to TestFlight, like the Deploy Mobile workflow.                                                                                |

They read keys through `scripts/lib/env.ts`: the root `.env` first, then `SIGNING_ENV_SOURCE` for the Apple values `pnpm mobile:signing` shares.

## Deploying

- **Mobile (iOS)** ships to TestFlight with Fastlane, from the **Deploy Mobile (iOS)** workflow. See [Mobile deployment](../setup/6-apple.mdx).
- **The API and the web app** run on Google Cloud Run, in a staging and a production environment described with OpenTofu in `infra/`. **Deploy Staging** runs on every push or merge to `main`, and **Deploy Production** on every push or merge to `production`; both can also be run by hand from the Actions tab. Their steps live in one reusable workflow, `deploy.yml`. To merge a small pull request without deploying staging, give it the `skip-staging-deploy` label. See [Infrastructure](infrastructure.md).
