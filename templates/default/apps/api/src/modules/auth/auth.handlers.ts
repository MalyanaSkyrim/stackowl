import type {
  LogInInput,
  OAuthSignInInput,
  RefreshTokenInput,
  RequestOtpInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  SignUpInput,
  VerifyOtpInput,
} from '@starter/common'

import type { Context } from '../../trpc/context'
import {
  deleteAccount,
  getAccount,
  getMe,
  logIn,
  logOut,
  oauthSignIn,
  refresh,
  requestOtp,
  requestPasswordReset,
  resetPassword,
  signUp,
  verifyOtp,
} from './auth.services'

/**
 * One handler per procedure in `auth.router.ts`: each reads what it needs
 * from the request and calls `auth.services.ts`. The service's data is the
 * reply; its `AppError`s become the error codes (see `trpc/trpc.ts`).
 */

type Request<Input> = { ctx: Context; input: Input }

export const signUpHandler = ({ ctx, input }: Request<SignUpInput>) =>
  signUp(input, ctx.log)

export const logInHandler = ({ ctx, input }: Request<LogInInput>) =>
  logIn(input, ctx.log)

export const requestOtpHandler = ({ ctx, input }: Request<RequestOtpInput>) =>
  requestOtp(input, ctx.log)

export const verifyOtpHandler = ({ input }: Request<VerifyOtpInput>) =>
  verifyOtp(input)

export const requestPasswordResetHandler = ({
  ctx,
  input,
}: Request<RequestPasswordResetInput>) => requestPasswordReset(input, ctx.log)

export const resetPasswordHandler = ({ input }: Request<ResetPasswordInput>) =>
  resetPassword(input)

export const oauthSignInHandler = ({ input }: Request<OAuthSignInInput>) =>
  oauthSignIn(input)

export const refreshHandler = ({ input }: Request<RefreshTokenInput>) =>
  refresh(input.refreshToken)

export const logOutHandler = ({ input }: Request<RefreshTokenInput>) =>
  logOut(input.refreshToken)

export const meHandler = ({ ctx }: { ctx: { userId: string } }) =>
  getMe(ctx.userId)

export const accountHandler = ({ ctx }: { ctx: { userId: string } }) =>
  getAccount(ctx.userId)

export const deleteAccountHandler = ({ ctx }: { ctx: { userId: string } }) =>
  deleteAccount(ctx.userId)
