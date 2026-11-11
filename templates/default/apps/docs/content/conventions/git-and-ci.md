---
title: 'Git and CI'
description: 'Branches, commit messages, pull requests and the checks every change passes.'
---

## Branches and pull requests

- `main` is always deployable. Work on a branch and open a pull request.
- A branch name starts with its type, then the issue number (if there is one) and a few words in kebab-case:
  - `feature/<issue>-<what>` for new work: features, refactors, docs, chores. Example: `feature/8-forgot-password`.
  - `hotfix/<issue>-<what>` for a fix to something already shipped. Example: `hotfix/31-otp-email-not-sent`.

  Never use a name or a username as the prefix (`<username>/…`).

- Keep a pull request to one change. Describe what a reader would see before and after.

## Commit messages

Short, in the imperative, with a type and an optional scope, as in the history:

```text
feat(ui): wave 2, universal form controls
fix(ci): spell check words and BottomSheet snapPoints type
docs: describe the universal UI kit
refactor: remove packages/mobile-ui
chore(ui): ban DOM elements and react-dom in the universal kit
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`. Scopes are a workspace or area: `ui`, `web`, `mobile`, `api`, `ci`, `docs`…

## What CI checks

Every pull request runs `.github/workflows/ci.yml`:

1. Spelling (`pnpm spell`). Add real words the dictionary does not know to `cspell.json`.
2. Formatting (`pnpm format:check`).
3. Types and lint (`pnpm typecheck && pnpm lint`).
4. Unit tests for `common`, `web` and `mobile`.
5. Builds of every app and package.
6. The Workshop build.
7. The migrations match the Prisma schema (the `migrations` job): it applies `packages/database/prisma/migrations` to an empty CockroachDB with `prisma migrate deploy`, then fails if `prisma migrate diff` finds schema changes no migration covers. When it fails, write the missing migration.

Run the same checks before pushing. A pre-commit hook (husky and lint-staged) formats the files you commit.

## Deploys

Deploys are started by hand. See [Running and deploying](../architecture/environments.md).
