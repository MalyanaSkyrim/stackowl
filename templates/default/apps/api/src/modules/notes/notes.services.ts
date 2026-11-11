import type { CreateNoteInput, UpdateNoteInput } from '@starter/common'
import { db } from '@starter/database'

import { NoteNotFoundError } from './notes.errors'

/**
 * The notes example: everything a feature's services do, scoped to the signed-in user. A note
 * that isn't the user's is treated as missing, so ids never leak across accounts.
 */

const select = {
  id: true,
  title: true,
  body: true,
  createdAt: true,
  updatedAt: true,
} as const

export const listNotes = (userId: string) =>
  db.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, select })

export async function getNote(userId: string, id: string) {
  const note = await db.note.findFirst({ where: { id, userId }, select })
  if (!note) throw new NoteNotFoundError()
  return note
}

export const createNote = (userId: string, input: CreateNoteInput) =>
  db.note.create({ data: { ...input, userId }, select })

export async function updateNote(userId: string, { id, ...changes }: UpdateNoteInput) {
  await getNote(userId, id)
  return db.note.update({ where: { id }, data: changes, select })
}

export async function deleteNote(userId: string, id: string) {
  await getNote(userId, id)
  await db.note.delete({ where: { id } })
  return { id }
}
