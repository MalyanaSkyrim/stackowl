import { z } from 'zod'

import { userSchema } from '../../models/user.model'
import { oauthProviderSchema } from './oauthProvider'
import { otpPurposeSchema } from './otpPurpose'

/** Trimmed and lower-cased, so one address always maps to one account. */
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email())

/** The shortest password a user can choose. */
export const PASSWORD_MIN_LENGTH = 8
/** bcrypt only reads the first 72 bytes, so longer passwords are refused. */
export const PASSWORD_MAX_LENGTH = 72

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)

export const otpCodeSchema = z.string().regex(/^\d{6}$/)

/** Shown later in the account screen's list of signed-in devices. */
export const deviceNameSchema = z.string().trim().max(100).optional()

/**
 * Purposes `requestOtp` and `verifyOtp` take. Password reset has its own
 * procedures (`requestPasswordReset`, `resetPassword`).
 */
export const appOtpPurposeSchema = otpPurposeSchema.extract(['SIGNUP'])

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

/** What every successful sign-in returns. */
export const signedInSchema = z.object({
  user: userSchema,
  tokens: authTokensSchema,
})

export const signUpInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

/** A code is on its way; the app opens the code screen. */
export const codeSentSchema = z.object({
  email: z.email(),
  /** Seconds before the app may ask for another code. */
  resendInSeconds: z.number().int().nonnegative(),
})

export const logInInputSchema = z.object({
  email: emailSchema,
  // Not `passwordSchema`: a sign-in only compares, it never sets a password.
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  deviceName: deviceNameSchema,
})

export const requestOtpInputSchema = z.object({
  email: emailSchema,
  purpose: appOtpPurposeSchema,
})

export const verifyOtpInputSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  purpose: appOtpPurposeSchema,
  deviceName: deviceNameSchema,
})

export const oauthSignInInputSchema = z.object({
  provider: oauthProviderSchema,
  idToken: z.string().min(1),
  /** Apple sends the user's name to the app once, on the first sign-in. */
  name: z.string().trim().max(100).optional(),
  deviceName: deviceNameSchema,
})

/** How the user can sign in: a password, Apple or Google. An account can have several. */
export const signInMethodSchema = z.enum([
  'PASSWORD',
  ...oauthProviderSchema.options,
])

/** The account screen: who is signed in and how they can sign in. */
export const accountSchema = z.object({
  email: z.email(),
  name: z.string().nullable(),
  /** Password first, then Apple and Google in the order they were linked. */
  signInMethods: z.array(signInMethodSchema),
})

export const refreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1),
})

/**
 * Why an auth call failed, sent in the error's `data.reason` so the app can
 * show the right message. The HTTP status says that it failed; the reason
 * says why.
 */
export const authErrorReasonSchema = z.enum([
  /** Sign-up with an email that already has a confirmed account. */
  'EMAIL_TAKEN',
  'INVALID_CREDENTIALS',
  /**
   * Sign-in with an email nobody confirmed yet: a new code went out, and
   * `data.resendInSeconds` says when the app may ask for another one.
   */
  'EMAIL_NOT_VERIFIED',
  /** Wrong, expired or already used code. */
  'INVALID_CODE',
  /** Too many wrong codes: the code is burnt, ask for a new one. */
  'TOO_MANY_ATTEMPTS',
  /** A code was sent moments ago, or too many in the last hour. */
  'RESEND_COOLDOWN',
  /** The refresh token is unknown, revoked or expired: sign out. */
  'SESSION_EXPIRED',
  /** The Apple or Google token could not be verified. */
  'OAUTH_INVALID_TOKEN',
  /** Apple or Google has not verified the account's email. */
  'OAUTH_EMAIL_NOT_VERIFIED',
  /** Apple or Google did not share an email address. */
  'OAUTH_NO_EMAIL',
  /** Sign-in with this provider is not set up on the server. */
  'OAUTH_NOT_CONFIGURED',
  /** The record doesn't exist, or belongs to another user. */
  'NOT_FOUND',
])

export type SignUpInput = z.infer<typeof signUpInputSchema>
export type CodeSent = z.infer<typeof codeSentSchema>
export type LogInInput = z.infer<typeof logInInputSchema>
export type RequestOtpInput = z.infer<typeof requestOtpInputSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpInputSchema>
export type OAuthSignInInput = z.infer<typeof oauthSignInInputSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenInputSchema>
export type SignInMethod = z.infer<typeof signInMethodSchema>
export type Account = z.infer<typeof accountSchema>
export type AuthTokens = z.infer<typeof authTokensSchema>
export type SignedIn = z.infer<typeof signedInSchema>
export type AuthErrorReason = z.infer<typeof authErrorReasonSchema>
