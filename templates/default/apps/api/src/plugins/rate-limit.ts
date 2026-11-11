import rateLimit from '@fastify/rate-limit'
import fp from 'fastify-plugin'
import Redis from 'ioredis'

import { env } from '../env'

/**
 * Limits requests per IP. With `REDIS_URL` set, the counts live in that Redis
 * and every Cloud Run instance shares them; without it (local development,
 * tests) each instance counts in memory.
 */
export default fp(
  async (fastify) => {
    // Fail fast rather than hold requests while Redis is unreachable, as the
    // plugin recommends; `skipOnError` then lets those requests through.
    const redis = env.REDIS_URL
      ? new Redis(env.REDIS_URL, {
          connectTimeout: 500,
          maxRetriesPerRequest: 1,
        })
      : undefined

    if (redis) {
      redis.on('error', (error) =>
        fastify.log.error({ err: error }, 'Rate limit Redis error'),
      )
      fastify.addHook('onClose', async () => {
        await redis.quit()
      })
    }

    await fastify.register(rateLimit, {
      global: true,
      max: env.RATE_LIMIT_MAX,
      timeWindow: env.RATE_LIMIT_TIME_WINDOW,
      redis,
      nameSpace: `starter-app-${env.APP_ENV}-rate-limit-`,
      skipOnError: true,
    })

    // Rate limit the 404 routes too.
    fastify.setNotFoundHandler(
      { preHandler: fastify.rateLimit() },
      (_, reply) => reply.notFound(),
    )
  },
  { name: 'rate-limit' },
)
