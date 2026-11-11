import { z } from 'zod'

/** Allowed OAuth provider values stored in `OAuthAccount.provider` */
export const oauthProviderSchema = z.enum(['APPLE', 'GOOGLE'])

export type OAuthProvider = z.infer<typeof oauthProviderSchema>
