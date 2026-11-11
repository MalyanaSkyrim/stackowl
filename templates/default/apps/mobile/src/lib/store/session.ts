import { authTokensSchema, userSchema } from '@starter/common';
import { atom } from 'jotai';
import { z } from 'zod';

import { SECURE_STORAGE_KEYS } from './keys';
import { atomWithSecureStorage } from './secureStorage';

const sessionSchema = z
  .object({
    user: userSchema,
    tokens: authTokensSchema,
  })
  .nullable();

export type Session = NonNullable<z.infer<typeof sessionSchema>>;

/**
 * The signed-in account and its tokens, or null when signed out. Kept in the Keychain so the tokens never sit in plain storage.
 */
export const sessionAtom = atomWithSecureStorage(SECURE_STORAGE_KEYS.session, sessionSchema, null);

/** The signed-in user, or null. */
export const currentUserAtom = atom((get) => get(sessionAtom)?.user ?? null);
