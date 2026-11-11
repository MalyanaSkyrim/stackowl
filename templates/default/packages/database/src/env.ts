import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },
  runtimeEnv: process.env,
  // Unset CI secrets arrive as '' — treat them as missing so defaults apply
  emptyStringAsUndefined: true,
})
