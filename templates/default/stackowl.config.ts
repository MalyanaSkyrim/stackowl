import { readFileSync } from 'node:fs'

import { defineConfig } from 'stackowl'

/**
 * Everything this project needs outside its code. `pnpm doctor` checks it, `pnpm stackowl
 * setup --apply` sets up what it can, `pnpm secrets:set <env> --apply` gives the API's cloud
 * secrets their values from `.env.<env>`. Docs: apps/docs/content/setup/.
 */

/** The quoted names in `<name> = ["A", "B"]` of an OpenTofu file, so infra/ stays the one list. */
const tfList = (file: string, name: string): string[] => {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
  const body = source.match(new RegExp(`${name}\\s*=\\s*\\[([^\\]]*)\\]`))?.[1] ?? ''
  return [...body.matchAll(/"([^"]+)"/g)].flatMap((match) => (match[1] ? [match[1]] : []))
}

export default defineConfig({
  name: 'Starter App',
  environments: ['staging', 'production'],
  node: '24.11',

  tools: [
    { command: 'git', required: true },
    { command: 'pnpm', required: true, install: 'corepack enable' },
    {
      command: 'docker',
      why: 'the local database (pnpm db:start)',
      install: 'https://docs.docker.com/get-docker/',
    },
    { command: 'gh', why: 'GitHub setup', install: 'https://cli.github.com' },
    {
      command: 'gcloud',
      why: 'Google Cloud (pnpm infra:init, pnpm secrets:set)',
      install: 'https://cloud.google.com/sdk/docs/install',
    },
    { command: 'tofu', why: 'OpenTofu (pnpm infra:init)', install: 'brew install opentofu' },
    { command: 'xcodebuild', why: 'iPhone builds', platform: 'darwin', install: 'the App Store' },
    { command: 'bundle', why: 'Fastlane (pnpm mobile:signing)', platform: 'darwin' },
  ],

  env: {
    required: ['DATABASE_URL', 'AUTH_SECRET', 'API_KEY'],
    groups: {
      'Email codes': ['RESEND_API_KEY', 'RESEND_FROM'],
      'Google sign-in': [
        'GOOGLE_OAUTH_CLIENT_IDS',
        'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
        'EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME',
      ],
      'Apple sign-in': ['APPLE_SIGN_IN_IOS_BUNDLE_ID'],
      'iPhone builds': ['APP_BUNDLE_ID', 'APPLE_TEAM_ID'],
      Infrastructure: ['GCP_PROJECT_ID'],
    },
    // Optional extras (Sentry, Meta Pixel, Turborepo cache) are left empty on purpose.
    example: false,
  },

  github: {
    variables: {
      API_URL_STAGING: {
        why: 'the API staging builds call',
        fallback: 'https://api-staging.example.com',
      },
      API_URL_PRODUCTION: {
        why: 'the API production builds call',
        fallback: 'https://api.example.com',
      },
      WEB_URL_STAGING: { why: 'the website staging builds open' },
      WEB_URL_PRODUCTION: {
        why: 'the website production builds open',
        fallback: 'https://www.example.com',
      },
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: { why: 'Google sign-in' },
      EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME: { why: 'Google sign-in' },
      EXPO_PUBLIC_SENTRY_DSN: { why: 'crash reports (optional)' },
    },
    environmentSecrets: {
      // Set by `pnpm mobile:signing`, read by the Deploy Mobile workflow.
      production: [
        'APPLE_ID',
        'APPLE_TEAM_ID',
        'APP_STORE_CONNECT_KEY_ID',
        'APP_STORE_CONNECT_ISSUER_ID',
        'APP_STORE_CONNECT_PRIVATE_KEY',
        'FASTLANE_MATCH_PASSWORD',
        'MATCH_GIT_URL',
        'SSH_PRIVATE_KEY',
      ],
    },
    labels: ['migration', 'skip-staging-deploy'],
    branches: ['production'],
  },

  gcp: {
    projectEnv: 'GCP_PROJECT_ID',
    secrets: {
      required: tfList('./infra/modules/environment/main.tf', 'required_secrets'),
      optional: tfList('./infra/modules/environment/main.tf', 'optional_secrets'),
    },
    // OpenTofu creates every secret with this value; a secret still holding it was never set.
    placeholder: 'placeholder-set-a-real-value',
    // OpenTofu owns the secrets: `secrets set` gives them values, never creates them.
    createMissing: false,
  },
})
