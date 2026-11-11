import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

/** Every page lives in `content/`: one folder per section, `meta.json` sets the order. */
export const docs = defineDocs({
  dir: 'content',
})

export default defineConfig({
  mdxOptions: {
    // ```mermaid blocks render as diagrams here and on GitHub alike.
    remarkPlugins: [remarkMdxMermaid],
  },
})
