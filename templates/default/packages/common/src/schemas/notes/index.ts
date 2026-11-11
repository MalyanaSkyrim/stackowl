import { z } from 'zod'

/**
 * The notes example: a small feature that shows every layer of the stack, from the database
 * to the API to the app. Copy it for your first real feature, then delete it.
 */
export const NOTE_TITLE_MAX_LENGTH = 120
export const NOTE_BODY_MAX_LENGTH = 10_000

export const noteTitleSchema = z.string().trim().min(1).max(NOTE_TITLE_MAX_LENGTH)
export const noteBodySchema = z.string().trim().max(NOTE_BODY_MAX_LENGTH)

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Note = z.infer<typeof noteSchema>

export const createNoteInputSchema = z.object({
  title: noteTitleSchema,
  body: noteBodySchema.default(''),
})
export type CreateNoteInput = z.infer<typeof createNoteInputSchema>

export const updateNoteInputSchema = z.object({
  id: z.string(),
  title: noteTitleSchema.optional(),
  body: noteBodySchema.optional(),
})
export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>

export const noteIdInputSchema = z.object({ id: z.string() })
