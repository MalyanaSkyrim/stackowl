import { z } from 'zod';

import { atomWithDeviceStorage } from './deviceStorage';
import { STORAGE_KEYS } from './keys';

/**
 * The name Apple gave the app, kept until a sign-in succeeds. Apple shares it only on the
 * first authorization, so a first sign-in that fails (no network, API down) would lose it.
 */
export const pendingAppleNameAtom = atomWithDeviceStorage(
  STORAGE_KEYS.pendingAppleName,
  z.string().nullable(),
  null
);
