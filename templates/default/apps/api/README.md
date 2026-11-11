# API

The Starter App backend: accounts, and the notes example to copy for your own features. Fastify serves every module's tRPC router under `/trpc` and a plain `GET /health`.

```sh
pnpm --filter=@starter/api dev     # http://localhost:4000 (API_PORT)
pnpm --filter=@starter/api test    # runs against TEST_DATABASE_URL
pnpm --filter=@starter/api build
```

| Folder                | What it holds                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `src/trpc/`           | tRPC setup: context, procedures, the app router and its type, `AppError` → HTTP status     |
| `src/errors.ts`       | `AppError`, the base class of every failure the app explains                               |
| `src/modules/auth/`   | Accounts: the procedures, and in `utils/` tokens, passwords, email codes, Apple and Google |
| `src/modules/notes/`  | The notes example: list, get, create, update, delete. Copy it for your first feature       |
| `src/modules/health/` | `GET /health` for Cloud Run                                                                |
| `src/plugins/`        | Fastify plugins: request logging, rate limiting, HTTP errors                               |

The database schema is in `packages/database` (see [Shared packages](../docs/content/architecture/packages.md)). The environment variables are listed in the root `.env.example`.

## Adding a procedure

Each module has the same files: `<module>.router.ts` → `<module>.handlers.ts` → `<module>.services.ts`, with `<module>.errors.ts`, `<module>.test.ts`, and `<module>.utils.ts` or a `utils/` folder (`src/modules/auth/` is the reference). The step-by-step guide, with examples, is the `add-api-feature-guide` skill (`.claude/skills/`). In short:

- The service does the work and returns the data itself: never `status: 'ok'`. A failure throws a class from `<module>.errors.ts` (`throw new EmailTakenError()`), which sets its reason and HTTP status; the app reads the reason in `data.reason`.
- The handler reads `ctx` and `input` and calls the service. The router line is `publicProcedure` or `protectedProcedure`, the input zod schema from `@starter/common`, and the handler. Inside a protected procedure, `ctx.userId` is the signed-in user.
- Only services and utils use the database: the tRPC context has no `db`.
- tRPC is for our own apps. Callers outside them (health checks, webhooks) get a plain Fastify route, like `modules/health/health.route.ts`.
- A procedure that has shipped never breaks, because old app builds stay in use: add a new procedure instead.

## Email codes in development

Codes are sent through Resend (`RESEND_API_KEY`, `RESEND_FROM`). In development without them, the API writes each code to its log instead, so sign-up works without an email provider. The tests rely on this, and need a database at `TEST_DATABASE_URL` with the schema pushed (`pnpm db:push:test`).
