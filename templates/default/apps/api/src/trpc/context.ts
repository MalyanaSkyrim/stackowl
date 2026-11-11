import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

import { verifyAccessToken } from '../modules/auth/utils/tokens'

/**
 * Built for every tRPC request. `userId` comes from the
 * `Authorization: Bearer <access token>` header, or is null when the header
 * is missing, the token is invalid or expired, or its session has ended.
 *
 * There is no database here on purpose: routers call their module's service,
 * and only services read and write the database.
 */
export async function createContext({ req }: CreateFastifyContextOptions) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  return {
    log: req.log,
    userId: token === null ? null : await verifyAccessToken(token),
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
