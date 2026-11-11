import {
  LegalDocument,
  LegalList,
  LegalSection,
  LegalText,
} from '@/components/marketing/LegalDocument'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { formatLegalDate } from '@/lib/marketing/legalDate'
import { brandValues, mailTo, richTags } from '@/lib/marketing/richText'
import { brand } from '@starter/common'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('terms.meta')
  return {
    title: t('title', brandValues),
    description: t('description', brandValues),
  }
}

/**
 * The terms of use the App Store listing links to. A starting point, not legal advice. If you
 * sell subscriptions, add Apple's auto-renewal wording (see the purchases guide in the docs).
 */
const TermsPage = async () => {
  const t = await getTranslations('terms')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const rich = {
    ...richTags,
    ...brandValues,
    mail: mailTo(brand.supportEmail),
    email: brand.supportEmail,
  }

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">
        <LegalDocument
          title={t('title')}
          updated={tCommon('lastUpdated', { date: formatLegalDate(locale) })}>
          <LegalText>{t.rich('intro', rich)}</LegalText>

          <LegalSection title={t('app.title')}>
            <LegalText>{t('app.body', brandValues)}</LegalText>
          </LegalSection>

          <LegalSection title={t('account.title')}>
            <LegalText>{t('account.body')}</LegalText>
          </LegalSection>



          <LegalSection title={t('use.title')}>
            <LegalText>{t('use.body')}</LegalText>
          </LegalSection>

          <LegalSection title={t('liability.title')}>
            <LegalText>{t('liability.body')}</LegalText>
          </LegalSection>

          <LegalSection title={t('ending.title')}>
            <LegalText>{t('ending.body')}</LegalText>
          </LegalSection>

          <LegalSection title={t('law.title')}>
            <LegalText>{t.rich('law.body', rich)}</LegalText>
          </LegalSection>
        </LegalDocument>
      </main>
      <SiteFooter />
    </>
  )
}

export default TermsPage
