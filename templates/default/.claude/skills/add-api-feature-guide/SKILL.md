---
name: add-api-feature-guide
description: How to add endpoints and modules to the API (apps/api, Fastify + tRPC + Prisma) - the router / handlers / services / errors / utils layout, data-only responses, one error class per failure, plain Fastify routes for outside callers, and keeping shipped procedures compatible. Use ONLY for apps/api, NOT for the mobile or web apps.
---

# API Feature Guide

How to add a procedure, a module or a plain route to `apps/api`.

## When to Use

- Use ONLY for the API (`apps/api`)
- Use when adding or changing a tRPC procedure
- Use when adding a module under `src/modules/`
- Use when adding a failure the app must explain
- Use when something outside our apps (a webhook, a health check) needs an endpoint

## Module layout

Each module in `src/modules/<module>/` has these files:

| File                            | Holds                                                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `<module>.router.ts`            | Procedures only: `publicProcedure` / `protectedProcedure`, the `.input()` zod schema from `@starter/common`, the handler.   |
| `<module>.handlers.ts`          | One handler per procedure: reads `ctx` and `input`, calls a service, returns its data.                                        |
| `<module>.services.ts`          | The work: business rules and database calls. Returns the data itself and throws a `<module>.errors.ts` class on a failure.    |
| `<module>.errors.ts`            | One `AppError` subclass per failure, with its reason and HTTP status set in the class.                                        |
| `<module>.test.ts`              | The module's tests, through `appRouter.createCaller`.                                                                         |
| `<module>.utils.ts` or `utils/` | Helpers: one file when it is small, a folder when there are several. A unit test sits next to its file (`utils/otp.test.ts`). |

What each layer may use:

- **Router → handlers → services → utils**, never the other way.
- Only **services and utils** use the database (`db` from `@starter/database`). The tRPC context has no `db`.
- Only **routers and handlers** know about tRPC. Services and utils never import `@trpc/server`, so a plain Fastify route can reuse them.

`src/modules/auth/` is the reference module.

## Responses carry data only

The HTTP status code says whether a call worked. The body is the data and nothing else:

- Never add `status: 'ok'`, `success: true` or any other success flag. Return the object itself (`SignedIn`, `CodeSent`), or nothing for an action (`logOut`).
- Never answer a failure with a success shape (`{ status: 'VERIFY_EMAIL' }`). Throw an error class: the app gets the HTTP status and reads `data.reason` to know why.
- The same applies inside the code: a util returns the value (`consumeOtpCode` returns the user id) and throws on a failure, instead of returning `{ status: 'ok', … }`.

## Failures: one error class each

`src/errors.ts` holds the base class, `AppError`. Each module declares one subclass per failure in `<module>.errors.ts`, with its `reason` and `status` set in the class:

```ts
// auth.errors.ts
export class EmailTakenError extends AppError {
  readonly reason = 'EMAIL_TAKEN'
  readonly status = 409
}

// A failure that tells the app more adds its own field.
export class UnverifiedEmailError extends AppError {
  readonly reason = 'EMAIL_NOT_VERIFIED'
  readonly status = 403

  constructor(
    readonly resendInSeconds: number,
    message?: string,
  ) {
    super(message)
  }
}
```

A service throws it, with a custom message for the logs if one helps:

```ts
throw new EmailTakenError()
throw new InvalidOAuthTokenError('Google ID token could not be verified.', {
  cause: error,
})
```

The middleware in `src/trpc/trpc.ts` turns an `AppError` into the tRPC code that matches its `status` (`statusToCode`), and the error formatter sends `data.reason`. The app shows `t('errors.<reason>')`.

To add a failure:

1. Add the reason to `authErrorReasonSchema` in `packages/common/src/schemas/auth/user.ts`, with a comment saying when it happens.
2. Add the class to `<module>.errors.ts`. A status that `AppErrorStatus` doesn't have yet also needs an entry in `statusToCode`; typecheck fails until it has one.
3. If it carries extra data (like `resendInSeconds`), add the field to the `errorFormatter` in `src/trpc/trpc.ts`.
4. Add `errors.<REASON>` to `en.json`, `fr.json` and `ar.json` in `apps/mobile/src/lib/i18n/messages/`.

