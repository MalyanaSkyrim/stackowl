import type { CreateNoteInput, UpdateNoteInput } from '@starter/common'

import type { Context } from '../../trpc/context'
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  updateNote,
} from './notes.services'

/**
 * One handler per procedure in `notes.router.ts`: each reads what it needs from the request
 * and calls `notes.services.ts`.
 */

type Request<Input> = { ctx: Context & { userId: string }; input: Input }

export const listHandler = ({ ctx }: { ctx: Context & { userId: string } }) =>
  listNotes(ctx.userId)

export const getHandler = ({ ctx, input }: Request<{ id: string }>) =>
  getNote(ctx.userId, input.id)

export const createHandler = ({ ctx, input }: Request<CreateNoteInput>) =>
  createNote(ctx.userId, input)

export const updateHandler = ({ ctx, input }: Request<UpdateNoteInput>) =>
  updateNote(ctx.userId, input)

export const deleteHandler = ({ ctx, input }: Request<{ id: string }>) =>
  deleteNote(ctx.userId, input.id)
