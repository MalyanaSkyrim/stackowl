import type {
  Account,
  AuthTokens,
  CodeSent,
  LogInInput,
  OAuthSignInInput,
  RequestOtpInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  SignedIn,
  SignUpInput,
  User as AuthUser,
  VerifyOtpInput,
} from '@starter/common'
import { db, type User } from '@starter/database'
import type { FastifyBaseLogger } from 'fastify'

import { env } from '../../env'
import {
  EmailTakenError,
  InvalidCredentialsError,
  ResendCooldownError,
  SessionExpiredError,
  UnverifiedEmailError,
} from './auth.errors'
import { deleteAccount as deleteUserData } from './utils/account'
import { deliverOtpCode } from './utils/email/deliverOtpCode'
import { inFixedTime } from './utils/fixedTime'
import { resolveUserFromOAuth } from './utils/oauth/oauth'
import {
  consumeOtpCode,
  OTP_RESEND_COOLDOWN_SECONDS,
  otpResendWait,
} from './utils/otp'
import { hashPassword, verifyPasswordOrDecoy } from './utils/password'
import {
  createSession,
  refreshSession,
  revokeAllSessions,
  revokeSession,
} from './utils/tokens'
import { toAuthUser } from './utils/user'

/**
 * Sends a sign-up code unless one went out too recently. Returns the seconds
 * before the app may ask for another one.
 */
const sendSignUpCode = async (user: User, log: FastifyBaseLogger) => {
  const wait = await otpResendWait({ userId: user.id, purpose: 'SIGNUP' })
  return wait > 0 ? wait : deliverOtpCode({ user, purpose: 'SIGNUP', log })
}

/**
 * How long `requestPasswordReset` takes to answer, whatever happened, so its
 * timing does not reveal whether the email has an account. Longer than a code
 * and an email take; 0 in the tests.
 */
const RESET_ANSWER_MS = env.NODE_ENV === 'test' ? 0 : 2_000

export const signUp = async (
  input: SignUpInput,
  log: FastifyBaseLogger,
): Promise<CodeSent> => {
  const existing = await db.user.findUnique({ where: { email: input.email } })

  // A confirmed address belongs to someone. An unconfirmed one does not yet:
  // whoever confirms it with the emailed code owns the account, so signing up
  // again just sets the new password and sends a new code.
  if (existing?.emailVerified) {
    throw new EmailTakenError()
  }

  const passwordHash = await hashPassword(input.password)
  const user =
    existing === null
      ? await db.user.create({ data: { email: input.email, passwordHash } })
      : await db.user.update({
          where: { id: existing.id },
          data: { passwordHash },
        })

  return { email: user.email, resendInSeconds: await sendSignUpCode(user, log) }
}

/**
 * Signs in with email and password. An unconfirmed email gets a new code and
 * fails with `UnverifiedEmailError`, so the app opens the code screen.
 */
export const logIn = async (
  input: LogInInput,
  log: FastifyBaseLogger,
): Promise<SignedIn> => {
  const user = await db.user.findUnique({ where: { email: input.email } })

  // Same answer, in the same time, for an unknown email, an Apple or
  // Google-only account and a wrong password, so the response does not reveal
  // who has an account.
  const passwordMatches = await verifyPasswordOrDecoy(
    input.password,
    user?.passwordHash,
  )

  if (user === null || !passwordMatches) {
    throw new InvalidCredentialsError()
  }

  if (user.emailVerified === null) {
    throw new UnverifiedEmailError(await sendSignUpCode(user, log))
  }

  // The session is only created if the password checked above is still the
  // current one. A password reset running at the same time either commits
  // first (this fails) or revokes this session (CockroachDB runs both
  // transactions as if one after the other).
  const tokens = await db.$transaction(async (tx) => {
    const current = await tx.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    })
    if (current?.passwordHash !== user.passwordHash) {
      throw new InvalidCredentialsError()
    }
    return createSession({ userId: user.id, deviceName: input.deviceName }, tx)
  })

  return { user: toAuthUser(user), tokens }
}

/** Sends a new code, for the "Resend code" button. */
export const requestOtp = async (
  input: RequestOtpInput,
  log: FastifyBaseLogger,
): Promise<CodeSent> => {
  const user = await db.user.findUnique({ where: { email: input.email } })

  // Nothing to confirm (no account, or already confirmed): answer as if a code
  // went out, so this cannot be used to look up accounts.
  if (user === null || user.emailVerified !== null) {
    return { email: input.email, resendInSeconds: OTP_RESEND_COOLDOWN_SECONDS }
  }

  const wait = await otpResendWait({ userId: user.id, purpose: input.purpose })
  if (wait > 0) {
    throw new ResendCooldownError()
  }

  const resendInSeconds = await deliverOtpCode({
    user,
    purpose: input.purpose,
    log,
  })

  return { email: user.email, resendInSeconds }
}

