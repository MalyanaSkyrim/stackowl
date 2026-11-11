import { formatDuration, intervalToDuration } from 'date-fns'
import { FastifyPluginAsync } from 'fastify'

/** The uptime in a readable format, such as "1 hour 2 minutes 3 seconds". */
export function getReadableUptime() {
  const uptime = process.uptime()

  return formatDuration(intervalToDuration({ start: 0, end: uptime * 1000 }))
}

/** `GET /health`: plain HTTP, so Cloud Run and uptime checks need no tRPC client. */
export const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => ({
    status: 'OK',
    uptime: getReadableUptime(),
  }))
}
