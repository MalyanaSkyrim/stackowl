---
title: 'Coding conventions'
description: 'How we work in the repository, and the commands everyone uses.'
---

These rules apply to everyone who changes the code, people and AI agents alike. Agents read the same rules from `AGENTS.md` at the root of the repository (see [Agent rules](https://github.com/your-github-user/starter-app/blob/main/AGENTS.md)). When a rule changes, change it in both places.

## The rules in short

- **One UI kit.** Every screen, on web and mobile, is built from `@starter/ui`. No web-only or mobile-only components. [More](ui.md)
- **PascalCase component files.** `SignIn.tsx`, not `sign-in.tsx`; route files in `app/` keep the names the router needs. [More](ui.md#file-names)
- **Strict TypeScript.** No `any`, no `as` casts, no `unknown` unless there is no other way, with a comment saying why. [More](typescript.md)
- **One source of truth.** Shared schemas, colors, the product name and environment variables each live in exactly one place. [More](contracts.md)
- **No Prisma enums.** A column with a fixed set of values is a `String`; its values are a zod enum in `@starter/common`. [More](contracts.md)
- **API modules have one layout.** Router → handlers → services, with one error class per failure. Responses carry only data, never `status: 'ok'`; a shipped procedure never breaks. [More](https://github.com/your-github-user/starter-app/blob/main/apps/api/README.md#adding-a-procedure)
- **Migrations are written by hand.** Change the Prisma schema only; tools and AI agents never create or edit migration files.
- **Branches start with `feature/` or `hotfix/`**, then the issue number: `feature/8-forgot-password`. Never a username. [More](git-and-ci.md#branches-and-pull-requests)
- **Every pull request passes CI**: spelling, formatting, types, lint, tests and builds. [More](git-and-ci.md)

## The monorepo

The repository is a **pnpm workspace** run with Turborepo. Each app and package has a name, `@starter/<name>`, and its own scripts.

Run a script in one workspace with `--filter`, from the root, instead of `cd`-ing into the folder:

```sh
pnpm --filter=@starter/<name> <script>

pnpm typecheck --filter=@starter/mobile
pnpm build --filter=@starter/web
pnpm test --filter=@starter/common
```

Check the `scripts` in the workspace's `package.json` first: not every workspace has `build`, `test` or `typecheck`.

## Commands from the root

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `pnpm dev`       | Start the API, the web app and the mobile bundler |
| `pnpm workshop`  | Open the Workshop (Storybook) for the UI kit      |
| `pnpm build`     | Build every app and package                       |
| `pnpm typecheck` | Type-check the monorepo                           |
| `pnpm lint`      | Lint the monorepo                                 |
| `pnpm test`      | Run the tests                                     |
| `pnpm spell`     | Check spelling with cspell                        |
| `pnpm format`    | Format with Prettier                              |