Inside a `db.$transaction`, **return** the error and throw it after the transaction. A throw rolls the transaction back, which would undo writes such as a burnt attempt (see `consumeOtpCode` in `auth/utils/otp.ts`).

## Adding a procedure

1. **Schema**: the input (and output, if the app needs its type) as zod schemas in `packages/common/src/schemas`, with their types exported.
2. **Service** in `<module>.services.ts`:

   ```ts
   export const signUp = async (
     input: SignUpInput,
     log: FastifyBaseLogger,
   ): Promise<CodeSent> => {
     const existing = await db.user.findUnique({
       where: { email: input.email },
     })
     if (existing?.emailVerified) throw new EmailTakenError()
     // …
     return { email: user.email, resendInSeconds }
   }
   ```

3. **Handler** in `<module>.handlers.ts`, one line that picks what the service needs:

   ```ts
   export const signUpHandler = ({ ctx, input }: Request<SignUpInput>) =>
     signUp(input, ctx.log)
   ```

   For a protected procedure, type `ctx` as `{ userId: string }`.

4. **Router line** in `<module>.router.ts`:

   ```ts
   signUp: publicProcedure.input(signUpInputSchema).mutation(signUpHandler),
   ```

5. **Test** in `<module>.test.ts`: the data on success, and the reason for each failure (`error.cause.reason`).

## Adding a module

Create `src/modules/<module>/` with the files above, and add its router to `appRouter` in `src/trpc/router.ts`. Its Prisma models go in `packages/database/prisma/<module>/` (see `AGENTS.md`).

## tRPC or a plain Fastify route

- **tRPC** for every call from our own apps. The mobile app imports `AppRouter` and gets the types end to end.
- **A plain Fastify route** only for callers outside our apps: health checks, webhooks (App Store Server Notifications, RevenueCat, Resend), OAuth redirects. Write it as `<module>.route.ts`, a `FastifyPluginAsync` registered in `src/server.ts` with a prefix, like `modules/health/health.route.ts`. It calls services too, and answers an `AppError` with `reply.code(error.status)`.

## Accounts and security

- **Don't reveal who has an account.** A procedure that must answer the same whether or not an email has an account (`requestPasswordReset`, `logIn`) gives the same shape, the same errors and the same timing. Wrap the work in `inFixedTime` (`auth/utils/fixedTime.ts`): it answers no sooner than a fixed time and logs a failure instead of throwing it, so a slow or failed email doesn't give a real account away. A password check with no password to compare against runs against a decoy hash (`verifyPasswordOrDecoy`).
- **Writes that must happen together go in one `db.$transaction`.** Helpers that write (`createSession`, `revokeAllSessions`) take an optional `client` so they can join the caller's transaction. When a check and a write depend on each other (the password checked in `logIn`, then the session created), re-read what was checked inside the transaction: CockroachDB runs transactions as if one after the other, so a concurrent change either lands first or fails.
- **Signing out is immediate.** An access token carries its session id (`sid`) and `verifyAccessToken` checks that the session is still live, so a sign-out, a password reset or a deleted account ends access at once, not when the token expires. Don't add a token or a session check that skips it.

## Shipped procedures never break

Old app builds stay on people's phones, and `pnpm typecheck` only checks the current app. Once a procedure has shipped:

- Only add **optional** input fields and **new** output fields.
- Never rename or remove a procedure or a field, and never make an input stricter.
- A breaking change becomes a new procedure (`auth.logInV2`); the old one stays until no supported build uses it.

## Checklist

- `pnpm --filter=@starter/api typecheck` and `lint`
- `pnpm --filter=@starter/mobile typecheck` (it imports `AppRouter`)
- `pnpm --filter=@starter/api test` (needs `TEST_DATABASE_URL` with the schema pushed: `pnpm db:push:test`)
- `apps/api/README.md` and `apps/docs/content/architecture/apps.md` updated when a module or procedure is added
