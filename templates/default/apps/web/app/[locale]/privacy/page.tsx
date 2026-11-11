import {
  LegalDocument,
  LegalList,
  LegalSection,
  LegalText,
} from '@/components/marketing/LegalDocument'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SurfaceCard } from '@/components/marketing/SurfaceCard'
import { formatLegalDate } from '@/lib/marketing/legalDate'
import { brandValues, mailTo, richTags } from '@/lib/marketing/richText'
import { brand } from '@starter/common'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('privacy.meta')
  return {
    title: t('title', brandValues),
    description: t('description', brandValues),
  }
}

/**
 * The privacy policy the App Store listing links to. It is a starting point, not legal advice:
 * make it describe what your app really collects (`packages/database/prisma`) and the services
 * you really use, and have it reviewed before launch.
 */
const PrivacyPage = async () => {
  const t = await getTranslations('privacy')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const rich = {
    ...richTags,
    ...brandValues,
    mail: mailTo(brand.privacyEmail),
    email: brand.privacyEmail,
  }

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">
        <LegalDocument
          title={t('title')}
          updated={tCommon('lastUpdated', { date: formatLegalDate(locale) })}>
          <SurfaceCard className="flex flex-col gap-3 p-6 md:p-7">
            <span className="text-muted-foreground text-[13px] font-semibold tracking-wider ltr:uppercase">
              {t('summary.label')}
            </span>
            <LegalList>
              <li>{t('summary.collect', brandValues)}</li>
              <li>{t('summary.account')}</li>
              <li>{t('summary.noAds')}</li>
              <li>{t('summary.delete')}</li>
            </LegalList>
          </SurfaceCard>

          <LegalSection title={t('who.title')}>
            <LegalText>{t.rich('who.body', rich)}</LegalText>
          </LegalSection>


          <LegalSection title={t('account.title')}>
            <LegalText>{t('account.intro')}</LegalText>
            <LegalList>
              <li>{t('account.email')}</li>
              <li>{t('account.password')}</li>
              <li>{t('account.devices')}</li>
              <li>{t('account.content')}</li>
            </LegalList>
            <LegalText>{t('account.use')}</LegalText>
          </LegalSection>

          <LegalSection title={t('services.title')}>
            <LegalText>{t('services.intro')}</LegalText>
            <LegalList>
              <li>{t.rich('services.apple', rich)}</li>
              <li>{t.rich('services.google', rich)}</li>
              <li>{t.rich('services.sentry', rich)}</li>
              <li>{t.rich('services.resend', rich)}</li>
            </LegalList>
          </LegalSection>

          <LegalSection title={t('retention.title')}>
            <LegalText>{t('retention.body')}</LegalText>
          </LegalSection>

          <LegalSection title={t('deletion.title')}>
            <LegalText>{t('deletion.body')}</LegalText>
          </LegalSection>

          <LegalSection title={t('rights.title')}>
            <LegalText>{t.rich('rights.body', rich)}</LegalText>
          </LegalSection>

          <LegalSection title={t('children.title')}>
            <LegalText>{t('children.body', brandValues)}</LegalText>
          </LegalSection>

          <LegalSection title={t('changes.title')}>
            <LegalText>{t('changes.body')}</LegalText>
          </LegalSection>
        </LegalDocument>
      </main>
      <SiteFooter />
    </>
  )
}

export default PrivacyPage
