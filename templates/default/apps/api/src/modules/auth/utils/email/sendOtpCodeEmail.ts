import { brand, type OtpPurpose } from '@starter/common'
import { randomUUID } from 'crypto'

import { OTP_EXPIRY_MINUTES } from '../otp'
import { escapeHtml, sendEmail } from './sendEmail'

const copy = (name: string, minutes: number) =>
  ({
    SIGNUP: {
      subject: `Confirm your ${name} email address`,
      intro: `Welcome to ${name}! Confirm your email address to finish creating your account.`,
      instructions: `Enter this code in the app to confirm your email address. It expires in ${minutes} minutes.`,
      ignoreNote:
        'If you did not create an account, you can ignore this email.',
    },
    LOGIN: {
      subject: `Your ${name} sign-in code`,
      intro: `Here is your code to sign in to ${name}.`,
      instructions: `Enter this code in the app to sign in. It expires in ${minutes} minutes.`,
      ignoreNote: 'If you did not try to sign in, you can ignore this email.',
    },
    RESET_PASSWORD: {
      subject: `Reset your ${name} password`,
      intro: `We received a request to reset your ${name} password.`,
      instructions: `Enter this code in the app to choose a new password. It expires in ${minutes} minutes.`,
      ignoreNote:
        'If you did not request a password reset, you can ignore this email.',
    },
  }) satisfies Record<OtpPurpose, Record<string, string>>

/** Emails a code created with `createOtpCode`. */
export async function sendOtpCodeEmail({
  to,
  code,
  purpose,
  idempotencyId,
}: {
  to: string
  code: string
  purpose: OtpPurpose
  idempotencyId: string
}): Promise<void> {
  const { subject, intro, instructions, ignoreNote } = copy(
    brand.displayName,
    OTP_EXPIRY_MINUTES[purpose],
  )[purpose]

  const text = [
    intro,
    '',
    `Your code is: ${code}`,
    '',
    instructions,
    '',
    ignoreNote,
  ].join('\n')

  const html = `
    <p>${escapeHtml(intro)}</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${escapeHtml(code)}</p>
    <p>${escapeHtml(instructions)}</p>
    <p style="color:#666;font-size:14px">${escapeHtml(ignoreNote)}</p>
  `

  await sendEmail({
    to,
    subject,
    text,
    html,
    // Unique per send: the same idempotency key with a different body (new
    // code) is rejected by Resend within 24h.
    idempotencyKey: `otp-code/${purpose}/${idempotencyId}/${randomUUID()}`,
  })
}
