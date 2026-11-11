import { db } from '@starter/database'
import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify'

import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify'

import { healthRoute } from './modules/health/health.route'
import loggerPlugin from './plugins/logger'
import rateLimitPlugin from './plugins/rate-limit'
import sensiblePlugin from './plugins/sensible'
import { createContext } from './trpc/context'
import { appRouter, type AppRouter } from './trpc/router'

export type ServerOptions = FastifyServerOptions

/**
 * Builds the API: a Fastify server with the health check at `/health` and
 * every module's tRPC router under `/trpc` (see `trpc/router.ts`).
 * @see https://trpc.io/docs/server/adapters/fastify
 */
export const createServer = (opts: ServerOptions = {}) => {
  const fastify = Fastify({
    // tRPC batches calls in one request, so the URL can grow past the default.
    routerOptions: { maxParamLength: 5000 },
    ...opts,
  })

  fastify.register(sensiblePlugin)
  fastify.register(loggerPlugin)
  fastify.register(rateLimitPlugin)

  fastify.register(healthRoute, { prefix: '/health' })

  fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        if (error.code === 'INTERNAL_SERVER_ERROR') {
          fastify.log.error(error, `tRPC error on ${path ?? 'unknown path'}`)
        }
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  })

  return fastify
}

/**
 * Closes the server and the database connection, after the tests
 * (see `vitestHelper.ts`).
 */
export async function closeServer(server: FastifyInstance) {
  server.log.info('Closing up server and resources...')
  await db.$disconnect()
  await server.close()
}
