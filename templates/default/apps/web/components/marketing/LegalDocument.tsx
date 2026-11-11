import { classMerge } from '@starter/ui/lib/utils'
import React from 'react'

interface LegalDocumentProps {
  title: string
  /** "Last updated …", already formatted. */
  updated: string
  children: React.ReactNode
}

/** The privacy policy and terms: one readable column of prose. */
export const LegalDocument = ({
  title,
  updated,
  children,
}: LegalDocumentProps) => (
  <article className="px-gutter mx-auto w-full max-w-prose pb-24 pt-16">
    <h1 className="type-h1 font-display rtl:font-display-ar text-primary">
      {title}
    </h1>
    <p className="text-muted-foreground mb-8 mt-3 text-[15px]">{updated}</p>
    <div className="flex flex-col gap-10">{children}</div>
  </article>
)

interface LegalSectionProps {
  title: string
  children: React.ReactNode
}

export const LegalSection = ({ title, children }: LegalSectionProps) => (
  <section className="flex flex-col gap-3.5">
    <h2 className="font-display rtl:font-display-ar text-primary text-2xl leading-tight">
      {title}
    </h2>
    {children}
  </section>
)

/** Body text of a legal section. */
export const LegalText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-foreground-soft text-base leading-7">{children}</p>
)

interface LegalListProps {
  children: React.ReactNode
  className?: string
}

/** A bulleted list; give each item a `<li>`. */
export const LegalList = ({ children, className }: LegalListProps) => (
  <ul
    className={classMerge(
      'text-foreground-soft flex list-disc flex-col gap-2 ps-5 text-base leading-7',
      className,
    )}>
    {children}
  </ul>
)
