import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SurfaceCard } from '@/components/marketing/SurfaceCard'
import { brandValues, richTags } from '@/lib/marketing/richText'
import { brand } from '@starter/common'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('support.meta')
  return {
    title: t('title', brandValues),
    description: t('description', brandValues),
  }
}

const topics = ['signIn', 'newPhone', 'bug', 'delete'] as const

/** The support page the App Store listing requires: contact, then the common questions. */
const SupportPage = async () => {
  const t = await getTranslations('support')

  return (
    <>
      <SiteNavbar />
      <main className="flex-1">
        <div className="px-gutter mx-auto flex w-full max-w-[880px] flex-col gap-10 pb-24 pt-16">
          <div className="flex flex-col gap-3">
            <h1 className="type-h1 font-display rtl:font-display-ar text-primary">
              {t('title')}
            </h1>
            <p className="text-foreground-soft type-body max-w-xl">
              {t('lead')}
            </p>
          </div>

          <div className="bg-hero text-hero-foreground rounded-card-lg flex flex-wrap items-center justify-between gap-5 p-8">
            <div className="flex flex-col gap-1.5">
              <span className="text-hero-foreground/80 text-sm">
                {t('emailLabel')}
              </span>
              <span dir="ltr" className="text-2xl font-semibold">
                {brand.supportEmail}
              </span>
            </div>
            <a
              href={`mailto:${brand.supportEmail}`}
              className="bg-hero-foreground text-hero rounded-btn inline-flex min-h-11 items-center px-5 font-semibold">
              {t('write')}
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {topics.map((key) => (
              <SurfaceCard key={key} className="flex flex-col gap-2 p-6">
                <h2 className="text-foreground text-lg font-semibold">
                  {t(`${key}.title`)}
                </h2>
                <p className="text-foreground-soft text-[15px] leading-relaxed">
                  {t.rich(`${key}.body`, richTags)}
                </p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default SupportPage
