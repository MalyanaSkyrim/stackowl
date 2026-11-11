import type { ReactElement } from 'react'

export type EmailContent = { subject: string; html: string; text: string }

export async function renderEmailHtml(email: ReactElement): Promise<string> {
  // Imported lazily: Next.js rejects a static `react-dom/server` import in
  // App Router server code, where the admin sends these emails from.
  const { renderToStaticMarkup } = await import('react-dom/server')
  return `<!DOCTYPE html>${renderToStaticMarkup(email)}`
}
