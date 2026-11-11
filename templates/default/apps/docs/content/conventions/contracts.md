---
title: 'Shared contracts'
description: 'The things that live in exactly one place, and where.'
---

Some things must mean the same in every app. Each lives in one place; everything else reads from there.

| What                          | The one place                                                        | Rule                                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared data shapes            | `packages/common/src/schemas` (zod)                                  | The apps import them. Change the schema first, then the callers.                                                                                      |
| Shared validation limits      | Constants next to the schema in `packages/common/src/schemas`        | The app's forms and their messages import them (`PASSWORD_MIN_LENGTH`); never retype the number.                                                      |
| App-only validation limits    | A constant exported next to the app's schema                         | The schema and the input (`maxLength`) both read it (`<FIELD>_MAX_LENGTH`).                                                                           |
| Allowed values of a field     | Its zod enum                                                         | Loop over `schema.options`, narrow with `schema.safeParse`; never retype the list. Data keyed by the values is a `Record<Value, …>`.                  |
| Colors, radii, spacing, fonts | `packages/design-tokens/src/tokens.ts`                               | Run `pnpm --filter=@starter/design-tokens generate` after a change. Never hardcode them in a Tailwind config or CSS file.                           |
| Product name and links        | `packages/common/src/brand.ts`                                       | Never write the product name in UI text or emails; read `brand.displayName`.                                                                          |
| Allowed values of a column    | `packages/common/src/schemas` (zod enum)                             | Never a Prisma `enum`: a `String` column typed with `/// [<Type>]` (declared in `packages/database/prisma/json-types.ts`), validated with the schema. |
| Environment variables         | Root `.env.example`, checked in the web app's and the API's `env.ts` | When you add a variable, update both.                                                                                                                 |
