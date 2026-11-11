import { db } from '@starter/database'
import pino from 'pino'
import { afterAll, beforeEach, describe, expect, test } from 'vitest'

import { TRPCError } from '@trpc/server'

import { AppError } from '../../errors'
import { appRouter } from '../../trpc/router'

// Needs TEST_DATABASE_URL (see package.json).
const log = pino({ level: 'silent' })

const reasonOf = (error: unknown) =>
  error instanceof TRPCError && error.cause instanceof AppError
    ? error.cause.reason
    : null

const userCaller = async (email: string) => {
  const user = await db.user.create({ data: { email, emailVerified: new Date() } })
  return appRouter.createCaller({ log, userId: user.id })
}

beforeEach(async () => {
  await db.user.deleteMany()
})

afterAll(async () => {
  await db.$disconnect()
})

describe('notes', () => {
  test('creates, lists, updates and deletes a note', async () => {
    const me = await userCaller('me@example.com')
    const created = await me.notes.create({ title: '  First  ' })
    expect(created).toMatchObject({ title: 'First', body: '' })

    const updated = await me.notes.update({ id: created.id, body: 'Hello' })
    expect(updated.body).toBe('Hello')
    expect((await me.notes.list()).map((n) => n.id)).toEqual([created.id])

    await me.notes.delete({ id: created.id })
    expect(await me.notes.list()).toEqual([])
  })

  test("never shows another user's note", async () => {
    const me = await userCaller('me@example.com')
    const other = await userCaller('other@example.com')
    const note = await other.notes.create({ title: 'Private' })

    expect(await me.notes.list()).toEqual([])
    await expect(me.notes.get({ id: note.id })).rejects.toSatisfy(
      (error) => reasonOf(error) === 'NOT_FOUND',
    )
  })

  test('needs a signed-in user', async () => {
    const anonymous = appRouter.createCaller({ log, userId: null })
    await expect(anonymous.notes.list()).rejects.toThrow(TRPCError)
  })
})
