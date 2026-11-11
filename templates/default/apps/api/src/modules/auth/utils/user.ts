import type { User as AuthUser } from '@starter/common'
import type { User } from '@starter/database'

/** The user as the app sees it: no password hash, no dates. */
export const toAuthUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  emailVerified: user.emailVerified !== null,
})
