import {
  ILLUSTRATIONS_DIR,
  type IllustrationName,
  illustrations,
} from '@/lib/marketing/illustrations'
import { classMerge } from '@starter/ui/lib/utils'
import { ImageIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import React from 'react'

interface IllustrationProps {
  name: IllustrationName
  /** Decorative illustrations are hidden from screen readers. */
  alt?: string
  /** Placeholder colors for the filled hero band. */
  onHero?: boolean
  priority?: boolean
  className?: string
}

/**
 * One of the site's illustrations, or, while its file is not in
 * `public/img/illustrations/` yet, a dashed box of the same shape labelled
 * with the file name it expects.
 *
 * A server component: the file check runs when the page is rendered (at build
 * time for these static pages), so adding the image and rebuilding swaps the
 * placeholder out.
 */
export const Illustration = async ({
  name,
  alt = '',
  onHero = false,
  priority = false,
  className,
}: IllustrationProps) => {
  const { width, height } = illustrations[name]
  const src = `${ILLUSTRATIONS_DIR}/${name}`
  const hasFile = existsSync(join(process.cwd(), 'public', src))

  if (hasFile) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        sizes="(min-width: 1024px) 580px, 100vw"
        className={classMerge('h-auto w-full', className)}
      />
    )
  }

  const t = await getTranslations('common')

  return (
    <div
      role="img"
      aria-label={t('illustration', { name })}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={classMerge(
        'rounded-card-lg flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed p-3 text-center',
        onHero
          ? 'border-hero-foreground/40 bg-hero-foreground/10 text-hero-foreground'
          : 'border-gold/60 bg-muted text-foreground-soft',
        className,
      )}>
      <ImageIcon aria-hidden="true" className="h-7 w-7" strokeWidth={1.75} />
      <span dir="ltr" className="text-sm font-semibold">
        {name}
      </span>
      <span dir="ltr" className="text-xs opacity-80">
        {width} × {height}
      </span>
    </div>
  )
}
