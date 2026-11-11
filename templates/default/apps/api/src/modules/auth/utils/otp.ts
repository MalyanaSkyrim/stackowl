import type { OtpPurpose } from '@starter/common'
import { db } from '@starter/database'
import { createHash, randomInt } from 'crypto'

import { AppError } from '../../../errors'
import { InvalidCodeError, TooManyAttemptsError } from '../auth.errors'

const CODE_MIN = 100_000
const CODE_MAX = 999_999
const MAX_ATTEMPTS = 5

/** Wait between two codes for the same user and purpose. */
export const OTP_RESEND_COOLDOWN_SECONDS = 60
/** Codes one user can get for one purpose in an hour. */
const MAX_CODES_PER_HOUR = 5
const HOUR_MS = 60 * 60 * 1000

/** How long a code stays valid, by purpose. */
export const OTP_EXPIRY_MINUTES: Record<OtpPurpose, number> = {
  SIGNUP: 15,
  LOGIN: 10,
  RESET_PASSWORD: 30,
}

const hashCode = (code: string) =>
  createHash('sha256').update(code).digest('hex')

/**
 * Creates a 6-digit code for this user and purpose and returns it, to send by
 * email. Only its hash is stored. Any earlier unused code for the same purpose
 * is consumed, so a resend always leaves exactly one code usable.
 */
export const createOtpCode = async ({
  userId,
  email,
  purpose,
}: {
  userId: string
  email: string
  purpose: OtpPurpose
}): Promise<string> => {
  const code = String(randomInt(CODE_MIN, CODE_MAX + 1))
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES[purpose] * 60 * 1000,
  )

  await db.$transaction(async (tx) => {
    await tx.otpCode.updateMany({
      where: { userId, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    })

    await tx.otpCode.create({
      data: { userId, email, purpose, codeHash: hashCode(code), expiresAt },
    })
  })

  return code
}

/**
 * Seconds before another code may be sent, given when the recent codes were
 * created (newest first, last hour only). 0 means a code can go out now.
 */
export const secondsUntilNextOtp = (
  recentCodes: Date[],
  now: Date = new Date(),
): number => {
  const [latest] = recentCodes
  if (latest === undefined) return 0

  const cooldownEnd = latest.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000

  // At the hourly cap, wait until the oldest code of the hour ages out.
  const oldestInWindow = recentCodes[MAX_CODES_PER_HOUR - 1]
  const capEnd =
    oldestInWindow === undefined ? 0 : oldestInWindow.getTime() + HOUR_MS

  const waitMs = Math.max(cooldownEnd, capEnd) - now.getTime()
  return waitMs > 0 ? Math.ceil(waitMs / 1000) : 0
}

/** `secondsUntilNextOtp` for this user and purpose, read from the database. */
export const otpResendWait = async ({
  userId,
  purpose,
}: {
  userId: string
  purpose: OtpPurpose
}): Promise<number> => {
  const recent = await db.otpCode.findMany({
    where: {
      userId,
      purpose,
      createdAt: { gt: new Date(Date.now() - HOUR_MS) },
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
    take: MAX_CODES_PER_HOUR,
  })

  return secondsUntilNextOtp(recent.map((code) => code.createdAt))
}

/**
 * Checks a submitted code and, if it matches, consumes it. Returns the id of
 * the code's user.
 *
 * A wrong code burns an attempt against the outstanding code; once the limit
 * is reached the code is consumed outright, so brute force costs a new email
 * every MAX_ATTEMPTS guesses.
 */
export const consumeOtpCode = async ({
  email,
  code,
  purpose,
}: {
  email: string
  code: string
  purpose: OtpPurpose
}): Promise<string> => {
  const codeHash = hashCode(code.trim())

  // The failures are returned, not thrown, inside the transaction: throwing
  // would roll back the burnt attempt.
  const userIdOrError = await db.$transaction(async (tx) => {
    const outstanding = await tx.otpCode.findFirst({
      where: {
        email: { equals: email.trim(), mode: 'insensitive' },
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!outstanding) return new InvalidCodeError()

    if (outstanding.codeHash !== codeHash) {
      const attempts = outstanding.attempts + 1
      const exhausted = attempts >= MAX_ATTEMPTS

      await tx.otpCode.update({
        where: { id: outstanding.id },
        data: { attempts, consumedAt: exhausted ? new Date() : null },
      })

      return exhausted ? new TooManyAttemptsError() : new InvalidCodeError()
    }

    await tx.otpCode.update({
      where: { id: outstanding.id },
      data: { consumedAt: new Date() },
    })

    return outstanding.userId
  })

  if (userIdOrError instanceof AppError) throw userIdOrError
  return userIdOrError
}
