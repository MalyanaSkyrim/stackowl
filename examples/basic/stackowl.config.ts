import { defineConfig } from 'stackowl'

/**
 * What this project needs outside its code. `npx stackowl doctor` checks it,
 * `npx stackowl setup --apply` sets up what it can. Docs: modules and config reference.
 */
export default defineConfig({
  name: 'basic',
  environments: ['staging', 'production'],
  node: '20',

  tools: [
    { command: 'git', required: true },
    { command: 'docker', why: 'the local database' },
    { command: 'gh', why: 'GitHub setup', install: 'https://cli.github.com' },
    {
      command: 'gcloud',
      why: 'Google Cloud',
      install: 'https://cloud.google.com/sdk/docs/install',
    },
  ],

  env: {
    required: ['DATABASE_URL'],
    groups: {
      // 'Sign-in': ['AUTH_SECRET'],
    },
  },

  // Checked by `doctor`; variables and labels are set by `setup github --apply`.
  github: {
    variables: {
      // NAME: { why: 'what reads it', fallback: 'value when the env file has none' },
      API_URL_STAGING: { why: 'the API staging builds call' },
    },
    environmentSecrets: {
      // production: ['DEPLOY_KEY'],
    },
    labels: ['migration', 'skip-staging-deploy'],
    branches: [],
  },

  // Secret Manager values per environment, set from .env.<environment> by `secrets set`.
  gcp: {
    projectEnv: 'GCP_PROJECT_ID',
    secrets: {
      required: ['DATABASE_URL', 'AUTH_SECRET'],
      optional: [],
    },
    // secretId: (name, environment) => `${name}_${environment.toUpperCase()}`,
    // placeholder: 'placeholder-set-a-real-value',
  },
})
