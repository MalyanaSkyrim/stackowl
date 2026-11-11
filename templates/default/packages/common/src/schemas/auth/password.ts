import { z } from 'zod'

import {
  deviceNameSchema,
  emailSchema,
  otpCodeSchema,
  passwordSchema,
} from './user'

/** Forgot password, step 1: email a reset code. */
export const requestPasswordResetInputSchema = z.object({
  email: emailSchema,
})

/**
 * Forgot password, step 2: the emailed code and the new password. A correct
 * code sets the password, ends the other sessions and signs this phone in.
 */
export const resetPasswordInputSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  password: passwordSchema,
  deviceName: deviceNameSchema,
})

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetInputSchema
>
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>
