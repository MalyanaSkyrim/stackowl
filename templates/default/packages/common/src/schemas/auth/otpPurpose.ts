import { z } from 'zod'

/**
 * Allowed values stored in `OtpCode.purpose`:
 * - `SIGNUP`: confirms the email address of a new account.
 * - `LOGIN`: signs in with a code sent by email.
 * - `RESET_PASSWORD`: lets the user choose a new password.
 */
export const otpPurposeSchema = z.enum(['SIGNUP', 'LOGIN', 'RESET_PASSWORD'])

export type OtpPurpose = z.infer<typeof otpPurposeSchema>
