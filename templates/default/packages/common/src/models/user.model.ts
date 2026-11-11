import { z } from 'zod'

/**
 * The signed-in user as the API returns it. Only JSON-safe fields: the tRPC
 * link has no transformer, so dates would arrive as strings.
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().nullable(),
  /** True once the email is confirmed with a code, or came from Apple or Google. */
  emailVerified: z.boolean(),
})

export type User = z.infer<typeof userSchema>
