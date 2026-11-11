import { db } from '@starter/database'
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { resolveUserFromOAuth } from './oauth'
import { verifyAppleIdToken } from './verify'

// Needs TEST_DATABASE_URL (see package.json). Apple's token check is replaced
// by a profile the test picks; the name is what the app sends.
vi.mock('./verify', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./verify')>()),
  verifyAppleIdToken: vi.fn(),
}))

const appleProfile = {
  providerAccountId: 'apple-1',
  email: 'abc123@privaterelay.appleid.com',
  emailVerified: true,
  name: null,
}

const signInWithApple = (name?: string) =>
  resolveUserFromOAuth({ provider: 'APPLE', idToken: 'token', name })

beforeEach(async () => {
  await db.user.deleteMany()
  vi.mocked(verifyAppleIdToken).mockResolvedValue(appleProfile)
})

afterAll(async () => {
  await db.$disconnect()
})

describe('Apple name', () => {
  test('a new account takes the name Apple gave the app', async () => {
    const user = await signInWithApple('Jane Appleseed')
    expect(user.name).toBe('Jane Appleseed')
  })

  test('a later sign-in fills a name the first one lost', async () => {
    const first = await signInWithApple()
    expect(first.name).toBeNull()

    const later = await signInWithApple('Jane Appleseed')

    expect(later.id).toBe(first.id)
    expect(later.name).toBe('Jane Appleseed')
    const saved = await db.user.findUniqueOrThrow({ where: { id: first.id } })
    expect(saved.name).toBe('Jane Appleseed')
  })

  test('never replaces a name the account already has', async () => {
    await signInWithApple('Jane')
    const later = await signInWithApple('Someone else')
    expect(later.name).toBe('Jane')
  })
})
