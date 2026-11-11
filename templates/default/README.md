# Starter App

An iPhone app, its API, a website and one UI kit they share, in one monorepo. Created with [stackowl](https://www.npmjs.com/package/stackowl): every layer works from the first run, and the **notes** feature shows how a feature goes through all of them (database, API, app). Copy it for your first real feature, then delete it.

**Start with the docs:** `pnpm docs` opens the docs site at http://localhost:3004 (pages in [`apps/docs/content/`](apps/docs/content)): setup step by step, architecture, coding conventions and guides.

## What is inside

```
starter-app/
├── apps/
│   ├── api/              # API: accounts and the notes example (Fastify + tRPC, Prisma)
│   ├── mobile/           # The iPhone app: Expo / React Native (expo-router, NativeWind)
│   ├── web/              # Next.js website: landing page, privacy policy, terms, support
│   ├── docs/             # Docs site (Fumadocs): setup step by step, reference, architecture
│   └── workshop/         # Workshop: one browser Storybook for every UI component
├── packages/
│   ├── ui/               # Universal UI kit (React Native + NativeWind) and email kit
│   ├── design-tokens/    # Colors, radii, type and shadows shared by web and mobile
│   ├── common/           # Shared zod schemas, models, brand, utilities
│   ├── database/         # Prisma schema and database client used by the API
│   └── config/           # Shared ESLint, Prettier and TypeScript configs
├── infra/                # OpenTofu: Google Cloud (Cloud Run, Secret Manager, deploy access)
├── tooling/              # iOS signing and deploy scripts
├── stackowl.config.ts   # What the project needs outside its code, checked by `pnpm doctor`
├── .claude/skills/       # Task guides (skills) for AI agents
└── .github/workflows/    # CI, deploys and the iOS release
```

## Requirements

- Node.js 24.11 or newer, pnpm 10.10 (`corepack enable`), Docker
- For the iPhone app: a Mac with Xcode

`pnpm doctor` checks all of it, and says what each missing piece is for.

## Getting started

`stackowl create` already ran these for you. On a fresh clone:

```bash
pnpm install
cp .env.example .env            # then set AUTH_SECRET and API_KEY (openssl rand -base64 32)
pnpm db:start                   # CockroachDB and Redis in Docker
pnpm db:push                    # create the tables
pnpm db:seed                    # demo@example.com / password123, with two notes
pnpm dev                        # API, website and Metro
pnpm --filter=@starter/mobile ios   # build and run the iOS app
```

| Address               | What                          |
| --------------------- | ----------------------------- |
| http://localhost:4000 | API                           |
| http://localhost:3003 | Website                       |
| http://localhost:3004 | Docs (`pnpm docs`)            |
| http://localhost:6006 | Workshop (`pnpm workshop`)    |
| localhost:26261       | CockroachDB (`pnpm db:start`) |
| http://localhost:8086 | CockroachDB admin UI          |

All workspaces read the single `.env` at the repo root. Without Resend configured, sign-up codes are written to the API log.

## Scripts

| Command                                      | What it does                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                                   | Start every app in watch mode                                            |
| `pnpm doctor`                                | Check tools, keys, GitHub and Google Cloud; changes nothing              |
| `pnpm stackowl setup --apply`               | Set up what can be scripted (GitHub variables and labels, cloud secrets) |
| `pnpm secrets:set <env> --apply`             | Give the API's cloud secrets their values from `.env.<env>`              |
| `pnpm infra:init`                            | Create the Google Cloud infrastructure (OpenTofu)                        |
| `pnpm mobile:signing`                        | One-time iOS signing setup for the deploy workflow                       |
| `pnpm db:start` / `db:stop`                  | Start or stop the local CockroachDB and Redis (Docker)                   |
| `pnpm db:push`                               | Apply the Prisma schema to the local database, without a migration       |
| `pnpm db:migrate`                            | Apply the migrations to the local database (`prisma migrate dev`)        |
| `pnpm db:seed`                               | Add the demo user and its notes                                          |
| `pnpm workshop`                              | Open the Workshop (Storybook) for the UI kit                             |
| `pnpm build` / `typecheck` / `lint` / `test` | Build, type-check, lint and test the monorepo                            |

Run a script in one workspace with `pnpm --filter=@starter/<name> <script>`.

## Make it yours

1. **Brand**: name, links and support email in `packages/common/src/brand.ts`; colors and fonts in `packages/design-tokens/src/tokens.ts`.
2. **Icons**: replace the images in `apps/mobile/assets/`, `apps/web/app/icon.svg` and the `AppLogo` component in `packages/ui/src/components/AppLogo/index.tsx`.
3. **Copy**: the website's text in `apps/web/locales/`, the app's in `apps/mobile/src/lib/i18n/messages/`.
4. **Legal**: the privacy policy and terms are starting points with [PLACEHOLDERS]; make them describe your app and have them reviewed.
5. **Your first feature**: copy the notes feature (`apps/api/src/modules/notes`, `packages/database/prisma/notes`, `apps/mobile/app/notes`), then delete it.

## Deployment

The docs walk through each step, in order: `apps/docs/content/setup/`.

- **API and website** run on Google Cloud Run, created by OpenTofu (`infra/`) and deployed by the GitHub workflows: `main` deploys staging, `production` deploys production.
- **iPhone app** ships to TestFlight with Fastlane: run the **Deploy Mobile (iOS)** workflow, or `pnpm mobile:deploy` on your Mac.

## Working with AI agents

- `AGENTS.md` holds the repo rules. `CLAUDE.md` imports it for Claude Code.
- `.claude/skills/` holds task guides, one folder each with a `SKILL.md`: web, mobile and API features, forms, component layers, Arabic right to left.
