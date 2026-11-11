import { createEnv } from '@t3-oss/env-core'
import dotenv from 'dotenv'
import z from 'zod'

dotenv.config({ path: '../../.env' })

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',

  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    APP_ENV: z
      .enum(['development', 'production', 'staging'])
      .default('development'),
    API_PORT: z.coerce.number().default(4000),
    API_URL: z.string().default('http://localhost:4000'),
    API_KEY: z.string(),
    /** Signs the access tokens (JWT). */
    AUTH_SECRET: z.string(),
    RATE_LIMIT_MAX: z.coerce.number().default(500),
    RATE_LIMIT_TIME_WINDOW: z.coerce.number().default(60000),
    /** External Redis (`redis://` or `rediss://`) shared by every API instance for rate limiting. Unset: counted in memory. */
    REDIS_URL: z.string().optional(),

    /** Email codes (sign-up, password reset). Unset in development: codes go to the log. */
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z.string().optional(),

    /** Comma-separated Google OAuth client IDs accepted as the id_token `aud` (iOS client, and the web client if used). */
    GOOGLE_OAUTH_CLIENT_IDS: z.string().optional(),
    /** Sign in with Apple on iPhone: the token's `aud` is the app bundle identifier. */
    APPLE_SIGN_IN_IOS_BUNDLE_ID: z.string().optional(),
  },
  runtimeEnv: process.env,
  // Unset CI secrets arrive as '' — treat them as missing so defaults apply
  emptyStringAsUndefined: true,
})
