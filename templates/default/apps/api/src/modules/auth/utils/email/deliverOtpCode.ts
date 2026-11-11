import type { OtpPurpose } from '@starter/common'
import type { FastifyBaseLogger } from 'fastify'

import { env } from '../../../../env'
import { createOtpCode, OTP_RESEND_COOLDOWN_SECONDS } from '../otp'
import { sendOtpCodeEmail } from './sendOtpCodeEmail'

/**
 * Creates a code for this user and emails it. Returns the seconds before the
 * app may ask for another one.
 *
 * Without Resend configured in local development, the code is written to the
 * API log instead, so sign-up can be tried without an email provider.
 */
export async function deliverOtpCode({
  user,
  purpose,
  log,
}: {
  user: { id: string; email: string }
  purpose: OtpPurpose
  log: FastifyBaseLogger
}): Promise<number> {
  const code = await createOtpCode({
    userId: user.id,
    email: user.email,
    purpose,
  })

  if (
    env.APP_ENV === 'development' &&
    (!env.RESEND_API_KEY || !env.RESEND_FROM)
  ) {
    log.warn(
      { email: user.email, purpose, code },
      'Resend is not configured: email code logged instead of sent',
    )
  } else {
    await sendOtpCodeEmail({
      to: user.email,
      code,
      purpose,
      idempotencyId: user.id,
    })
  }

  return OTP_RESEND_COOLDOWN_SECONDS
}
