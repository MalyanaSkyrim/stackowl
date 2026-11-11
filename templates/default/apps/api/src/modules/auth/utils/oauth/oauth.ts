import type { OAuthProvider } from '@starter/common'
import { db, type User } from '@starter/database'

import {
  OAuthEmailNotVerifiedError,
  OAuthNoEmailError,
} from '../../auth.errors'
import {
  verifyAppleIdToken,
  verifyGoogleIdToken,
  type VerifiedOAuthProfile,
} from './verify'

/**
 * Finds or creates the user behind an Apple or Google token:
 * 1. an existing link to this provider account signs that user in;
 * 2. otherwise a user with the same email gets this provider linked;
 * 3. otherwise a new, verified user is created.
 */
export async function resolveUserFromOAuth({
  provider,
  idToken,
  name,
}: {
  provider: OAuthProvider
  idToken: string
  /** The name Apple gives the app on the first sign-in. */
  name?: string
}): Promise<User> {
  const profile = await verifyProviderToken(provider, idToken)

  const existingLink = await db.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  })

  if (existingLink !== null) {
    return fillMissingName(existingLink.user, name)
  }

  if (!profile.emailVerified) {
    throw new OAuthEmailNotVerifiedError('The account email is not verified.')
  }

  if (profile.email === null) {
    throw new OAuthNoEmailError('The provider did not share an email address.')
  }

  const email = profile.email

  const userByEmail = await db.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  })

  if (userByEmail !== null) {
    await db.oAuthAccount.create({
      data: {
        userId: userByEmail.id,
        provider,
        providerAccountId: profile.providerAccountId,
      },
    })

    if (userByEmail.emailVerified !== null) {
      return fillMissingName(userByEmail, name ?? profile.name)
    }

    // An email sign-up nobody confirmed: the provider has now proved who owns
    // the address. Drop the unconfirmed password, which anyone could have
    // set, so it cannot be used to get into this account later.
    return db.user.update({
      where: { id: userByEmail.id },
      data: {
        emailVerified: new Date(),
        passwordHash: null,
        name: userByEmail.name ?? name ?? profile.name,
      },
    })
  }

  return db.user.create({
    data: {
      email,
      name: name ?? profile.name,
      // The provider already proved ownership of this address (unverified
      // emails are rejected above), so there is nothing to confirm.
      emailVerified: new Date(),
      oauthAccounts: {
        create: { provider, providerAccountId: profile.providerAccountId },
      },
    },
  })
}

/**
 * Apple shares the user's name once, on the first sign-in, and a first sign-in that failed
 * loses it. So a later sign-in that brings a name fills it in when the account has none; a
 * name the user already has is never replaced.
 */
async function fillMissingName(
  user: User,
  name: string | null | undefined,
): Promise<User> {
  if (user.name !== null || !name) return user
  return db.user.update({ where: { id: user.id }, data: { name } })
}

function verifyProviderToken(
  provider: OAuthProvider,
  idToken: string,
): Promise<VerifiedOAuthProfile> {
  switch (provider) {
    case 'APPLE':
      return verifyAppleIdToken(idToken)
    case 'GOOGLE':
      return verifyGoogleIdToken(idToken)
  }
}
