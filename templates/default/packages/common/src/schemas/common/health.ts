import { z } from 'zod'

export const healthReplySchema = z.object({
  status: z.string(),
  uptime: z.string(),
  docURL: z.string().url(),
  apiVersions: z.string(),
})

export type HealthOutput = z.infer<typeof healthReplySchema>
