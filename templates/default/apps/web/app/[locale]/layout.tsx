import { Providers } from '@/components/Providers'
import { routing } from '@/i18n/routing'
import { fontVariables } from '@/lib/fonts'
import { isLocale, localeDirection } from '@/lib/utils/locale.enum'
import { brand } from '@starter/common'
import '@starter/ui/globals.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import React from 'react'

import '../marketing.css'

export const metadata: Metadata = {
  metadataBase: new URL(brand.urls.website),
  title: brand.displayName,
}

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }))

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale: requested } = await params
  const locale = isLocale(requested) ? requested : routing.defaultLocale

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <html lang={locale} dir={localeDirection(locale)} suppressHydrationWarning>
      <head>
        {/*
         * `Reveal` starts its children transparent and reveals them from an
         * IntersectionObserver. With no JavaScript that observer never runs,
         * so the entrance is switched off entirely rather than leaving the
         * page blank.
         */}
        <noscript>
          <style>{'.reveal{opacity:1;transform:none}'}</style>
        </noscript>
      </head>
      <body
        className={`${fontVariables} bg-background text-foreground rtl:font-arabic flex min-h-screen flex-col overflow-x-clip font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default Layout
