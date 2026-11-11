import type { FastifyBaseLogger } from 'fastify'

/**
 * Runs `work` and resolves no sooner than `ms` after the call, whether it
 * succeeded or failed. For answers that must not reveal what happened behind
 * them, such as whether an email has an account: the work for a real account
 * (a code, an email) would otherwise take visibly longer than none at all.
 *
 * A failure is logged, not thrown, for the same reason: a failed email must
 * not turn into an error that only real accounts get.
 */
export const inFixedTime = async (
  ms: number,
  work: () => Promise<unknown>,
  log: FastifyBaseLogger,
): Promise<void> => {
  const minimum = new Promise((resolve) => setTimeout(resolve, ms))
  await work().catch((error: unknown) => {
    log.error(error, 'Work behind a fixed-time answer failed')
  })
  await minimum
}
