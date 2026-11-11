import {
  logInInputSchema,
  oauthSignInInputSchema,
  refreshTokenInputSchema,
  requestOtpInputSchema,
  requestPasswordResetInputSchema,
  resetPasswordInputSchema,
  signUpInputSchema,
  verifyOtpInputSchema,
} from '@starter/common'

import { protectedProcedure, publicProcedure, router } from '../../trpc/trpc'
import {
  accountHandler,
  deleteAccountHandler,
  logInHandler,
  logOutHandler,
  meHandler,
  oauthSignInHandler,
  refreshHandler,
  requestOtpHandler,
  requestPasswordResetHandler,
  resetPasswordHandler,
  signUpHandler,
  verifyOtpHandler,
} from './auth.handlers'

/**
 * Accounts: sign-up and sign-in with email, Apple or Google, email codes and
 * sessions, password reset, and the account screen with account deletion.
 *
 * Email sign-up: `signUp` emails a code, `verifyOtp` confirms the address and
 * signs the user in. Until then `logIn` fails with `EMAIL_NOT_VERIFIED` and
 * sends a new code.
 *
 * Forgot password: `requestPasswordReset` emails a code, `resetPassword` takes
 * it with the new password, signs the other devices out and this one in.
 */
export const authRouter = router({
  signUp: publicProcedure.input(signUpInputSchema).mutation(signUpHandler),

  logIn: publicProcedure.input(logInInputSchema).mutation(logInHandler),

  /** Sends a new code, for the "Resend code" button. */
  requestOtp: publicProcedure
    .input(requestOtpInputSchema)
    .mutation(requestOtpHandler),

  /** Confirms the email with the code and signs the user in. */
  verifyOtp: publicProcedure
    .input(verifyOtpInputSchema)
    .mutation(verifyOtpHandler),

  /** Forgot password, step 1: emails a reset code. */
  requestPasswordReset: publicProcedure
    .input(requestPasswordResetInputSchema)
    .mutation(requestPasswordResetHandler),

  /** Forgot password, step 2: the code and the new password. */
  resetPassword: publicProcedure
    .input(resetPasswordInputSchema)
    .mutation(resetPasswordHandler),

  /** Sign in with Apple or Google, with the id token the phone got. */
  oauthSignIn: publicProcedure
    .input(oauthSignInInputSchema)
    .mutation(oauthSignInHandler),

  refresh: publicProcedure
    .input(refreshTokenInputSchema)
    .mutation(refreshHandler),

  /** Signs this device out. Safe to call with an already revoked token. */
  logOut: publicProcedure
    .input(refreshTokenInputSchema)
    .mutation(logOutHandler),

  me: protectedProcedure.query(meHandler),

  /** The account screen: email and the ways the user can sign in. */
  account: protectedProcedure.query(accountHandler),

  /**
   * Deletes the account and everything it owns, and signs every
   * device out.
   */
  deleteAccount: protectedProcedure.mutation(deleteAccountHandler),
})
