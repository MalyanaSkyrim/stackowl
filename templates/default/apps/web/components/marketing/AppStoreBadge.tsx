import { brand } from '@starter/common'
import { useTranslations } from 'next-intl'
import React from 'react'

/**
 * Apple's "Download on the App Store" badge, drawn in its black style.
 *
 * Until the listing exists (`brand.urls.appStore` is null) it renders without
 * a link. Before launch, swap in Apple's official badge artwork for each
 * language from the App Store marketing guidelines.
 */
export const AppStoreBadge = () => {
  const t = useTranslations('appStore')
  const href = brand.urls.appStore ?? undefined

  return (
    <a
      href={href}
      aria-label={t('label')}
      className="focus-visible:ring-ring inline-flex min-h-11 items-center gap-2.5 rounded-xl bg-black px-5 py-2.5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor">
        <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
      </svg>
      <span className="flex flex-col text-start leading-tight">
        <span className="text-[11px]">{t('small')}</span>
        <span className="text-lg font-semibold">{t('large')}</span>
      </span>
    </a>
  )
}
