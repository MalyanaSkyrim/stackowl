import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

import { PrismaClient } from '../../generated/prisma/client'
import { env } from '../env'
import { RetryTransaction } from './retry-transaction'

/**
 * Creates a new instance of the database client and add extensions to it.
 *
 * @returns The extended database client instance.
 */
export const createDbInstance = () => {
  const { PRISMA_VERBOSE = 'error' } = process.env
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
  const adapter = new PrismaPg(pool)

  let dbToCreate: PrismaClient
  if (PRISMA_VERBOSE === 'error') {
    dbToCreate = new PrismaClient({ adapter, log: ['error'] })
  } else if (PRISMA_VERBOSE === 'warn') {
    dbToCreate = new PrismaClient({ adapter, log: ['error', 'warn'] })
  } else if (PRISMA_VERBOSE === 'info') {
    dbToCreate = new PrismaClient({ adapter, log: ['error', 'warn', 'info'] })
  } else if (PRISMA_VERBOSE === 'query') {
    const verboseDbToCreate = new PrismaClient({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'info' },
      ],
    })
    verboseDbToCreate.$on('query', (event) => {
      console.log('📮 Query: ' + event.query)
      console.log('💉 Param: ' + event.params)
      console.log('🚅 Duration: ' + event.duration + 'ms')
      console.log('🎯 Target: ' + event.target)
      console.log('⌛ Timestamp: ' + event.timestamp)
    })
    dbToCreate = verboseDbToCreate
  } else {
    throw new Error(`Invalid value for PRISMA_VERBOSE: ${PRISMA_VERBOSE}`)
  }

  return dbToCreate.$extends(
    RetryTransaction({
      jitter: 'full',
      numOfAttempts: 5,
    }),
  )
}

export type ExtendedPrismaClient = ReturnType<typeof createDbInstance>
export type ExtendedTransactionClient = Parameters<
  Parameters<ExtendedPrismaClient['$transaction']>[0]
>[0]
