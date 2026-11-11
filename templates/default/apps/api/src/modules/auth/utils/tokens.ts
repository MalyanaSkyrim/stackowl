import {
  db,
  type ExtendedPrismaClient,
  type ExtendedTransactionClient,
} from '@starter/database'
import { createHash, randomBytes } from 'crypto'
import jwt from 'jsonwebtoken'

import { env } from '../../../env'

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY_DAYS = 90

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

/** The database, or the transaction a caller runs these helpers in. */
type DbClient = ExtendedPrismaClient | ExtendedTransactionClient

/**
 * The user id in a valid access token, or null. A token is valid while it has
 * not expired and its session is still live: signing out, a password reset or
 * a deleted account ends it at once, not 15 minutes later.
 */
export const verifyAccessToken = async (
  token: string,
): Promise<string | null> => {
  const claims = decodeAccessToken(token)
  if (claims === null) return null

  const session = await db.session.findUnique({
    where: { id: claims.sessionId },
    select: { userId: true, revokedAt: true, expiresAt: true },
  })

  const live =
    session !== null &&
    session.userId === claims.userId &&
    session.revokedAt === null &&
    session.expiresAt > new Date()

  return live ? claims.userId : null
}

/** The user and session in a correctly signed, unexpired access token. */
const decodeAccessToken = (
  token: string,
): { userId: string; sessionId: string } | null => {
  try {
    const decoded = jwt.verify(token, env.AUTH_SECRET)
    return typeof decoded === 'object' &&
      typeof decoded.sub === 'string' &&
      typeof decoded.sid === 'string'
      ? { userId: decoded.sub, sessionId: decoded.sid }
      : null
  } catch {
    return null
  }
}

const signAccessToken = (userId: string, sessionId: string) =>
  jwt.sign({ sid: sessionId }, env.AUTH_SECRET, {
    subject: userId,
    expiresIn: ACCESS_TOKEN_EXPIRY,
  })

const hashRefreshToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

const refreshTokenExpiry = () =>
  new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

/**
 * Starts a session on a new device, after a successful sign-in. Pass `client`
 * to create it inside the caller's transaction.
 */
export const createSession = async (
  {
    userId,
    deviceName,
  }: {
    userId: string
    deviceName?: string
  },
  client: DbClient = db,
): Promise<AuthTokens> => {
  const refreshToken = randomBytes(32).toString('base64url')

  const session = await client.session.create({
    data: {
      userId,
      deviceName,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
    },
  })

  return { accessToken: signAccessToken(userId, session.id), refreshToken }
}

/**
 * Swaps a refresh token for new tokens. The old refresh token stops working,
 * so a stolen one can be used at most once. Returns null when the token is
 * unknown, revoked or expired: the app then signs the user out.
 */
export const refreshSession = async (
  refreshToken: string,
): Promise<AuthTokens | null> => {
  const session = await db.session.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
  })

  if (
    session === null ||
    session.revokedAt !== null ||
    session.expiresAt <= new Date()
  ) {
    return null
  }

  const nextRefreshToken = randomBytes(32).toString('base64url')

  // Only while still live: a sign-out or password reset that lands between the
  // read above and this write wins.
  const { count } = await db.session.updateMany({
    where: { id: session.id, revokedAt: null },
    data: {
      refreshTokenHash: hashRefreshToken(nextRefreshToken),
      expiresAt: refreshTokenExpiry(),
      lastUsedAt: new Date(),
    },
  })
  if (count === 0) return null

  return {
    accessToken: signAccessToken(session.userId, session.id),
    refreshToken: nextRefreshToken,
  }
}

/** Signs one device out. */
export const revokeSession = async (refreshToken: string) => {
  await db.session.updateMany({
    where: {
      refreshTokenHash: hashRefreshToken(refreshToken),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  })
}

/**
 * Signs every device of this user out, after a password reset. Pass `client`
 * to do it inside the caller's transaction.
 */
export const revokeAllSessions = async (
  userId: string,
  client: DbClient = db,
) => {
  await client.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
