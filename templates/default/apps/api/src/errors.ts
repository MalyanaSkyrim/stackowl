import type { AuthErrorReason } from '@starter/common'

/** The HTTP statuses a known failure can answer with. */
export type AppErrorStatus = 400 | 401 | 403 | 404 | 409 | 412 | 429

/**
 * A failure the app explains to the user. Each module declares one subclass
 * per failure in `<module>.errors.ts`, with its reason and status set in the
 * class, so a service only writes `throw new EmailTakenError()`.
 *
 * Services throw these instead of tRPC errors: the tRPC middleware in
 * `trpc/trpc.ts` turns them into the matching code, and a plain Fastify route
 * can answer with `status` directly. The message is for the logs only; the
 * app reads `reason`.
 */
export abstract class AppError extends Error {
  abstract readonly reason: AuthErrorReason
  abstract readonly status: AppErrorStatus

  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = new.target.name
  }
}
