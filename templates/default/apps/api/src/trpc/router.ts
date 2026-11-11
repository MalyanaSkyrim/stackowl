import { authRouter } from '../modules/auth/auth.router'
import { notesRouter } from '../modules/notes/notes.router'
import { router } from './trpc'

/** Every module's router, served under `/trpc`. */
export const appRouter = router({
  auth: authRouter,
  notes: notesRouter,
})

/** Imported by the app's tRPC client for end-to-end types. */
export type AppRouter = typeof appRouter
