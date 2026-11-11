import { AppStoreBadge } from '@/components/marketing/AppStoreBadge'
import { FAQAccordion } from '@/components/marketing/FAQAccordion'
import { FeatureCard } from '@/components/marketing/FeatureCard'
import { Illustration } from '@/components/marketing/Illustration'
import { Reveal } from '@/components/marketing/Reveal'
import { Section } from '@/components/marketing/Section'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteLink } from '@/components/marketing/SiteLink'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { StepCard } from '@/components/marketing/StepCard'
import { brandValues } from '@/lib/marketing/richText'
import { MetaPixel } from '@/lib/tracking/MetaPixel'
import { intlLocale, isLocale } from '@/lib/utils/locale.enum'
import { Check } from 'lucide-react'
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('home.meta')
  const title = t('title', brandValues)
  const description = t('description', brandValues)

  return { title, description, openGraph: { title, description } }
}

const steps = [
  { key: 'download', illustration: 'step-download.png' },
  { key: 'write', illustration: 'step-write.png' },
  { key: 'sync', illustration: 'step-sync.png' },
] as const

const features = ['fast', 'everywhere', 'private', 'languages'] as const

const privacyPoints = ['minimal', 'noAds', 'delete'] as const

const faqKeys = ['account', 'devices', 'price', 'android'] as const

/**
 * The landing page: what the app does, how it works, its features, privacy, the FAQ and the
 * App Store badge. The copy is in `locales/*.json`: replace it with your product's.
 */
const HomePage = async () => {
  const t = await getTranslations('home')
  const locale = await getLocale()
  const numbers = new Intl.NumberFormat(
    isLocale(locale) ? intlLocale[locale] : undefined,
  )

  const faqEntries = faqKeys.map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`, brandValues),
  }))

  return (
    <>
      <MetaPixel contentName="home" />
      <SiteNavbar />

      <main className="flex-1">
        <section className="max-w-content px-gutter mx-auto flex flex-wrap items-center gap-14 pb-20 pt-16 md:px-8 lg:pt-20">
          <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-6">
            <p className="text-muted-foreground text-sm font-semibold tracking-wider ltr:uppercase">
              {t('hero.eyebrow')}
            </p>
            <h1 className="type-display font-display rtl:font-display-ar text-primary rtl:leading-[1.35]">
              {t('hero.title')}
            </h1>
            <p className="text-foreground-soft max-w-xl text-lg leading-relaxed lg:text-xl">
              {t('hero.subtitle', brandValues)}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <AppStoreBadge />
              <span className="text-muted-foreground text-sm">
                {t('hero.note')}
              </span>
            </div>
          </div>
          <div className="flex flex-[1_1_480px] justify-center">
            <Illustration name="hero.png" priority className="max-w-[580px]" />
          </div>
        </section>

        <Section
          id="how-it-works"
          surface="card"
          title={t('steps.title')}
          lead={t('steps.lead')}>
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map(({ key, illustration }, index) => (
              <li key={key}>
                <Reveal delay={index * 80} className="h-full">
                  <StepCard
                    step={numbers.format(index + 1)}
                    title={t(`steps.${key}.title`)}
                    body={t(`steps.${key}.body`)}
                    art={<Illustration name={illustration} />}
                  />
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={t('features.title')}>
          <div className="grid gap-5 md:grid-cols-2">
            {features.map((key, index) => (
              <Reveal key={key} delay={index * 60} className="h-full">
                <FeatureCard
                  title={t(`features.${key}.title`)}
                  body={t(`features.${key}.body`)}
                  badge={
                    key === 'languages' ? t('features.languages.badge') : undefined
                  }
                />
              </Reveal>
            ))}
          </div>
        </Section>

        <Section surface="hero">
          <div className="flex flex-wrap items-start gap-10">
            <div className="w-44 shrink-0 lg:w-56">
              <Illustration name="privacy.png" onHero />
            </div>
            <div className="flex flex-[1_1_320px] flex-col gap-3.5">
              <h2 className="type-h2 font-display rtl:font-display-ar">
                {t('privacy.title')}
              </h2>
              <p className="text-hero-foreground/85 type-body">
                {t('privacy.body')}
              </p>
              <SiteLink
                href="/privacy"
                className="text-accent font-semibold underline-offset-2 hover:underline">
                {t('privacy.link')}
              </SiteLink>
            </div>
            <ul className="flex flex-[1_1_320px] flex-col gap-3.5">
              {privacyPoints.map((key) => (
                <li key={key} className="flex gap-3 leading-relaxed">
                  <Check
                    aria-hidden="true"
                    className="text-gold mt-1 h-5 w-5 shrink-0"
                  />
                  {t(`privacy.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="faq" title={t('faq.title')}>
          <div className="max-w-3xl">
            <FAQAccordion entries={faqEntries} />
          </div>
        </Section>

        <section
          id="get-started"
          className="max-w-content px-gutter mx-auto mb-20 w-full md:px-8">
          <div className="bg-card border-border rounded-card-lg flex flex-col items-center gap-5 border px-8 py-14 text-center">
            <h2 className="type-h2 font-display rtl:font-display-ar text-primary">
              {t('cta.title')}
            </h2>
            <AppStoreBadge />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}

export default HomePage
