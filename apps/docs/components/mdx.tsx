import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'

import { Mermaid } from './Mermaid'
import { Terminal } from './Terminal'

/** Everything a page can use without importing it. */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Accordion,
    Accordions,
    Mermaid,
    Step,
    Steps,
    Tab,
    Tabs,
    Terminal,
    ...components,
  } satisfies MDXComponents
}
