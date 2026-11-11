// Email templates render to static HTML on the server. Kept out of the main
// `@starter/ui` barrel, which pulls in client-only Radix components.
export { type EmailContent, renderEmailHtml } from './render'
export { type EmailLocale } from './templates/copy'
