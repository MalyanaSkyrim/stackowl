import { classMerge } from '@starter/ui/lib/utils'
import React from 'react'

interface SectionProps {
  children: React.ReactNode
  title?: string
  /** Intro paragraph between the title and the content. */
  lead?: string
  id?: string
  /** Page bands: the page background, a white band, or the filled hero one. */
  surface?: 'plain' | 'card' | 'hero'
  className?: string
}

/**
 * One marketing section: the vertical rhythm, the page band and the content
 * column. Headings start-align, so they sit on the right in Arabic.
 *
 * `scroll-mt-20` clears the sticky navbar so an anchored section lands with
 * its heading visible rather than tucked behind the header.
 */
export const Section = ({
  children,
  title,
  lead,
  id,
  surface = 'plain',
  className,
}: SectionProps) => (
  <section
    id={id}
    tabIndex={id ? -1 : undefined}
    className={classMerge(
      'py-section scroll-mt-20 outline-none lg:py-20',
      surface === 'card' && 'bg-card border-border border-y',
      surface === 'hero' && 'bg-hero text-hero-foreground',
      className,
    )}>
    <div className="max-w-content px-gutter mx-auto w-full md:px-8">
      {(title || lead) && (
        <div className="mb-10 flex max-w-2xl flex-col gap-3">
          {title && (
            <h2
              className={classMerge(
                'type-h2 font-display rtl:font-display-ar',
                surface !== 'hero' && 'text-primary',
              )}>
              {title}
            </h2>
          )}
          {lead && <p className="type-body text-foreground-soft">{lead}</p>}
        </div>
      )}
      {children}
    </div>
  </section>
)
