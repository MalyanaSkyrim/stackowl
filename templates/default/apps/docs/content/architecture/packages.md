---
title: 'Shared packages'
description: 'The code in packages/ that the apps share.'
---

Packages are not run on their own: apps import them. Each one is named `@starter/<name>`.

| Package                  | What it holds                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `@starter/ui`            | The universal UI kit (React Native + NativeWind) and the email templates                                |
| `@starter/design-tokens` | Colors, radii, spacing, type and shadows; generates the Tailwind preset, CSS variables and native theme |
| `@starter/common`        | Shared zod schemas and models, the brand, currency and logging helpers                                  |
| `@starter/database`      | The Prisma schema and the database client the API uses (see below)                                      |
| `@starter/config`        | Shared ESLint, Prettier and TypeScript settings                                                         |

## `@starter/ui`

See [UI kit](ui-kit.md). The email templates in `src/emails` use React Email and are the only place in the kit allowed to use HTML.

## `@starter/design-tokens`

`src/tokens.ts` is the source of every color, radius, spacing step and font. Run `pnpm --filter=@starter/design-tokens generate` after changing it; it writes the Tailwind preset, the CSS variables for the web and the theme for the phone.

## `@starter/common`

- `src/schemas/`: shared zod schemas.
- `src/brand.ts`: the product name, links, support email, default currency and locale. Never write the product name anywhere else.
- `src/models/`, `src/currency.ts`, `src/log-sanitize.ts`, `src/i18n-utils.ts`: shared types and helpers.

## Database (`@starter/database`)

The CockroachDB schema (Prisma provider `cockroachdb`), in `prisma/`, split by API module. Each `.prisma` file holds one model and is named after it (`auth/User.prisma`):

| Folder   | Models                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `auth/`  | `User`, `OAuthAccount` (Apple and Google ids), `Session` (hashed refresh tokens), `OtpCode` (hashed codes, by purpose) |
| `notes/` | `Note`, the example feature                                                                                            |

- No Prisma `enum`s: columns such as `OAuthAccount.provider` and `OtpCode.purpose` are `String`s whose values are zod enums in `@starter/common` (`oauthProviderSchema`, `otpPurposeSchema`). Each type is imported into the `PrismaJson` namespace in `prisma/json-types.ts`, and the `/// [<Type>]` comment above the column types it in the Prisma client.
- Every table hangs off `User` with `onDelete: Cascade`, so deleting an account deletes all of its data.
- **Migrations are written by hand.** Change the schema, then write the migration yourself; tools and agents never create or edit files in `prisma/migrations`. CI applies them on deploy.
- Locally, `pnpm db:start` runs CockroachDB (SQL on `localhost:26261`, admin UI on http://localhost:8086) and Redis (`localhost:6383`) from `docker-compose.yml`. It runs in insecure mode, so `DATABASE_URL` has no password: `postgresql://starter_app@localhost:26261/starter_app?sslmode=disable`. On its first start, `docker/cockroach/init.sql` creates the `starter_app` user, its `starter_app` and `starter_app_test` databases and its rights on `public`, and makes the user create tables unlocked: CockroachDB locks a new table's schema by default, which blocks the `ALTER TABLE` statements Prisma runs after `CREATE TABLE`.
- `pnpm --filter=@starter/database db:generate` builds the client (typecheck and build run it for you), `db:push` applies the schema to a local database, `db:seed` adds a demo user (see `prisma/seeds/README.md`), `db:studio` opens Prisma Studio.