/** Confirms the email with the code and signs the user in. */
export const verifyOtp = async (input: VerifyOtpInput): Promise<SignedIn> => {
  const userId = await consumeOtpCode({
    email: input.email,
    code: input.code,
    purpose: input.purpose,
  })

  const user = await db.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  })

  const tokens = await createSession({
    userId: user.id,
    deviceName: input.deviceName,
  })

  return { user: toAuthUser(user), tokens }
}

/** Forgot password, step 1: emails a reset code. */
export const requestPasswordReset = async (
  input: RequestPasswordResetInput,
  log: FastifyBaseLogger,
): Promise<CodeSent> => {
  // Always the same answer, in the same time and without errors, whether or
  // not the email has an account and whether or not a code went out, so this
  // cannot be used to look up accounts. The app waits the full cooldown
  // before offering a resend.
  await inFixedTime(
    RESET_ANSWER_MS,
    async () => {
      const user = await db.user.findUnique({ where: { email: input.email } })
      if (user === null) return

      const wait = await otpResendWait({
        userId: user.id,
        purpose: 'RESET_PASSWORD',
      })
      if (wait === 0) {
        await deliverOtpCode({ user, purpose: 'RESET_PASSWORD', log })
      }
    },
    log,
  )

  return { email: input.email, resendInSeconds: OTP_RESEND_COOLDOWN_SECONDS }
}

/**
 * Forgot password, step 2: checks the code, sets the new password, signs
 * every other device out and signs this one in.
 *
 * The code proves the user reads this inbox, so it also confirms an
 * unconfirmed email, and gives an Apple or Google-only account a password.
 */
export const resetPassword = async (
  input: ResetPasswordInput,
): Promise<SignedIn> => {
  const userId = await consumeOtpCode({
    email: input.email,
    code: input.code,
    purpose: 'RESET_PASSWORD',
  })

  const passwordHash = await hashPassword(input.password)

  // One transaction, so no session can start between the new password and
  // the sign-out of every other device (see `logIn`).
  return db.$transaction(async (tx) => {
    const current = await tx.user.findUniqueOrThrow({ where: { id: userId } })
    const user = await tx.user.update({
      where: { id: current.id },
      data: {
        passwordHash,
        emailVerified: current.emailVerified ?? new Date(),
      },
    })

    await revokeAllSessions(user.id, tx)
    const tokens = await createSession(
      { userId: user.id, deviceName: input.deviceName },
      tx,
    )

    return { user: toAuthUser(user), tokens }
  })
}

/** Sign in with Apple or Google, with the id token the phone got. */
export const oauthSignIn = async (
  input: OAuthSignInInput,
): Promise<SignedIn> => {
  const user = await resolveUserFromOAuth({
    provider: input.provider,
    idToken: input.idToken,
    name: input.name,
  })

  const tokens = await createSession({
    userId: user.id,
    deviceName: input.deviceName,
  })

  return { user: toAuthUser(user), tokens }
}

/** Swaps a refresh token for new tokens; the old one stops working. */
export const refresh = async (refreshToken: string): Promise<AuthTokens> => {
  const tokens = await refreshSession(refreshToken)
  if (tokens === null) {
    throw new SessionExpiredError()
  }
  return tokens
}

/** Signs this device out. Safe to call with an already revoked token. */
export const logOut = (refreshToken: string): Promise<void> =>
  revokeSession(refreshToken)

/** The signed-in user. */
export const getMe = async (userId: string): Promise<AuthUser> => {
  const user = await db.user.findUnique({ where: { id: userId } })
  // A valid access token for a deleted account.
  if (user === null) throw new SessionExpiredError()
  return toAuthUser(user)
}

/** The account screen: email, name and every way the user can sign in. */
export const getAccount = async (userId: string): Promise<Account> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { oauthAccounts: { orderBy: { createdAt: 'asc' } } },
  })
  if (user === null) throw new SessionExpiredError()
  return {
    email: user.email,
    name: user.name,
    signInMethods: [
      ...(user.passwordHash === null ? [] : ['PASSWORD' as const]),
      ...user.oauthAccounts.map((account) => account.provider),
    ],
  }
}

/**
 * Deletes the account and all its data on our servers (Apple requires it).
 * Its sessions go with it, so every phone is signed out; the progress saved
 * on the phones stays. A second call, from a phone that missed the first
 * answer, finds no account and signs that phone out too.
 */
export const deleteAccount = async (userId: string): Promise<void> => {
  const deleted = await deleteUserData(userId)
  if (!deleted) throw new SessionExpiredError()
}
