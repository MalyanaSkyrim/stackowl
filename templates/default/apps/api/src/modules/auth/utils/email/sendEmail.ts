import { env } from '../../../../env'

/**
 * Sends a transactional email through Resend.
 * Swap this module out if you use another provider.
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
  idempotencyKey,
}: {
  to: string
  subject: string
  text: string
  html: string
  idempotencyKey: string
}): Promise<void> {
  const apiKey = env.RESEND_API_KEY
  const from = env.RESEND_FROM
  if (typeof apiKey !== 'string' || typeof from !== 'string') {
    throw new Error(
      'Cannot send email: RESEND_API_KEY and RESEND_FROM must be set.',
    )
  }

  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send(
    { from, to: [to], subject, text, html },
    { idempotencyKey },
  )

  if (error) {
    throw new Error(error.message)
  }
  if (!data?.id) {
    throw new Error('Failed to send email: no email id returned from provider.')
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
