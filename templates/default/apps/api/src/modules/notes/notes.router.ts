import {
  createNoteInputSchema,
  noteIdInputSchema,
  updateNoteInputSchema,
} from '@starter/common'

import { protectedProcedure, router } from '../../trpc/trpc'
import {
  createHandler,
  deleteHandler,
  getHandler,
  listHandler,
  updateHandler,
} from './notes.handlers'

/**
 * The notes example, for signed-in users: the smallest feature that goes through every layer.
 * Each procedure validates its input with a schema from `@starter/common` and calls
 * `notes.handlers.ts`. Copy this module for your first real feature, then delete it.
 */
export const notesRouter = router({
  /** The user's notes, most recently changed first. */
  list: protectedProcedure.query(listHandler),
  get: protectedProcedure.input(noteIdInputSchema).query(getHandler),
  create: protectedProcedure.input(createNoteInputSchema).mutation(createHandler),
  update: protectedProcedure.input(updateNoteInputSchema).mutation(updateHandler),
  delete: protectedProcedure.input(noteIdInputSchema).mutation(deleteHandler),
})
