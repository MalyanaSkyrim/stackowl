import { AppError } from '../../errors'

/** The note doesn't exist, or belongs to another user. */
export class NoteNotFoundError extends AppError {
  readonly reason = 'NOT_FOUND'
  readonly status = 404
}
