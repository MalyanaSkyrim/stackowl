import { db } from '@starter/database'
import pino from 'pino'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'

import { AppError } from '../../errors'
import { appRouter } from '../../trpc/router'
import { UnverifiedEmailError } from './auth.errors'
import { verifyAccessToken } from './utils/tokens'

// Needs TEST_DATABASE_URL (see package.json). Without Resend configured in
// development, codes go to the log, which is where the tests read them.
const log = pino({ level: 'warn' }, { write: () => {} })
const warn = vi.spyOn(log, 'warn')

const caller = appRouter.createCaller({ log, userId: null })

const email = 'reader@example.com'
const password = 'reading-every-day'

/** The code from the last "email" the API sent. */
const lastCode = (): string => {
  const [details] = warn.mock.lastCall ?? []
  if (typeof details !== 'object' || details === null || !('code' in details)) {
    throw new Error('No code was sent')
  }
  return String(details.code)
}

const reasonOf = (error: unknown) =>
  error instanceof TRPCError && error.cause instanceof AppError
    ? error.cause.reason
    : null

/** Lets the next code go out without waiting for the resend cooldown. */
const skipCooldown = () =>
  db.otpCode.updateMany({
    data: { createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  })

beforeEach(async () => {
  await db.user.deleteMany()
  warn.mockClear()
})

afterAll(async () => {
  await db.$disconnect()
})

describe('email sign-up', () => {
  test('signs up, confirms the code and signs in', async () => {
    const sent = await caller.auth.signUp({
      email: ' Reader@Example.com ',
      password,
    })
    expect(sent).toEqual({ email, resendInSeconds: 60 })

    const signedIn = await caller.auth.verifyOtp({
      email,
      code: lastCode(),
      purpose: 'SIGNUP',
    })
    expect(signedIn.user).toMatchObject({ email, emailVerified: true })
    expect(await verifyAccessToken(signedIn.tokens.accessToken)).toBe(
      signedIn.user.id,
    )

    const logIn = await caller.auth.logIn({ email, password })
    expect(logIn.user).toMatchObject({ email, emailVerified: true })
  })

  test('refuses a confirmed email', async () => {
    await caller.auth.signUp({ email, password })
    await caller.auth.verifyOtp({ email, code: lastCode(), purpose: 'SIGNUP' })

    await expect(
      caller.auth.signUp({ email, password: 'another-password' }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'EMAIL_TAKEN')
  })

  test('sends a code instead of tokens until the email is confirmed', async () => {
    await caller.auth.signUp({ email, password })
    await skipCooldown()

    const failure = await caller.auth.logIn({ email, password }).then(
      () => null,
      (error: unknown) =>
        error instanceof TRPCError
          ? { status: getHTTPStatusCodeFromError(error), cause: error.cause }
          : null,
    )
    expect(failure?.status).toBe(403)
    expect(failure?.cause).toBeInstanceOf(UnverifiedEmailError)
    expect(failure?.cause).toMatchObject({
      reason: 'EMAIL_NOT_VERIFIED',
      resendInSeconds: 60,
    })
    // One code for the sign-up, a new one for the sign-in.
    expect(warn).toHaveBeenCalledTimes(2)
  })

  test('refuses a wrong password and an unknown email the same way', async () => {
    await caller.auth.signUp({ email, password })

    for (const input of [
      { email, password: 'wrong-password' },
      { email: 'nobody@example.com', password },
    ]) {
      await expect(caller.auth.logIn(input)).rejects.toSatisfy(
        (error) => reasonOf(error) === 'INVALID_CREDENTIALS',
      )
    }
  })
})

describe('codes', () => {
  test('burns the code after five wrong attempts', async () => {
    await caller.auth.signUp({ email, password })
    const code = lastCode()
    const wrong = code === '123456' ? '654321' : '123456'

    for (let attempt = 1; attempt < 5; attempt++) {
      await expect(
        caller.auth.verifyOtp({ email, code: wrong, purpose: 'SIGNUP' }),
      ).rejects.toSatisfy((error) => reasonOf(error) === 'INVALID_CODE')
    }
    await expect(
      caller.auth.verifyOtp({ email, code: wrong, purpose: 'SIGNUP' }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'TOO_MANY_ATTEMPTS')

    await expect(
      caller.auth.verifyOtp({ email, code, purpose: 'SIGNUP' }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'INVALID_CODE')
  })

  test('holds a resend during the cooldown, and the new code replaces the old', async () => {
    await caller.auth.signUp({ email, password })
    const firstCode = lastCode()

    await expect(
      caller.auth.requestOtp({ email, purpose: 'SIGNUP' }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'RESEND_COOLDOWN')

    await skipCooldown()
    await caller.auth.requestOtp({ email, purpose: 'SIGNUP' })
    const secondCode = lastCode()

    if (firstCode !== secondCode) {
      await expect(
        caller.auth.verifyOtp({ email, code: firstCode, purpose: 'SIGNUP' }),
      ).rejects.toSatisfy((error) => reasonOf(error) === 'INVALID_CODE')
    }
    await expect(
      caller.auth.verifyOtp({ email, code: secondCode, purpose: 'SIGNUP' }),
    ).resolves.toMatchObject({ user: { email } })
  })

  test('answers a resend for an unknown email without sending anything', async () => {
    await expect(
      caller.auth.requestOtp({
        email: 'nobody@example.com',
        purpose: 'SIGNUP',
      }),
    ).resolves.toEqual({ email: 'nobody@example.com', resendInSeconds: 60 })
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('sessions', () => {
  const signIn = async () => {
    await caller.auth.signUp({ email, password })
    return caller.auth.verifyOtp({ email, code: lastCode(), purpose: 'SIGNUP' })
  }

  test('a refresh token works once', async () => {
    const { tokens } = await signIn()

    const next = await caller.auth.refresh({
      refreshToken: tokens.refreshToken,
    })
    expect(next.refreshToken).not.toBe(tokens.refreshToken)

    await expect(
      caller.auth.refresh({ refreshToken: tokens.refreshToken }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'SESSION_EXPIRED')
  })

  test('logging out ends the session', async () => {
    const { tokens } = await signIn()

    await caller.auth.logOut({ refreshToken: tokens.refreshToken })

    await expect(
      caller.auth.refresh({ refreshToken: tokens.refreshToken }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'SESSION_EXPIRED')
    // The access token stops working at once, not when it expires.
    expect(await verifyAccessToken(tokens.accessToken)).toBeNull()
  })

  test('me needs an access token', async () => {
    const { user } = await signIn()

    await expect(caller.auth.me()).rejects.toThrow(TRPCError)
    await expect(
      appRouter.createCaller({ log, userId: user.id }).auth.me(),
    ).resolves.toEqual(user)
  })
})

describe('account', () => {
  const signIn = async () => {
    await caller.auth.signUp({ email, password })
    return caller.auth.verifyOtp({ email, code: lastCode(), purpose: 'SIGNUP' })
  }

  test('lists the ways to sign in', async () => {
    const { user } = await signIn()
    await db.oAuthAccount.create({
      data: {
        userId: user.id,
        provider: 'APPLE',
        providerAccountId: 'apple-1',
      },
    })

    await expect(
      appRouter.createCaller({ log, userId: user.id }).auth.account(),
    ).resolves.toEqual({
      email,
      name: null,
      signInMethods: ['PASSWORD', 'APPLE'],
    })
  })

  test('deleting the account erases its data and signs out', async () => {
    const { user, tokens } = await signIn()
    const signedIn = appRouter.createCaller({ log, userId: user.id })
    await signedIn.sync.push({
      settings: [
        {
          key: 'settings.theme',
          value: 'dark',
          changedAt: new Date(),
        },
      ],
    })

    await signedIn.auth.deleteAccount()

    expect(await db.user.count()).toBe(0)
    expect(await db.userSetting.count()).toBe(0)
    expect(await db.session.count()).toBe(0)
    expect(await verifyAccessToken(tokens.accessToken)).toBeNull()
    // A retry from a phone that missed the answer: signed out too.
    await expect(signedIn.auth.deleteAccount()).rejects.toSatisfy(
      (error) => reasonOf(error) === 'SESSION_EXPIRED',
    )
  })

  test('needs an access token', async () => {
    await expect(caller.auth.deleteAccount()).rejects.toThrow(TRPCError)
  })
})

describe('forgot password', () => {
  const newPassword = 'a-brand-new-password'

  const confirmedAccount = async () => {
    await caller.auth.signUp({ email, password })
    return caller.auth.verifyOtp({ email, code: lastCode(), purpose: 'SIGNUP' })
  }

  test('resets the password, signs other devices out and this one in', async () => {
    const { tokens: oldTokens } = await confirmedAccount()
    warn.mockClear()

    const sent = await caller.auth.requestPasswordReset({ email })
    expect(sent).toEqual({ email, resendInSeconds: 60 })

    const signedIn = await caller.auth.resetPassword({
      email,
      code: lastCode(),
      password: newPassword,
    })
    expect(await verifyAccessToken(signedIn.tokens.accessToken)).toBe(
      signedIn.user.id,
    )

    await expect(
      caller.auth.refresh({ refreshToken: oldTokens.refreshToken }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'SESSION_EXPIRED')
    expect(await verifyAccessToken(oldTokens.accessToken)).toBeNull()
    await expect(
      caller.auth.refresh({ refreshToken: signedIn.tokens.refreshToken }),
    ).resolves.toMatchObject({ accessToken: expect.any(String) })

    await expect(caller.auth.logIn({ email, password })).rejects.toSatisfy(
      (error) => reasonOf(error) === 'INVALID_CREDENTIALS',
    )
    await expect(
      caller.auth.logIn({ email, password: newPassword }),
    ).resolves.toMatchObject({ user: { email } })
  })

  test('answers an unknown email the same way without sending anything', async () => {
    await expect(
      caller.auth.requestPasswordReset({ email: 'nobody@example.com' }),
    ).resolves.toEqual({ email: 'nobody@example.com', resendInSeconds: 60 })
    expect(warn).not.toHaveBeenCalled()
  })

  test('answers during the cooldown the same way without sending again', async () => {
    await confirmedAccount()
    await caller.auth.requestPasswordReset({ email })
    warn.mockClear()

    await expect(caller.auth.requestPasswordReset({ email })).resolves.toEqual({
      email,
      resendInSeconds: 60,
    })
    expect(warn).not.toHaveBeenCalled()
  })

  test('refuses a sign-up code and a wrong code', async () => {
    await caller.auth.signUp({ email, password })
    const signUpCode = lastCode()

    await expect(
      caller.auth.resetPassword({
        email,
        code: signUpCode,
        password: newPassword,
      }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'INVALID_CODE')

    await caller.auth.requestPasswordReset({ email })
    const resetCode = lastCode()
    const wrong = resetCode === '123456' ? '654321' : '123456'

    await expect(
      caller.auth.resetPassword({ email, code: wrong, password: newPassword }),
    ).rejects.toSatisfy((error) => reasonOf(error) === 'INVALID_CODE')
  })

  test('confirms an unconfirmed email', async () => {
    await caller.auth.signUp({ email, password })
    await skipCooldown()

    await caller.auth.requestPasswordReset({ email })
    const signedIn = await caller.auth.resetPassword({
      email,
      code: lastCode(),
      password: newPassword,
    })

    expect(signedIn.user).toMatchObject({ email, emailVerified: true })
  })
})
