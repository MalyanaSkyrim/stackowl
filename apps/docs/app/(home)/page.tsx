import { CopyCommand } from '@/components/CopyCommand'
import { Logo } from '@/components/Logo'
import { Terminal } from '@/components/Terminal'
import { repositoryUrl, site } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

import styles from './Landing.module.css'

export const metadata: Metadata = {
  title: { absolute: `${site.name}: from idea to App Store, wisely` },
  description: site.description,
}

const INSTALL =
  'curl -fsSL https://raw.githubusercontent.com/MalyanaSkyrim/stackowl/main/install/install.sh | bash -s my-app'

/** Who StackOwl is for: the same tool, three ways in. */
const audiences = [
  {
    title: 'Vibecoders',
    body: 'Describe what you want to your AI assistant. StackOwl gives it a repo it understands (rules, skills and a worked example), and one-line commands with plain-language output, so you need very little Git or terminal know-how.',
  },
  {
    title: 'Developers',
    body: 'A typed full stack with conventions already decided: tRPC end to end, one UI kit for web and mobile, Prisma, tests and CI. Copy the notes feature and build yours.',
  },
  {
    title: 'Experts and teams',
    body: 'Infrastructure as code, secrets per environment, staging and production deploys, signed iPhone builds, and stackowl doctor in CI so nothing drifts.',
  },
]

const parts = [
  {
    title: 'Website',
    body: 'Next.js landing page with privacy, terms and support pages, in English and French.',
  },
  {
    title: 'API',
    body: 'Fastify and tRPC, typed end to end. Sign in with email codes, Apple and Google.',
  },
  {
    title: 'iPhone app',
    body: 'Expo and React Native: sign-in, settings, dark mode, English, French and Arabic.',
  },
  {
    title: 'Docs',
    body: 'Your own docs site, with every setup step for your project, in order.',
  },
  {
    title: 'Cloud',
    body: 'OpenTofu for Google Cloud: Cloud Run, Secret Manager and deploy access for GitHub.',
  },
  {
    title: 'CI and releases',
    body: 'GitHub Actions for checks, staging and production deploys, and TestFlight builds.',
  },
]

const technologies = [
  'TypeScript',
  'Next.js',
  'Expo',
  'React Native',
  'NativeWind',
  'Fastify',
  'tRPC',
  'Zod',
  'Prisma',
  'CockroachDB',
  'Redis',
  'Resend',
  'Sign in with Apple',
  'Google sign-in',
  'Fumadocs',
  'Storybook',
  'Turborepo',
  'pnpm',
  'Docker',
  'OpenTofu',
  'Google Cloud Run',
  'GitHub Actions',
  'Fastlane',
  'TestFlight',
  'Sentry',
]

/** The project's own setup guide, phase by phase, and what StackOwl does for each. */
const path = [
  { step: 'Your machine', help: 'The installer adds Node.js, pnpm, Docker and git.', command: 'install.sh' },
  { step: 'Your app', help: 'Copied, renamed for your app, installed, database started.', command: 'stackowl create' },
  { step: 'Local development', help: 'API, website and iPhone app running, with a demo user.', command: 'pnpm dev' },
  { step: 'Repository', help: 'GitHub variables, labels and branches set for you.', command: 'stackowl setup github' },
  { step: 'Backend services', help: 'Each key you still need, and what it unlocks.', command: 'stackowl doctor' },
  { step: 'Cloud', help: 'Infrastructure created, secrets given their values.', command: 'stackowl secrets set' },
  { step: 'Apple', help: 'Signing, then your first TestFlight build.', command: 'pnpm mobile:signing' },
  { step: 'Release', help: 'The App Store listing and the submission, step by step.', command: 'docs' },
]

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Logo size={88} />
        <p className={styles.eyebrow}>For vibecoders, junior and senior developers alike</p>
        <h1 className={styles.title}>From idea to App Store, wisely.</h1>
        <p className={styles.lead}>
          One command gives you a production-ready website, API, iPhone app, docs and cloud. Then{' '}
          {site.name} guides every step, from your first commit to the App Store.
        </p>
        <CopyCommand command={INSTALL} />
        <p className={styles.note}>
          Already have Node.js? <code>npx stackowl create my-app</code>
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/docs/start-here/create-an-app">
            Get started
          </Link>
          <a className={styles.secondary} href={repositoryUrl}>
            GitHub
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <Terminal
          title="stackowl create"
          lines={[
            {
              command: 'npx stackowl create habit-tracker',
              output: `◇  App name: Habit Tracker
◇  Bundle id: com.acme.habittracker
◇  Copied the starter (312 files renamed for Habit Tracker)

› Install dependencies
› Start the local database
› Create the tables
› Add the demo user

✓ Habit Tracker is ready in habit-tracker`,
            },
            {
              command: 'pnpm dev',
              output: 'API on :4000 · website on :3003 · iPhone app in the simulator',
            },
          ]}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Made for everyone who builds</h2>
        <p className={styles.sub}>
          Whether you write every line or let an AI write them, you get the same production setup, and
          the same guide all the way to the App Store.
        </p>
        <div className={styles.grid}>
          {audiences.map((audience) => (
            <div key={audience.title} className={styles.card}>
              <h3>{audience.title}</h3>
              <p>{audience.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Everything a product needs, wired together</h2>
        <p className={styles.sub}>
          One monorepo, one UI kit for the website and the app, and a small notes feature that goes
          through every layer as the example to copy.
        </p>
        <div className={styles.grid}>
          {parts.map((part) => (
            <div key={part.title} className={styles.card}>
              <h3>{part.title}</h3>
              <p>{part.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Built on tools you already trust</h2>
        <ul className={styles.chips}>
          {technologies.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Guided until you publish</h2>
        <p className={styles.sub}>
          Creating the app is the first step, not the last. Your project comes with a setup guide, and{' '}
          <code>stackowl doctor</code> says what is still missing at every phase: ✓ ready, ! worth a
          look, ✖ must be fixed.
        </p>
        <ol className={styles.path}>
          {path.map((item, index) => (
            <li key={item.step}>
              <span className={styles.number}>{index + 1}</span>
              <div>
                <strong>{item.step}</strong>
                <p>{item.help}</p>
              </div>
              <code>{item.command}</code>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.cta}>
        <h2 className={styles.heading}>Start with one line</h2>
        <CopyCommand command={INSTALL} />
        <div className={styles.actions}>
          <Link className={styles.primary} href="/docs">
            Read the docs
          </Link>
        </div>
      </section>
    </main>
  )
}
