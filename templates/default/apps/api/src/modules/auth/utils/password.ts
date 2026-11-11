import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export const verifyPassword = (password: string, hashed: string) =>
  bcrypt.compare(password, hashed)

export const hashPassword = (password: string, rounds = 12) =>
  bcrypt.hash(password, rounds)

/** A hash of a random password nobody knows, made once on first use. */
let decoyHash: Promise<string> | undefined

/**
 * `verifyPassword` that also runs when there is no password to check (an
 * unknown email, an Apple or Google-only account), against a decoy hash, so
 * every answer takes as long as a real check and its timing does not reveal
 * who has an account. Always false without a password.
 */
export const verifyPasswordOrDecoy = async (
  password: string,
  hashed: string | null | undefined,
): Promise<boolean> => {
  if (hashed != null) return verifyPassword(password, hashed)

  decoyHash ??= hashPassword(randomBytes(32).toString('hex'))
  await verifyPassword(password, await decoyHash)
  return false
}
