// Loads the `PrismaJson` types that the generated client refers to, so every
// package that imports the database type-checks them.
import type {} from '../prisma/json-types'
import { env } from './env'
import {
  createDbInstance,
  type ExtendedPrismaClient,
  type ExtendedTransactionClient,
} from './extensions'

declare global {
  // allow global `var` declarations
  var db: ExtendedPrismaClient | undefined
}

let db: ExtendedPrismaClient

if (env.NODE_ENV === 'production') {
  db = createDbInstance()
} else {
  if (!global.db) {
    global.db = createDbInstance()
  }
  db = global.db
}

export type * from '../generated/prisma/client'
export { Prisma, PrismaClient } from '../generated/prisma/client'
export { db, env }
export { type ExtendedPrismaClient, type ExtendedTransactionClient }
