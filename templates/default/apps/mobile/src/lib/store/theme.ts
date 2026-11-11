import { z } from 'zod';

import { atomWithDeviceStorage } from './deviceStorage';
import { STORAGE_KEYS } from './keys';

export const themeSchema = z.enum(['light', 'dark']);

export type Theme = z.infer<typeof themeSchema>;

/** Light or dark, from the switch in Settings. Defaults to light. */
export const themeAtom = atomWithDeviceStorage(STORAGE_KEYS.theme, themeSchema, 'light');
