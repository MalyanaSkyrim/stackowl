import { createRemoteJWKSet, jwtVerify } from 'jose'

import { env } from '../../../../env'
import {
  InvalidOAuthTokenError,
  OAuthNotConfiguredError,
} from '../../auth.errors'

export type VerifiedOAuthProfile = {
  providerAccountId: string
  email: string | null
  emailVerified: boolean
  name: string | null
}

const googleJwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs'),
)

const appleJwks = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys'),
)

function parseGoogleAudiences(): string[] {
  return (env.GOOGLE_OAUTH_CLIENT_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export async function verifyGoogleIdToken(
  idToken: string,
): Promise<VerifiedOAuthProfile> {
  const audiences = parseGoogleAudiences()
  if (audiences.length === 0) {
    throw new OAuthNotConfiguredError(
      'Google sign-in is not configured (GOOGLE_OAUTH_CLIENT_IDS).',
    )
  }

  const payload = await jwtVerify(idToken, googleJwks, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: audiences,
  }).then(
    (result) => result.payload,
    (error) => {
      throw new InvalidOAuthTokenError(
        'Google ID token could not be verified.',
        { cause: error },
      )
    },
  )

  if (typeof payload.sub !== 'string' || payload.sub === '') {
    throw new InvalidOAuthTokenError('Google token missing sub.')
  }

  return {
    providerAccountId: payload.sub,
    email:
      typeof payload.email === 'string' ? normalizeEmail(payload.email) : null,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === 'string' ? payload.name : null,
  }
}

/**
 * Apple only sends the user's name to the app, on the first sign-in, so the
 * app passes it along; the token itself carries the id and email.
 */
export async function verifyAppleIdToken(
  idToken: string,
): Promise<VerifiedOAuthProfile> {
  const audience = env.APPLE_SIGN_IN_IOS_BUNDLE_ID?.trim()
  if (!audience) {
    throw new OAuthNotConfiguredError(
      'Sign in with Apple is not configured (APPLE_SIGN_IN_IOS_BUNDLE_ID).',
    )
  }

  const payload = await jwtVerify(idToken, appleJwks, {
    issuer: 'https://appleid.apple.com',
    audience,
  }).then(
    (result) => result.payload,
    (error) => {
      throw new InvalidOAuthTokenError(
        'Apple identity token could not be verified.',
        { cause: error },
      )
    },
  )

  if (typeof payload.sub !== 'string' || payload.sub === '') {
    throw new InvalidOAuthTokenError('Apple token missing sub.')
  }

  return {
    providerAccountId: payload.sub,
    email:
      typeof payload.email === 'string' ? normalizeEmail(payload.email) : null,
    emailVerified: true,
    name: null,
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
