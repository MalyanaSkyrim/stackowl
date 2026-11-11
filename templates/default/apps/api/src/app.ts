import pino from 'pino'
import pretty from 'pino-pretty'

import { env } from './env'
import { createServer, type ServerOptions } from './server'

const prodConfig: ServerOptions = {
  disableRequestLogging: true,
  bodyLimit: 1_000_000,
  loggerInstance: pino({ name: 'api' }),
}

const devConfig: ServerOptions = {
  disableRequestLogging: true,
  bodyLimit: 1_000_000,
  loggerInstance: pino(
    {},
    pretty({
      levelFirst: true,
      colorize: true,
      colorizeObjects: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'hostname,pid,labels',
    }),
  ),
}

const server = createServer(
  env.NODE_ENV === 'production' ? prodConfig : devConfig,
)

const start = async () => {
  try {
    await server.listen({ port: env.API_PORT, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
