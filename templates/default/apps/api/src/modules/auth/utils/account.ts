import { db } from '@starter/database'

/**
 * Deletes the account and, through the schema's cascades, everything tied to
 * it: sessions, codes, Apple and Google links and all synced progress.
 * Returns false when there was no such account (already deleted).
 */
export const deleteAccount = async (userId: string): Promise<boolean> => {
  const { count } = await db.user.deleteMany({ where: { id: userId } })
  return count > 0
}
