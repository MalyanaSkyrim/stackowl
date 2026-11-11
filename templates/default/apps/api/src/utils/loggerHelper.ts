import fastRedact, { type RedactOptions } from 'fast-redact'
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

export const getRedact = (
  paths: string[] = [],
  opts?: Omit<RedactOptions, 'paths'>,
) => {
  return fastRedact({ paths, serialize: false, ...opts })
}

type LogData = {
  data: unknown
  message: string
}

interface LogDataResolverOptions {
  env: 'production' | 'staging' | 'development' | 'test'
}

export class ServerLogDataResolver {
  env: 'production' | 'staging' | 'development' | 'test'

  constructor({ env }: LogDataResolverOptions) {
    this.env = env
  }

  onRequest(req: FastifyRequest, redactPaths: string[] = []): LogData {
    const redact = getRedact(redactPaths)
    const data =
      this.env === 'development'
        ? {
            remoteAddress: req.ip,
            hostname: req.hostname,
            method: req.method,
            url: req.url,
          }
        : redact({
            req,
          })

    return {
      data,
      message: `Incoming request ${req.method} ${req.url}`,
    }
  }

  onError(
    req: FastifyRequest,
    error: FastifyError,
    redactPaths: string[] = [],
  ): LogData {
    const redact = getRedact(redactPaths)
    const data =
      this.env === 'development'
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
          }
        : redact({
            req,
            error,
          })

    return {
      data,
      message: `Failed request ${req.method} ${req.url}`,
    }
  }

  onSend(
    req: FastifyRequest,
    reply: FastifyReply,
    payload: unknown,
    redactPaths: string[] = [],
  ): LogData {
    const redact = getRedact(redactPaths)
    const data =
      this.env === 'development'
        ? {
            statusCode: reply.statusCode,
            responseTime: reply.elapsedTime,
            remoteAddress: req.ip,
            hostname: req.hostname,
            method: req.method,
            url: req.url,
          }
        : redact({
            req,
            reply,
            payload,
          })

    return {
      data,
      message: `Completed request ${req.method} ${req.url} with status code ${reply.statusCode}`,
    }
  }
}
