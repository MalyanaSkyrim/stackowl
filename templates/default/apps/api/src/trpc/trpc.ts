import { initTRPC, TRPCError } from '@trpc/server'

import { AppError, type AppErrorStatus } from '../errors'
import { UnverifiedEmailError } from '../modules/auth/auth.errors'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  // A known failure carries its reason (see `errors.ts`) so the app can show
  // the matching message; the HTTP status already says that it failed.
  errorFormatter({ shape, error }) {
    const cause = error.cause
    return {
      ...shape,
      data: {
        ...shape.data,
        reason: cause instanceof AppError ? cause.reason : null,
        resendInSeconds:
          cause instanceof UnverifiedEmailError ? cause.resendInSeconds : null,
      },
    }
  },
})

/** The tRPC code, and so the HTTP status, for each status an `AppError` uses. */
const statusToCode: Record<AppErrorStatus, TRPCError['code']> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  412: 'PRECONDITION_FAILED',
  429: 'TOO_MANY_REQUESTS',
}

/**
 * Services throw `AppError`s, which tRPC would otherwise answer with a 500.
 * This gives each one its own code, and keeps it as the cause for the error
 * formatter.
 */
const appErrors = t.procedure.use(async ({ next }) => {
  const result = await next()
  if (!result.ok && result.error.cause instanceof AppError) {
    const cause = result.error.cause
    throw new TRPCError({
      code: statusToCode[cause.status],
      message: cause.message,
      cause,
    })
  }
  return result
})

export const router = t.router

/** Open to anyone: sign-up, sign-in, password reset. */
export const publicProcedure = appErrors

/** Needs a valid access token; `ctx.userId` is the signed-in user. */
export const protectedProcedure = appErrors.use(({ ctx, next }) => {
  if (ctx.userId === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})
