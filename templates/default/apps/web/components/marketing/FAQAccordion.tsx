'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Text,
} from '@starter/ui'
import React from 'react'

export interface FAQEntry {
  question: string
  answer: string
}

interface FAQAccordionProps {
  entries: FAQEntry[]
}

/**
 * FAQ rows divided by hairlines. Uses the universal Accordion from
 * `@starter/ui`, with larger marketing type.
 */
export const FAQAccordion = ({ entries }: FAQAccordionProps) => (
  <Accordion type="single" collapsible className="border-input border-t">
    {entries.map((entry, index) => (
      <AccordionItem
        key={entry.question}
        value={`faq-${index}`}
        className="border-input">
        <AccordionTrigger className="py-5">
          <Text className="text-foreground text-base font-semibold">
            {entry.question}
          </Text>
        </AccordionTrigger>
        <AccordionContent className="pb-5 pe-8">
          <Text className="text-foreground-soft text-[15px] leading-relaxed">
            {entry.answer}
          </Text>
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
)
